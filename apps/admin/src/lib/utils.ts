import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { formatInTimeZone, utcToZonedTime } from 'date-fns-tz'

// Organization timezone - all times displayed in this timezone
const ORG_TIMEZONE = 'Asia/Karachi'

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
  const zonedDate = utcToZonedTime(d, ORG_TIMEZONE)
  const dateStr = zonedDate.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    timeZone: ORG_TIMEZONE,
  })
  const dayName = zonedDate.toLocaleDateString('en-US', { weekday: 'long', timeZone: ORG_TIMEZONE })
  return `${dateStr} - ${dayName}`
}

// Get the working day date for time tracking (handles cross-midnight sessions)
export function getWorkingDay(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date
  const zonedDate = utcToZonedTime(d, ORG_TIMEZONE)
  const hour = zonedDate.getHours()
  
  // If time is between 00:00-02:59, it belongs to the previous working day
  // because working hours are 16:50-02:00 (next day)
  if (hour >= 0 && hour < 3) {
    const previousDay = new Date(zonedDate)
    previousDay.setDate(zonedDate.getDate() - 1)
    return formatInTimeZone(previousDay, ORG_TIMEZONE, 'yyyy-MM-dd')
  }
  
  return formatInTimeZone(zonedDate, ORG_TIMEZONE, 'yyyy-MM-dd')
}

export function formatDateTime(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date
  return formatInTimeZone(d, ORG_TIMEZONE, 'MMM d, yyyy h:mm a')
}

// Format time in organization timezone
export function formatTime(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date
  return formatInTimeZone(d, ORG_TIMEZONE, 'h:mm a')
}

// Convert UTC date to organization timezone
export function toOrgTimezone(date: Date | string): Date {
  const d = typeof date === 'string' ? new Date(date) : date
  return utcToZonedTime(d, ORG_TIMEZONE)
}
