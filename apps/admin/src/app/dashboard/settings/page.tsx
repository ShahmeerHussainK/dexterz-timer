'use client'

import { useEffect, useState } from 'react'
import { api } from '@/lib/api'
import { toast } from '@/lib/toast'
import { Building2, Clock, Coffee, Timer, Globe, Save } from 'lucide-react'

export default function SettingsPage() {
  const [organization, setOrganization] = useState<any>(null)
  const [schedule, setSchedule] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      const [org, sched] = await Promise.all([
        api.getOrganization(),
        api.getSchedule(),
      ])
      setOrganization(org)
      setSchedule(sched)
    } catch (error) {
      console.error('Failed to load settings:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSaveOrg = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    try {
      await api.updateOrganization({
        name: organization.name,
        timezone: organization.timezone,
      })
      toast.success('Organization settings saved successfully')
    } catch (error) {
      console.error('Failed to save organization:', error)
      toast.error('Failed to save settings')
    } finally {
      setSaving(false)
    }
  }

  const handleSaveSchedule = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    try {
      await api.updateSchedule({
        tz: schedule.tz,
        checkinStart: schedule.checkinStart,
        checkinEnd: schedule.checkinEnd,
        breakStart: schedule.breakStart,
        breakEnd: schedule.breakEnd,
        idleThresholdSeconds: parseInt(schedule.idleThresholdSeconds),
      })
      toast.success('Schedule settings saved successfully')
    } catch (error) {
      console.error('Failed to save schedule:', error)
      toast.error('Failed to save settings')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-20 bg-gray-200 rounded-lg"></div>
        <div className="h-64 bg-gray-200 rounded-xl"></div>
        <div className="h-96 bg-gray-200 rounded-xl"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Settings</h1>
        <p className="mt-1 text-sm text-gray-500">Manage organization and schedule settings</p>
      </div>

      {/* Two Column Layout */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Organization Settings Card */}
        <div className="rounded-2xl bg-white shadow-lg border border-gray-100 overflow-hidden">
          {/* Card Header */}
          <div className="px-6 py-4 border-b border-gray-100">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-teal-100">
                <Building2 className="h-4 w-4 text-teal-600" />
              </div>
              <div>
                <h2 className="text-base font-semibold text-gray-900">Organization Settings</h2>
                <p className="text-xs text-gray-500">Configure your organization details</p>
              </div>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSaveOrg} className="p-6 space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Organization Name
              </label>
              <input
                type="text"
                value={organization?.name || ''}
                onChange={(e) =>
                  setOrganization({ ...organization, name: e.target.value })
                }
                className="block w-full rounded-xl border border-gray-200 px-4 py-3 text-sm shadow-sm transition-all focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20"
                placeholder="Enter organization name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Timezone
              </label>
              <div className="relative">
                <select
                  value={organization?.timezone || ''}
                  onChange={(e) =>
                    setOrganization({ ...organization, timezone: e.target.value })
                  }
                  className="block w-full rounded-xl border border-gray-200 px-4 py-3 text-sm shadow-sm transition-all focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20 appearance-none bg-white"
                >
                  <option value="">Select timezone</option>
                  <option value="Asia/Karachi">Asia/Karachi</option>
                  <option value="America/New_York">America/New_York</option>
                  <option value="America/Los_Angeles">America/Los_Angeles</option>
                  <option value="Europe/London">Europe/London</option>
                  <option value="Europe/Paris">Europe/Paris</option>
                  <option value="Asia/Dubai">Asia/Dubai</option>
                  <option value="Asia/Singapore">Asia/Singapore</option>
                  <option value="Australia/Sydney">Australia/Sydney</option>
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3">
                  <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
              <p className="mt-2 text-xs text-gray-500">
                Use IANA timezone format (e.g., Asia/Karachi, America/New_York)
              </p>
            </div>

            <button
              type="submit"
              disabled={saving}
              className="flex items-center justify-center gap-2 w-full rounded-xl bg-gradient-to-r from-teal-500 to-teal-600 px-6 py-3 text-sm font-semibold text-white shadow-lg transition-all hover:shadow-xl hover:from-teal-600 hover:to-teal-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Save className="h-4 w-4" />
              {saving ? 'Saving...' : 'Save Organization'}
            </button>
          </form>
        </div>

        {/* Work Schedule Card */}
        <div className="rounded-2xl bg-white shadow-lg border border-gray-100 overflow-hidden">
          {/* Card Header */}
          <div className="px-6 py-4 border-b border-gray-100">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-teal-100">
                <Clock className="h-4 w-4 text-teal-600" />
              </div>
              <div>
                <h2 className="text-base font-semibold text-gray-900">Work Schedule</h2>
                <p className="text-xs text-gray-500">Config is per organization basis</p>
              </div>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSaveSchedule} className="p-6 space-y-5">
            {/* Working Hours */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                <Clock className="inline h-4 w-4 mr-1 text-gray-500" />
                Working Hours
              </label>
              <div className="grid gap-4 grid-cols-2">
                <div>
                  <input
                    type="time"
                    value={schedule?.checkinStart || ''}
                    onChange={(e) =>
                      setSchedule({ ...schedule, checkinStart: e.target.value })
                    }
                    className="block w-full rounded-xl border border-gray-200 px-4 py-3 text-sm shadow-sm transition-all focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20"
                  />
                </div>
                <div>
                  <input
                    type="time"
                    value={schedule?.checkinEnd || ''}
                    onChange={(e) =>
                      setSchedule({ ...schedule, checkinEnd: e.target.value })
                    }
                    className="block w-full rounded-xl border border-gray-200 px-4 py-3 text-sm shadow-sm transition-all focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20"
                    placeholder="End Time"
                  />
                </div>
              </div>
            </div>

            {/* Break Time */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                <Coffee className="inline h-4 w-4 mr-1 text-gray-500" />
                Break Time
              </label>
              <div className="grid gap-4 grid-cols-2">
                <div>
                  <input
                    type="time"
                    value={schedule?.breakStart || ''}
                    onChange={(e) =>
                      setSchedule({ ...schedule, breakStart: e.target.value })
                    }
                    className="block w-full rounded-xl border border-gray-200 px-4 py-3 text-sm shadow-sm transition-all focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20"
                  />
                </div>
                <div>
                  <input
                    type="time"
                    value={schedule?.breakEnd || ''}
                    onChange={(e) =>
                      setSchedule({ ...schedule, breakEnd: e.target.value })
                    }
                    className="block w-full rounded-xl border border-gray-200 px-4 py-3 text-sm shadow-sm transition-all focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20"
                    placeholder="End Time"
                  />
                </div>
              </div>
            </div>

            {/* Idle Detection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                <Timer className="inline h-4 w-4 mr-1 text-gray-500" />
                Idle Detection
                <span className="ml-1 text-xs text-gray-400">(in seconds)</span>
              </label>
              <input
                type="number"
                value={schedule?.idleThresholdSeconds || ''}
                onChange={(e) =>
                  setSchedule({ ...schedule, idleThresholdSeconds: e.target.value })
                }
                className="block w-full rounded-xl border border-gray-200 px-4 py-3 text-sm shadow-sm transition-all focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20"
                placeholder="300"
              />
              <p className="mt-2 text-xs text-gray-500">
                Consecutive idle time (in seconds) before marking as idle. Default: 300 (5 minutes)
              </p>
            </div>

            <button
              type="submit"
              disabled={saving}
              className="flex items-center justify-center gap-2 w-full rounded-xl bg-gradient-to-r from-teal-500 to-teal-600 px-6 py-3 text-sm font-semibold text-white shadow-lg transition-all hover:shadow-xl hover:from-teal-600 hover:to-teal-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Save className="h-4 w-4" />
              {saving ? 'Saving...' : 'Save Schedule'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
