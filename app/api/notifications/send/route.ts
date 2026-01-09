import { NextRequest, NextResponse } from 'next/server'
import { dynamoDb, TABLE_NAME } from '@/lib/aws/dynamodb'
import { QueryCommand } from '@aws-sdk/lib-dynamodb'
import { sendFoodAvailableEmail } from '@/lib/emailjs/config'

export async function POST(request: NextRequest) {
  try {
    const { city, postId, foodType, quantity } = await request.json()

    // Get volunteers in the city
    const result = await dynamoDb.send(
      new QueryCommand({
        TableName: TABLE_NAME,
        IndexName: 'GSI1',
        KeyConditionExpression: 'GSI1PK = :gsi1pk',
        FilterExpression: '#role = :role',
        ExpressionAttributeNames: {
          '#role': 'role',
        },
        ExpressionAttributeValues: {
          ':gsi1pk': `CITY#${city}`,
          ':role': 'volunteer',
        },
      })
    )

    const volunteers = result.Items || []

    // Send FCM notifications (topic-based)
    // In production, use Firebase Admin SDK to send to topic
    const fcmPayload = {
      notification: {
        title: 'New Food Available!',
        body: `${foodType} (${quantity}) is available for pickup in ${city}`,
      },
      data: {
        postId,
        city,
        url: `/posts/${postId}`,
      },
      topic: `city_${city.toLowerCase().replace(/\s+/g, '_')}`,
    }

    // Log FCM notification (implement actual sending with Firebase Admin SDK)
    console.log('FCM Notification:', fcmPayload)

    // Send email fallback to volunteers without FCM tokens
    const emailPromises = volunteers.slice(0, 5).map((volunteer) =>
      sendFoodAvailableEmail(volunteer.email, volunteer.name, {
        foodType,
        quantity,
        city,
        postId,
      })
    )

    await Promise.allSettled(emailPromises)

    return NextResponse.json({ success: true, notifiedVolunteers: volunteers.length })
  } catch (error) {
    console.error('Error sending notifications:', error)
    return NextResponse.json(
      { error: 'Failed to send notifications' },
      { status: 500 }
    )
  }
}
