// Type definitions for the application

export interface User {
  id: string
  email: string
  phone?: string
  name: string
  city: string
  role: 'host' | 'volunteer' | 'admin'
  verified: boolean
  createdAt: string
  rating?: number
  totalPickups?: number
  totalPosts?: number
}

export interface FoodPost {
  id: string
  hostId: string
  hostName: string
  hostPhone?: string
  foodType: string
  quantity: string
  servings: number
  preparedAt: string
  expiresAt: string
  description?: string
  imageUrl?: string
  location: {
    address: string
    city: string
    landmark?: string
    coordinates?: {
      lat: number
      lng: number
    }
  }
  safetyChecklist: {
    freshlyPrepared: boolean
    properStorage: boolean
    noAllergensWarning: boolean
    labeledCorrectly: boolean
  }
  status: 'POSTED' | 'ACCEPTED' | 'PICKED' | 'COMPLETED' | 'EXPIRED' | 'CANCELLED'
  pickupId?: string
  createdAt: string
  updatedAt: string
}

export interface Pickup {
  id: string
  postId: string
  volunteerId: string
  volunteerName: string
  volunteerPhone?: string
  status: 'ACCEPTED' | 'EN_ROUTE' | 'PICKED' | 'COMPLETED' | 'CANCELLED'
  acceptedAt: string
  pickedAt?: string
  completedAt?: string
  notes?: string
  rating?: {
    score: number
    feedback?: string
  }
}

export interface Notification {
  id: string
  userId: string
  type: 'NEW_POST' | 'PICKUP_ACCEPTED' | 'PICKUP_COMPLETED' | 'POST_EXPIRED' | 'REMINDER'
  title: string
  message: string
  postId?: string
  pickupId?: string
  read: boolean
  createdAt: string
}

export interface CityStats {
  city: string
  totalPosts: number
  completedPickups: number
  activeVolunteers: number
  mealsSaved: number
}

export interface DynamoDBEntity {
  pk: string
  sk: string
  EntityType: string
  GSI1PK?: string
  GSI1SK?: string
  [key: string]: any
}

export type PostStatus = FoodPost['status']
export type PickupStatus = Pickup['status']
export type NotificationType = Notification['type']
export type UserRole = User['role']
