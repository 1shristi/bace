'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useRouter } from 'next/navigation'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { DEMO_DOCTOR, DEMO_PATIENTS, getDemoEntriesByUserId } from '@/lib/demo-data'

interface Patient {
  id: string
  name?: string
  full_name?: string
  email: string
}

interface DailyEntry {
  id: string
  date?: string
  entry_date?: string
  behavior: number
  behavior_score?: number
  activity: number
  activity_score?: number
  cognition: number
  cognition_score?: number
  emotion: number
  emotion_score?: number
  notes: string | null
}

export default function DoctorDashboard() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [patients, setPatients] = useState<Patient[]>([])
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null)
  const [entries, setEntries] = useState<DailyEntry[]>([])
  const [isDemo, setIsDemo] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const checkUser = async () => {
      // Check demo mode first
      const demoSession = localStorage.getItem('demo_session')
      if (demoSession) {
        try {
          const session = JSON.parse(demoSession)
          setUser(session.user)
          setIsDemo(true)
          // Get demo patients
          const demoPatients = DEMO_PATIENTS.map((p) => ({
            id: p.id,
            name: p.name,
            email: p.email,
          }))
          setPatients(demoPatients)
          setLoading(false)
          return
        } catch (e) {
          console.log('[v0] Demo session error:', e)
        }
      }

      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        router.push('/auth/login')
        return
      }

      setUser(user)
      fetchPatients()
      setLoading(false)
    }

    checkUser()
  }, [])

  const fetchPatients = async () => {
    const { data } = await supabase
      .from('patient_doctor')
      .select('patient_id')
      .eq('doctor_id', user?.id)

    if (data) {
      const patientIds = data.map((pd) => pd.patient_id)
      const { data: patientProfiles } = await supabase
        .from('profiles')
        .select('id, full_name, email')
        .in('id', patientIds)

      setPatients(patientProfiles || [])
    }
  }

  const handleSelectPatient = async (patient: Patient) => {
    setSelectedPatient(patient)
    if (isDemo) {
      // Get demo entries
      const demoEntries = getDemoEntriesByUserId(patient.id).sort(
        (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime(),
      )
      setEntries(demoEntries)
    } else {
      const { data } = await supabase
        .from('daily_entries')
        .select('*')
        .eq('patient_id', patient.id)
        .order('entry_date', { ascending: true })
        .limit(30)

      setEntries(data || [])
    }
  }

  const handleLogout = async () => {
    if (isDemo) {
      localStorage.removeItem('demo_session')
      router.push('/')
    } else {
      await supabase.auth.signOut()
      router.push('/auth/login')
    }
  }

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>
  }

  const chartData = entries.map((entry) => ({
    date: new Date(entry.date || entry.entry_date || new Date()).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    }),
    behavior: entry.behavior || entry.behavior_score,
    activity: entry.activity || entry.activity_score,
    cognition: entry.cognition || entry.cognition_score,
    emotion: entry.emotion || entry.emotion_score,
  }))

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold">BACE Doctor Dashboard</h1>
            <p className="text-muted-foreground mt-1">Monitor your patients' progress</p>
            {isDemo && <p className="text-xs text-amber-600 mt-2">Demo Mode - Data is not saved</p>}
          </div>
          <Button variant="outline" onClick={handleLogout}>
            Log out
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Patient List */}
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle>Patients</CardTitle>
              <CardDescription>{patients.length} patients</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {patients.map((patient) => (
                  <button
                    key={patient.id}
                    onClick={() => handleSelectPatient(patient)}
                    className={`w-full text-left p-3 rounded-lg border transition-colors ${
                      selectedPatient?.id === patient.id
                        ? 'bg-primary text-primary-foreground border-primary'
                        : 'hover:bg-accent border-border'
                    }`}
                  >
                    <p className="font-semibold text-sm">{patient.name || patient.full_name}</p>
                    <p className="text-xs text-muted-foreground truncate">{patient.email}</p>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Patient Details */}
          <div className="lg:col-span-3 space-y-6">
            {selectedPatient ? (
              <>
                {/* Trend Chart */}
                {entries.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle>BACE Trends - {selectedPatient.name || selectedPatient.full_name}</CardTitle>
                      <CardDescription>Last 30 days</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={chartData}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="date" stroke="currentColor" />
                          <YAxis domain={[1, 5]} stroke="currentColor" />
                          <Tooltip />
                          <Legend />
                          <Line type="monotone" dataKey="behavior" stroke="#3b82f6" dot={false} />
                          <Line type="monotone" dataKey="activity" stroke="#10b981" dot={false} />
                          <Line type="monotone" dataKey="cognition" stroke="#f59e0b" dot={false} />
                          <Line type="monotone" dataKey="emotion" stroke="#ef4444" dot={false} />
                        </LineChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>
                )}

                {/* Recent Entries */}
                <Card>
                  <CardHeader>
                    <CardTitle>Recent Entries</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {entries.length > 0 ? (
                      <div className="space-y-4">
                        {[...entries].reverse().map((entry) => (
                          <div key={entry.id} className="border rounded-lg p-4">
                            <p className="font-semibold text-sm text-muted-foreground mb-3">
                              {new Date(entry.date || entry.entry_date || new Date()).toLocaleDateString()}
                            </p>
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                              <div>
                                <p className="text-xs text-muted-foreground">Behavior</p>
                                <p className="text-2xl font-bold text-blue-500">{entry.behavior || entry.behavior_score}</p>
                              </div>
                              <div>
                                <p className="text-xs text-muted-foreground">Activity</p>
                                <p className="text-2xl font-bold text-green-500">{entry.activity || entry.activity_score}</p>
                              </div>
                              <div>
                                <p className="text-xs text-muted-foreground">Cognition</p>
                                <p className="text-2xl font-bold text-amber-500">{entry.cognition || entry.cognition_score}</p>
                              </div>
                              <div>
                                <p className="text-xs text-muted-foreground">Emotion</p>
                                <p className="text-2xl font-bold text-red-500">{entry.emotion || entry.emotion_score}</p>
                              </div>
                            </div>
                            {entry.notes && (
                              <p className="text-sm text-muted-foreground mt-3 italic">"{entry.notes}"</p>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-muted-foreground">No entries yet</p>
                    )}
                  </CardContent>
                </Card>
              </>
            ) : (
              <Card>
                <CardContent className="pt-6">
                  <p className="text-center text-muted-foreground">Select a patient to view their data</p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
