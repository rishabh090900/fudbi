import { NextRequest, NextResponse } from 'next/server'
import { dynamoDb, TABLE_NAME } from '@/lib/aws/dynamodb'
import { UpdateCommand, GetCommand } from '@aws-sdk/lib-dynamodb'

export async function POST(request: NextRequest) {
  try {
    const { postId, pickupId, status, rating, feedback } = await request.json()

    console.log('Update pickup request:', { postId, pickupId, status })

    if (!postId || !pickupId) {
      return NextResponse.json(
        { error: 'postId and pickupId are required' },
        { status: 400 }
      )
    }

    const now = new Date().toISOString()
    const updateFields: any = {
      status,
      updatedAt: now,
    }

    if (status === 'PICKED') {
      updateFields.pickedAt = now
    } else if (status === 'COMPLETED') {
      updateFields.completedAt = now
      if (rating) {
        updateFields.rating = { score: rating, feedback: feedback || '' }
      }
    }

    // Update pickup status
    await dynamoDb.send(
      new UpdateCommand({
        TableName: TABLE_NAME,
        Key: {
          pk: `POST#${postId}`,
          sk: `PICKUP#${pickupId}`,
        },
        UpdateExpression: `SET ${Object.keys(updateFields)
          .map((key) => `#${key} = :${key}`)
          .join(', ')}`,
        ExpressionAttributeNames: Object.fromEntries(
          Object.keys(updateFields).map((key) => [`#${key}`, key])
        ),
        ExpressionAttributeValues: Object.fromEntries(
          Object.entries(updateFields).map(([key, value]) => [`:${key}`, value])
        ),
      })
    )

    // Update post status
    await dynamoDb.send(
      new UpdateCommand({
        TableName: TABLE_NAME,
        Key: {
          pk: `POST#${postId}`,
          sk: 'METADATA',
        },
        UpdateExpression: 'SET #status = :status, updatedAt = :updatedAt',
        ExpressionAttributeNames: {
          '#status': 'status',
        },
        ExpressionAttributeValues: {
          ':status': status === 'COMPLETED' ? 'COMPLETED' : status,
          ':updatedAt': now,
        },
      })
    )

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error updating pickup:', error)
    return NextResponse.json(
      { error: 'Failed to update pickup', details: (error as Error).message },
      { status: 500 }
    )
  }
}
