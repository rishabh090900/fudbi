import emailjs from '@emailjs/browser'

emailjs.init(process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY || '')

interface EmailNotification {
  to_email: string
  to_name: string
  subject: string
  message: string
  post_id?: string
}

export async function sendEmailNotification(data: EmailNotification): Promise<boolean> {
  try {
    const response = await emailjs.send(
      process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID || '',
      process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID || '',
      {
        to_email: data.to_email,
        to_name: data.to_name,
        subject: data.subject,
        message: data.message,
        post_id: data.post_id || '',
        app_name: 'FudBi',
        app_url: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:8000',
      }
    )

    return response.status === 200
  } catch (error) {
    console.error('Error sending email notification:', error)
    return false
  }
}

export async function sendFoodAvailableEmail(
  volunteerEmail: string,
  volunteerName: string,
  postDetails: {
    foodType: string
    quantity: string
    city: string
    postId: string
  }
): Promise<boolean> {
  return sendEmailNotification({
    to_email: volunteerEmail,
    to_name: volunteerName,
    subject: 'New Food Available in Your Area',
    message: `Hello ${volunteerName},\n\nNew food is available for pickup:\n\nType: ${postDetails.foodType}\nQuantity: ${postDetails.quantity}\nCity: ${postDetails.city}\n\nVisit the app to accept this pickup.`,
    post_id: postDetails.postId,
  })
}
