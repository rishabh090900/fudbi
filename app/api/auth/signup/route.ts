import { NextRequest, NextResponse } from 'next/server'
import { CognitoIdentityProviderClient, SignUpCommand } from '@aws-sdk/client-cognito-identity-provider'
import { dynamoDb, TABLE_NAME } from '@/lib/aws/dynamodb'
import { PutCommand } from '@aws-sdk/lib-dynamodb'

const cognitoClient = new CognitoIdentityProviderClient({
  region: process.env.NEXT_PUBLIC_COGNITO_REGION || 'ap-south-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
  },
})

export async function POST(request: NextRequest) {
  try {
    const { email, password, name, phone, city, role } = await request.json()

    // Sign up user in Cognito
    const signUpCommand = new SignUpCommand({
      ClientId: process.env.NEXT_PUBLIC_COGNITO_CLIENT_ID,
      Username: email,
      Password: password,
      UserAttributes: [
        { Name: 'email', Value: email },
        { Name: 'name', Value: name },
        { Name: 'phone_number', Value: phone.startsWith('+') ? phone : `+91${phone}` },
      ],
    })

    const signUpResult = await cognitoClient.send(signUpCommand);
    console.log('Cognito sign up result:', signUpResult);
    const userId = signUpResult.UserSub || `user-${Date.now()}`

    // Store user profile in DynamoDB
    await dynamoDb.send(
      new PutCommand({
        TableName: TABLE_NAME,
        Item: {
          pk: `USER#${userId}`,
          sk: 'PROFILE',
          EntityType: 'USER',
          GSI1PK: `CITY#${city}`,
          GSI1SK: `USER#${userId}`,
          id: userId,
          email,
          name,
          phone,
          city,
          role,
          verified: false,
          createdAt: new Date().toISOString(),
          totalPosts: 0,
          totalPickups: 0,
          rating: 0,
        },
      })
    )

    console.log(`User registered in Cognito: ${email} as ${role} in ${city}`)
    console.log('Verification email sent to:', email)

    return NextResponse.json({
      success: true,
      message: 'Account created! Please check your email for verification code.',
      requiresConfirmation: true,
    })
  } catch (error: any) {
    console.error('Signup error:', error)
    
    let errorMessage = 'Sign up failed'
    if (error.name === 'UsernameExistsException') {
      errorMessage = 'User already exists'
    } else if (error.name === 'InvalidPasswordException') {
      errorMessage = 'Password must be at least 8 characters with uppercase, lowercase, and numbers'
    } else if (error.message) {
      errorMessage = error.message
    }
    
    return NextResponse.json({ error: errorMessage }, { status: 400 })
  }
}
