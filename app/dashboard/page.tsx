'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/components/providers/AuthProvider'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Package, Users, TrendingUp, Plus, LogOut, List } from 'lucide-react'

export default function Dashboard() {
  const { user, loading: authLoading, signOut } = useAuth()
  const router = useRouter()
  const [stats, setStats] = useState({
    totalPosts: 0,
    activePickups: 0,
    completedPickups: 0,
    mealsSaved: 0,
  })

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
      fetchStats()
    }
  }, [user])

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/stats/user')
      const data = await response.json()
      setStats(data)
    } catch (error) {
      console.error('Error fetching stats:', error)
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
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
            <p className="text-gray-600">Welcome back, {user.name}!</p>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/volunteer" className="btn-secondary flex items-center gap-2">
              <List className="w-5 h-5" />
              View Available Food
            </Link>
            <Link href="/post-food" className="btn-primary flex items-center gap-2">
              <Plus className="w-5 h-5" />
              Post Food
            </Link>
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
        </div>
      </header>

      {/* Stats */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <div className="card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Total Posts</p>
                <p className="text-3xl font-bold text-gray-900">{stats.totalPosts}</p>
              </div>
              <Package className="w-12 h-12 text-primary-600" />
            </div>
          </div>

          <div className="card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Active Pickups</p>
                <p className="text-3xl font-bold text-gray-900">{stats.activePickups}</p>
              </div>
              <Users className="w-12 h-12 text-blue-600" />
            </div>
          </div>

          <div className="card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Completed</p>
                <p className="text-3xl font-bold text-gray-900">{stats.completedPickups}</p>
              </div>
              <TrendingUp className="w-12 h-12 text-green-600" />
            </div>
          </div>

          <div className="card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Meals Saved</p>
                <p className="text-3xl font-bold text-gray-900">{stats.mealsSaved}</p>
              </div>
              <TrendingUp className="w-12 h-12 text-orange-600" />
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="card">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
          <div className="grid md:grid-cols-3 gap-4">
            <Link href="/post-food" className="p-4 border border-gray-200 rounded-lg hover:border-primary-600 hover:bg-primary-50 transition-colors">
              <h3 className="font-semibold text-gray-900 mb-2">Post Food</h3>
              <p className="text-sm text-gray-600">Share available food with the community</p>
            </Link>
            <Link href="/my-posts" className="p-4 border border-gray-200 rounded-lg hover:border-primary-600 hover:bg-primary-50 transition-colors">
              <h3 className="font-semibold text-gray-900 mb-2">My Posts</h3>
              <p className="text-sm text-gray-600">View and manage your food posts</p>
            </Link>
            <Link href="/profile" className="p-4 border border-gray-200 rounded-lg hover:border-primary-600 hover:bg-primary-50 transition-colors">
              <h3 className="font-semibold text-gray-900 mb-2">Profile</h3>
              <p className="text-sm text-gray-600">Update your account settings</p>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
