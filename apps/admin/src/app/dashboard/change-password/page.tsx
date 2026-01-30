'use client'

import { useState } from 'react'
import { api } from '@/lib/api'
import { toast } from '@/lib/toast'
import { Lock } from 'lucide-react'

export default function ChangePasswordPage() {
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (newPassword !== confirmPassword) {
      toast.error('New passwords do not match')
      return
    }

    if (newPassword.length < 6) {
      toast.error('Password must be at least 6 characters')
      return
    }

    setLoading(true)
    try {
      await api.changePassword(currentPassword, newPassword)
      toast.success('Password changed successfully')
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
    } catch (error: any) {
      toast.error(error.message || 'Failed to change password')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#F1F4F7', fontFamily: '"Darker Grotesque", sans-serif' }}>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-black text-gray-900" style={{ fontWeight: 900 }}>
            Settings
          </h1>
          <p className="mt-1 text-sm text-gray-500">Update your Account password</p>
        </div>

        {/* Password Change Card */}
        <div className="bg-white rounded-2xl shadow-sm p-8 max-w-xl">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-gray-600 mb-2">
                Current Password
              </label>
              <input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                required
                placeholder="Current Password"
                className="w-full h-12 px-4 bg-white border-2 border-gray-200 rounded-xl text-gray-900 placeholder:text-gray-400 focus:border-[#45C8AF] focus:ring-2 focus:ring-[#45C8AF]/20 outline-none transition-all"
                style={{ fontFamily: '"Darker Grotesque", sans-serif' }}
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-600 mb-2">
                New Password
              </label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                minLength={6}
                placeholder="New Password"
                className="w-full h-12 px-4 bg-white border-2 border-gray-200 rounded-xl text-gray-900 placeholder:text-gray-400 focus:border-[#45C8AF] focus:ring-2 focus:ring-[#45C8AF]/20 outline-none transition-all"
                style={{ fontFamily: '"Darker Grotesque", sans-serif' }}
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-600 mb-2">
                Confirm New Password
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                minLength={6}
                placeholder="Confirm New Password"
                className="w-full h-12 px-4 bg-white border-2 border-gray-200 rounded-xl text-gray-900 placeholder:text-gray-400 focus:border-[#45C8AF] focus:ring-2 focus:ring-[#45C8AF]/20 outline-none transition-all"
                style={{ fontFamily: '"Darker Grotesque", sans-serif' }}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full h-12 rounded-xl font-bold text-white transition-all disabled:opacity-50"
              style={{
                backgroundColor: '#45C8AF',
                fontFamily: '"Darker Grotesque", sans-serif',
                fontWeight: 700
              }}
            >
              {loading ? 'Changing...' : 'Change Password'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
