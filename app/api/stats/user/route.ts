import { NextRequest, NextResponse } from 'next/server'
import { dynamoDb, TABLE_NAME } from '@/lib/aws/dynamodb'
import { QueryCommand } from '@aws-sdk/lib-dynamodb'

export async function GET(request: NextRequest) {
  try {
    // Get user from session
    const userId = request.headers.get('x-user-id') || 'temp-user-id'

    // Get user's posts
    const postsResult = await dynamoDb.send(
      new QueryCommand({
        TableName: TABLE_NAME,
        IndexName: 'GSI2',
        KeyConditionExpression: 'GSI2PK = :gsi2pk',
        ExpressionAttributeValues: {
          ':gsi2pk': `HOST#${userId}`,
        },
      })
    )

    const posts = postsResult.Items || []
    const completedPosts = posts.filter((p) => p.status === 'COMPLETED')

    const stats = {
      totalPosts: posts.length,
      activePickups: posts.filter((p) => ['ACCEPTED', 'PICKED'].includes(p.status)).length,
      completedPickups: completedPosts.length,
      mealsSaved: completedPosts.reduce((sum, p) => sum + (p.servings || 0), 0),
    }

    return NextResponse.json(stats)
  } catch (error) {
    console.error('Error fetching user stats:', error)
    return NextResponse.json({ error: 'Failed to fetch stats' }, { status: 500 })
  }
}
