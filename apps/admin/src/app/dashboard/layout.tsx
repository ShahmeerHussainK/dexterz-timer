'use client'

import { useRouter, usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import { api } from '@/lib/api'
import Link from 'next/link'
import { Users, BarChart3, Settings, LogOut, Clock, Timer, FolderKanban, UsersRound, FileEdit, Loader2 } from 'lucide-react'
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
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [isLoggingOut, setIsLoggingOut] = useState(false)

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
    setIsLoggingOut(true)
    try {
      await api.logout()
      router.push('/login')
    } catch (error) {
      console.error('Logout failed:', error)
      setIsLoggingOut(false)
    }
  }



  // Navigation helper function
  const handleNavigation = (href: string) => {
    if (pathname !== href) {
      router.push(href)
      setSidebarOpen(false)
    }
  }

  if (loading) {
    return <Loader />
  }

  return (
    <div className="min-h-screen bg-gray-100" style={{ fontFamily: '"Darker Grotesque", sans-serif', scrollbarGutter: 'stable' }}>
      {/* Top Header Bar */}
      <header className="bg-white sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            {/* Left - Logo and Name */}
            <div className="flex items-center gap-4">
              <img src="/logo.png" alt="Dexterz" className="h-10 w-10 object-contain" />
              <div>
                <h1 className="text-3xl font-black leading-tight" style={{ fontWeight: 900, color: '#1ABC9C' }}>
                  {user?.fullName || user?.email?.split('@')[0] || 'User'}
                </h1>
                <p className="text-sm text-gray-400 font-medium">
                  {user?.email}
                </p>
              </div>
            </div>

            {/* Right - Actions */}
            <div className="flex items-center gap-4">
              <a
                href="https://dexterzbackend.online/downloads/TimeTracker-Setup.exe"
                download
                className="relative hidden md:flex items-center gap-2 px-6 py-2 rounded-full text-sm font-bold transition-all border"
                style={{
                  borderColor: '#1ABC9C',
                  color: '#1ABC9C',
                  backgroundColor: '#E6F8F5'
                }}
              >
                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="7 10 12 15 17 10" />
                  <line x1="12" y1="15" x2="12" y2="3" />
                </svg>
                Download Desktop App
                {hasUpdate && (
                  <span className="absolute -top-1 -right-1 flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                  </span>
                )}
              </a>

              {/* Mobile menu button */}
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="md:hidden p-2 rounded-lg text-gray-600 hover:bg-gray-100"
              >
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>

              {/* User avatar */}
              <div
                className="h-10 w-10 rounded-full flex items-center justify-center text-white font-black text-lg border-2 border-white shadow-sm"
                style={{ backgroundColor: '#FB923C' }}
              >
                {user?.name?.charAt(0).toUpperCase() || user?.fullName?.charAt(0).toUpperCase() || 'U'}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content Area with Floating Sidebar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex gap-6">
          {/* Floating Sidebar Card */}
          <aside className={`
            ${sidebarOpen ? 'block' : 'hidden'} md:block
            fixed md:relative inset-0 md:inset-auto z-30 md:z-auto
            md:w-64 md:flex-shrink-0
          `}>
            {/* Mobile overlay */}
            <div
              className="md:hidden absolute inset-0 bg-black/50"
              onClick={() => setSidebarOpen(false)}
            ></div>

            {/* Sidebar Card */}
            <div className="relative md:sticky md:top-24 w-64 bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden ml-4 mt-4 md:ml-0 md:mt-0">
              {/* Navigation */}
              <nav className="p-4 space-y-1">
                {user?.role === 'MEMBER' ? (
                  <>
                    <button
                      onClick={() => handleNavigation('/dashboard/my-activity')}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${isActive('/dashboard/my-activity')
                        ? 'bg-gradient-to-r from-teal-500 to-teal-600 text-white shadow-md'
                        : 'text-gray-700 hover:bg-gray-50'
                        }`}
                    >
                      <BarChart3 className="h-5 w-5" />
                      My Activity
                    </button>
                    <button
                      onClick={() => handleNavigation('/dashboard/my-timesheet')}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${isActive('/dashboard/my-timesheet')
                        ? 'bg-gradient-to-r from-teal-500 to-teal-600 text-white shadow-md'
                        : 'text-gray-700 hover:bg-gray-50'
                        }`}
                    >
                      <Clock className="h-5 w-5" />
                      My Timesheet
                    </button>
                    <button
                      onClick={() => handleNavigation('/dashboard/my-projects')}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${pathname?.startsWith('/dashboard/my-projects')
                        ? 'bg-gradient-to-r from-teal-500 to-teal-600 text-white shadow-md'
                        : 'text-gray-700 hover:bg-gray-50'
                        }`}
                    >
                      <FolderKanban className="h-5 w-5" />
                      My Projects
                    </button>
                    <button
                      onClick={() => handleNavigation('/dashboard/manual-time')}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${isActive('/dashboard/manual-time')
                        ? 'bg-gradient-to-r from-teal-500 to-teal-600 text-white shadow-md'
                        : 'text-gray-700 hover:bg-gray-50'
                        }`}
                    >
                      <FileEdit className="h-5 w-5" />
                      Manual Time
                    </button>
                    <button
                      onClick={() => handleNavigation('/dashboard/change-password')}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${isActive('/dashboard/change-password')
                        ? 'bg-gradient-to-r from-teal-500 to-teal-600 text-white shadow-md'
                        : 'text-gray-700 hover:bg-gray-50'
                        }`}
                    >
                      <Settings className="h-5 w-5" />
                      Settings
                    </button>
                  </>
                ) : user?.role === 'MANAGER' ? (
                  <>
                    <button
                      onClick={() => handleNavigation('/dashboard/my-activity')}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${isActive('/dashboard/my-activity')
                        ? 'bg-gradient-to-r from-teal-500 to-teal-600 text-white shadow-md'
                        : 'text-gray-700 hover:bg-gray-50'
                        }`}
                    >
                      <BarChart3 className="h-5 w-5" />
                      My Activity
                    </button>
                    <button
                      onClick={() => handleNavigation('/dashboard/my-timesheet')}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${isActive('/dashboard/my-timesheet')
                        ? 'bg-gradient-to-r from-teal-500 to-teal-600 text-white shadow-md'
                        : 'text-gray-700 hover:bg-gray-50'
                        }`}
                    >
                      <Clock className="h-5 w-5" />
                      My Timesheet
                    </button>
                    <button
                      onClick={() => handleNavigation('/dashboard/my-projects')}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${pathname?.startsWith('/dashboard/my-projects')
                        ? 'bg-gradient-to-r from-teal-500 to-teal-600 text-white shadow-md'
                        : 'text-gray-700 hover:bg-gray-50'
                        }`}
                    >
                      <FolderKanban className="h-5 w-5" />
                      My Projects
                    </button>
                    <button
                      onClick={() => handleNavigation('/dashboard/manual-time')}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${isActive('/dashboard/manual-time')
                        ? 'bg-gradient-to-r from-teal-500 to-teal-600 text-white shadow-md'
                        : 'text-gray-700 hover:bg-gray-50'
                        }`}
                    >
                      <FileEdit className="h-5 w-5" />
                      Manual Time
                    </button>
                    <button
                      onClick={() => handleNavigation('/dashboard/pending-requests')}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${isActive('/dashboard/pending-requests')
                        ? 'bg-gradient-to-r from-teal-500 to-teal-600 text-white shadow-md'
                        : 'text-gray-700 hover:bg-gray-50'
                        }`}
                    >
                      <FileEdit className="h-5 w-5" />
                      Pending Requests
                    </button>
                    <button
                      onClick={() => handleNavigation('/dashboard/change-password')}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${isActive('/dashboard/change-password')
                        ? 'bg-gradient-to-r from-teal-500 to-teal-600 text-white shadow-md'
                        : 'text-gray-700 hover:bg-gray-50'
                        }`}
                    >
                      <Settings className="h-5 w-5" />
                      Settings
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={() => handleNavigation('/dashboard')}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${isActive('/dashboard')
                        ? 'bg-gradient-to-r from-teal-500 to-teal-600 text-white shadow-md'
                        : 'text-gray-700 hover:bg-gray-50'
                        }`}
                    >
                      <BarChart3 className="h-5 w-5" />
                      Dashboard
                    </button>
                    <button
                      onClick={() => handleNavigation('/dashboard/timesheets')}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${isActive('/dashboard/timesheets')
                        ? 'bg-gradient-to-r from-teal-500 to-teal-600 text-white shadow-md'
                        : 'text-gray-700 hover:bg-gray-50'
                        }`}
                    >
                      <Clock className="h-5 w-5" />
                      Timesheets
                    </button>
                    <button
                      onClick={() => handleNavigation('/dashboard/teams')}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${pathname?.startsWith('/dashboard/teams')
                        ? 'bg-gradient-to-r from-teal-500 to-teal-600 text-white shadow-md'
                        : 'text-gray-700 hover:bg-gray-50'
                        }`}
                    >
                      <UsersRound className="h-5 w-5" />
                      Teams
                    </button>
                    <button
                      onClick={() => handleNavigation('/dashboard/projects')}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${pathname?.startsWith('/dashboard/projects')
                        ? 'bg-gradient-to-r from-teal-500 to-teal-600 text-white shadow-md'
                        : 'text-gray-700 hover:bg-gray-50'
                        }`}
                    >
                      <FolderKanban className="h-5 w-5" />
                      Projects
                    </button>
                    <button
                      onClick={() => handleNavigation('/dashboard/users')}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${isActive('/dashboard/users')
                        ? 'bg-gradient-to-r from-teal-500 to-teal-600 text-white shadow-md'
                        : 'text-gray-700 hover:bg-gray-50'
                        }`}
                    >
                      <Users className="h-5 w-5" />
                      Users
                    </button>
                    <button
                      onClick={() => handleNavigation('/dashboard/pending-requests')}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${isActive('/dashboard/pending-requests')
                        ? 'bg-gradient-to-r from-teal-500 to-teal-600 text-white shadow-md'
                        : 'text-gray-700 hover:bg-gray-50'
                        }`}
                    >
                      <FileEdit className="h-5 w-5" />
                      Pending Requests
                    </button>
                    <button
                      onClick={() => handleNavigation('/dashboard/settings')}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${isActive('/dashboard/settings')
                        ? 'bg-gradient-to-r from-teal-500 to-teal-600 text-white shadow-md'
                        : 'text-gray-700 hover:bg-gray-50'
                        }`}
                    >
                      <Settings className="h-5 w-5" />
                      Settings
                    </button>
                  </>
                )}
              </nav>

              {/* Logout Button */}
              <div className="p-4 border-t border-gray-100">
                <button
                  onClick={handleLogout}
                  disabled={isLoggingOut}
                  className="flex w-full items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-red-600 hover:bg-red-50 transition-all disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {isLoggingOut ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    <LogOut className="h-5 w-5" />
                  )}
                  {isLoggingOut ? 'Logging out...' : 'Logout'}
                </button>
              </div>
            </div>
          </aside>

          {/* Main Content */}
          <main className="flex-1 min-w-0">
            {children}
          </main>
        </div>
      </div>
    </div>
  )
}
