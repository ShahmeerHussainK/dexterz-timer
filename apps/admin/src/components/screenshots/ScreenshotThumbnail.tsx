'use client'

import { useState } from 'react'
import Image from 'next/image'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://localhost:3001'

interface ScreenshotThumbnailProps {
  screenshot: {
    id: number
    fileUrl: string
    capturedAt: string
    fileSize: number
  }
  onClick: () => void
}

export default function ScreenshotThumbnail({ screenshot, onClick }: ScreenshotThumbnailProps) {
  const [imageError, setImageError] = useState(false)

  const formatTime = (date: string) => {
    return new Date(date).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const imageUrl = `${API_BASE_URL}${screenshot.fileUrl}`

  return (
    <div
      onClick={onClick}
      className="cursor-pointer border rounded-lg overflow-hidden hover:shadow-lg transition-shadow bg-white"
    >
      <div className="relative w-full h-32 bg-gray-100">
        {!imageError ? (
          <img
            src={imageUrl}
            alt={`Screenshot at ${formatTime(screenshot.capturedAt)}`}
            className="w-full h-full object-cover"
            onError={() => setImageError(true)}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400">
            <span>Image unavailable</span>
          </div>
        )}
      </div>
      <div className="p-2 text-xs text-gray-600">
        {formatTime(screenshot.capturedAt)}
      </div>
    </div>
  )
}
