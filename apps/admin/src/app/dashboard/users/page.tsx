'use client'

import { useEffect, useState } from 'react'
import { api } from '@/lib/api'
import { formatMinutes, formatDate } from '@/lib/utils'
import { toast } from '@/lib/toast'
import { Plus, Pencil, Trash2, Eye, X, Clock, Activity, TrendingUp, Calendar, BarChart3, Key } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
import { GroupedTimeline } from '@/components/GroupedTimeline'

export default function UsersPage() {
  const [users, setUsers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [showDetailModal, setShowDetailModal] = useState(false)
  const [showPasswordModal, setShowPasswordModal] = useState(false)
  const [editingUser, setEditingUser] = useState<any>(null)
  const [resetPasswordUser, setResetPasswordUser] = useState<any>(null)
  const [newPassword, setNewPassword] = useState('')
  const [selectedUser, setSelectedUser] = useState<any>(null)
  const [timesheet, setTimesheet] = useState<any>(null)
  const [loadingTimesheet, setLoadingTimesheet] = useState(false)
  const [activityRate, setActivityRate] = useState<number | null>(null)
  const [schedule, setSchedule] = useState<any>(null)
  const [viewType, setViewType] = useState<'daily' | 'weekly' | 'monthly'>('weekly')
  const [dateRange, setDateRange] = useState({
    from: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    to: new Date().toISOString().split('T')[0],
  })
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    fullName: '',
    role: 'MEMBER',
  })

  useEffect(() => {
    loadUsers()
    loadSchedule()
    checkForAppUpdates()
  }, [])

  const checkForAppUpdates = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/app/version')
      const data = await response.json()
      
      // Store in localStorage to show once per version
      const lastNotifiedVersion = localStorage.getItem('lastNotifiedAppVersion')
      
      if (data.version && lastNotifiedVersion !== data.version) {
        toast.info(
          `🎉 New Desktop App v${data.version} Available! Click "Download Desktop App" button in sidebar.`,
          { duration: 10000 }
        )
        localStorage.setItem('lastNotifiedAppVersion', data.version)
      }
    } catch (error) {
      console.log('Could not check for app updates')
    }
  }

  const loadSchedule = async () => {
    try {
      const data = await api.getSchedule()
      setSchedule(data)
    } catch (error) {
      console.error('Failed to load schedule:', error)
    }
  }

  const loadUsers = async () => {
    try {
      const data = await api.getUsers()
      setUsers(data)
    } catch (error) {
      console.error('Failed to load users:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      if (editingUser) {
        await api.updateUser(editingUser.id, {
          fullName: formData.fullName,
          role: formData.role,
        })
      } else {
        await api.createUser(formData)
      }
      setShowModal(false)
      setEditingUser(null)
      setFormData({ email: '', password: '', fullName: '', role: 'MEMBER' })
      loadUsers()
      toast.success(editingUser ? 'User updated successfully' : 'User created successfully')
    } catch (error) {
      console.error('Failed to save user:', error)
      toast.error('Failed to save user')
    }
  }

  const handleEdit = (user: any) => {
    setEditingUser(user)
    setFormData({
      email: user.email,
      password: '',
      fullName: user.fullName || '',
      role: user.role,
    })
    setShowModal(true)
  }

  const handleDelete = async (id: string) => {
    try {
      await api.deleteUser(id)
      loadUsers()
      toast.success('User deleted successfully')
    } catch (error) {
      console.error('Failed to delete user:', error)
      toast.error('Failed to delete user')
    }
  }

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!resetPasswordUser || !newPassword) return
    
    try {
      await api.resetUserPassword(resetPasswordUser.id, newPassword)
      setShowPasswordModal(false)
      setResetPasswordUser(null)
      setNewPassword('')
      toast.success('Password reset successfully')
    } catch (error) {
      console.error('Failed to reset password:', error)
      toast.error('Failed to reset password')
    }
  }

  const handleViewDetails = async (user: any) => {
    setSelectedUser(user)
    setShowDetailModal(true)
    setLoadingTimesheet(true)
    setActivityRate(null)
    try {
      const [timesheetData, activityRateData] = await Promise.all([
        api.getUserTimesheet(user.id, dateRange.from, dateRange.to),
        api.getActivityRate(user.id, dateRange.from, dateRange.to)
      ])
      console.log('📊 Activity Rate Data:', activityRateData)
      console.log('📊 Activity Rate Value:', activityRateData.activityRate)
      setTimesheet(timesheetData)
      setActivityRate(activityRateData.activityRate)
      console.log('📊 State updated with activity rate:', activityRateData.activityRate)
    } catch (error) {
      console.error('Failed to load data:', error)
    } finally {
      setLoadingTimesheet(false)
    }
  }

  useEffect(() => {
    if (selectedUser && showDetailModal) {
      // Update date range based on view type (use local date to avoid timezone issues)
      const now = new Date()
      const getLocalDate = (date: Date) => {
        const year = date.getFullYear()
        const month = String(date.getMonth() + 1).padStart(2, '0')
        const day = String(date.getDate()).padStart(2, '0')
        return `${year}-${month}-${day}`
      }
      
      const today = getLocalDate(now)
      let from, to
      
      if (viewType === 'daily') {
        // Daily: today only
        from = to = today
      } else if (viewType === 'weekly') {
        // Weekly: current week (Monday to today)
        const dayOfWeek = now.getDay()
        const daysToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1
        const monday = new Date(now.getTime() - daysToMonday * 24 * 60 * 60 * 1000)
        from = getLocalDate(monday)
        to = today
      } else {
        // Monthly: current month (1st to today)
        const firstDay = new Date(now.getFullYear(), now.getMonth(), 1)
        from = getLocalDate(firstDay)
        to = today
      }
      
      setDateRange({ from, to })
    }
  }, [viewType])
  
  useEffect(() => {
    if (selectedUser && showDetailModal) {
      // Reload data when date range changes
      const loadData = async () => {
        setLoadingTimesheet(true)
        setActivityRate(null)
        try {
          const [timesheetData, activityRateData] = await Promise.all([
            api.getUserTimesheet(selectedUser.id, dateRange.from, dateRange.to),
            api.getActivityRate(selectedUser.id, dateRange.from, dateRange.to)
          ])
          console.log('📊 Activity Rate Data (useEffect):', activityRateData)
          console.log('📊 Activity Rate Value (useEffect):', activityRateData.activityRate)
          setTimesheet(timesheetData)
          setActivityRate(activityRateData.activityRate)
          console.log('📊 State updated with activity rate (useEffect):', activityRateData.activityRate)
        } catch (error) {
          console.error('Failed to load data:', error)
        } finally {
          setLoadingTimesheet(false)
        }
      }
      loadData()
    }
  }, [dateRange, selectedUser, showDetailModal])

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-gray-200 border-t-primary"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6 pb-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">Users</h1>
          <p className="mt-1 text-sm text-gray-500">👥 Manage organization users</p>
        </div>
        <button
          onClick={() => {
            setEditingUser(null)
            setFormData({ email: '', password: '', fullName: '', role: 'MEMBER' })
            setShowModal(true)
          }}
          className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-primary to-primary/80 px-4 py-2 text-sm font-medium text-white shadow-lg hover:shadow-xl transition-all hover:scale-105"
        >
          <Plus className="h-4 w-4" />
          Add User
        </button>
      </div>

      <div className="rounded-xl bg-white shadow-lg overflow-hidden">
        <div className="border-b border-gray-200 bg-gradient-to-r from-gray-50 to-gray-100 px-4 sm:px-6 py-4">
          <h2 className="text-base sm:text-lg font-semibold text-gray-900">👤 User Directory</h2>
          <p className="text-xs text-gray-500 mt-1">{users.length} total users</p>
        </div>
        <div className="block sm:hidden">
          {/* Mobile Card View */}
          <div className="divide-y divide-gray-200">
            {users.map((user) => (
              <div key={user.id} className="p-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-start gap-3">
                  <div className="h-10 w-10 flex-shrink-0 rounded-full bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center text-white text-sm font-semibold shadow-md">
                    {user.fullName?.charAt(0).toUpperCase() || user.email?.charAt(0).toUpperCase() || 'U'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <h3 className="text-sm font-semibold text-gray-900 truncate">{user.fullName || 'N/A'}</h3>
                        <p className="text-xs text-gray-500 truncate mt-0.5">{user.email}</p>
                      </div>
                      <div className="flex gap-1 flex-shrink-0">
                        <button
                          onClick={() => handleViewDetails(user)}
                          className="rounded-lg p-1.5 text-blue-600 hover:bg-blue-50 transition-colors"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleEdit(user)}
                          className="rounded-lg p-1.5 text-gray-600 hover:bg-gray-100 transition-colors"
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => {
                            setResetPasswordUser(user)
                            setShowPasswordModal(true)
                          }}
                          className="rounded-lg p-1.5 text-orange-600 hover:bg-orange-50 transition-colors"
                        >
                          <Key className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(user.id)}
                          className="rounded-lg p-1.5 text-red-600 hover:bg-red-50 transition-colors"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                    <div className="flex gap-2 mt-2">
                      <span className="inline-flex rounded-full bg-blue-100 px-2 py-1 text-xs font-semibold text-blue-700">
                        {user.role}
                      </span>
                      <span
                        className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${
                          user.isActive
                            ? 'bg-green-100 text-green-700'
                            : 'bg-gray-100 text-gray-600'
                        }`}
                      >
                        {user.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="hidden sm:block overflow-x-auto">
          {/* Desktop Table View */}
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-3 sm:px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  User
                </th>
                <th className="px-3 sm:px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Role
                </th>
                <th className="px-3 sm:px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Status
                </th>
                <th className="px-3 sm:px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {users.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-3 sm:px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="h-8 w-8 sm:h-10 sm:w-10 flex-shrink-0 rounded-full bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center text-white text-xs sm:text-sm font-semibold shadow-md">
                        {user.fullName?.charAt(0).toUpperCase() || user.email?.charAt(0).toUpperCase() || 'U'}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="text-xs sm:text-sm font-medium text-gray-900 truncate">
                          {user.fullName || 'N/A'}
                        </div>
                        <div className="text-xs text-gray-500 truncate">
                          {user.email}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-3 sm:px-4 py-3">
                    <span className="inline-flex rounded-full bg-blue-100 px-2 py-1 text-xs font-semibold text-blue-700">
                      {user.role}
                    </span>
                  </td>
                  <td className="px-3 sm:px-4 py-3">
                    <span
                      className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${
                        user.isActive
                          ? 'bg-green-100 text-green-700'
                          : 'bg-gray-100 text-gray-600'
                      }`}
                    >
                      {user.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-3 sm:px-4 py-3">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => handleViewDetails(user)}
                        className="rounded-lg p-1.5 text-blue-600 hover:bg-blue-50 transition-colors"
                        title="View"
                      >
                        <Eye className="h-3 w-3 sm:h-4 sm:w-4" />
                      </button>
                      <button
                        onClick={() => handleEdit(user)}
                        className="rounded-lg p-1.5 text-gray-600 hover:bg-gray-100 transition-colors"
                        title="Edit"
                      >
                        <Pencil className="h-3 w-3 sm:h-4 sm:w-4" />
                      </button>
                      <button
                        onClick={() => {
                          setResetPasswordUser(user)
                          setShowPasswordModal(true)
                        }}
                        className="rounded-lg p-1.5 text-orange-600 hover:bg-orange-50 transition-colors"
                        title="Reset"
                      >
                        <Key className="h-3 w-3 sm:h-4 sm:w-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(user.id)}
                        className="rounded-lg p-1.5 text-red-600 hover:bg-red-50 transition-colors"
                        title="Delete"
                      >
                        <Trash2 className="h-3 w-3 sm:h-4 sm:w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit/Create Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 px-4">
          <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
            <h2 className="text-xl font-bold text-gray-900">
              {editingUser ? 'Edit User' : 'Add User'}
            </h2>
            <form onSubmit={handleSubmit} className="mt-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Email</label>
                <input
                  type="email"
                  required
                  disabled={!!editingUser}
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-primary focus:outline-none focus:ring-primary disabled:bg-gray-100"
                />
              </div>
              {!editingUser && (
                <div>
                  <label className="block text-sm font-medium text-gray-700">Password</label>
                  <input
                    type="password"
                    required
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-primary focus:outline-none focus:ring-primary"
                  />
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-gray-700">Full Name</label>
                <input
                  type="text"
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-primary focus:outline-none focus:ring-primary"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Role</label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-primary focus:outline-none focus:ring-primary"
                >
                  <option value="MEMBER">Member</option>
                  <option value="MANAGER">Manager</option>
                  <option value="ADMIN">Admin</option>
                  <option value="OWNER">Owner</option>
                </select>
              </div>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false)
                    setEditingUser(null)
                  }}
                  className="flex-1 rounded-lg border border-gray-300 px-4 py-2 text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 rounded-lg bg-primary px-4 py-2 text-white hover:bg-primary/90"
                >
                  {editingUser ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Reset Password Modal */}
      {showPasswordModal && resetPasswordUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 px-4">
          <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
            <h2 className="text-xl font-bold text-gray-900">
              Reset Password for {resetPasswordUser.fullName || resetPasswordUser.email}
            </h2>
            <form onSubmit={handleResetPassword} className="mt-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">New Password</label>
                <input
                  type="password"
                  required
                  minLength={6}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-primary focus:outline-none focus:ring-primary"
                  placeholder="Enter new password (min 6 characters)"
                />
              </div>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowPasswordModal(false)
                    setResetPasswordUser(null)
                    setNewPassword('')
                  }}
                  className="flex-1 rounded-lg border border-gray-300 px-4 py-2 text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 rounded-lg bg-orange-600 px-4 py-2 text-white hover:bg-orange-700"
                >
                  Reset Password
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* User Detail Modal */}
      {showDetailModal && selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-2 sm:p-4">
          <div className="relative h-[95vh] sm:h-[90vh] w-full max-w-6xl overflow-hidden rounded-lg bg-white shadow-xl">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-gray-200 px-4 sm:px-6 py-3 sm:py-4">
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 min-w-0 flex-1">
                <div className="min-w-0 flex-1">
                  <h2 className="text-lg sm:text-2xl font-bold text-gray-900 truncate">
                    {selectedUser.fullName || selectedUser.email}
                  </h2>
                  <p className="text-xs sm:text-sm text-gray-500 truncate">{selectedUser.email}</p>
                </div>
                <span
                  className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                    selectedUser.isActive
                      ? 'bg-green-100 text-green-800'
                      : 'bg-red-100 text-red-800'
                  }`}
                >
                  {selectedUser.isActive ? 'Active' : 'Inactive'}
                </span>
                <span className="inline-flex rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-800">
                  {selectedUser.role}
                </span>
              </div>
              <button
                onClick={() => {
                  setShowDetailModal(false)
                  setSelectedUser(null)
                  setTimesheet(null)
                }}
                className="rounded-lg p-2 hover:bg-gray-100"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Content */}
            <div className="h-[calc(95vh-70px)] sm:h-[calc(90vh-80px)] overflow-y-auto p-3 sm:p-6">
              <div className="space-y-6">
              {/* View Type Tabs */}
              <div className="mb-4 flex gap-1 sm:gap-2 bg-white rounded-lg p-1 sm:p-2 shadow-md w-full sm:w-fit overflow-x-auto">
                <button
                  onClick={() => setViewType('daily')}
                  className={`flex-1 sm:flex-none px-3 sm:px-6 py-1.5 sm:py-2 rounded-lg text-sm sm:text-base font-semibold transition-all whitespace-nowrap ${
                    viewType === 'daily'
                      ? 'bg-primary text-white shadow-md'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  📅 Daily
                </button>
                <button
                  onClick={() => setViewType('weekly')}
                  className={`flex-1 sm:flex-none px-3 sm:px-6 py-1.5 sm:py-2 rounded-lg text-sm sm:text-base font-semibold transition-all whitespace-nowrap ${
                    viewType === 'weekly'
                      ? 'bg-primary text-white shadow-md'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  📆 Weekly
                </button>
                <button
                  onClick={() => setViewType('monthly')}
                  className={`flex-1 sm:flex-none px-3 sm:px-6 py-1.5 sm:py-2 rounded-lg text-sm sm:text-base font-semibold transition-all whitespace-nowrap ${
                    viewType === 'monthly'
                      ? 'bg-primary text-white shadow-md'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  🗓️ Monthly
                </button>
              </div>

              {/* Date Range */}
              <div className="mb-6 rounded-lg bg-gray-50 p-4">
                <div className="flex items-center gap-4">
                  <Calendar className="h-5 w-5 text-gray-400" />
                  {viewType === 'daily' ? (
                    <div>
                      <label className="block text-xs font-medium text-gray-700">Select Date</label>
                      <input
                        type="date"
                        value={dateRange.from}
                        onChange={(e) => setDateRange({ from: e.target.value, to: e.target.value })}
                        className="mt-1 block rounded-md border border-gray-300 px-3 py-1.5 text-sm shadow-sm focus:border-primary focus:outline-none focus:ring-primary"
                      />
                    </div>
                  ) : (
                    <div className="flex items-center gap-4">
                      <div>
                        <label className="block text-xs font-medium text-gray-700">From</label>
                        <input
                          type="date"
                          value={dateRange.from}
                          onChange={(e) => setDateRange({ ...dateRange, from: e.target.value })}
                          className="mt-1 block rounded-md border border-gray-300 px-3 py-1.5 text-sm shadow-sm focus:border-primary focus:outline-none focus:ring-primary"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-700">To</label>
                        <input
                          type="date"
                          value={dateRange.to}
                          onChange={(e) => setDateRange({ ...dateRange, to: e.target.value })}
                          className="mt-1 block rounded-md border border-gray-300 px-3 py-1.5 text-sm shadow-sm focus:border-primary focus:outline-none focus:ring-primary"
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {loadingTimesheet ? (
                <div className="flex h-64 items-center justify-center">
                  <div className="text-gray-600">Loading...</div>
                </div>
              ) : (
                <>
                  {/* Check-in Status */}
                  {(() => {
                    const firstEntry = timesheet?.entries?.[0]
                    if (!firstEntry || !schedule) return null
                    
                    const start = new Date(firstEntry.startedAt)
                    const hour = start.getHours()
                    const minute = start.getMinutes()
                    const timeInMinutes = hour * 60 + minute
                    
                    // Parse schedule times
                    const [startHour, startMin] = schedule.checkinStart.split(':').map(Number)
                    const [endHour, endMin] = schedule.checkinEnd.split(':').map(Number)
                    const checkinStart = startHour * 60 + startMin
                    const checkinEnd = endHour * 60 + endMin
                    const onTimeEnd = checkinStart + 15
                    
                    let status, color, bgColor
                    
                    // Check if time is in valid window (handles overnight shift)
                    const isInWindow = timeInMinutes >= checkinStart || timeInMinutes <= checkinEnd
                    
                    if (!isInWindow) {
                      status = 'Early'
                      color = 'text-blue-700'
                      bgColor = 'bg-blue-50 border-blue-200'
                    } else if (timeInMinutes >= checkinStart && timeInMinutes <= onTimeEnd) {
                      status = 'On Time'
                      color = 'text-green-700'
                      bgColor = 'bg-green-50 border-green-200'
                    } else {
                      status = 'Late'
                      color = 'text-red-700'
                      bgColor = 'bg-red-50 border-red-200'
                    }
                    
                    return (
                      <div className={`mb-4 inline-flex items-center gap-2 rounded-lg border ${bgColor} px-3 py-2`}>
                        <span className="text-xs font-medium text-gray-600">Check-in:</span>
                        <span className={`text-sm font-bold ${color}`}>{status}</span>
                        <span className="text-xs text-gray-500">
                          {start.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    )
                  })()}

                  {/* Stats */}
                  <div className="mb-6 grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
                    <div className="rounded-lg bg-gradient-to-br from-blue-50 to-blue-100 p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-xs font-medium text-blue-600">Total Time</p>
                          <p className="mt-1 text-xl font-bold text-blue-900">
                            {formatMinutes(
                              timesheet?.entries?.reduce((sum: number, entry: any) => {
                                const start = new Date(entry.startedAt)
                                const end = new Date(entry.endedAt)
                                return sum + Math.floor((end.getTime() - start.getTime()) / 60000)
                              }, 0) || 0
                            )}
                          </p>
                        </div>
                        <Clock className="h-8 w-8 text-blue-600 opacity-50" />
                      </div>
                    </div>

                    <div className="rounded-lg bg-gradient-to-br from-green-50 to-green-100 p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-xs font-medium text-green-600">Active Time</p>
                          <p className="mt-1 text-xl font-bold text-green-900">
                            {formatMinutes(
                              timesheet?.entries
                                ?.filter((e: any) => e.kind === 'ACTIVE')
                                .reduce((sum: number, entry: any) => {
                                  const start = new Date(entry.startedAt)
                                  const end = new Date(entry.endedAt)
                                  return sum + Math.floor((end.getTime() - start.getTime()) / 60000)
                                }, 0) || 0
                            )}
                          </p>
                        </div>
                        <Activity className="h-8 w-8 text-green-600 opacity-50" />
                      </div>
                    </div>

                    <div className="rounded-lg bg-gradient-to-br from-yellow-50 to-yellow-100 p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-xs font-medium text-yellow-600">Idle Time</p>
                          <p className="mt-1 text-xl font-bold text-yellow-900">
                            {formatMinutes(
                              timesheet?.entries
                                ?.filter((e: any) => e.kind === 'IDLE')
                                .reduce((sum: number, entry: any) => {
                                  const start = new Date(entry.startedAt)
                                  const end = new Date(entry.endedAt)
                                  return sum + Math.floor((end.getTime() - start.getTime()) / 60000)
                                }, 0) || 0
                            )}
                          </p>
                        </div>
                        <Clock className="h-8 w-8 text-yellow-600 opacity-50" />
                      </div>
                    </div>

                    <div className="rounded-lg bg-gradient-to-br from-purple-50 to-purple-100 p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-xs font-medium text-purple-600">Activity Rate</p>
                          <p className="mt-1 text-xl font-bold text-purple-900">
                            {activityRate !== null ? `${activityRate}%` : 'N/A'}
                          </p>
                        </div>
                        <TrendingUp className="h-8 w-8 text-purple-600 opacity-50" />
                      </div>
                    </div>
                  </div>

                  {/* Activity Chart */}
                  <div className="mb-6 rounded-xl border border-gray-200 bg-white shadow-sm">
                    <div className="border-b border-gray-200 bg-gradient-to-r from-gray-50 to-gray-100 px-6 py-4">
                      <div className="flex items-center gap-2">
                        <BarChart3 className="h-5 w-5 text-primary" />
                        <h3 className="font-semibold text-gray-900">Activity Overview</h3>
                      </div>
                    </div>
                    <div className="p-6">
                      <div className="grid gap-8 grid-cols-1 lg:grid-cols-2">
                        {/* Bar Chart - Daily Activity */}
                        <div className="rounded-lg bg-gradient-to-br from-gray-50 to-white p-4">
                          <h4 className="mb-4 text-sm font-semibold text-gray-700">Daily Activity Breakdown</h4>
                          <ResponsiveContainer width="100%" height={280}>
                            <BarChart
                              data={(() => {
                                const dailyData: any = {}
                                timesheet?.entries?.forEach((entry: any) => {
                                  const date = formatDate(entry.startedAt)
                                  if (!dailyData[date]) {
                                    dailyData[date] = { date, active: 0, idle: 0 }
                                  }
                                  const start = new Date(entry.startedAt)
                                  const end = new Date(entry.endedAt)
                                  const minutes = Math.floor((end.getTime() - start.getTime()) / 60000)
                                  if (entry.kind === 'ACTIVE') {
                                    dailyData[date].active += minutes
                                  } else {
                                    dailyData[date].idle += minutes
                                  }
                                })
                                return Object.values(dailyData)
                              })()}
                              margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
                            >
                              <defs>
                                <linearGradient id="activeGradient" x1="0" y1="0" x2="0" y2="1">
                                  <stop offset="0%" stopColor="#10b981" stopOpacity={0.8} />
                                  <stop offset="100%" stopColor="#10b981" stopOpacity={0.3} />
                                </linearGradient>
                                <linearGradient id="idleGradient" x1="0" y1="0" x2="0" y2="1">
                                  <stop offset="0%" stopColor="#f59e0b" stopOpacity={0.8} />
                                  <stop offset="100%" stopColor="#f59e0b" stopOpacity={0.3} />
                                </linearGradient>
                              </defs>
                              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
                              <XAxis 
                                dataKey="date" 
                                tick={{ fontSize: 11, fill: '#6b7280' }} 
                                axisLine={{ stroke: '#e5e7eb' }}
                                tickLine={false}
                              />
                              <YAxis 
                                tick={{ fontSize: 11, fill: '#6b7280' }} 
                                axisLine={{ stroke: '#e5e7eb' }}
                                tickLine={false}
                                label={{ value: 'Minutes', angle: -90, position: 'insideLeft', style: { fontSize: 11, fill: '#6b7280' } }}
                              />
                              <Tooltip 
                                contentStyle={{ 
                                  backgroundColor: 'rgba(255, 255, 255, 0.95)', 
                                  border: '1px solid #e5e7eb',
                                  borderRadius: '8px',
                                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                                }}
                                labelStyle={{ fontWeight: 600, color: '#111827' }}
                              />
                              <Legend 
                                wrapperStyle={{ paddingTop: '10px' }}
                                iconType="circle"
                              />
                              <Bar 
                                dataKey="active" 
                                fill="url(#activeGradient)" 
                                name="Active" 
                                radius={[6, 6, 0, 0]}
                                animationDuration={800}
                              />
                              <Bar 
                                dataKey="idle" 
                                fill="url(#idleGradient)" 
                                name="Idle" 
                                radius={[6, 6, 0, 0]}
                                animationDuration={800}
                              />
                            </BarChart>
                          </ResponsiveContainer>
                        </div>

                        {/* Pie Chart - Active vs Idle */}
                        <div className="rounded-lg bg-gradient-to-br from-gray-50 to-white p-4">
                          <h4 className="mb-4 text-sm font-semibold text-gray-700">Time Distribution</h4>
                          <ResponsiveContainer width="100%" height={280}>
                            <PieChart>
                              <defs>
                                <linearGradient id="pieActiveGradient" x1="0" y1="0" x2="1" y2="1">
                                  <stop offset="0%" stopColor="#10b981" />
                                  <stop offset="100%" stopColor="#059669" />
                                </linearGradient>
                                <linearGradient id="pieIdleGradient" x1="0" y1="0" x2="1" y2="1">
                                  <stop offset="0%" stopColor="#f59e0b" />
                                  <stop offset="100%" stopColor="#d97706" />
                                </linearGradient>
                              </defs>
                              <Pie
                                data={[
                                  {
                                    name: 'Active',
                                    value: timesheet?.entries
                                      ?.filter((e: any) => e.kind === 'ACTIVE')
                                      .reduce((sum: number, entry: any) => {
                                        const start = new Date(entry.startedAt)
                                        const end = new Date(entry.endedAt)
                                        return sum + Math.floor((end.getTime() - start.getTime()) / 60000)
                                      }, 0) || 0,
                                  },
                                  {
                                    name: 'Idle',
                                    value: timesheet?.entries
                                      ?.filter((e: any) => e.kind === 'IDLE')
                                      .reduce((sum: number, entry: any) => {
                                        const start = new Date(entry.startedAt)
                                        const end = new Date(entry.endedAt)
                                        return sum + Math.floor((end.getTime() - start.getTime()) / 60000)
                                      }, 0) || 0,
                                  },
                                ]}
                                cx="50%"
                                cy="50%"
                                labelLine={false}
                                label={({ name, percent, value }) => 
                                  value > 0 ? `${name}: ${(percent * 100).toFixed(1)}%` : ''
                                }
                                outerRadius={90}
                                innerRadius={50}
                                fill="#8884d8"
                                dataKey="value"
                                animationBegin={0}
                                animationDuration={800}
                                paddingAngle={2}
                              >
                                <Cell fill="url(#pieActiveGradient)" stroke="#fff" strokeWidth={2} />
                                <Cell fill="url(#pieIdleGradient)" stroke="#fff" strokeWidth={2} />
                              </Pie>
                              <Tooltip 
                                contentStyle={{ 
                                  backgroundColor: 'rgba(255, 255, 255, 0.95)', 
                                  border: '1px solid #e5e7eb',
                                  borderRadius: '8px',
                                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                                }}
                                formatter={(value: number) => `${value} min`}
                              />
                            </PieChart>
                          </ResponsiveContainer>
                          <div className="mt-4 flex justify-center gap-6">
                            <div className="flex items-center gap-2">
                              <div className="h-3 w-3 rounded-full bg-gradient-to-br from-green-500 to-green-600"></div>
                              <span className="text-xs font-medium text-gray-600">Active Time</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <div className="h-3 w-3 rounded-full bg-gradient-to-br from-yellow-500 to-yellow-600"></div>
                              <span className="text-xs font-medium text-gray-600">Idle Time</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Timeline */}
                  <div className="rounded-lg border border-gray-200">
                    <div className="border-b border-gray-200 bg-gray-50 px-4 py-3">
                      <h3 className="font-semibold text-gray-900">Activity Timeline</h3>
                      <p className="text-xs text-gray-500">
                        {timesheet?.entries?.length || 0} entries
                        {viewType !== 'daily' && ' (grouped by day)'}
                      </p>
                    </div>
                    <GroupedTimeline entries={timesheet?.entries || []} viewType={viewType} />
                  </div>
                </>
              )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
