import { NextRequest, NextResponse } from 'next/server'
import { dynamoDb, TABLE_NAME } from '@/lib/aws/dynamodb'
import { GetCommand, QueryCommand } from '@aws-sdk/lib-dynamodb'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const postId = params.id

    // Get post
    const postResult = await dynamoDb.send(
      new GetCommand({
        TableName: TABLE_NAME,
        Key: {
          pk: `POST#${postId}`,
          sk: 'METADATA',
        },
      })
    )

    if (!postResult.Item) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 })
    }

    let pickup = null
    if (postResult.Item.pickupId) {
      // Get pickup details
      const pickupResult = await dynamoDb.send(
        new GetCommand({
          TableName: TABLE_NAME,
          Key: {
            pk: `POST#${postId}`,
            sk: `PICKUP#${postResult.Item.pickupId}`,
          },
        })
      )
      pickup = pickupResult.Item
    }

    return NextResponse.json({
      post: postResult.Item,
      pickup,
    })
  } catch (error) {
    console.error('Error fetching post:', error)
    return NextResponse.json(
      { error: 'Failed to fetch post' },
      { status: 500 }
    )
  }
}
