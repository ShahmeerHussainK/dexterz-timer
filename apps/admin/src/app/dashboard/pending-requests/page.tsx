'use client'

import { useEffect, useState } from 'react'
import { api } from '@/lib/api'
import { toast } from '@/lib/toast'
import { CheckCircle, XCircle, Clock } from 'lucide-react'

export default function PendingRequestsPage() {
  const [requests, setRequests] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [reviewModal, setReviewModal] = useState<any>(null)
  const [reviewNote, setReviewNote] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    loadRequests()
  }, [])

  const loadRequests = async () => {
    setLoading(true)
    try {
      const data = await api.getPendingManualTimeRequests()
      setRequests(data)
    } catch (error) {
      console.error('Failed to load requests:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleReview = async (status: string) => {
    if (!reviewModal) return
    setSubmitting(true)
    try {
      await api.reviewManualTimeRequest(reviewModal.id, status, reviewNote)
      toast.success(`Request ${status.toLowerCase()}`)
      setReviewModal(null)
      setReviewNote('')
      loadRequests()
    } catch (error: any) {
      toast.error(error.message || 'Failed to review request')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return <div className="flex h-screen items-center justify-center"><div className="h-12 w-12 animate-spin rounded-full border-4 border-gray-200 border-t-primary"></div></div>
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">Pending Requests</h1>
        <p className="mt-1 text-sm text-gray-500">⏳ Review manual time adjustment requests</p>
      </div>

      <div className="rounded-xl bg-white shadow-lg">
        <div className="border-b border-gray-200 bg-gradient-to-r from-gray-50 to-gray-100 px-6 py-4">
          <h2 className="text-lg font-semibold text-gray-900">📋 Pending Approvals</h2>
          <p className="text-xs text-gray-500 mt-1">{requests.length} requests awaiting review</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">User</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Date & Time</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Duration</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Reason</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Type</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Requested</th>
                <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {requests.length > 0 ? (
                requests.map((request) => (
                  <tr key={request.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="h-8 w-8 rounded-full bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center text-white text-xs font-semibold">
                          {request.user.fullName?.charAt(0).toUpperCase() || request.user.email?.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-900">{request.user.fullName || 'N/A'}</div>
                          <div className="text-xs text-gray-500">{request.user.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900">
                      <div>{new Date(request.startTime).toLocaleDateString()}</div>
                      <div className="text-xs text-gray-500">
                        {new Date(request.startTime).toLocaleTimeString()} - {new Date(request.endTime).toLocaleTimeString()}
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900">{request.minutes} min</td>
                    <td className="px-6 py-4 text-sm text-gray-600 max-w-xs">
                      <div className="line-clamp-2">{request.reason}</div>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4">
                      <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                        request.type === 'ACTIVE' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                      }`}>
                        {request.type}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                      {new Date(request.createdAt).toLocaleDateString()}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-right">
                      <button
                        onClick={() => setReviewModal(request)}
                        className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 transition-colors"
                      >
                        Review
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center">
                    <Clock className="mx-auto h-12 w-12 text-gray-300" />
                    <p className="mt-2 text-sm font-medium text-gray-500">No pending requests</p>
                    <p className="text-xs text-gray-400">All requests have been reviewed</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {reviewModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 px-4">
          <div className="w-full max-w-lg rounded-lg bg-white p-6 shadow-xl">
            <h2 className="text-xl font-bold text-gray-900">Review Request</h2>
            
            <div className="mt-4 space-y-3 rounded-lg bg-gray-50 p-4">
              <div className="flex justify-between">
                <span className="text-sm font-medium text-gray-600">User:</span>
                <span className="text-sm text-gray-900">{reviewModal.user.fullName || reviewModal.user.email}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm font-medium text-gray-600">Date:</span>
                <span className="text-sm text-gray-900">{new Date(reviewModal.startTime).toLocaleDateString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm font-medium text-gray-600">Time:</span>
                <span className="text-sm text-gray-900">
                  {new Date(reviewModal.startTime).toLocaleTimeString()} - {new Date(reviewModal.endTime).toLocaleTimeString()}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm font-medium text-gray-600">Duration:</span>
                <span className="text-sm font-bold text-gray-900">{reviewModal.minutes} minutes</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm font-medium text-gray-600">Type:</span>
                <span className={`text-sm font-semibold ${reviewModal.type === 'ACTIVE' ? 'text-green-700' : 'text-gray-700'}`}>
                  {reviewModal.type}
                </span>
              </div>
              <div className="border-t pt-3">
                <span className="text-sm font-medium text-gray-600">Reason:</span>
                <p className="mt-1 text-sm text-gray-900">{reviewModal.reason}</p>
              </div>
            </div>

            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700">Review Note (Optional)</label>
              <textarea
                value={reviewNote}
                onChange={(e) => setReviewNote(e.target.value)}
                rows={3}
                placeholder="Add a note about your decision..."
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-primary focus:outline-none focus:ring-primary"
              />
            </div>

            <div className="mt-6 flex gap-3">
              <button
                type="button"
                onClick={() => {
                  setReviewModal(null)
                  setReviewNote('')
                }}
                disabled={submitting}
                className="flex-1 rounded-lg border border-gray-300 px-4 py-2 text-gray-700 hover:bg-gray-50 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={() => handleReview('REJECTED')}
                disabled={submitting}
                className="flex-1 flex items-center justify-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-white hover:bg-red-700 disabled:opacity-50"
              >
                <XCircle className="h-4 w-4" />
                Reject
              </button>
              <button
                onClick={() => handleReview('APPROVED')}
                disabled={submitting}
                className="flex-1 flex items-center justify-center gap-2 rounded-lg bg-green-600 px-4 py-2 text-white hover:bg-green-700 disabled:opacity-50"
              >
                <CheckCircle className="h-4 w-4" />
                Approve
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
