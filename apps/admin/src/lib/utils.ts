import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatMinutes(minutes: number): string {
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60
  return `${hours}h ${mins}m`
}

export function formatDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

// Get the working day date for time tracking (handles cross-midnight sessions)
export function getWorkingDay(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date
  const hour = d.getHours()
  
  // If time is between 00:00-02:59, it belongs to the previous working day
  // because working hours are 16:50-02:00 (next day)
  if (hour >= 0 && hour < 3) {
    const previousDay = new Date(d)
    previousDay.setDate(d.getDate() - 1)
    return previousDay.toISOString().split('T')[0]
  }
  
  return d.toISOString().split('T')[0]
}

export function formatDateTime(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date
  return d.toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}
