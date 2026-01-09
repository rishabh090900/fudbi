'use client'

import Link from 'next/link'
import { Bell, Heart, Users, TrendingUp } from 'lucide-react'
import { useAuth } from '@/components/providers/AuthProvider'

export default function HomePage() {
  const { user } = useAuth()

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary-50 via-white to-primary-100 py-20 px-4">
        <div className="max-w-6xl mx-auto text-center">
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
            Stop Food Waste,
            <span className="text-primary-600"> Start Sharing</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Connect leftover food from your events with volunteers who can redistribute it to those in need. Fast, simple, and impactful.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {user ? (
              <>
                {user.role === 'host' ? (
                  <>
                    <Link href="/post-food" className="btn-primary text-lg px-8 py-3">
                      Post Food Now
                    </Link>
                    <Link href="/dashboard" className="btn-secondary text-lg px-8 py-3">
                      Go to Dashboard
                    </Link>
                  </>
                ) : (
                  <>
                    <Link href="/volunteer" className="btn-primary text-lg px-8 py-3">
                      View Available Food
                    </Link>
                    <Link href="/volunteer" className="btn-secondary text-lg px-8 py-3">
                      My Pickups
                    </Link>
                  </>
                )}
              </>
            ) : (
              <>
                <Link href="/auth/signup?role=host" className="btn-primary text-lg px-8 py-3">
                  Post Food Now
                </Link>
                <Link href="/auth/signup?role=volunteer" className="btn-secondary text-lg px-8 py-3">
                  Become a Volunteer
                </Link>
              </>
            )}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
            How It Works
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-100 rounded-full mb-4">
                <Bell className="w-8 h-8 text-primary-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Post in 1 Minute</h3>
              <p className="text-gray-600">
                Quick form to post available food with details like quantity, type, and pickup location.
              </p>
            </div>
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-100 rounded-full mb-4">
                <Users className="w-8 h-8 text-primary-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Instant Matching</h3>
              <p className="text-gray-600">
                Nearby volunteers get instant notifications and can accept pickup requests immediately.
              </p>
            </div>
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-100 rounded-full mb-4">
                <Heart className="w-8 h-8 text-primary-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Make Impact</h3>
              <p className="text-gray-600">
                Food reaches those who need it before it expires. Track your positive impact.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 px-4 bg-primary-50">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-3 gap-8 text-center">
            <div>
              <div className="inline-flex items-center justify-center w-12 h-12 bg-primary-600 rounded-full mb-4">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
              <div className="text-4xl font-bold text-primary-600 mb-2">1000+</div>
              <div className="text-gray-600">Meals Saved</div>
            </div>
            <div>
              <div className="inline-flex items-center justify-center w-12 h-12 bg-primary-600 rounded-full mb-4">
                <Users className="w-6 h-6 text-white" />
              </div>
              <div className="text-4xl font-bold text-primary-600 mb-2">500+</div>
              <div className="text-gray-600">Active Volunteers</div>
            </div>
            <div>
              <div className="inline-flex items-center justify-center w-12 h-12 bg-primary-600 rounded-full mb-4">
                <Heart className="w-6 h-6 text-white" />
              </div>
              <div className="text-4xl font-bold text-primary-600 mb-2">50+</div>
              <div className="text-gray-600">Cities Covered</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-primary-600 text-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Join the Movement Today
          </h2>
          <p className="text-xl mb-8 text-primary-100">
            Every meal saved is a step towards a sustainable future
          </p>
          <Link href="/auth/signup" className="inline-block bg-white text-primary-600 px-8 py-3 rounded-lg font-semibold text-lg hover:bg-gray-100 transition-colors">
            Get Started Free
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-300 py-12 px-4">
        <div className="max-w-6xl mx-auto text-center">
          <div className="text-2xl font-bold text-white mb-4">FudBi</div>
          <p className="mb-6">Reducing food waste, one meal at a time</p>
          <div className="flex justify-center gap-8 text-sm">
            <Link href="/about" className="hover:text-white transition-colors">
              About
            </Link>
            <Link href="/how-it-works" className="hover:text-white transition-colors">
              How It Works
            </Link>
            <Link href="/privacy" className="hover:text-white transition-colors">
              Privacy
            </Link>
            <Link href="/terms" className="hover:text-white transition-colors">
              Terms
            </Link>
          </div>
          <div className="mt-8 text-sm text-gray-500">
            © 2026 FudBi. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  )
}
