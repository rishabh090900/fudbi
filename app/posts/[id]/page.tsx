'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { MapPin, Clock, User, Phone, Star, ArrowLeft } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import Link from 'next/link'
import dynamic from 'next/dynamic'

const MapView = dynamic(() => import('@/components/MapView'), { ssr: false })

interface Post {
  id: string
  hostName: string
  hostPhone?: string
  foodType: string
  quantity: string
  servings: number
  description?: string
  location: {
    address: string
    city: string
    landmark?: string
    coordinates?: {
      lat: number
      lng: number
    }
  }
  expiresAt: string
  status: string
  imageUrl?: string
  pickupId?: string
}

interface Pickup {
  id: string
  volunteerName: string
  status: string
  acceptedAt: string
  pickedAt?: string
  completedAt?: string
}

export default function PostDetailPage() {
  const params = useParams()
  const postId = params?.id as string
  const [post, setPost] = useState<Post | null>(null)
  const [pickup, setPickup] = useState<Pickup | null>(null)
  const [loading, setLoading] = useState(true)
  const [rating, setRating] = useState(0)
  const [feedback, setFeedback] = useState('')
  const [showRatingForm, setShowRatingForm] = useState(false)

  useEffect(() => {
    if (postId) {
      fetchPostDetails()
    }
  }, [postId])

  const fetchPostDetails = async () => {
    try {
      const response = await fetch(`/api/posts/${postId}`)
      const data = await response.json()
      setPost(data.post)
      if (data.pickup) {
        setPickup(data.pickup)
      }
    } catch (error) {
      console.error('Error fetching post:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateStatus = async (newStatus: string) => {
    if (!post?.pickupId) return

    try {
      const response = await fetch('/api/pickups/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          postId: post.id,
          pickupId: post.pickupId,
          status: newStatus,
        }),
      })

      if (response.ok) {
        fetchPostDetails()
        if (newStatus === 'COMPLETED') {
          setShowRatingForm(true)
        }
      }
    } catch (error) {
      console.error('Error updating status:', error)
    }
  }

  const handleSubmitRating = async () => {
    if (!post?.pickupId || rating === 0) return

    try {
      const response = await fetch('/api/pickups/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          postId: post.id,
          pickupId: post.pickupId,
          status: 'COMPLETED',
          rating,
          feedback,
        }),
      })

      if (response.ok) {
        setShowRatingForm(false)
        fetchPostDetails()
        alert('Thank you for your feedback!')
      }
    } catch (error) {
      console.error('Error submitting rating:', error)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  if (!post) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-xl text-gray-600">Post not found</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <Link href="/" className="inline-flex items-center gap-2 text-primary-600 hover:text-primary-700">
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Link>
        </div>
        
        <div className="card">
          {/* Status Badge */}
          <div className="mb-6">
            <span className={`badge ${
              post.status === 'POSTED' ? 'badge-success' :
              post.status === 'ACCEPTED' ? 'badge-info' :
              post.status === 'PICKED' ? 'badge-warning' :
              'badge-success'
            }`}>
              {post.status}
            </span>
          </div>

          {/* Image */}
          {post.imageUrl && (
            <img
              src={post.imageUrl}
              alt={post.foodType}
              className="w-full h-64 object-cover rounded-lg mb-6"
            />
          )}

          {/* Food Details */}
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{post.foodType}</h1>
              <p className="text-lg text-gray-600">{post.quantity} • {post.servings} servings</p>
            </div>

            {post.description && (
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-2">Description</h2>
                <p className="text-gray-700">{post.description}</p>
              </div>
            )}

            {/* Host Info */}
            <div className="border-t border-gray-200 pt-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Host Information</h2>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <User className="w-5 h-5 text-gray-500" />
                  <span>{post.hostName}</span>
                </div>
                {post.hostPhone && (
                  <div className="flex items-center gap-3">
                    <Phone className="w-5 h-5 text-gray-500" />
                    <a href={`tel:${post.hostPhone}`} className="text-primary-600 hover:underline">
                      {post.hostPhone}
                    </a>
                  </div>
                )}
              </div>
            </div>

            {/* Location */}
            <div className="border-t border-gray-200 pt-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Pickup Location</h2>
              <div className="flex items-start gap-3 mb-4">
                <MapPin className="w-5 h-5 text-gray-500 mt-1" />
                <div>
                  <p className="text-gray-900">{post.location.address}</p>
                  <p className="text-gray-600">{post.location.city}</p>
                  {post.location.landmark && (
                    <p className="text-gray-600 text-sm">Near: {post.location.landmark}</p>
                  )}
                </div>
              </div>
              <a
                href={
                  post.location.coordinates
                    ? `https://www.google.com/maps/search/?api=1&query=${post.location.coordinates.lat},${post.location.coordinates.lng}`
                    : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(post.location.address + ', ' + post.location.city)}`
                }
                target="_blank"
                rel="noopener noreferrer"
                className="btn-secondary inline-flex items-center gap-2"
              >
                <MapPin className="w-4 h-4" />
                View on Map
              </a>
              {post.location.coordinates && (
                <div className="mt-4">
                  <h3 className="text-sm font-medium text-gray-700 mb-2">Location on Map</h3>
                  <div className="w-full h-[300px] rounded-lg overflow-hidden border-2 border-gray-200">
                    <MapView position={[post.location.coordinates.lat, post.location.coordinates.lng]} />
                  </div>
                </div>
              )}
            </div>

            {/* Timing */}
            <div className="border-t border-gray-200 pt-6">
              <div className="flex items-center gap-3">
                <Clock className="w-5 h-5 text-gray-500" />
                {new Date(post.expiresAt) < new Date() ? (
                  <span className="text-lg font-semibold text-red-600">Expired</span>
                ) : (
                  <span className="text-gray-900">
                    Expires {formatDistanceToNow(new Date(post.expiresAt), { addSuffix: true })}
                  </span>
                )}
              </div>
              {new Date(post.expiresAt) < new Date() && (
                <div className="mt-4 px-4 py-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-red-600 font-medium">This food has expired and is no longer available for pickup.</p>
                </div>
              )}
            </div>

            {/* Pickup Info */}
            {pickup && (
              <div className="border-t border-gray-200 pt-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Pickup Details</h2>
                <div className="space-y-3">
                  <p className="text-gray-700">Volunteer: {pickup.volunteerName}</p>
                  <p className="text-gray-700">Status: {pickup.status}</p>
                  <p className="text-gray-700">
                    Accepted: {formatDistanceToNow(new Date(pickup.acceptedAt), { addSuffix: true })}
                  </p>
                </div>

                {/* Action Buttons for Volunteer */}
                {pickup.status === 'ACCEPTED' && (
                  <button
                    onClick={() => handleUpdateStatus('PICKED')}
                    className="btn-primary mt-4"
                  >
                    Mark as Picked Up
                  </button>
                )}

                {pickup.status === 'PICKED' && (
                  <button
                    onClick={() => handleUpdateStatus('COMPLETED')}
                    className="btn-primary mt-4"
                  >
                    Mark as Completed
                  </button>
                )}
              </div>
            )}

            {/* Rating Form */}
            {showRatingForm && (
              <div className="border-t border-gray-200 pt-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Rate this pickup</h2>
                <div className="space-y-4">
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        onClick={() => setRating(star)}
                        className="focus:outline-none"
                      >
                        <Star
                          className={`w-8 h-8 ${
                            star <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
                          }`}
                        />
                      </button>
                    ))}
                  </div>
                  <textarea
                    value={feedback}
                    onChange={(e) => setFeedback(e.target.value)}
                    className="input-field"
                    rows={3}
                    placeholder="Share your experience (optional)"
                  />
                  <button onClick={handleSubmitRating} className="btn-primary">
                    Submit Rating
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
