'use client'

import { useState, useEffect } from 'react'
import { api } from '@/lib/api'
import ScreenshotThumbnail from './ScreenshotThumbnail'
import ScreenshotModal from './ScreenshotModal'
import { Camera } from 'lucide-react'

interface ScreenshotTimelineProps {
  userId: string
  date: string
}

export default function ScreenshotTimeline({ userId, date }: ScreenshotTimelineProps) {
  const [screenshots, setScreenshots] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedScreenshot, setSelectedScreenshot] = useState<any>(null)

  useEffect(() => {
    loadScreenshots()
  }, [userId, date])

  const loadScreenshots = async () => {
    try {
      setLoading(true)
      const data = await api.getScreenshots(userId, date)
      setScreenshots(data)
    } catch (error) {
      console.error('Failed to load screenshots:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (screenshots.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <Camera className="w-12 h-12 mx-auto mb-2 opacity-50" />
        <p>No screenshots available for this date</p>
      </div>
    )
  }

  return (
    <>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
        {screenshots.map((screenshot) => (
          <ScreenshotThumbnail
            key={screenshot.id}
            screenshot={screenshot}
            onClick={() => setSelectedScreenshot(screenshot)}
          />
        ))}
      </div>

      <ScreenshotModal
        screenshot={selectedScreenshot}
        onClose={() => setSelectedScreenshot(null)}
      />
    </>
  )
}
