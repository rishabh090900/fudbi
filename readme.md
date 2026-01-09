# FudBi - Food Redistribution Platform

A scalable Next.js web application that reduces food wastage from small events by connecting hosts with community volunteers for quick food pickups.

## 🎯 Project Overview

FudBi enables individuals hosting small events (homes, offices, societies) to quickly post available food and connect with nearby volunteers who can pick it up before it expires. The platform uses AWS DynamoDB for scalable storage, Firebase Cloud Messaging for instant notifications, and EmailJS as a fallback notification system.

## 🚀 Features

### Core Functionality
- **One-Minute Food Posting**: Quick form to post available food with details
- **Location-Based Matching**: Automatic discovery of nearby volunteers by city
- **Instant Notifications**: Push notifications (FCM) + Email fallback (EmailJS)
- **Pickup Coordination**: Track pickups from POSTED → ACCEPTED → PICKED → COMPLETED
- **Safety Features**: Mandatory food safety checklist for all posts
- **Rating System**: Post-pickup feedback and ratings

### User Types
1. **Hosts**: Post available food from events
2. **Volunteers**: Accept and pickup food donations
3. **Admins**: Monitor platform health and flag inappropriate posts

## 🛠 Tech Stack

### Frontend
- **Next.js 14** (App Router)
- **TypeScript**
- **Tailwind CSS**
- **React Hooks**

### Backend
- **Next.js API Routes**
- **Node.js**

### Authentication
- **AWS Cognito** (Email/Phone login)

### Database
- **AWS DynamoDB** (Single Table Design)
- Efficient queries using GSI (Global Secondary Indexes)

### Storage
- **AWS S3** (Food images)

### Notifications
- **Firebase Cloud Messaging** (Push notifications)
- **EmailJS** (Email fallback)

## 📁 Project Structure

```
fudbi/
├── app/
│   ├── admin/              # Admin panel
│   ├── api/                # API routes
│   │   ├── auth/           # Authentication endpoints
│   │   ├── posts/          # Food post endpoints
│   │   ├── pickups/        # Pickup management
│   │   ├── notifications/  # Notification system
│   │   ├── upload/         # Image upload
│   │   └── stats/          # Statistics
│   ├── auth/               # Auth pages (signin/signup)
│   ├── dashboard/          # User dashboard
│   ├── post-food/          # Create food post
│   ├── posts/              # View post details
│   ├── volunteer/          # Volunteer dashboard
│   ├── layout.tsx          # Root layout
│   ├── page.tsx            # Homepage
│   └── globals.css         # Global styles
├── components/
│   └── providers/          # Context providers
│       ├── AuthProvider.tsx
│       └── NotificationProvider.tsx
├── lib/
│   ├── aws/                # AWS integrations
│   │   ├── cognito.ts
│   │   ├── dynamodb.ts
│   │   └── s3.ts
│   ├── firebase/           # Firebase config
│   │   └── config.ts
│   ├── emailjs/            # EmailJS config
│   │   └── config.ts
│   └── utils/              # Utility functions
│       ├── constants.ts
│       ├── format.ts
│       └── validation.ts
├── types/
│   └── index.ts            # TypeScript types
├── public/
│   ├── firebase-messaging-sw.js
│   └── manifest.json
├── .env.local.example      # Environment variables template
├── next.config.js
├── tailwind.config.js
├── tsconfig.json
└── package.json
```

## 🗄 Database Design (Single Table)

**Table Name**: `FoodRedistribution`

### Entity Patterns

#### User Profile
- pk: `USER#<userId>`
- sk: `PROFILE`

#### Food Post
- pk: `POST#<postId>`
- sk: `METADATA`
- GSI1PK: `CITY#<cityName>`
- GSI1SK: `POST#<createdAt>#<postId>`

#### Pickup Assignment
- pk: `POST#<postId>`
- sk: `PICKUP#<pickupId>`

#### City-based Discovery
- pk: `CITY#<cityName>`
- sk: `POST#<createdAt>#<postId>`

## 🔧 Setup Instructions

### 1. Prerequisites
- Node.js >= 18.17.0
- AWS Account (for DynamoDB, S3, Cognito)
- Firebase Project (for FCM)
- EmailJS Account (for email notifications)

### 2. Installation

```bash
# Clone the repository
cd d:\Rishabh\fudbi

# Install dependencies
npm install
```

### 3. Environment Configuration

Copy `.env.local.example` to `.env.local` and fill in your credentials:

```bash
cp .env.local.example .env.local
```

Required environment variables:
- AWS credentials (Access Key, Secret Key, Region)
- DynamoDB table name
- S3 bucket name
- Cognito User Pool details
- Firebase configuration
- EmailJS credentials

### 4. AWS Setup

#### DynamoDB Table
Create a table named `FoodRedistribution` with:
- Primary Key: `pk` (String)
- Sort Key: `sk` (String)
- GSI1: `GSI1PK` (Partition) + `GSI1SK` (Sort)
- GSI2: `GSI2PK` (Partition) + `GSI2SK` (Sort)

#### S3 Bucket
Create a bucket for food images with public read access

#### Cognito User Pool
Set up with email/phone authentication

### 5. Firebase Setup

1. Create a Firebase project
2. Enable Cloud Messaging
3. Generate VAPID key for web push
4. Update `public/firebase-messaging-sw.js` with your config

### 6. EmailJS Setup

1. Create an account at emailjs.com
2. Create an email service
3. Create an email template
4. Get your public key, service ID, and template ID

### 7. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## 📱 Key User Flows

### Host Flow
1. Sign up → Select "Post food donations"
2. Navigate to "Post Food"
3. Fill form (1 minute)
4. Complete safety checklist
5. Upload optional image
6. Submit → Volunteers notified instantly

### Volunteer Flow
1. Sign up → Select "Volunteer to pickup food"
2. Enable notifications
3. Receive notification when food available in city
4. View available posts
5. Accept pickup → Host notified
6. Mark as "Picked Up" → "Completed"
7. Rate the experience

### Admin Flow
1. Sign in with admin credentials
2. View platform statistics
3. Monitor recent posts
4. Flag inappropriate content

## 🔒 Security Features

- Email/Phone verification via Cognito
- Mandatory food safety checklist
- Post-pickup rating system
- Admin flagging capabilities
- Secure image uploads to S3
- Environment-based configuration

## 📊 Scalability

- **Single-table DynamoDB design** for fast queries
- **City-based GSI** for efficient location matching
- **Topic-based FCM** for scalable notifications
- **Serverless architecture** with Next.js API routes
- **CDN-ready** with S3 image hosting

## 🚀 Deployment

### Vercel (Recommended)
```bash
npm run build
vercel deploy
```

### Manual Deployment
```bash
npm run build
npm start
```

## 📝 API Endpoints

### Authentication
- `POST /api/auth/signup` - Create account
- `POST /api/auth/signin` - Sign in
- `POST /api/auth/confirm` - Confirm account
- `POST /api/auth/signout` - Sign out
- `GET /api/auth/session` - Get session

### Posts
- `POST /api/posts/create` - Create food post
- `GET /api/posts/list` - List posts by city
- `GET /api/posts/[id]` - Get post details

### Pickups
- `POST /api/pickups/accept` - Accept pickup
- `POST /api/pickups/update` - Update pickup status
- `GET /api/pickups/my-pickups` - Get volunteer's pickups

### Notifications
- `POST /api/notifications/register` - Register FCM token
- `POST /api/notifications/send` - Send notifications
- `POST /api/notifications/pickup-accepted` - Notify host

### Admin
- `GET /api/admin/stats` - Platform statistics
- `GET /api/admin/posts` - All posts
- `POST /api/admin/flag-post` - Flag post

## 🎨 UI Components

Built with Tailwind CSS utility classes:
- `btn-primary`, `btn-secondary`, `btn-danger` - Buttons
- `input-field` - Form inputs
- `card` - Container cards
- `badge-*` - Status badges

## 📄 License

This project is for educational purposes.

## 🤝 Contributing

1. Fork the repository
2. Create feature branch
3. Commit changes
4. Push to branch
5. Open pull request

## 📧 Support

For issues and questions, please open a GitHub issue.

---

Built with ❤️ to reduce food waste in India
