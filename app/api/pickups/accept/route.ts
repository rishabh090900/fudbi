import { NextRequest, NextResponse } from 'next/server'
import { dynamoDb, TABLE_NAME } from '@/lib/aws/dynamodb'
import { PutCommand, UpdateCommand, GetCommand } from '@aws-sdk/lib-dynamodb'
import { v4 as uuidv4 } from 'uuid'

export async function POST(request: NextRequest) {
  try {
    const { postId } = await request.json()

    // Get user from session cookie
    const sessionCookie = request.cookies.get('session')?.value
    
    if (!sessionCookie) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    const session = JSON.parse(sessionCookie)
    const volunteerId = session.user?.id
    const volunteerName = session.user?.name

    if (!volunteerId) {
      return NextResponse.json({ error: 'User ID not found' }, { status: 401 })
    }

    // Get the post
    const postResult = await dynamoDb.send(
      new GetCommand({
        TableName: TABLE_NAME,
        Key: {
          pk: `POST#${postId}`,
          sk: 'METADATA',
        },
      })
    )

    if (!postResult.Item || postResult.Item.status !== 'POSTED') {
      return NextResponse.json(
        { error: 'Post not available' },
        { status: 400 }
      )
    }

    const pickupId = uuidv4()
    const now = new Date().toISOString()

    // Create pickup record
    const pickup = {
      pk: `POST#${postId}`,
      sk: `PICKUP#${pickupId}`,
      EntityType: 'PICKUP',
      id: pickupId,
      postId,
      volunteerId,
      volunteerName,
      status: 'ACCEPTED',
      acceptedAt: now,
    }

    // Update post status
    await Promise.all([
      dynamoDb.send(
        new PutCommand({
          TableName: TABLE_NAME,
          Item: pickup,
        })
      ),
      dynamoDb.send(
        new UpdateCommand({
          TableName: TABLE_NAME,
          Key: {
            pk: `POST#${postId}`,
            sk: 'METADATA',
          },
          UpdateExpression: 'SET #status = :status, pickupId = :pickupId, updatedAt = :updatedAt',
          ExpressionAttributeNames: {
            '#status': 'status',
          },
          ExpressionAttributeValues: {
            ':status': 'ACCEPTED',
            ':pickupId': pickupId,
            ':updatedAt': now,
          },
        })
      ),
    ])

    // Send notification to host
    await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/notifications/pickup-accepted`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        postId,
        hostId: postResult.Item.hostId,
        volunteerName,
      }),
    })

    return NextResponse.json({ success: true, pickupId })
  } catch (error) {
    console.error('Error accepting pickup:', error)
    return NextResponse.json(
      { error: 'Failed to accept pickup' },
      { status: 500 }
    )
  }
}
