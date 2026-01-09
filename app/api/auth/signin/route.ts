import { NextRequest, NextResponse } from 'next/server'
import { CognitoIdentityProviderClient, InitiateAuthCommand, GetUserCommand } from '@aws-sdk/client-cognito-identity-provider'
import { dynamoDb, TABLE_NAME } from '@/lib/aws/dynamodb'
import { GetCommand } from '@aws-sdk/lib-dynamodb'

const cognitoClient = new CognitoIdentityProviderClient({
  region: process.env.NEXT_PUBLIC_COGNITO_REGION || 'ap-south-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
  },
})

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()

    // Authenticate with Cognito
    const authCommand = new InitiateAuthCommand({
      ClientId: process.env.NEXT_PUBLIC_COGNITO_CLIENT_ID,
      AuthFlow: 'USER_PASSWORD_AUTH',
      AuthParameters: {
        USERNAME: email,
        PASSWORD: password,
      },
    })

    const authResult = await cognitoClient.send(authCommand)
    
    if (!authResult.AuthenticationResult?.AccessToken) {
      throw new Error('Authentication failed')
    }

    const accessToken = authResult.AuthenticationResult.AccessToken

    // Get user details from Cognito
    const getUserCommand = new GetUserCommand({
      AccessToken: accessToken,
    })

    const cognitoUser = await cognitoClient.send(getUserCommand)
    const userId = cognitoUser.Username

    // Get user profile from DynamoDB
    const userProfile = await dynamoDb.send(
      new GetCommand({
        TableName: TABLE_NAME,
        Key: {
          pk: `USER#${userId}`,
          sk: 'PROFILE',
        },
      })
    )

    if (!userProfile.Item) {
      return NextResponse.json(
        { error: 'User profile not found' },
        { status: 404 }
      )
    }

    const user = {
      id: userProfile.Item.id,
      email: userProfile.Item.email,
      name: userProfile.Item.name,
      phone: userProfile.Item.phone,
      city: userProfile.Item.city,
      role: userProfile.Item.role,
      verified: true,
      rating: userProfile.Item.rating,
      totalPosts: userProfile.Item.totalPosts,
      totalPickups: userProfile.Item.totalPickups,
    }

    // Store session with Cognito tokens
    const response = NextResponse.json({ user })
    response.cookies.set('session', JSON.stringify({ user, accessToken }), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24, // 24 hours
    })

    console.log(`User signed in via Cognito: ${email} as ${user.role}`)

    return response
  } catch (error: any) {
    console.error('Signin error:', error)
    
    let errorMessage = 'Invalid email or password'
    if (error.name === 'UserNotConfirmedException') {
      errorMessage = 'Please verify your email first'
    } else if (error.name === 'NotAuthorizedException') {
      errorMessage = 'Invalid email or password'
    } else if (error.message) {
      errorMessage = error.message
    }
    
    return NextResponse.json({ error: errorMessage }, { status: 401 })
  }
}
