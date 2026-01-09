import { NextRequest, NextResponse } from 'next/server'
import { dynamoDb, TABLE_NAME } from '@/lib/aws/dynamodb'
import { PutCommand } from '@aws-sdk/lib-dynamodb'
import { v4 as uuidv4 } from 'uuid'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      foodType,
      quantity,
      servings,
      description,
      contactName,
      contactPhone,
      address,
      city,
      landmark,
      latitude,
      longitude,
      preparedAt,
      expiryHours,
      safetyChecklist,
      imageUrl,
    } = body

    // Get user from session cookie
    const sessionCookie = request.cookies.get('session')?.value
    
    if (!sessionCookie) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    const session = JSON.parse(sessionCookie)
    const userId = session.user?.id
    const userName = session.user?.name

    if (!userId) {
      return NextResponse.json({ error: 'User ID not found' }, { status: 401 })
    }

    const postId = uuidv4()
    const now = new Date().toISOString()
    const expiresAt = new Date(
      new Date(preparedAt).getTime() + parseInt(expiryHours) * 60 * 60 * 1000
    ).toISOString()

    const foodPost = {
      pk: `POST#${postId}`,
      sk: 'METADATA',
      EntityType: 'POST',
      GSI1PK: `CITY#${city}`,
      GSI1SK: `POST#${now}#${postId}`,
      id: postId,
      hostId: userId,
      hostName: userName,
      contactName: contactName || userName,
      contactPhone: contactPhone || '',
      foodType,
      quantity,
      servings,
      description: description || '',
      imageUrl: imageUrl || '',
      location: {
        address,
        city,
        landmark: landmark || '',
        coordinates: latitude && longitude ? {
          lat: latitude,
          lng: longitude,
        } : undefined,
      },
      preparedAt,
      expiresAt,
      safetyChecklist,
      status: 'POSTED',
      createdAt: now,
      updatedAt: now,
    }

    await dynamoDb.send(
      new PutCommand({
        TableName: TABLE_NAME,
        Item: foodPost,
      })
    )

    // Trigger notifications to volunteers in the city
    await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/notifications/send`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        city,
        postId,
        foodType,
        quantity,
      }),
    })

    return NextResponse.json({ success: true, postId })
  } catch (error) {
    console.error('Error creating post:', error)
    return NextResponse.json(
      { error: 'Failed to create post' },
      { status: 500 }
    )
  }
}
