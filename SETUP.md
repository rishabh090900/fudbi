# FudBi Setup Guide

## Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment Variables

Copy `.env.local.example` to `.env.local`:

```bash
cp .env.local.example .env.local
```

Then fill in your credentials in `.env.local`.

### 3. AWS Setup

#### A. DynamoDB Table

1. Go to AWS DynamoDB Console
2. Create table with these settings:
   - **Table name**: `FoodRedistribution`
   - **Partition key**: `pk` (String)
   - **Sort key**: `sk` (String)
   
3. Add Global Secondary Indexes:

**GSI1**:
- Name: `GSI1`
- Partition key: `GSI1PK` (String)
- Sort key: `GSI1SK` (String)

**GSI2**:
- Name: `GSI2`
- Partition key: `GSI2PK` (String)
- Sort key: `GSI2SK` (String)

#### B. S3 Bucket

1. Go to AWS S3 Console
2. Create bucket: `fudbi-food-images`
3. Enable public read access for images
4. Update CORS configuration:

```json
[
  {
    "AllowedHeaders": ["*"],
    "AllowedMethods": ["GET", "PUT", "POST"],
    "AllowedOrigins": ["*"],
    "ExposeHeaders": []
  }
]
```

#### C. AWS Cognito

1. Go to AWS Cognito Console
2. Create User Pool
3. Configure sign-in options: Email
4. Add app client
5. Copy User Pool ID and Client ID to `.env.local`

### 4. Firebase Setup

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create new project
3. Enable Cloud Messaging:
   - Go to Project Settings → Cloud Messaging
   - Generate Web Push certificates (VAPID key)
4. Get your Firebase config from Project Settings → General
5. Update `.env.local` with Firebase credentials
6. Update `public/firebase-messaging-sw.js` with your Firebase config

### 5. EmailJS Setup

1. Go to [EmailJS](https://www.emailjs.com/)
2. Sign up and create a service (Gmail recommended)
3. Create an email template with these variables:
   - `{{to_name}}`
   - `{{to_email}}`
   - `{{subject}}`
   - `{{message}}`
   - `{{app_name}}`
   - `{{app_url}}`
4. Copy Service ID, Template ID, and Public Key to `.env.local`

### 6. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Testing the Application

### 1. Create Test Accounts

**Host Account**:
- Email: `host@test.com`
- Password: `Test1234`
- Role: Host
- City: Mumbai

**Volunteer Account**:
- Email: `volunteer@test.com`
- Password: `Test1234`
- Role: Volunteer
- City: Mumbai

### 2. Test Flow

1. **Host posts food**:
   - Sign in as host
   - Navigate to "Post Food"
   - Fill form and submit

2. **Volunteer receives notification**:
   - Sign in as volunteer
   - Check notifications
   - View available posts

3. **Accept and complete pickup**:
   - Volunteer accepts post
   - Mark as "Picked Up"
   - Mark as "Completed"
   - Submit rating

## Production Deployment

### Vercel Deployment

1. Push code to GitHub
2. Connect repository to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy

```bash
vercel deploy --prod
```

### Environment Variables Checklist

Make sure all these are set in your production environment:

- [ ] AWS_REGION
- [ ] AWS_ACCESS_KEY_ID
- [ ] AWS_SECRET_ACCESS_KEY
- [ ] DYNAMODB_TABLE_NAME
- [ ] S3_BUCKET_NAME
- [ ] NEXT_PUBLIC_COGNITO_USER_POOL_ID
- [ ] NEXT_PUBLIC_COGNITO_CLIENT_ID
- [ ] NEXT_PUBLIC_FIREBASE_* (all Firebase variables)
- [ ] NEXT_PUBLIC_EMAILJS_* (all EmailJS variables)

## Troubleshooting

### Issue: Notifications not working

**Solution**:
1. Check Firebase config in `.env.local`
2. Verify VAPID key is correct
3. Check browser console for errors
4. Ensure service worker is registered

### Issue: Image upload fails

**Solution**:
1. Check S3 bucket permissions
2. Verify AWS credentials
3. Check CORS configuration
4. Ensure bucket name is correct

### Issue: DynamoDB queries fail

**Solution**:
1. Verify table name in `.env.local`
2. Check AWS credentials
3. Ensure GSIs are created
4. Check AWS region

## Next Steps

1. **Implement Real Authentication**:
   - Complete Cognito integration
   - Add session management
   - Implement refresh tokens

2. **Add Real-time Updates**:
   - WebSocket integration
   - Real-time post status updates

3. **Enhance Notifications**:
   - Firebase Admin SDK integration
   - Topic subscriptions
   - Scheduled notifications

4. **Add Analytics**:
   - Google Analytics
   - Custom event tracking
   - User behavior analysis

5. **Improve Performance**:
   - Implement caching
   - Add pagination
   - Optimize images

## Support

For issues, check:
1. Environment variables are correct
2. AWS services are configured
3. Firebase project is active
4. EmailJS account is verified

Create an issue on GitHub for additional help.
