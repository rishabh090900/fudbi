'use client'

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { CognitoUser, AuthenticationDetails } from 'amazon-cognito-identity-js'
import { User } from '@/types'

interface AuthContextType {
  user: User | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<void>
  signUp: (email: string, password: string, name: string, phone: string, city: string, role: 'host' | 'volunteer') => Promise<void>
  signOut: () => Promise<void>
  confirmSignUp: (email: string, code: string) => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = async () => {
    try {
      const response = await fetch('/api/auth/session')
      if (response.ok) {
        const data = await response.json()
        setUser(data.user)
      }
    } catch (error) {
      console.error('Auth check failed:', error)
    } finally {
      setLoading(false)
    }
  }

  const signIn = async (email: string, password: string) => {
    const response = await fetch('/api/auth/signin', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || 'Sign in failed')
    }

    const data = await response.json()
    setUser(data.user)
  }

  const signUp = async (
    email: string,
    password: string,
    name: string,
    phone: string,
    city: string,
    role: 'host' | 'volunteer'
  ) => {
    const response = await fetch('/api/auth/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, name, phone, city, role }),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || 'Sign up failed')
    }
  }

  const confirmSignUp = async (email: string, code: string) => {
    const response = await fetch('/api/auth/confirm', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, code }),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || 'Confirmation failed')
    }
  }

  const signOut = async () => {
    await fetch('/api/auth/signout', { method: 'POST' })
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signUp, signOut, confirmSignUp }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}
