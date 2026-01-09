import { NextRequest, NextResponse } from 'next/server'
import { sendEmailNotification } from '@/lib/emailjs/config'

export async function POST(request: NextRequest) {
  try {
    const { postId, hostId, volunteerName } = await request.json()

    // Get host details (simplified - fetch from DB)
    const hostEmail = 'host@example.com' // Fetch from DB
    const hostName = 'Host Name' // Fetch from DB

    await sendEmailNotification({
      to_email: hostEmail,
      to_name: hostName,
      subject: 'Your Food Post Has Been Accepted!',
      message: `Good news! ${volunteerName} has accepted your food post and will be picking it up soon. Please keep the food ready for pickup.`,
      post_id: postId,
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error sending pickup accepted notification:', error)
    return NextResponse.json(
      { error: 'Failed to send notification' },
      { status: 500 }
    )
  }
}
