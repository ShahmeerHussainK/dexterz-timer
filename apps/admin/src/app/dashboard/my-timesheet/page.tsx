'use client'

import { useEffect, useState } from 'react'
import { api } from '@/lib/api'
import { formatMinutes, formatDate, getWorkingDay } from '@/lib/utils'
import { Clock, Activity, TrendingUp, Calendar, BarChart3 } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
import { GroupedTimeline } from '@/components/GroupedTimeline'

export default function MyTimesheetPage() {
  const [timesheet, setTimesheet] = useState<any>(null)
  const [activityRate, setActivityRate] = useState<number | null>(null)
  const [loading, setLoading] = useState(true)
  const [viewType, setViewType] = useState<'daily' | 'weekly' | 'monthly'>('weekly')
  const [dateRange, setDateRange] = useState({
    from: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    to: new Date().toISOString().split('T')[0],
  })
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    const init = async () => {
      const userData = await loadUser()
      if (userData) {
        const range = calculateDateRange(viewType)
        setDateRange(range)
        await loadTimesheetData(userData.id, range.from, range.to)
      }
    }
    init()
  }, [])

  useEffect(() => {
    if (user) {
      const range = calculateDateRange(viewType)
      setDateRange(range)
      loadTimesheetData(user.id, range.from, range.to)
    }
  }, [viewType])

  const calculateDateRange = (type: 'daily' | 'weekly' | 'monthly') => {
    const now = new Date()
    const getLocalDate = (date: Date) => {
      const year = date.getFullYear()
      const month = String(date.getMonth() + 1).padStart(2, '0')
      const day = String(date.getDate()).padStart(2, '0')
      return `${year}-${month}-${day}`
    }

    const today = getLocalDate(now)
    let from, to

    if (type === 'daily') {
      from = to = today
    } else if (type === 'weekly') {
      const dayOfWeek = now.getDay()
      const daysToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1
      const monday = new Date(now.getTime() - daysToMonday * 24 * 60 * 60 * 1000)
      from = getLocalDate(monday)
      to = today
    } else {
      const firstDay = new Date(now.getFullYear(), now.getMonth(), 1)
      from = getLocalDate(firstDay)
      to = today
    }

    return { from, to }
  }

  const loadUser = async () => {
    try {
      const userData = await api.getCurrentUser()
      setUser(userData)
      return userData
    } catch (error) {
      console.error('Failed to load user:', error)
      return null
    }
  }

  const loadTimesheetData = async (userId: string, from: string, to: string) => {
    setLoading(true)
    try {
      const [timesheetData, activityRateData] = await Promise.all([
        api.getUserTimesheet(userId, from, to),
        api.getActivityRate(userId, from, to)
      ])
      setTimesheet(timesheetData)
      setActivityRate(activityRateData.activityRate)
    } catch (error) {
      console.error('Failed to load timesheet:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading || !user) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-gray-200 border-t-primary"></div>
      </div>
    )
  }

  // Calculate stats
  const totalMinutes = timesheet?.entries?.reduce((sum: number, entry: any) => {
    const start = new Date(entry.startedAt)
    const end = new Date(entry.endedAt)
    return sum + Math.floor((end.getTime() - start.getTime()) / 60000)
  }, 0) || 0

  const activeMinutes = timesheet?.entries
    ?.filter((e: any) => e.kind === 'ACTIVE')
    .reduce((sum: number, entry: any) => {
      const start = new Date(entry.startedAt)
      const end = new Date(entry.endedAt)
      return sum + Math.floor((end.getTime() - start.getTime()) / 60000)
    }, 0) || 0

  const idleMinutes = timesheet?.entries
    ?.filter((e: any) => e.kind === 'IDLE')
    .reduce((sum: number, entry: any) => {
      const start = new Date(entry.startedAt)
      const end = new Date(entry.endedAt)
      return sum + Math.floor((end.getTime() - start.getTime()) / 60000)
    }, 0) || 0

  // Format date for display
  const formatDateDisplay = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    })
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#F1F4F7', fontFamily: '"Darker Grotesque", sans-serif' }}>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-black text-gray-900" style={{ fontWeight: 900 }}>
            My Timesheet
          </h1>
          <p className="mt-1 text-sm text-gray-500">Detailed activity breakdown</p>
        </div>

        {/* View Type Tabs & Date Display */}
        <div className="flex items-center justify-between flex-wrap gap-4">
          {/* Day/Week/Month Tabs */}
          <div className="flex gap-1 bg-white rounded-full p-1 shadow-sm">
            <button
              onClick={() => setViewType('daily')}
              className="px-6 py-2 rounded-full text-sm font-bold transition-all"
              style={{
                backgroundColor: viewType === 'daily' ? '#1ABC9C' : 'transparent',
                color: viewType === 'daily' ? 'white' : '#6B7280',
                fontWeight: 700
              }}
            >
              Day
            </button>
            <button
              onClick={() => setViewType('weekly')}
              className="px-6 py-2 rounded-full text-sm font-bold transition-all"
              style={{
                backgroundColor: viewType === 'weekly' ? '#1ABC9C' : 'transparent',
                color: viewType === 'weekly' ? 'white' : '#6B7280',
                fontWeight: 700
              }}
            >
              Week
            </button>
            <button
              onClick={() => setViewType('monthly')}
              className="px-6 py-2 rounded-full text-sm font-bold transition-all"
              style={{
                backgroundColor: viewType === 'monthly' ? '#1ABC9C' : 'transparent',
                color: viewType === 'monthly' ? 'white' : '#6B7280',
                fontWeight: 700
              }}
            >
              Month
            </button>
          </div>

          {/* Date Picker */}
          <div
            className="flex items-center gap-3 px-4 py-2 rounded-lg"
            style={{ backgroundColor: '#CEF0EA' }}
          >
            <Calendar className="h-4 w-4 text-gray-600" />
            {viewType === 'daily' ? (
              <input
                type="date"
                value={dateRange.from}
                onChange={(e) => {
                  const newRange = { from: e.target.value, to: e.target.value }
                  setDateRange(newRange)
                  if (user) loadTimesheetData(user.id, newRange.from, newRange.to)
                }}
                className="bg-transparent border-none text-sm font-semibold text-gray-700 focus:outline-none cursor-pointer"
                style={{ fontFamily: '"Darker Grotesque", sans-serif' }}
              />
            ) : (
              <div className="flex items-center gap-2">
                <input
                  type="date"
                  value={dateRange.from}
                  onChange={(e) => {
                    const newRange = { ...dateRange, from: e.target.value }
                    setDateRange(newRange)
                    if (user) loadTimesheetData(user.id, newRange.from, newRange.to)
                  }}
                  className="bg-transparent border-none text-sm font-semibold text-gray-700 focus:outline-none cursor-pointer"
                  style={{ fontFamily: '"Darker Grotesque", sans-serif' }}
                />
                <span className="text-gray-500 font-bold">to</span>
                <input
                  type="date"
                  value={dateRange.to}
                  onChange={(e) => {
                    const newRange = { ...dateRange, to: e.target.value }
                    setDateRange(newRange)
                    if (user) loadTimesheetData(user.id, newRange.from, newRange.to)
                  }}
                  className="bg-transparent border-none text-sm font-semibold text-gray-700 focus:outline-none cursor-pointer"
                  style={{ fontFamily: '"Darker Grotesque", sans-serif' }}
                />
              </div>
            )}
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
          {/* Total Time */}
          <div className="bg-white rounded-2xl p-5 shadow-sm">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-semibold" style={{ color: '#2563EB' }}>Total Time</p>
                <p className="mt-2 text-2xl font-black text-gray-900" style={{ fontWeight: 900 }}>
                  {formatMinutes(totalMinutes)}
                </p>
              </div>
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center"
                style={{ backgroundColor: '#E8F4FD' }}
              >
                <Clock className="h-5 w-5" style={{ color: '#2563EB' }} />
              </div>
            </div>
          </div>

          {/* Active Time */}
          <div className="bg-white rounded-2xl p-5 shadow-sm">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-semibold" style={{ color: '#45C8AF' }}>Active Time</p>
                <p className="mt-2 text-2xl font-black text-gray-900" style={{ fontWeight: 900 }}>
                  {formatMinutes(activeMinutes)}
                </p>
              </div>
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center"
                style={{ backgroundColor: '#E6F9F5' }}
              >
                <Activity className="h-5 w-5" style={{ color: '#45C8AF' }} />
              </div>
            </div>
          </div>

          {/* Idle Time */}
          <div className="bg-white rounded-2xl p-5 shadow-sm">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-semibold" style={{ color: '#FF0000' }}>Idle Time</p>
                <p className="mt-2 text-2xl font-black text-gray-900" style={{ fontWeight: 900 }}>
                  {formatMinutes(idleMinutes)}
                </p>
              </div>
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center"
                style={{ backgroundColor: '#FFEBEB' }}
              >
                <Clock className="h-5 w-5" style={{ color: '#FF0000' }} />
              </div>
            </div>
          </div>

          {/* Activity Rate */}
          <div className="bg-white rounded-2xl p-5 shadow-sm">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-semibold" style={{ color: '#FFBB00' }}>Activity Rate</p>
                <p className="mt-2 text-2xl font-black text-gray-900" style={{ fontWeight: 900 }}>
                  {activityRate !== null ? `${activityRate}%` : 'N/A'}
                </p>
              </div>
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center"
                style={{ backgroundColor: '#FFF8E6' }}
              >
                <TrendingUp className="h-5 w-5" style={{ color: '#FFBB00' }} />
              </div>
            </div>
          </div>
        </div>

        {/* Activity Overview */}
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100">
            <div className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-gray-700" />
              <h3 className="font-bold text-gray-900" style={{ fontWeight: 700 }}>Activity Overview</h3>
            </div>
          </div>
          <div className="p-6">
            <div className="grid gap-8 md:grid-cols-2">
              {/* Bar Chart */}
              <div>
                <h4 className="mb-4 text-sm font-semibold text-gray-600">Daily Activity Breakdown</h4>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart
                    data={(() => {
                      const dailyData: any = {}
                      timesheet?.entries?.forEach((entry: any) => {
                        const workingDay = getWorkingDay(entry.startedAt)
                        if (!dailyData[workingDay]) {
                          dailyData[workingDay] = { date: workingDay, active: 0, idle: 0 }
                        }
                        const start = new Date(entry.startedAt)
                        const end = new Date(entry.endedAt)
                        const minutes = Math.floor((end.getTime() - start.getTime()) / 60000)
                        if (entry.kind === 'ACTIVE') {
                          dailyData[workingDay].active += minutes
                        } else {
                          dailyData[workingDay].idle += minutes
                        }
                      })
                      return Object.values(dailyData)
                    })()}
                    margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                    <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#9CA3AF' }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 11, fill: '#9CA3AF' }} axisLine={false} tickLine={false} />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="active" fill="#45C8AF" name="Active" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="idle" fill="#FF0000" name="Idle" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Pie Chart */}
              <div>
                <h4 className="mb-4 text-sm font-semibold text-gray-600">Time Distribution</h4>
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={[
                        { name: 'Active', value: activeMinutes },
                        { name: 'Idle', value: idleMinutes },
                      ]}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent, value }) =>
                        value > 0 ? `${name}: ${(percent * 100).toFixed(1)}%` : ''
                      }
                      outerRadius={80}
                      innerRadius={45}
                      dataKey="value"
                    >
                      <Cell fill="#45C8AF" />
                      <Cell fill="#FF0000" />
                    </Pie>
                    <Tooltip formatter={(value: number) => `${value} min`} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>

        {/* Activity Timeline */}
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100">
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-gray-700" />
              <h3 className="font-bold text-gray-900" style={{ fontWeight: 700 }}>Activity Timeline</h3>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              {timesheet?.entries?.length || 0} entries
              {viewType !== 'daily' && ' (grouped by day)'}
            </p>
          </div>
          <GroupedTimeline entries={timesheet?.entries || []} viewType={viewType} />
        </div>
      </div>
    </div>
  )
}
