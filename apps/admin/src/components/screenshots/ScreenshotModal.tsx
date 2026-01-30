'use client'

import { X } from 'lucide-react'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://localhost:3001'

interface ScreenshotModalProps {
  screenshot: {
    id: number
    fileUrl: string
    capturedAt: string
    fileSize: number
  } | null
  onClose: () => void
}

export default function ScreenshotModal({ screenshot, onClose }: ScreenshotModalProps) {
  if (!screenshot) return null

  const imageUrl = `${API_BASE_URL}${screenshot.fileUrl}`

  const formatDateTime = (date: string) => {
    return new Date(date).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const formatFileSize = (bytes: number) => {
    return `${Math.floor(bytes / 1024)} KB`
  }

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-lg max-w-6xl max-h-[90vh] overflow-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 bg-white border-b px-4 py-3 flex justify-between items-center">
          <div>
            <h3 className="font-semibold">{formatDateTime(screenshot.capturedAt)}</h3>
            <p className="text-sm text-gray-500">{formatFileSize(screenshot.fileSize)}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-4">
          <img
            src={imageUrl}
            alt={`Screenshot at ${formatDateTime(screenshot.capturedAt)}`}
            className="w-full h-auto"
          />
        </div>
      </div>
    </div>
  )
}
