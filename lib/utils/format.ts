export function formatTime(date: Date): string {
  return new Intl.DateTimeFormat('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  }).format(date)
}

export function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(date)
}

export function formatDateTime(date: Date): string {
  return `${formatDate(date)} at ${formatTime(date)}`
}

export function getExpiryColor(expiresAt: string): string {
  const now = new Date()
  const expiry = new Date(expiresAt)
  const hoursLeft = (expiry.getTime() - now.getTime()) / (1000 * 60 * 60)

  if (hoursLeft < 1) return 'text-red-600'
  if (hoursLeft < 2) return 'text-orange-600'
  return 'text-gray-700'
}

export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text
  return text.substring(0, maxLength) + '...'
}

export function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}
