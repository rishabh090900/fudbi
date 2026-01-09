import { NextRequest, NextResponse } from 'next/server'
import { dynamoDb, TABLE_NAME } from '@/lib/aws/dynamodb'
import { ScanCommand } from '@aws-sdk/lib-dynamodb'

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

    // Scan for posts by this user
    const result = await dynamoDb.send(
      new ScanCommand({
        TableName: TABLE_NAME,
        FilterExpression: 'EntityType = :entityType AND hostId = :hostId',
        ExpressionAttributeValues: {
          ':entityType': 'POST',
          ':hostId': userId,
        },
      })
    )

    // Sort by createdAt descending
    const posts = (result.Items || []).sort((a: any, b: any) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )

    return NextResponse.json({ posts })
  } catch (error) {
    console.error('Error fetching my posts:', error)
    return NextResponse.json({ error: 'Failed to fetch posts', details: (error as Error).message }, { status: 500 })
  }
}
