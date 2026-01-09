'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/components/providers/AuthProvider'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { MapPin, Clock, Eye, ArrowLeft, Users } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'

interface FoodPost {
  id: string
  foodType: string
  quantity: string
  servings: number
  description?: string
  location: {
    address: string
    city: string
    landmark?: string
  }
  expiresAt: string
  status: string
  imageUrl?: string
  createdAt: string
  pickupId?: string
}

export default function MyPostsPage() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const [posts, setPosts] = useState<FoodPost[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth/signin')
    }

    if (user?.role === 'volunteer') {
      router.push('/volunteer')
    }
  }, [user, authLoading])

  useEffect(() => {
    if (user) {
      fetchMyPosts()
    }
  }, [user])

  const fetchMyPosts = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/posts/my-posts')
      const data = await response.json()
      
      if (response.ok) {
        setPosts(data.posts || [])
      } else {
        console.error('Error fetching posts:', data.error)
      }
    } catch (error) {
      console.error('Error fetching posts:', error)
    } finally {
      setLoading(false)
    }
  }

  if (authLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="mb-4">
            <Link href="/dashboard" className="inline-flex items-center gap-2 text-primary-600 hover:text-primary-700">
              <ArrowLeft className="w-4 h-4" />
              Back to Dashboard
            </Link>
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">My Posts</h1>
            <p className="text-gray-600">Manage your food donation posts</p>
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
          </div>
        ) : posts.length === 0 ? (
          <div className="card text-center py-12">
            <p className="text-gray-600 mb-4">You haven&apos;t posted any food yet.</p>
            <Link href="/post-food" className="btn-primary inline-block">
              Post Food Now
            </Link>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {posts.map((post) => (
              <Link
                key={post.id}
                href={`/posts/${post.id}`}
                className="card hover:shadow-lg transition-shadow"
              >
                {post.imageUrl && (
                  <img
                    src={post.imageUrl}
                    alt={post.foodType}
                    className="w-full h-48 object-cover rounded-lg mb-4"
                  />
                )}

                <div className="space-y-3">
                  <div className="flex justify-between items-start">
                    <h3 className="text-lg font-semibold text-gray-900">{post.foodType}</h3>
                    <span
                      className={`badge ${
                        post.status === 'POSTED'
                          ? 'badge-success'
                          : post.status === 'ACCEPTED'
                          ? 'badge-info'
                          : post.status === 'PICKED'
                          ? 'badge-warning'
                          : 'badge-success'
                      }`}
                    >
                      {post.status}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Users className="w-4 h-4" />
                    <span>{post.servings} servings</span>
                    <span className="text-gray-400">•</span>
                    <span>{post.quantity}</span>
                  </div>

                  <div className="flex items-start gap-2 text-sm text-gray-600">
                    <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />
                    <span className="line-clamp-2">
                      {post.location.address}, {post.location.city}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 text-sm">
                    <Clock className="w-4 h-4 text-gray-600" />
                    {new Date(post.expiresAt) < new Date() ? (
                      <span className="font-semibold text-red-600">Expired</span>
                    ) : (
                      <span className="text-gray-600">
                        Expires {formatDistanceToNow(new Date(post.expiresAt), { addSuffix: true })}
                      </span>
                    )}
                  </div>

                  {post.description && (
                    <p className="text-sm text-gray-600 line-clamp-2">{post.description}</p>
                  )}

                  <div className="pt-2 border-t border-gray-100">
                    <button className="text-primary-600 hover:text-primary-700 text-sm font-medium flex items-center gap-1">
                      <Eye className="w-4 h-4" />
                      View Details
                    </button>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
