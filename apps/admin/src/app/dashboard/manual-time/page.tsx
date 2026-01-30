'use client'

import { useEffect, useState } from 'react'
import { api } from '@/lib/api'
import { toast } from '@/lib/toast'
import { Clock, Plus, CheckCircle, XCircle, AlertCircle } from 'lucide-react'

export default function ManualTimePage() {
  const [requests, setRequests] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [formData, setFormData] = useState({
    startTime: '',
    endTime: '',
    reason: '',
    type: 'ACTIVE',
  })

  useEffect(() => {
    loadRequests()
  }, [])

  const loadRequests = async () => {
    setLoading(true)
    try {
      const data = await api.getMyManualTimeRequests()
      setRequests(data)
    } catch (error) {
      console.error('Failed to load requests:', error)
    } finally {
      setLoading(false)
    }
  }

  const calculateMinutes = (start: string, end: string) => {
    if (!start || !end) return 0
    const startDate = new Date(start)
    const endDate = new Date(end)
    return Math.floor((endDate.getTime() - startDate.getTime()) / 60000)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const minutes = calculateMinutes(formData.startTime, formData.endTime)
    if (minutes <= 0) {
      toast.error('End time must be after start time')
      return
    }

    try {
      await api.createManualTimeRequest({
        ...formData,
        minutes,
      })
      toast.success('Request submitted successfully')
      setShowModal(false)
      setFormData({ startTime: '', endTime: '', reason: '', type: 'ACTIVE' })
      loadRequests()
    } catch (error: any) {
      toast.error(error.message || 'Failed to submit request')
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PENDING':
        return <span className="inline-flex items-center gap-1 rounded-full bg-yellow-100 px-3 py-1 text-xs font-semibold text-yellow-700"><AlertCircle className="h-3 w-3" /> Pending</span>
      case 'APPROVED':
        return <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700"><CheckCircle className="h-3 w-3" /> Approved</span>
      case 'REJECTED':
        return <span className="inline-flex items-center gap-1 rounded-full bg-red-100 px-3 py-1 text-xs font-semibold text-red-700"><XCircle className="h-3 w-3" /> Rejected</span>
      default:
        return null
    }
  }

  if (loading) {
    return <div className="flex h-screen items-center justify-center"><div className="h-12 w-12 animate-spin rounded-full border-4 border-gray-200 border-t-primary"></div></div>
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">Manual Time Requests</h1>
          <p className="mt-1 text-sm text-gray-500">⏱️ Request manual time adjustments</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-primary to-primary/80 px-4 py-2 text-sm font-medium text-white shadow-lg hover:shadow-xl transition-all hover:scale-105"
        >
          <Plus className="h-4 w-4" />
          New Request
        </button>
      </div>

      <div className="rounded-xl bg-white shadow-lg">
        <div className="border-b border-gray-200 bg-gradient-to-r from-gray-50 to-gray-100 px-6 py-4">
          <h2 className="text-lg font-semibold text-gray-900">📝 My Requests</h2>
          <p className="text-xs text-gray-500 mt-1">{requests.length} total requests</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Date & Time</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Duration</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Reason</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Type</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Reviewed By</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {requests.length > 0 ? (
                requests.map((request) => (
                  <tr key={request.id} className="hover:bg-gray-50 transition-colors">
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900">
                      {new Date(request.startTime).toLocaleString()} - {new Date(request.endTime).toLocaleTimeString()}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900">{request.minutes} min</td>
                    <td className="px-6 py-4 text-sm text-gray-600 max-w-xs truncate">{request.reason}</td>
                    <td className="whitespace-nowrap px-6 py-4">
                      <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${request.type === 'ACTIVE' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                        }`}>
                        {request.type}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4">{getStatusBadge(request.status)}</td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-600">
                      {request.reviewer ? request.reviewer.fullName || request.reviewer.email : '-'}
                      {request.reviewNote && <p className="text-xs text-gray-500 mt-1">{request.reviewNote}</p>}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center">
                    <Clock className="mx-auto h-12 w-12 text-gray-300" />
                    <p className="mt-2 text-sm font-medium text-gray-500">No requests yet</p>
                    <p className="text-xs text-gray-400">Create your first manual time request</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 px-4">
          <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
            <h2 className="text-xl font-bold text-gray-900">Request Manual Time</h2>
            <form onSubmit={handleSubmit} className="mt-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Start Time</label>
                <input
                  type="datetime-local"
                  required
                  value={formData.startTime}
                  onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-primary focus:outline-none focus:ring-primary"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">End Time</label>
                <input
                  type="datetime-local"
                  required
                  value={formData.endTime}
                  onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-primary focus:outline-none focus:ring-primary"
                />
              </div>
              {formData.startTime && formData.endTime && (
                <div className="rounded-lg bg-blue-50 p-3">
                  <p className="text-sm font-medium text-blue-900">
                    Duration: {calculateMinutes(formData.startTime, formData.endTime)} minutes
                  </p>
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-gray-700">Type</label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-primary focus:outline-none focus:ring-primary"
                >
                  <option value="ACTIVE">Active (Productive)</option>
                  <option value="IDLE">Idle</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Reason</label>
                <textarea
                  required
                  value={formData.reason}
                  onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                  rows={3}
                  placeholder="e.g., Team meeting with lead, Client call, etc."
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-primary focus:outline-none focus:ring-primary"
                />
              </div>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 rounded-lg border border-gray-300 px-4 py-2 text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 rounded-lg bg-primary px-4 py-2 text-white hover:bg-primary/90"
                >
                  Submit Request
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
