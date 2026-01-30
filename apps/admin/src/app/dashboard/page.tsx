'use client'

import { useEffect, useState } from 'react'
import { api } from '@/lib/api'
import { formatMinutes, formatDate } from '@/lib/utils'
import { Users, Clock, TrendingUp } from 'lucide-react'
import { LoadingSkeleton } from '@/components/LoadingSkeleton'

export default function DashboardPage() {
  const [report, setReport] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0])
  const [filter, setFilter] = useState<'all' | 'active' | 'inactive'>('all')
  const [activeUserIds, setActiveUserIds] = useState<Set<string>>(new Set())

  useEffect(() => {
    loadReport()
    loadActiveUsers()
    const interval = setInterval(loadActiveUsers, 30000) // Refresh every 30s
    return () => clearInterval(interval)
  }, [selectedDate])

  const loadActiveUsers = async () => {
    try {
      const activeUsers = await api.getActiveUsers()
      setActiveUserIds(new Set(activeUsers.map((u: any) => u.userId)))
    } catch (error) {
      console.error('Failed to load active users:', error)
    }
  }

  const loadReport = async () => {
    setLoading(true)
    try {
      const data = await api.getDailyReport(selectedDate)
      setReport(data)
    } catch (error) {
      console.error('Failed to load report:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <LoadingSkeleton />
  }

  const totalMinutes = report?.users?.reduce(
    (sum: number, user: any) => sum + user.totalMinutes,
    0
  ) || 0

  const totalActiveMinutes = report?.users?.reduce(
    (sum: number, user: any) => sum + user.activeMinutes,
    0
  ) || 0

  const activeUsers = activeUserIds.size
  const usersWithActivity = report?.users?.filter((u: any) => u.totalMinutes > 0).length || 0
  const inactiveUsers = report?.users?.filter((u: any) => u.totalMinutes === 0).length || 0

  const filteredUsers = report?.users?.filter((user: any) => {
    if (filter === 'active') return activeUserIds.has(user.userId)
    if (filter === 'inactive') return !activeUserIds.has(user.userId)
    return true
  }) || []

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#F1F4F7', fontFamily: '"Darker Grotesque", sans-serif' }}>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-3xl font-black text-gray-900" style={{ fontWeight: 900 }}>
              Dashboard
            </h1>
            <p className="mt-1 text-sm text-gray-500">
              Overview for {report?.date ? formatDate(report.date) : 'today'}
            </p>
          </div>
          <div
            className="flex items-center gap-2 bg-white px-4 py-2 rounded-full shadow-sm"
            style={{ border: '1px solid #E5E7EB' }}
          >
            <span style={{ color: '#1ABC9C' }}>📅</span>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="bg-transparent border-none outline-none text-sm font-semibold text-gray-700"
              style={{ fontFamily: '"Darker Grotesque", sans-serif' }}
            />
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-6 md:grid-cols-3">
          {/* Active Users */}
          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold" style={{ color: '#1ABC9C' }}>Active Users</p>
                <p className="mt-2 text-5xl font-black text-gray-900" style={{ fontWeight: 900 }}>
                  {activeUsers}
                </p>
                <p className="mt-1 text-xs text-gray-400">Currently Tracking</p>
              </div>
              <div
                className="w-14 h-14 rounded-full flex items-center justify-center"
                style={{ backgroundColor: '#E6F8F5' }}
              >
                <Users className="h-7 w-7" style={{ color: '#1ABC9C' }} />
              </div>
            </div>
          </div>

          {/* Total Hours */}
          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold" style={{ color: '#1ABC9C' }}>Total Hours</p>
                <p className="mt-2 text-5xl font-black text-gray-900" style={{ fontWeight: 900 }}>
                  {formatMinutes(totalMinutes)}
                </p>
                <p className="mt-1 text-xs text-gray-400">Total Tracked Time</p>
              </div>
              <div
                className="w-14 h-14 rounded-full flex items-center justify-center"
                style={{ backgroundColor: '#E6F8F5' }}
              >
                <Clock className="h-7 w-7" style={{ color: '#1ABC9C' }} />
              </div>
            </div>
          </div>

          {/* Avg Per User */}
          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold" style={{ color: '#1ABC9C' }}>Avg Per User</p>
                <p className="mt-2 text-5xl font-black text-gray-900" style={{ fontWeight: 900 }}>
                  {activeUsers > 0
                    ? formatMinutes(Math.round(totalMinutes / activeUsers))
                    : '0h 0m'}
                </p>
                <p className="mt-1 text-xs text-gray-400">Average Total Time</p>
              </div>
              <div
                className="w-14 h-14 rounded-full flex items-center justify-center"
                style={{ backgroundColor: '#E6F8F5' }}
              >
                <TrendingUp className="h-7 w-7" style={{ color: '#1ABC9C' }} />
              </div>
            </div>
          </div>
        </div>

        {/* Activity Breakdown */}
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          {/* Header */}
          <div className="px-6 py-5 border-b border-gray-100">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div>
                <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                  📊 Activity Breakdown
                </h2>
                <p className="text-xs text-gray-400 mt-1">Detailed user activity for selected date</p>
              </div>

              {/* Filter Pills */}
              <div className="flex gap-2">
                <button
                  onClick={() => setFilter('all')}
                  className="px-5 py-2 rounded-full text-sm font-bold transition-all"
                  style={{
                    backgroundColor: filter === 'all' ? '#1ABC9C' : '#F3F4F6',
                    color: filter === 'all' ? 'white' : '#6B7280'
                  }}
                >
                  All ({report?.users?.length || 0})
                </button>
                <button
                  onClick={() => setFilter('active')}
                  className="px-5 py-2 rounded-full text-sm font-bold transition-all"
                  style={{
                    backgroundColor: filter === 'active' ? '#1ABC9C' : '#F3F4F6',
                    color: filter === 'active' ? 'white' : '#6B7280'
                  }}
                >
                  Active ({activeUsers})
                </button>
                <button
                  onClick={() => setFilter('inactive')}
                  className="px-5 py-2 rounded-full text-sm font-bold transition-all"
                  style={{
                    backgroundColor: filter === 'inactive' ? '#1ABC9C' : '#F3F4F6',
                    color: filter === 'inactive' ? 'white' : '#6B7280'
                  }}
                >
                  Inactive ({(report?.users?.length || 0) - activeUsers})
                </button>
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50">
                  <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-gray-500">
                    User
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-gray-500">
                    Active Time
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-gray-500">
                    Idle Time
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-gray-500">
                    Total Time
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredUsers.length > 0 ? (
                  filteredUsers.map((user: any) => (
                    <tr key={user.userId} className="hover:bg-gray-50 transition-colors">
                      <td className="whitespace-nowrap px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div
                            className="h-10 w-10 rounded-full flex items-center justify-center text-white font-bold"
                            style={{ backgroundColor: '#FB923C' }}
                          >
                            {user.userName?.charAt(0).toUpperCase() || 'U'}
                          </div>
                          <div className="text-sm font-semibold text-gray-900">{user.userName}</div>
                        </div>
                      </td>
                      <td className="whitespace-nowrap px-6 py-4">
                        <span className="text-sm font-bold" style={{ color: '#1ABC9C' }}>
                          {formatMinutes(user.activeMinutes)}
                        </span>
                      </td>
                      <td className="whitespace-nowrap px-6 py-4">
                        <span className="text-sm font-bold" style={{ color: '#EF4444' }}>
                          {formatMinutes(user.idleMinutes)}
                        </span>
                      </td>
                      <td className="whitespace-nowrap px-6 py-4">
                        <span className="text-sm font-bold text-gray-700">
                          {formatMinutes(user.totalMinutes)}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="px-6 py-12 text-center">
                      <div className="flex flex-col items-center gap-2">
                        <Clock className="h-12 w-12 text-gray-300" />
                        <p className="text-sm font-medium text-gray-500">No activity recorded</p>
                        <p className="text-xs text-gray-400">Users will appear here once they start tracking</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}
