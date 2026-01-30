'use client'

import { useEffect, useState } from 'react'
import { api } from '@/lib/api'
import { formatMinutes } from '@/lib/utils'
import { Clock, Activity, Coffee } from 'lucide-react'

export default function MyActivityPage() {
  const [stats, setStats] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadStats()
    const interval = setInterval(loadStats, 60000) // Refresh every minute
    return () => clearInterval(interval)
  }, [])

  const loadStats = async () => {
    setLoading(true)
    try {
      const data = await api.getMyTodayStats()
      setStats(data)
    } catch (error) {
      console.error('Failed to load stats:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-12 w-64 bg-gray-200 rounded-lg"></div>
        <div className="grid gap-6 md:grid-cols-2">
          <div className="h-32 bg-gray-200 rounded-xl"></div>
          <div className="h-32 bg-gray-200 rounded-xl"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#F1F4F7', fontFamily: '"Darker Grotesque", sans-serif' }}>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-black text-gray-900" style={{ fontWeight: 900 }}>
            My Activity
          </h1>
          <p className="mt-1 text-sm text-gray-500">Your activity for today</p>
        </div>

        {/* Stats Grid */}
        <div className="grid gap-6 md:grid-cols-2">
          {/* Active Time Card */}
          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-semibold" style={{ color: '#45C8AF' }}>Active Time</p>
                <div className="mt-2 flex items-baseline gap-1">
                  <p className="text-4xl font-black text-gray-900" style={{ fontWeight: 900 }}>
                    {formatMinutes(stats?.activeMinutes || 0).split(' ')[0]}
                  </p>
                  <p className="text-xl font-bold text-gray-900">hrs</p>
                  <p className="text-4xl font-black text-gray-900 ml-2" style={{ fontWeight: 900 }}>
                    {formatMinutes(stats?.activeMinutes || 0).split(' ')[2]}
                  </p>
                  <p className="text-xl font-bold text-gray-900">min</p>
                </div>
                <p className="mt-1 text-xs text-gray-400">Productive Work Time</p>
              </div>
              <div
                className="w-12 h-12 rounded-full flex items-center justify-center"
                style={{ backgroundColor: '#E6F9F5' }}
              >
                <Activity className="h-6 w-6" style={{ color: '#45C8AF' }} />
              </div>
            </div>
          </div>

          {/* Idle Time Card */}
          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-semibold" style={{ color: '#FF0000' }}>Idle Time</p>
                <div className="mt-2 flex items-baseline gap-1">
                  <p className="text-4xl font-black text-gray-900" style={{ fontWeight: 900 }}>
                    {formatMinutes(stats?.idleMinutes || 0).split(' ')[0]}
                  </p>
                  <p className="text-xl font-bold text-gray-900">hrs</p>
                  <p className="text-4xl font-black text-gray-900 ml-2" style={{ fontWeight: 900 }}>
                    {formatMinutes(stats?.idleMinutes || 0).split(' ')[2]}
                  </p>
                  <p className="text-xl font-bold text-gray-900">min</p>
                </div>
                <p className="mt-1 text-xs text-gray-400">Inactive Periods</p>
              </div>
              <div
                className="w-12 h-12 rounded-full flex items-center justify-center"
                style={{ backgroundColor: '#FFEBEB' }}
              >
                <Clock className="h-6 w-6" style={{ color: '#FF0000' }} />
              </div>
            </div>
          </div>
        </div>

        {/* Tips Section */}
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <h2 className="text-lg font-bold text-gray-900 mb-4" style={{ fontWeight: 700 }}>Tips</h2>
          <ul className="space-y-3">
            <li className="flex items-start gap-2 text-sm text-gray-500">
              <span className="mt-1.5 w-1 h-1 rounded-full bg-gray-300 shrink-0" />
              Keep the desktop app running to track your activity
            </li>
            <li className="flex items-start gap-2 text-sm text-gray-500">
              <span className="mt-1.5 w-1 h-1 rounded-full bg-gray-300 shrink-0" />
              Active time is counted when you're using keyboard/mouse
            </li>
            <li className="flex items-start gap-2 text-sm text-gray-500">
              <span className="mt-1.5 w-1 h-1 rounded-full bg-gray-300 shrink-0" />
              Idle time starts after 5 minutes of inactivity
            </li>
            <li className="flex items-start gap-2 text-sm text-gray-500">
              <span className="mt-1.5 w-1 h-1 rounded-full bg-gray-300 shrink-0" />
              Break time (22:00-23:00) is not counted
            </li>
          </ul>
        </div>
      </div>
    </div>
  )
}
