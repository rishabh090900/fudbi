'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/components/providers/AuthProvider'
import { Upload, MapPin, Clock, AlertCircle } from 'lucide-react'
import dynamic from 'next/dynamic'

const MapPicker = dynamic(() => import('@/components/MapPicker'), { ssr: false })

const INDIAN_CITIES = [
  'Mumbai', 'Delhi', 'Bangalore', 'Hyderabad', 'Chennai', 'Kolkata',
  'Pune', 'Ahmedabad', 'Jaipur', 'Surat', 'Lucknow', 'Kanpur'
]

export default function PostFoodPage() {
  const router = useRouter()
  const { user } = useAuth()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string>('')

  const [formData, setFormData] = useState({
    foodType: '',
    quantity: '',
    servings: '',
    description: '',
    contactName: user?.name || '',
    contactPhone: user?.phone || '',
    address: '',
    city: user?.city || '',
    landmark: '',
    latitude: null as number | null,
    longitude: null as number | null,
    expiryHours: '4',
    safetyChecklist: {
      freshlyPrepared: false,
      properStorage: false,
      noAllergensWarning: false,
      labeledCorrectly: false,
    },
  })

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setImageFile(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleCheckboxChange = (field: keyof typeof formData.safetyChecklist) => {
    setFormData({
      ...formData,
      safetyChecklist: {
        ...formData.safetyChecklist,
        [field]: !formData.safetyChecklist[field],
      },
    })
  }

  const allChecklistComplete = Object.values(formData.safetyChecklist).every(Boolean)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    if (!allChecklistComplete) {
      setError('Please complete all safety checklist items')
      setLoading(false)
      return
    }

    try {
      // First, upload image if present
      let imageUrl = ''
      if (imageFile) {
        const formData = new FormData()
        formData.append('file', imageFile)

        const uploadRes = await fetch('/api/upload/image', {
          method: 'POST',
          body: formData,
        })

        if (uploadRes.ok) {
          const { url } = await uploadRes.json()
          imageUrl = url
        }
      }

      // Create food post
      const response = await fetch('/api/posts/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          preparedAt: new Date().toISOString(),
          imageUrl,
          servings: parseInt(formData.servings),
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to create post')
      }

      const { postId } = await response.json()
      router.push(`/posts/${postId}`)
    } catch (err: any) {
      setError(err.message || 'Failed to post food')
    } finally {
      setLoading(false)
    }
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-xl mb-4">Please sign in to post food</p>
          <button onClick={() => router.push('/auth/signin')} className="btn-primary">
            Sign In
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Post Available Food</h1>
          <p className="text-gray-600">Share details about available food for quick pickup</p>
        </div>

        <form onSubmit={handleSubmit} className="card space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center gap-2">
              <AlertCircle className="w-5 h-5" />
              {error}
            </div>
          )}

          {/* Food Details */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
              <Upload className="w-5 h-5" />
              Food Details
            </h2>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Food Type *
                </label>
                <input
                  type="text"
                  value={formData.foodType}
                  onChange={(e) => setFormData({ ...formData, foodType: e.target.value })}
                  className="input-field"
                  placeholder="e.g., Biryani, Sandwiches, Dal-Rice"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Quantity *
                </label>
                <input
                  type="text"
                  value={formData.quantity}
                  onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                  className="input-field"
                  placeholder="e.g., 5 kg, 20 plates"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Approximate Servings *
              </label>
              <input
                type="number"
                value={formData.servings}
                onChange={(e) => setFormData({ ...formData, servings: e.target.value })}
                className="input-field"
                placeholder="e.g., 20"
                min="1"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="input-field"
                rows={3}
                placeholder="Any additional details about the food..."
              />
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Contact Person Name *
                </label>
                <input
                  type="text"
                  value={formData.contactName}
                  onChange={(e) => setFormData({ ...formData, contactName: e.target.value })}
                  className="input-field"
                  placeholder="Your name"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Contact Phone *
                </label>
                <input
                  type="tel"
                  value={formData.contactPhone}
                  onChange={(e) => setFormData({ ...formData, contactPhone: e.target.value })}
                  className="input-field"
                  placeholder="+91 9876543210"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Food Image (Optional)
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="input-field"
              />
              {imagePreview && (
                <img src={imagePreview} alt="Preview" className="mt-2 h-32 object-cover rounded" />
              )}
            </div>
          </div>

          {/* Location */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
              <MapPin className="w-5 h-5" />
              Pickup Location
            </h2>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Address *
              </label>
              <input
                type="text"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                className="input-field"
                placeholder="Building name, street, area"
                required
              />
              {formData.address && formData.city && (
                <a
                  href={
                    formData.latitude && formData.longitude
                      ? `https://www.google.com/maps/search/?api=1&query=${formData.latitude},${formData.longitude}`
                      : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(formData.address + ', ' + formData.city)}`
                  }
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 mt-2 text-sm text-primary-600 hover:text-primary-700"
                >
                  <MapPin className="w-4 h-4" />
                  View on Map
                </a>
              )}
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  City *
                </label>
                <select
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  className="input-field"
                  required
                >
                  <option value="">Select City</option>
                  {INDIAN_CITIES.map((city) => (
                    <option key={city} value={city}>
                      {city}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Landmark
                </label>
                <input
                  type="text"
                  value={formData.landmark}
                  onChange={(e) => setFormData({ ...formData, landmark: e.target.value })}
                  className="input-field"
                  placeholder="Nearby landmark"
                />
              </div>
            </div>

            {formData.city && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Pick Exact Location on Map *
                </label>
                <p className="text-sm text-gray-500 mb-2">
                  Click on the map to set the exact pickup location
                </p>
                {formData.latitude && formData.longitude && (
                  <p className="text-sm text-green-600 mb-2">
                    ✓ Location selected: {formData.latitude.toFixed(6)}, {formData.longitude.toFixed(6)}
                  </p>
                )}
                <MapPicker
                  city={formData.city}
                  initialPosition={
                    formData.latitude && formData.longitude
                      ? [formData.latitude, formData.longitude]
                      : undefined
                  }
                  onLocationSelect={(lat, lng) => {
                    setFormData({ ...formData, latitude: lat, longitude: lng });
                  }}
                />
              </div>
            )}
          </div>

          {/* Timing */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
              <Clock className="w-5 h-5" />
              Timing
            </h2>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Safe to consume for (hours) *
              </label>
              <p className="text-sm text-gray-500 mb-2">
                Food will be marked as prepared at current time
              </p>
              <select
                value={formData.expiryHours}
                onChange={(e) => setFormData({ ...formData, expiryHours: e.target.value })}
                className="input-field"
                required
              >
                <option value="2">2 hours</option>
                <option value="4">4 hours</option>
                <option value="6">6 hours</option>
                <option value="8">8 hours</option>
                <option value="12">12 hours</option>
              </select>
            </div>
          </div>

          {/* Safety Checklist */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-900">
              Safety Checklist *
            </h2>
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 space-y-3">
              {Object.entries({
                freshlyPrepared: 'Food was freshly prepared',
                properStorage: 'Food has been stored properly',
                noAllergensWarning: 'Common allergens are noted (if any)',
                labeledCorrectly: 'Food is labeled correctly',
              }).map(([key, label]) => (
                <label key={key} className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.safetyChecklist[key as keyof typeof formData.safetyChecklist]}
                    onChange={() => handleCheckboxChange(key as keyof typeof formData.safetyChecklist)}
                    className="w-5 h-5 text-primary-600 rounded focus:ring-primary-500"
                  />
                  <span className="text-gray-700">{label}</span>
                </label>
              ))}
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || !allChecklistComplete}
            className="w-full btn-primary py-3 text-lg"
          >
            {loading ? 'Posting...' : 'Post Food'}
          </button>
        </form>
      </div>
    </div>
  )
}
