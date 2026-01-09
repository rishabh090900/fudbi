import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export async function GET(request: NextRequest) {
  try {
    // Get session from cookie
    const cookieStore = cookies()
    const sessionCookie = cookieStore.get('session')

    if (!sessionCookie?.value) {
      return NextResponse.json({ user: null })
    }

    const session = JSON.parse(sessionCookie.value)
    // Session contains { user, accessToken }, return just the user
    return NextResponse.json({ user: session.user || session })
  } catch (error) {
    console.error('Session check error:', error)
    return NextResponse.json({ user: null })
  }
}
