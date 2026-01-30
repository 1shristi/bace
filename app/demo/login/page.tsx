'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { DEMO_DOCTOR, DEMO_PATIENTS } from '@/lib/demo-data'

export default function DemoLogin() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)

  const handleDemoLogin = async (email: string, role: string) => {
    setIsLoading(true)
    try {
      // Store demo session in localStorage
      localStorage.setItem(
        'demo_session',
        JSON.stringify({
          user: {
            id: role === 'doctor' ? DEMO_DOCTOR.id : DEMO_PATIENTS.find((p) => p.email === email)?.id,
            email: email,
            user_metadata: {
              first_name: role === 'doctor' ? 'Dr.' : 'Patient',
            },
          },
          profile: {
            id: role === 'doctor' ? DEMO_DOCTOR.id : DEMO_PATIENTS.find((p) => p.email === email)?.id,
            role: role,
          },
        }),
      )

      // Brief delay for UX
      await new Promise((resolve) => setTimeout(resolve, 500))

      router.push('/protected')
      router.refresh()
    } catch (error) {
      console.log('[v0] Demo login error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <Card className="w-full max-w-md p-8 shadow-xl">
        <div className="space-y-8">
          <div className="text-center space-y-2">
            <h1 className="text-3xl font-bold text-gray-900">BACE Tracker</h1>
            <p className="text-sm text-gray-600">Demo Version</p>
            <p className="text-xs text-gray-500 mt-4">
              Try the app with sample data. Select your role to continue.
            </p>
          </div>

          <div className="space-y-3">
            <div className="space-y-2">
              <h3 className="text-sm font-semibold text-gray-700">Doctor Account</h3>
              <Button
                onClick={() => handleDemoLogin(DEMO_DOCTOR.email, 'doctor')}
                disabled={isLoading}
                className="w-full bg-indigo-600 hover:bg-indigo-700"
              >
                {isLoading ? 'Loading...' : `Login as ${DEMO_DOCTOR.name}`}
              </Button>
              <p className="text-xs text-gray-500">{DEMO_DOCTOR.email}</p>
            </div>

            <div className="border-t border-gray-200 pt-4">
              <h3 className="text-sm font-semibold text-gray-700 mb-2">Patient Accounts</h3>
              <div className="space-y-2">
                {DEMO_PATIENTS.map((patient) => (
                  <div key={patient.id}>
                    <Button
                      onClick={() => handleDemoLogin(patient.email, 'patient')}
                      disabled={isLoading}
                      variant="outline"
                      className="w-full"
                    >
                      {isLoading ? 'Loading...' : `Login as ${patient.name}`}
                    </Button>
                    <p className="text-xs text-gray-500">{patient.email}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <p className="text-xs text-blue-900">
              <strong>Demo Mode:</strong> This is a demo version. Your data is not persisted. To use the real version, add Supabase
              credentials.
            </p>
          </div>
        </div>
      </Card>
    </div>
  )
}
