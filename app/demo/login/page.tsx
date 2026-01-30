'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
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
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-2xl">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-2">BACE Tracker</h1>
          <p className="text-muted-foreground">Demo Version - Explore with sample accounts</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Doctor Account */}
          <Card>
            <CardHeader>
              <CardTitle>Doctor Account</CardTitle>
              <CardDescription>Monitor patients' BACE progress</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-primary/5 border border-primary/20 rounded-lg p-4 space-y-2">
                <p className="text-sm">
                  <span className="font-semibold">Name:</span> {DEMO_DOCTOR.name}
                </p>
                <p className="text-sm">
                  <span className="font-semibold">Email:</span> {DEMO_DOCTOR.email}
                </p>
                <p className="text-sm">
                  <span className="font-semibold">Patients:</span> {DEMO_PATIENTS.length} assigned
                </p>
              </div>
              <Button
                onClick={() => handleDemoLogin(DEMO_DOCTOR.email, 'doctor')}
                disabled={isLoading}
                className="w-full"
              >
                {isLoading ? 'Loading...' : 'Login as Doctor'}
              </Button>
            </CardContent>
          </Card>

          {/* Patient Accounts */}
          <Card>
            <CardHeader>
              <CardTitle>Patient Accounts</CardTitle>
              <CardDescription>Log your daily BACE scores</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {DEMO_PATIENTS.map((patient) => (
                <div key={patient.id}>
                  <div className="bg-accent/5 border border-accent/20 rounded-lg p-3 mb-2 space-y-1">
                    <p className="text-sm font-semibold">{patient.name}</p>
                    <p className="text-xs text-muted-foreground">{patient.email}</p>
                  </div>
                  <Button
                    onClick={() => handleDemoLogin(patient.email, 'patient')}
                    disabled={isLoading}
                    variant="outline"
                    className="w-full bg-transparent"
                  >
                    {isLoading ? 'Loading...' : `Login as ${patient.name.split(' ')[0]}`}
                  </Button>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Info */}
        <Card className="mt-6">
          <CardContent className="pt-6">
            <div className="space-y-2">
              <p className="font-semibold text-sm">Demo Mode Information</p>
              <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                <li>All data is stored locally and will reset when you leave</li>
                <li>Doctor can view all assigned patients' entries and trends</li>
                <li>Patients can log daily BACE scores and view their history</li>
                <li>Try adding new entries to see real-time updates</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
