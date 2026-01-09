'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/components/providers/AuthProvider'
import { useRouter } from 'next/navigation'
import { Package, Users, TrendingUp, AlertTriangle, CheckCircle, LogOut } from 'lucide-react'

interface AdminStats {
  totalPosts: number
  activePosts: number
  completedPickups: number
  totalVolunteers: number
  totalHosts: number
  mealsSaved: number
  citiesActive: string[]
}

interface RecentPost {
  id: string
  foodType: string
  city: string
  status: string
  createdAt: string
  expiresAt: string
}

export default function AdminPanel() {
  const { user, signOut } = useAuth()
  const router = useRouter()
  const [stats, setStats] = useState<AdminStats | null>(null)
  const [recentPosts, setRecentPosts] = useState<RecentPost[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user?.role !== 'admin') {
      router.push('/dashboard')
      return
    }

    fetchData()
  }, [user])

  const fetchData = async () => {
    try {
      const [statsRes, postsRes] = await Promise.all([
        fetch('/api/admin/stats'),
        fetch('/api/admin/posts'),
      ])

      const statsData = await statsRes.json()
      const postsData = await postsRes.json()

      setStats(statsData)
      setRecentPosts(postsData.posts || [])
    } catch (error) {
      console.error('Error fetching admin data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleFlagPost = async (postId: string) => {
    if (!confirm('Are you sure you want to flag this post?')) return

    try {
      await fetch('/api/admin/flag-post', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ postId }),
      })
      fetchData()
      alert('Post flagged successfully')
    } catch (error) {
      console.error('Error flagging post:', error)
      alert('Failed to flag post')
    }
  }

  if (loading) {
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
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Admin Panel</h1>
            <p className="text-gray-600">Platform monitoring and management</p>
          </div>
          <button
            onClick={async () => {
              await signOut()
              router.push('/')
            }}
            className="btn-secondary flex items-center gap-2"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </button>
        </div>
      </header>

      {/* Stats Grid */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
          <div className="card">
            <Package className="w-8 h-8 text-primary-600 mb-2" />
            <p className="text-2xl font-bold text-gray-900">{stats?.totalPosts || 0}</p>
            <p className="text-sm text-gray-600">Total Posts</p>
          </div>

          <div className="card">
            <CheckCircle className="w-8 h-8 text-green-600 mb-2" />
            <p className="text-2xl font-bold text-gray-900">{stats?.activePosts || 0}</p>
            <p className="text-sm text-gray-600">Active Posts</p>
          </div>

          <div className="card">
            <TrendingUp className="w-8 h-8 text-blue-600 mb-2" />
            <p className="text-2xl font-bold text-gray-900">{stats?.completedPickups || 0}</p>
            <p className="text-sm text-gray-600">Completed</p>
          </div>

          <div className="card">
            <Users className="w-8 h-8 text-purple-600 mb-2" />
            <p className="text-2xl font-bold text-gray-900">{stats?.totalVolunteers || 0}</p>
            <p className="text-sm text-gray-600">Volunteers</p>
          </div>

          <div className="card">
            <Users className="w-8 h-8 text-orange-600 mb-2" />
            <p className="text-2xl font-bold text-gray-900">{stats?.totalHosts || 0}</p>
            <p className="text-sm text-gray-600">Hosts</p>
          </div>

          <div className="card">
            <TrendingUp className="w-8 h-8 text-green-600 mb-2" />
            <p className="text-2xl font-bold text-gray-900">{stats?.mealsSaved || 0}</p>
            <p className="text-sm text-gray-600">Meals Saved</p>
          </div>
        </div>

        {/* Active Cities */}
        <div className="card mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Active Cities</h2>
          <div className="flex flex-wrap gap-2">
            {stats?.citiesActive.map((city) => (
              <span key={city} className="badge-info">
                {city}
              </span>
            ))}
          </div>
        </div>

        {/* Recent Posts */}
        <div className="card">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Recent Posts</h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Food Type</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">City</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Status</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Created</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody>
                {recentPosts.map((post) => (
                  <tr key={post.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4">{post.foodType}</td>
                    <td className="py-3 px-4">{post.city}</td>
                    <td className="py-3 px-4">
                      <span className={`badge ${
                        post.status === 'POSTED' ? 'badge-success' :
                        post.status === 'ACCEPTED' ? 'badge-info' :
                        post.status === 'COMPLETED' ? 'badge-success' :
                        'badge-warning'
                      }`}>
                        {post.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-600">
                      {new Date(post.createdAt).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-4">
                      <button
                        onClick={() => handleFlagPost(post.id)}
                        className="text-red-600 hover:text-red-700 text-sm font-medium"
                      >
                        Flag
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}
