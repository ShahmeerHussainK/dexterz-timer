'use client'

import { useEffect, useState } from 'react'
import { api } from '@/lib/api'
import { formatMinutes, formatDateTime } from '@/lib/utils'
import { Calendar, Clock, Camera } from 'lucide-react'
import { LoadingSkeleton } from '@/components/LoadingSkeleton'
import ScreenshotTimeline from '@/components/screenshots/ScreenshotTimeline'

export default function TimesheetsPage() {
  const [users, setUsers] = useState<any[]>([])
  const [selectedUser, setSelectedUser] = useState<string>('')
  const [timesheet, setTimesheet] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [showScreenshots, setShowScreenshots] = useState(false)
  const [filter, setFilter] = useState<'all' | 'active' | 'inactive'>('all')
  const [dateRange, setDateRange] = useState({
    from: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    to: new Date().toISOString().split('T')[0],
  })

  useEffect(() => {
    loadUsers()
  }, [])

  useEffect(() => {
    if (selectedUser) {
      loadTimesheet()
    }
  }, [selectedUser, dateRange])

  const loadUsers = async () => {
    try {
      const data = await api.getUsers()
      setUsers(data)
      if (data.length > 0) {
        setSelectedUser(data[0].id)
      }
    } catch (error) {
      console.error('Failed to load users:', error)
    } finally {
      setLoading(false) // Stop loading after users loaded
    }
  }

  const loadTimesheet = async () => {
    if (!selectedUser) return
    setLoading(true)
    try {
      const data = await api.getUserTimesheet(selectedUser, dateRange.from, dateRange.to)
      setTimesheet(data)
    } catch (error) {
      console.error('Failed to load timesheet:', error)
    } finally {
      setLoading(false)
    }
  }

  const totalMinutes = timesheet?.entries?.reduce((sum: number, entry: any) => {
    const start = new Date(entry.startedAt)
    const end = new Date(entry.endedAt)
    return sum + Math.floor((end.getTime() - start.getTime()) / 60000)
  }, 0) || 0

  const activeEntries = timesheet?.entries?.filter((e: any) => e.kind === 'ACTIVE') || []
  const inactiveEntries = timesheet?.entries?.filter((e: any) => e.kind !== 'ACTIVE') || []

  const filteredEntries = timesheet?.entries?.filter((entry: any) => {
    if (filter === 'active') return entry.kind === 'ACTIVE'
    if (filter === 'inactive') return entry.kind !== 'ACTIVE'
    return true
  }) || []

  if (loading) {
    return <LoadingSkeleton />
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#F1F4F7', fontFamily: '"Darker Grotesque", sans-serif' }}>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-black text-gray-900" style={{ fontWeight: 900 }}>
            Timesheets
          </h1>
          <p className="mt-1 text-sm text-gray-500">View detailed time entries for users</p>
        </div>

        {/* Filters Row */}
        <div className="flex items-center gap-4 flex-wrap">
          {/* User Dropdown */}
          <select
            value={selectedUser}
            onChange={(e) => setSelectedUser(e.target.value)}
            className="bg-white rounded-lg border border-gray-200 px-4 py-2.5 text-sm font-medium text-gray-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 min-w-[200px]"
            style={{ fontFamily: '"Darker Grotesque", sans-serif' }}
          >
            {users.map((user) => (
              <option key={user.id} value={user.id}>
                {user.fullName || user.email}
              </option>
            ))}
          </select>

          {/* From Date */}
          <div className="flex items-center gap-2 bg-white rounded-lg border border-gray-200 px-4 py-2 shadow-sm">
            <span className="text-sm text-gray-500">From</span>
            <input
              type="date"
              value={dateRange.from}
              onChange={(e) => setDateRange({ ...dateRange, from: e.target.value })}
              className="bg-transparent border-none outline-none text-sm font-semibold text-gray-700"
              style={{ fontFamily: '"Darker Grotesque", sans-serif' }}
            />
          </div>

          {/* To Date */}
          <div className="flex items-center gap-2 bg-white rounded-lg border border-gray-200 px-4 py-2 shadow-sm">
            <span style={{ color: '#1ABC9C' }}>📅</span>
            <input
              type="date"
              value={dateRange.to}
              onChange={(e) => setDateRange({ ...dateRange, to: e.target.value })}
              className="bg-transparent border-none outline-none text-sm font-semibold text-gray-700"
              style={{ fontFamily: '"Darker Grotesque", sans-serif' }}
            />
          </div>
        </div>

        {/* Stats Cards */}
        {timesheet && (
          <div className="grid gap-6 md:grid-cols-2">
            {/* Total Time */}
            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold" style={{ color: '#1ABC9C' }}>Total Time</p>
                  <p className="mt-2 text-5xl font-black text-gray-900" style={{ fontWeight: 900 }}>
                    {formatMinutes(totalMinutes)}
                  </p>
                  <p className="mt-1 text-xs text-gray-400">Tracked Hours</p>
                </div>
                <div
                  className="w-14 h-14 rounded-full flex items-center justify-center"
                  style={{ backgroundColor: '#E6F8F5' }}
                >
                  <Clock className="h-7 w-7" style={{ color: '#1ABC9C' }} />
                </div>
              </div>
            </div>

            {/* Total Entries */}
            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold" style={{ color: '#1ABC9C' }}>Total Entries</p>
                  <p className="mt-2 text-5xl font-black text-gray-900" style={{ fontWeight: 900 }}>
                    {timesheet.entries?.length || 0}
                  </p>
                  <p className="mt-1 text-xs text-gray-400">Time Records</p>
                </div>
                <div
                  className="w-14 h-14 rounded-full flex items-center justify-center"
                  style={{ backgroundColor: '#E6F8F5' }}
                >
                  <Calendar className="h-7 w-7" style={{ color: '#1ABC9C' }} />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Time Entries Table */}
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          {/* Header */}
          <div className="px-6 py-5 border-b border-gray-100">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div>
                <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                  📊 Time Entries
                </h2>
                <p className="text-xs text-gray-400 mt-1">{timesheet?.entries?.length || 0} entries found</p>
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
                  All ({timesheet?.entries?.length || 0})
                </button>
                <button
                  onClick={() => setFilter('active')}
                  className="px-5 py-2 rounded-full text-sm font-bold transition-all"
                  style={{
                    backgroundColor: filter === 'active' ? '#1ABC9C' : '#F3F4F6',
                    color: filter === 'active' ? 'white' : '#6B7280'
                  }}
                >
                  Active ({activeEntries.length})
                </button>
                <button
                  onClick={() => setFilter('inactive')}
                  className="px-5 py-2 rounded-full text-sm font-bold transition-all"
                  style={{
                    backgroundColor: filter === 'inactive' ? '#1ABC9C' : '#F3F4F6',
                    color: filter === 'inactive' ? 'white' : '#6B7280'
                  }}
                >
                  Inactive ({inactiveEntries.length})
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
                    Started At
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-gray-500">
                    Ended At
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-gray-500">
                    Duration
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-gray-500">
                    Type
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-gray-500">
                    Source
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredEntries.map((entry: any) => {
                  const start = new Date(entry.startedAt)
                  const end = new Date(entry.endedAt)
                  const minutes = Math.floor((end.getTime() - start.getTime()) / 60000)
                  return (
                    <tr key={entry.id} className="hover:bg-gray-50 transition-colors">
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-700">
                        {formatDateTime(entry.startedAt)}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-700">
                        {formatDateTime(entry.endedAt)}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm font-semibold text-gray-700">
                        {formatMinutes(minutes)}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4">
                        <span
                          className="inline-flex rounded-full px-3 py-1 text-xs font-bold"
                          style={{
                            backgroundColor: entry.kind === 'ACTIVE' ? '#E6F8F5' : '#FEE2E2',
                            color: entry.kind === 'ACTIVE' ? '#1ABC9C' : '#EF4444'
                          }}
                        >
                          {entry.kind === 'ACTIVE' ? 'Active' : 'Idle'}
                        </span>
                      </td>
                      <td className="whitespace-nowrap px-6 py-4">
                        <span
                          className="inline-flex rounded-full px-3 py-1 text-xs font-bold"
                          style={{ backgroundColor: '#E6F8F5', color: '#1ABC9C' }}
                        >
                          {entry.source || 'Auto'}
                        </span>
                      </td>
                    </tr>
                  )
                })}
                {filteredEntries.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center">
                      <div className="flex flex-col items-center gap-2">
                        <Clock className="h-12 w-12 text-gray-300" />
                        <p className="text-sm font-medium text-gray-500">No entries found</p>
                        <p className="text-xs text-gray-400">Select a different date range or user</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Screenshots Section */}
        {showScreenshots && selectedUser && (
          <div className="bg-white rounded-2xl shadow-sm p-6">
            <div className="flex items-center gap-2 mb-4">
              <Camera className="h-5 w-5" style={{ color: '#1ABC9C' }} />
              <h3 className="font-bold text-gray-900">Screenshots</h3>
            </div>
            <ScreenshotTimeline userId={selectedUser} date={dateRange.to} />
          </div>
        )}

        {/* Show Screenshots Button */}
        <div className="flex justify-center">
          <button
            onClick={() => setShowScreenshots(!showScreenshots)}
            className="flex items-center gap-2 px-6 py-3 rounded-full text-sm font-bold transition-all"
            style={{
              backgroundColor: showScreenshots ? '#1ABC9C' : '#E6F8F5',
              color: showScreenshots ? 'white' : '#1ABC9C'
            }}
          >
            <Camera className="w-4 h-4" />
            {showScreenshots ? 'Hide Screenshots' : 'Show Screenshots'}
          </button>
        </div>
      </div>
    </div>
  )
}
