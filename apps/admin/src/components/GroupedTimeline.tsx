'use client'

import { useState } from 'react'
import { ChevronDown, ChevronRight } from 'lucide-react'
import { formatMinutes, formatDate, getWorkingDay } from '@/lib/utils'

interface TimeEntry {
  id: string | number
  startedAt: string
  endedAt: string
  kind: 'ACTIVE' | 'IDLE' | 'BREAK'
}

interface GroupedTimelineProps {
  entries: TimeEntry[]
  viewType: 'daily' | 'weekly' | 'monthly'
}

export function GroupedTimeline({ entries, viewType }: GroupedTimelineProps) {
  const [expandedDays, setExpandedDays] = useState<Set<string>>(new Set())

  const toggleDay = (date: string) => {
    const newExpanded = new Set(expandedDays)
    if (newExpanded.has(date)) {
      newExpanded.delete(date)
    } else {
      newExpanded.add(date)
    }
    setExpandedDays(newExpanded)
  }

  // Group entries by working day (handles cross-midnight sessions)
  const groupedByDate = entries.reduce((acc, entry) => {
    const workingDay = getWorkingDay(entry.startedAt)
    if (!acc[workingDay]) {
      acc[workingDay] = []
    }
    acc[workingDay].push(entry)
    return acc
  }, {} as Record<string, TimeEntry[]>)

  // Calculate stats for each working day
  const dayStats = Object.entries(groupedByDate).map(([workingDay, dayEntries]) => {
    const totalMinutes = dayEntries.reduce((sum, entry) => {
      const start = new Date(entry.startedAt)
      const end = new Date(entry.endedAt)
      return sum + Math.floor((end.getTime() - start.getTime()) / 60000)
    }, 0)

    const activeMinutes = dayEntries
      .filter(e => e.kind === 'ACTIVE')
      .reduce((sum, entry) => {
        const start = new Date(entry.startedAt)
        const end = new Date(entry.endedAt)
        return sum + Math.floor((end.getTime() - start.getTime()) / 60000)
      }, 0)

    const idleMinutes = dayEntries
      .filter(e => e.kind === 'IDLE')
      .reduce((sum, entry) => {
        const start = new Date(entry.startedAt)
        const end = new Date(entry.endedAt)
        return sum + Math.floor((end.getTime() - start.getTime()) / 60000)
      }, 0)

    return {
      date: workingDay,
      entries: dayEntries,
      totalMinutes,
      activeMinutes,
      idleMinutes,
      entryCount: dayEntries.length
    }
  }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

  // For daily view, show all entries without grouping
  if (viewType === 'daily') {
    return (
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-2 sm:px-4 py-2 text-left text-xs font-medium text-gray-500">Date</th>
              <th className="hidden sm:table-cell px-2 sm:px-4 py-2 text-left text-xs font-medium text-gray-500">Start</th>
              <th className="hidden sm:table-cell px-2 sm:px-4 py-2 text-left text-xs font-medium text-gray-500">End</th>
              <th className="px-2 sm:px-4 py-2 text-left text-xs font-medium text-gray-500">Duration</th>
              <th className="px-2 sm:px-4 py-2 text-left text-xs font-medium text-gray-500">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {entries.map((entry) => {
              const start = new Date(entry.startedAt)
              const end = new Date(entry.endedAt)
              const minutes = Math.floor((end.getTime() - start.getTime()) / 60000)
              return (
                <tr key={entry.id} className="hover:bg-gray-50">
                  <td className="px-2 sm:px-4 py-3 text-xs sm:text-sm text-gray-900">
                    <div>{getWorkingDay(entry.startedAt)}</div>
                    <div className="sm:hidden text-xs text-gray-500 mt-1">
                      {start.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })} - {end.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </td>
                  <td className="hidden sm:table-cell whitespace-nowrap px-2 sm:px-4 py-3 text-sm text-gray-600">
                    {start.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                  </td>
                  <td className="hidden sm:table-cell whitespace-nowrap px-2 sm:px-4 py-3 text-sm text-gray-600">
                    {end.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                  </td>
                  <td className="whitespace-nowrap px-2 sm:px-4 py-3 text-xs sm:text-sm font-medium text-gray-900">
                    {formatMinutes(minutes)}
                  </td>
                  <td className="px-2 sm:px-4 py-3">
                    <span
                      className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${
                        entry.kind === 'ACTIVE'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}
                    >
                      {entry.kind}
                    </span>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
        {entries.length === 0 && (
          <div className="py-12 text-center text-sm text-gray-500">
            No activity recorded for this period
          </div>
        )}
      </div>
    )
  }

  // For weekly/monthly view, show grouped by day
  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-2 sm:px-4 py-2 text-left text-xs font-medium text-gray-500 w-8"></th>
            <th className="px-2 sm:px-4 py-2 text-left text-xs font-medium text-gray-500">Date</th>
            <th className="px-2 sm:px-4 py-2 text-left text-xs font-medium text-gray-500">Total</th>
            <th className="hidden sm:table-cell px-2 sm:px-4 py-2 text-left text-xs font-medium text-gray-500">Active</th>
            <th className="hidden sm:table-cell px-2 sm:px-4 py-2 text-left text-xs font-medium text-gray-500">Idle</th>
            <th className="px-2 sm:px-4 py-2 text-left text-xs font-medium text-gray-500">Entries</th>
          </tr>
        </thead>
        <tbody>
          {dayStats.map((day) => {
            const isExpanded = expandedDays.has(day.date)
            return (
              <>
                {/* Summary Row */}
                <tr
                  key={day.date}
                  className="hover:bg-gray-50 cursor-pointer border-b border-gray-200 bg-gray-50/50"
                  onClick={() => toggleDay(day.date)}
                >
                  <td className="px-2 sm:px-4 py-3">
                    {isExpanded ? (
                      <ChevronDown className="h-4 w-4 text-gray-600" />
                    ) : (
                      <ChevronRight className="h-4 w-4 text-gray-600" />
                    )}
                  </td>
                  <td className="px-2 sm:px-4 py-3 text-xs sm:text-sm font-semibold text-gray-900">
                    {formatDate(day.date)}
                  </td>
                  <td className="px-2 sm:px-4 py-3 text-xs sm:text-sm font-bold text-blue-900">
                    {formatMinutes(day.totalMinutes)}
                  </td>
                  <td className="hidden sm:table-cell px-2 sm:px-4 py-3 text-xs sm:text-sm text-green-700 font-medium">
                    {formatMinutes(day.activeMinutes)}
                  </td>
                  <td className="hidden sm:table-cell px-2 sm:px-4 py-3 text-xs sm:text-sm text-yellow-700 font-medium">
                    {formatMinutes(day.idleMinutes)}
                  </td>
                  <td className="px-2 sm:px-4 py-3">
                    <span className="inline-flex rounded-full bg-gray-200 px-2 py-1 text-xs font-semibold text-gray-700">
                      {day.entryCount}
                    </span>
                  </td>
                </tr>

                {/* Detail Rows (Expanded) */}
                {isExpanded && day.entries.map((entry) => {
                  const start = new Date(entry.startedAt)
                  const end = new Date(entry.endedAt)
                  const minutes = Math.floor((end.getTime() - start.getTime()) / 60000)
                  return (
                    <tr key={entry.id} className="hover:bg-blue-50/30 bg-white">
                      <td className="px-2 sm:px-4 py-2"></td>
                      <td className="px-2 sm:px-4 py-2 text-xs text-gray-600 pl-8">
                        <div className="sm:hidden">
                          {start.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })} - {end.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                        </div>
                        <div className="hidden sm:block">
                          {start.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })} → {end.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </td>
                      <td className="px-2 sm:px-4 py-2 text-xs font-medium text-gray-900">
                        {formatMinutes(minutes)}
                      </td>
                      <td className="hidden sm:table-cell px-2 sm:px-4 py-2"></td>
                      <td className="hidden sm:table-cell px-2 sm:px-4 py-2"></td>
                      <td className="px-2 sm:px-4 py-2">
                        <span
                          className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${
                            entry.kind === 'ACTIVE'
                              ? 'bg-green-100 text-green-800'
                              : 'bg-yellow-100 text-yellow-800'
                          }`}
                        >
                          {entry.kind}
                        </span>
                      </td>
                    </tr>
                  )
                })}
              </>
            )
          })}
        </tbody>
      </table>
      {dayStats.length === 0 && (
        <div className="py-12 text-center text-sm text-gray-500">
          No activity recorded for this period
        </div>
      )}
    </div>
  )
}
