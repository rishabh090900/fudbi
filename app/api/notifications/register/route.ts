import { NextRequest, NextResponse } from 'next/server'
import { dynamoDb, TABLE_NAME } from '@/lib/aws/dynamodb'
import { PutCommand } from '@aws-sdk/lib-dynamodb'

export async function POST(request: NextRequest) {
  try {
    const { token } = await request.json()

    // Get user from session
    const userId = request.headers.get('x-user-id') || 'temp-user-id'

    // Store FCM token
    await dynamoDb.send(
      new PutCommand({
        TableName: TABLE_NAME,
        Item: {
          pk: `USER#${userId}`,
          sk: 'FCM_TOKEN',
          EntityType: 'FCM_TOKEN',
          token,
          updatedAt: new Date().toISOString(),
        },
      })
    )

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error registering token:', error)
    return NextResponse.json(
      { error: 'Failed to register token' },
      { status: 500 }
    )
  }
}
