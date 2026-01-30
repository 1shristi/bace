'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function Protected() {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const checkRole = async () => {
      // Check demo mode first
      const demoSession = localStorage.getItem('demo_session')
      if (demoSession) {
        try {
          const session = JSON.parse(demoSession)
          if (session.profile?.role === 'doctor') {
            router.push('/protected/doctor')
          } else {
            router.push('/protected/patient')
          }
          return
        } catch (e) {
          console.log('[v0] Demo session error:', e)
        }
      }

      // Check if Supabase is configured
      if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
        setError('Supabase is not configured. Please add your Supabase credentials.')
        return
      }

      try {
        const supabase = createClient()
        const {
          data: { user },
        } = await supabase.auth.getUser()

        if (!user) {
          router.push('/auth/login')
          return
        }

        const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()

        if (profile?.role === 'doctor') {
          router.push('/protected/doctor')
        } else {
          router.push('/protected/patient')
        }
      } catch (err) {
        console.log('[v0] Error checking role:', err)
        setError('Error loading dashboard. Please try again.')
      }
    }

    checkRole()
  }, [router])

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <p className="text-lg font-semibold text-red-600">Setup Required</p>
          <p className="text-sm text-muted-foreground">{error}</p>
          <p className="text-xs text-muted-foreground mt-4">
            Visit the Vars section in the sidebar to add your Supabase credentials.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center space-y-2">
        <p className="text-lg font-semibold">Loading...</p>
        <p className="text-sm text-muted-foreground">Redirecting you to your dashboard</p>
      </div>
    </div>
  )
}
