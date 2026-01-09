# AWS Cognito Setup for Email Verification

## Prerequisites
Your Cognito User Pool ID: `ap-south-1_DLl5oPNk2`
Your App Client ID: `5fqgq7rvfqbtejoj5bmeslfg72`

## Required Configuration Steps

### 1. Enable USER_PASSWORD_AUTH Flow

1. Go to [AWS Cognito Console](https://ap-south-1.console.aws.amazon.com/cognito/v2/idp/user-pools/ap-south-1_DLl5oPNk2)
2. Navigate to **App integration** tab
3. Click on your App client: `5fqgq7rvfqbtejoj5bmeslfg72`
4. Click **Edit** under "Authentication flows"
5. Enable these authentication flows:
   - ✅ **ALLOW_USER_PASSWORD_AUTH**
   - ✅ **ALLOW_REFRESH_TOKEN_AUTH**
6. Click **Save changes**

### 2. Configure Email Verification

1. In your User Pool, go to **Sign-in experience** tab
2. Under **Multi-factor authentication**, ensure it's set to:
   - **MFA enforcement**: Optional or Off
3. Go to **Sign-up experience** tab
4. Under **Required attributes**, ensure **email** is selected
5. Under **Email provider**, configure one of:

#### Option A: Use Cognito's Built-in Email (Testing Only)
   - Select **Send email with Cognito**
   - ⚠️ Limited to 50 emails/day
   - Good for testing only

#### Option B: Use Amazon SES (Production)
   1. Go to [Amazon SES Console](https://console.aws.amazon.com/ses/)
   2. Verify your sending domain or email address
   3. Request production access (if sending limit needed)
   4. Go back to Cognito User Pool → **Messaging** tab
   5. Select **Send email with Amazon SES**
   6. Choose your verified email address

### 3. Customize Email Messages (Optional)

1. Go to **Messaging** tab in your User Pool
2. Click **Edit** under **Email**
3. Customize the verification email template:

**Subject**: Verify your FudBi account

**Message**:
```
Welcome to FudBi!

Your verification code is: {####}

Please enter this code in the app to verify your email address.

If you didn't create an account, please ignore this email.

Thank you,
The FudBi Team
```

### 4. Update Password Policy (If Needed)

1. Go to **Sign-up experience** tab
2. Under **Password policy**, configure:
   - Minimum length: 8
   - Require uppercase: Yes
   - Require lowercase: Yes
   - Require numbers: Yes
   - Require special characters: Optional

### 5. Test the Integration

1. **Sign Up**:
   ```bash
   # You should receive an email with verification code
   POST http://localhost:3001/api/auth/signup
   {
     "email": "test@example.com",
     "password": "Test1234",
     "name": "Test User",
     "phone": "+919876543210",
     "city": "Mumbai",
     "role": "volunteer"
   }
   ```

2. **Check your email** for the verification code

3. **Confirm Email**:
   ```bash
   POST http://localhost:3001/api/auth/confirm
   {
     "email": "test@example.com",
     "code": "123456"
   }
   ```

4. **Sign In**:
   ```bash
   POST http://localhost:3001/api/auth/signin
   {
     "email": "test@example.com",
     "password": "Test1234"
   }
   ```

## Troubleshooting

### Error: "USER_PASSWORD_AUTH flow not enabled"
- Go to App client settings
- Enable ALLOW_USER_PASSWORD_AUTH flow
- Save and retry

### Email not received
- Check spam/junk folder
- Verify email provider configuration in Cognito
- Check SES sending limits if using SES
- Try with Cognito's built-in email first

### Error: "Invalid verification code"
- Codes expire after 24 hours
- Request a new code by signing up again
- Check for typos in the code

### Error: "User does not exist"
- Make sure you completed sign up
- Check the email spelling
- Look in Cognito Console → Users to see if user was created

## Email Provider Comparison

| Feature | Cognito Email | Amazon SES |
|---------|--------------|------------|
| Setup | Easy | Moderate |
| Cost | Free | Pay per email |
| Limit | 50/day | Up to 200/day (sandbox), Unlimited (production) |
| Customization | Limited | Full control |
| Best for | Testing | Production |

## Production Checklist

- [ ] Enable USER_PASSWORD_AUTH flow
- [ ] Configure Amazon SES
- [ ] Verify sending domain
- [ ] Request SES production access
- [ ] Customize email templates
- [ ] Test complete signup flow
- [ ] Monitor email delivery rates
- [ ] Set up CloudWatch alarms

## Current Status

Check if your configuration is working:
1. Go to AWS Cognito Console
2. Navigate to your User Pool
3. Click on "App clients" to verify authentication flows
4. Check "Messaging" tab for email configuration

Once configured, the app will:
✅ Send verification emails automatically on signup
✅ Require email verification before signin
✅ Show proper error messages
✅ Store user data in DynamoDB
