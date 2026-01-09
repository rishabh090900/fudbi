import { NextRequest, NextResponse } from 'next/server'
import { dynamoDb, TABLE_NAME } from '@/lib/aws/dynamodb'
import { UpdateCommand } from '@aws-sdk/lib-dynamodb'

export async function POST(request: NextRequest) {
  try {
    const { postId } = await request.json()

    await dynamoDb.send(
      new UpdateCommand({
        TableName: TABLE_NAME,
        Key: {
          pk: `POST#${postId}`,
          sk: 'METADATA',
        },
        UpdateExpression: 'SET #status = :status, flagged = :flagged, updatedAt = :updatedAt',
        ExpressionAttributeNames: {
          '#status': 'status',
        },
        ExpressionAttributeValues: {
          ':status': 'FLAGGED',
          ':flagged': true,
          ':updatedAt': new Date().toISOString(),
        },
      })
    )

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error flagging post:', error)
    return NextResponse.json({ error: 'Failed to flag post' }, { status: 500 })
  }
}
