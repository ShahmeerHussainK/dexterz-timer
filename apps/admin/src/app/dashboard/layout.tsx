'use client'

import { useRouter, usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import { api } from '@/lib/api'
import Link from 'next/link'
import { Users, BarChart3, Settings, LogOut, Clock, Timer, FolderKanban, UsersRound } from 'lucide-react'
import Loader from '@/components/Loader'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const pathname = usePathname()
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)
  const [hasUpdate, setHasUpdate] = useState(false)

  useEffect(() => {
    const token = api.getToken()
    if (!token) {
      router.push('/login')
    } else {
      loadUser()
      checkForAppUpdates()
    }
  }, [router])

  const checkForAppUpdates = async () => {
    try {
      const response = await fetch('https://dexterzbackend.online/api/app/version')
      const data = await response.json()
      
      const lastNotifiedVersion = localStorage.getItem('lastNotifiedAppVersion')
      
      if (data.version && lastNotifiedVersion !== data.version) {
        setHasUpdate(true)
        
        setTimeout(() => {
          const toast = document.createElement('div')
          toast.className = 'fixed top-4 right-4 bg-blue-600 text-white px-6 py-4 rounded-lg shadow-lg z-50 max-w-md animate-slide-in'
          toast.innerHTML = `
            <div class="flex items-center gap-3">
              <svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              <div>
                <div class="font-semibold">🎉 New Desktop App Available!</div>
                <div class="text-sm text-blue-100">Version ${data.version} - Click "Download Desktop App" in sidebar</div>
              </div>
              <button onclick="this.parentElement.parentElement.remove()" class="ml-2 text-blue-200 hover:text-white">
                <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          `
          document.body.appendChild(toast)
          setTimeout(() => toast.remove(), 10000)
        }, 1000)
        
        localStorage.setItem('lastNotifiedAppVersion', data.version)
      }
    } catch (error) {
      console.error('Could not check for app updates:', error)
    }
  }

  const loadUser = async () => {
    try {
      const userData = await api.getCurrentUser()
      setUser(userData)
      
      // Redirect MEMBER to their activity page if on admin pages
      if (userData.role === 'MEMBER' && pathname === '/dashboard') {
        router.push('/dashboard/my-activity')
      }
    } catch (error) {
      console.error('Failed to load user:', error)
    } finally {
      setLoading(false)
    }
  }

  const isActive = (path: string) => pathname === path

  const handleLogout = async () => {
    await api.logout()
    router.push('/login')
  }

  if (loading) {
    return <Loader />
  }

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-200 flex flex-col">
        {/* Logo */}
        <div className="h-16 flex items-center px-6 border-b border-gray-200">
          <div className="flex items-center gap-2">
            <Timer className="h-6 w-6 text-primary" />
            <h1 className="text-lg font-bold text-gray-900">Time Tracker</h1>
          </div>
        </div>

        {/* User Profile */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-primary flex items-center justify-center text-white font-semibold">
              {user?.name?.charAt(0).toUpperCase() || 'A'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">
                {user?.fullName || user?.email?.split('@')[0] || 'User'}
              </p>
              <p className="text-xs text-gray-500 truncate">{user?.email}</p>
            </div>
          </div>
        </div>

        {/* Download Desktop App */}
        <div className="p-3 border-b border-gray-200">
          <a
            href="https://dexterzbackend.online/downloads/TimeTracker-Setup.exe"
            download
            className="relative flex items-center justify-center gap-2 w-full px-3 py-2 rounded-lg text-sm font-medium bg-gradient-to-r from-green-600 to-green-700 text-white hover:from-green-700 hover:to-green-800 transition-all shadow-sm hover:shadow-md"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            Download Desktop App
            {hasUpdate && (
              <span className="absolute -top-1 -right-1 flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
              </span>
            )}
          </a>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-3 space-y-1">
          {user?.role === 'MEMBER' ? (
            <>
              <Link
                href="/dashboard/my-activity"
                className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isActive('/dashboard/my-activity')
                    ? 'bg-primary text-white'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <BarChart3 className="h-5 w-5" />
                My Activity
              </Link>
              <Link
                href="/dashboard/my-timesheet"
                className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isActive('/dashboard/my-timesheet')
                    ? 'bg-primary text-white'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <Clock className="h-5 w-5" />
                My Timesheet
              </Link>
              <Link
                href="/dashboard/my-projects"
                className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  pathname?.startsWith('/dashboard/my-projects')
                    ? 'bg-primary text-white'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <FolderKanban className="h-5 w-5" />
                My Projects
              </Link>
              <Link
                href="/dashboard/change-password"
                className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isActive('/dashboard/change-password')
                    ? 'bg-primary text-white'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <Settings className="h-5 w-5" />
                Change Password
              </Link>
            </>
          ) : (
            <>
              <Link
                href="/dashboard"
                className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isActive('/dashboard')
                    ? 'bg-primary text-white'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <BarChart3 className="h-5 w-5" />
                Dashboard
              </Link>
              <Link
                href="/dashboard/timesheets"
                className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isActive('/dashboard/timesheets')
                    ? 'bg-primary text-white'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <Clock className="h-5 w-5" />
                Timesheets
              </Link>
              <Link
                href="/dashboard/teams"
                className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  pathname?.startsWith('/dashboard/teams')
                    ? 'bg-primary text-white'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <UsersRound className="h-5 w-5" />
                Teams
              </Link>
              <Link
                href="/dashboard/projects"
                className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  pathname?.startsWith('/dashboard/projects')
                    ? 'bg-primary text-white'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <FolderKanban className="h-5 w-5" />
                Projects
              </Link>
              <Link
                href="/dashboard/users"
                className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isActive('/dashboard/users')
                    ? 'bg-primary text-white'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <Users className="h-5 w-5" />
                Users
              </Link>
              <Link
                href="/dashboard/settings"
                className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isActive('/dashboard/settings')
                    ? 'bg-primary text-white'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <Settings className="h-5 w-5" />
                Settings
              </Link>
            </>
          )}
        </nav>

        {/* Logout */}
        <div className="p-3 border-t border-gray-200">
          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors"
          >
            <LogOut className="h-5 w-5" />
            Logout
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-auto">
        <div className="p-8">{children}</div>
      </main>
    </div>
  )
}
