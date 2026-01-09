import { NextRequest, NextResponse } from 'next/server'
import { CognitoIdentityProviderClient, ConfirmSignUpCommand } from '@aws-sdk/client-cognito-identity-provider'

const cognitoClient = new CognitoIdentityProviderClient({
  region: process.env.NEXT_PUBLIC_COGNITO_REGION || 'ap-south-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
  },
})

export async function POST(request: NextRequest) {
  try {
    const { email, code } = await request.json()

    const confirmCommand = new ConfirmSignUpCommand({
      ClientId: process.env.NEXT_PUBLIC_COGNITO_CLIENT_ID,
      Username: email,
      ConfirmationCode: code,
    })

    await cognitoClient.send(confirmCommand)

    console.log(`Email verified for: ${email}`)

    return NextResponse.json({
      success: true,
      message: 'Email verified successfully! You can now sign in.',
    })
  } catch (error: any) {
    console.error('Confirmation error:', error)
    
    let errorMessage = 'Confirmation failed'
    if (error.name === 'CodeMismatchException') {
      errorMessage = 'Invalid verification code'
    } else if (error.name === 'ExpiredCodeException') {
      errorMessage = 'Verification code has expired'
    } else if (error.message) {
      errorMessage = error.message
    }
    
    return NextResponse.json({ error: errorMessage }, { status: 400 })
  }
}
