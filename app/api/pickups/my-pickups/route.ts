import { NextRequest, NextResponse } from 'next/server'
import { dynamoDb, TABLE_NAME } from '@/lib/aws/dynamodb'
import { ScanCommand, GetCommand } from '@aws-sdk/lib-dynamodb'

export async function GET(request: NextRequest) {
  try {
    // Get user from session cookie
    const sessionCookie = request.cookies.get('session')?.value
    
    if (!sessionCookie) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    const session = JSON.parse(sessionCookie)
    const userId = session.user?.id

    if (!userId) {
      return NextResponse.json({ error: 'User ID not found' }, { status: 401 })
    }

    // Scan for pickups by this volunteer
    const result = await dynamoDb.send(
      new ScanCommand({
        TableName: TABLE_NAME,
        FilterExpression: 'EntityType = :entityType AND volunteerId = :volunteerId',
        ExpressionAttributeValues: {
          ':entityType': 'PICKUP',
          ':volunteerId': userId,
        },
      })
    )

    // Get associated post details for each pickup
    const posts = await Promise.all(
      (result.Items || []).map(async (pickup: any) => {
        try {
          const postResult = await dynamoDb.send(
            new GetCommand({
              TableName: TABLE_NAME,
              Key: {
                pk: `POST#${pickup.postId}`,
                sk: 'METADATA',
              },
            })
          )
          
          // Merge post with pickup data to ensure pickupId is available
          if (postResult.Item) {
            // Extract pickupId from sk (format: PICKUP#<id>)
            const pickupId = pickup.sk?.replace('PICKUP#', '') || pickup.id;
            console.log('Pickup data:', { postId: pickup.postId, pickupId, sk: pickup.sk, status: pickup.status });
            return {
              ...postResult.Item,
              pickupId, // Ensure pickupId from pickup record
              pickupStatus: pickup.status, // Include pickup-specific status
            }
          }
          return null
        } catch (err) {
          console.error('Error fetching post:', err)
          return null
        }
      })
    )

    console.log('My pickups response:', posts.filter(Boolean).map(p => ({ pickupId: p?.pickupId, pickupStatus: p?.pickupStatus })))

    return NextResponse.json({ posts: posts.filter(Boolean) })
  } catch (error) {
    console.error('Error fetching pickups:', error)
    return NextResponse.json({ error: 'Failed to fetch pickups', details: (error as Error).message }, { status: 500 })
  }
}
