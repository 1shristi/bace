'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

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

        // Try to fetch profile
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .single()

        // If profile exists, redirect based on role
        if (profile?.role === 'doctor') {
          router.push('/protected/doctor')
        } else if (profile?.role === 'patient') {
          router.push('/protected/patient')
        } else if (!profileError) {
          // Profile exists but no role - default to patient
          router.push('/protected/patient')
        } else {
          // Table doesn't exist or other error - show setup instructions
          setError('Database setup required. Please configure Supabase or try the demo.')
        }
      } catch (err) {
        console.log('[v0] Error checking role:', err)
        setError('Error loading dashboard. Database setup may be required.')
      }
    }

    checkRole()
  }, [router])

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Setup Required</CardTitle>
            <CardDescription>Unable to load dashboard</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">{error}</p>
            <div className="space-y-2">
              <Button onClick={() => router.push('/demo/login')} className="w-full">
                Try Demo Version
              </Button>
              <Button
                onClick={() => {
                  localStorage.removeItem('demo_session')
                  router.push('/auth/login')
                }}
                variant="outline"
                className="w-full bg-transparent"
              >
                Back to Login
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              To use the production version, add your Supabase credentials in the Vars section and execute the database migration.
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center space-y-2">
        <p className="text-lg font-semibold">Loading...</p>
        <p className="text-sm text-muted-foreground">Redirecting you to your dashboard</p>
      </div>
    </div>
  )
}
