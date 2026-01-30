'use client'

import Image from 'next/image'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { api } from '@/lib/api'
import { Clock, BarChart3, Users, Shield, Loader2 } from 'lucide-react'
import './placeholder-styles.css'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (loading) return

    setError('')
    setLoading(true)

    try {
      await api.login(email, password)
      router.push('/dashboard')
    } catch (err: any) {
      setError(err.message || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  const features = [
    { icon: Clock, text: 'Track Time Effortlessly' },
    { icon: BarChart3, text: 'Detailed analytics & reports' },
    { icon: Users, text: 'Team collaboration' },
    { icon: Shield, text: 'Enterprise-grade security' },
  ]

  return (
    <div className="min-h-screen relative" style={{ fontFamily: '"Darker Grotesque", sans-serif' }}>
      {/* Full Background Image */}
      <div className="absolute inset-0">
        <Image
          src="/Login-page 1.png"
          alt="Background"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-white/20" />
      </div>

      {/* Content Container */}
      <div className="relative z-10 min-h-screen flex flex-col items-center justify-center py-10 px-6">
        {/* Main Wrapper */}
        <div className="w-full max-w-5xl flex flex-col items-center">
          {/* Logo & Branding */}
          <div className="text-center mb-1">
            <Image src="/logo.png" alt="Logo" width={112} height={112} className="mx-auto" />
          </div>

          {/* Main Title Section */}
          <div className="text-center mb-10">
            <h2 className="text-6xl font-black text-black mb-3" style={{ fontWeight: 900, fontSize: '64px' }}>
              Time Tracker
            </h2>
            <p className="mb-4 text-5xl font-black" style={{
              fontWeight: 900,
              fontSize: '48px',
              lineHeight: '136%',
              background: 'linear-gradient(90deg, #1ABC9C 0%, #45C8AF 49.57%, #CEFFF5 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text'
            }}>
              Manage your team's time efficiently
            </p>
            <p className="text-xl text-gray-500 mb-8 max-w-3xl mx-auto font-semibold">
              Powerful insights & controls to help your Organization Track, Analyze & Optimize Productivity.
            </p>

            {/* Features Row */}
            <div className="flex flex-wrap justify-center gap-4">
              {features.map((feature, index) => (
                <div
                  key={index}
                  className="flex items-center gap-2 border border-[#45C8AF]/20 px-5 h-10 rounded-full bg-white/10 backdrop-blur-sm"
                >
                  <feature.icon className="w-4 h-4" style={{ color: '#45C8AF' }} />
                  <span className="text-sm font-bold" style={{ color: '#45C8AF' }}>{feature.text}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Login Form Card */}
          <div className="w-full max-w-4xl backdrop-blur-xl rounded-[40px] p-12 shadow-2xl border-b-[6px]"
            style={{ background: 'rgba(255, 255, 255, 0.6)', borderBottomColor: '#45C8AF' }}>
            <div className="text-center mb-8">
              <h3 className="text-5xl font-black text-black mb-2" style={{ fontWeight: 900, fontSize: '48px' }}>
                Welcome Back
              </h3>
              <p className="text-xl font-bold text-black/60">
                Sign in Your Account to Continue
              </p>
            </div>

            <form method="post" className="flex flex-col items-center" onSubmit={handleSubmit}>
              <fieldset disabled={loading} className="w-full flex flex-col items-center space-y-6">
                {error && (
                  <div className="w-full max-w-[500px] rounded-lg bg-red-50 border border-red-200 p-3 mb-2">
                    <p className="text-sm text-red-800 font-medium text-center">{error}</p>
                  </div>
                )}

                <div className="w-full flex flex-col items-center space-y-5">
                  <input
                    id="email"
                    type="email"
                    autoComplete="email"
                    required
                    disabled={loading}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Your Email"
                    className="w-full max-w-[500px] h-14 px-6 bg-white/40 border-none rounded-2xl text-black font-semibold placeholder:text-black/30 focus:ring-2 focus:ring-[#45C8AF]/50 outline-none transition-all"
                  />

                  <input
                    id="password"
                    type="password"
                    autoComplete="current-password"
                    required
                    disabled={loading}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Password"
                    className="w-full max-w-[500px] h-14 px-6 bg-white/40 border-none rounded-2xl text-black font-semibold placeholder:text-black/30 focus:ring-2 focus:ring-[#45C8AF]/50 outline-none transition-all"
                  />
                </div>

                <div className="pt-4">
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-[320px] h-14 bg-white/80 hover:bg-white text-2xl font-black text-[#1ABC9C] rounded-2xl shadow-sm transition-all flex items-center justify-center gap-2 group"
                    style={{ fontWeight: 900 }}
                  >
                    {loading ? (
                      <Loader2 className="w-6 h-6 animate-spin" />
                    ) : (
                      'Sign in'
                    )}
                  </button>
                </div>
              </fieldset>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}
