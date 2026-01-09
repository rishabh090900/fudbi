import { NextRequest, NextResponse } from 'next/server'
import { dynamoDb, TABLE_NAME } from '@/lib/aws/dynamodb'
import { ScanCommand } from '@aws-sdk/lib-dynamodb'

export async function GET(request: NextRequest) {
  try {
    // Scan for all posts and users (simplified - use pagination in production)
    const result = await dynamoDb.send(
      new ScanCommand({
        TableName: TABLE_NAME,
        FilterExpression: 'EntityType = :post OR EntityType = :user',
        ExpressionAttributeValues: {
          ':post': 'POST',
          ':user': 'USER',
        },
      })
    )

    const items = result.Items || []
    const posts = items.filter((item) => item.EntityType === 'POST')
    const users = items.filter((item) => item.EntityType === 'USER')

    const stats = {
      totalPosts: posts.length,
      activePosts: posts.filter((p) => ['POSTED', 'ACCEPTED'].includes(p.status)).length,
      completedPickups: posts.filter((p) => p.status === 'COMPLETED').length,
      totalVolunteers: users.filter((u) => u.role === 'volunteer').length,
      totalHosts: users.filter((u) => u.role === 'host').length,
      mealsSaved: posts
        .filter((p) => p.status === 'COMPLETED')
        .reduce((sum, p) => sum + (p.servings || 0), 0),
      citiesActive: [...new Set(posts.map((p) => p.location?.city).filter(Boolean))],
    }

    return NextResponse.json(stats)
  } catch (error) {
    console.error('Error fetching admin stats:', error)
    return NextResponse.json({ error: 'Failed to fetch stats' }, { status: 500 })
  }
}
