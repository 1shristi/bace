'use client'

import { Slider } from "@/components/ui/slider"

import React from "react"

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Dial } from '@/components/dial'
import { Textarea } from '@/components/ui/textarea'
import { useRouter } from 'next/navigation'
import { getDemoEntriesByUserId, addDemoEntry } from '@/lib/demo-data'

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

export default function PatientDashboard() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [entries, setEntries] = useState<DailyEntry[]>([])
  const [scores, setScores] = useState({
    behavior: 3,
    activity: 3,
    cognition: 3,
    emotion: 3,
  })
  const [notes, setNotes] = useState('')
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
          const demoEntries = getDemoEntriesByUserId(session.user.id)
          setEntries(demoEntries)
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
      fetchEntries()
      setLoading(false)
    }

    checkUser()
  }, [])

  const fetchEntries = async () => {
    const { data } = await supabase
      .from('daily_entries')
      .select('*')
      .order('entry_date', { ascending: false })
      .limit(7)

    setEntries(data || [])
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)

    try {
      if (isDemo) {
        // Demo mode: add to demo data
        addDemoEntry(user.id, {
          behavior: scores.behavior,
          activity: scores.activity,
          cognition: scores.cognition,
          emotion: scores.emotion,
          notes: notes || undefined,
        })
        setNotes('')
        const demoEntries = getDemoEntriesByUserId(user.id)
        setEntries(demoEntries)
      } else {
        // Real mode: save to database
        const today = new Date().toISOString().split('T')[0]

        const { error } = await supabase.from('daily_entries').upsert({
          patient_id: user.id,
          entry_date: today,
          behavior_score: scores.behavior,
          activity_score: scores.activity,
          cognition_score: scores.cognition,
          emotion_score: scores.emotion,
          notes: notes || null,
        })

        if (error) throw error

        setNotes('')
        await fetchEntries()
      }
    } catch (err) {
      console.error('Error submitting entry:', err)
    } finally {
      setSubmitting(false)
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

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold">BACE Daily Tracker</h1>
            <p className="text-muted-foreground mt-1">How are you feeling today?</p>
            {isDemo && <p className="text-xs text-amber-600 mt-2">Demo Mode - Data is not saved</p>}
          </div>
          <Button variant="outline" onClick={handleLogout}>
            Log out
          </Button>
        </div>

        {/* Tracking Form */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Today's Check-in</CardTitle>
            <CardDescription>Rate each area on a scale of 1-5</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Dials Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                {/* Behavior Dial */}
                <div>
                  <Dial
                    value={scores.behavior}
                    onChange={(value) => setScores({ ...scores, behavior: value })}
                    label="Behaviour"
                    description="Overall conduct"
                    color="hsl(var(--chart-1))"
                  />
                </div>

                {/* Activity Dial */}
                <div>
                  <Dial
                    value={scores.activity}
                    onChange={(value) => setScores({ ...scores, activity: value })}
                    label="Activity"
                    description="Physical engagement"
                    color="hsl(var(--chart-2))"
                  />
                </div>

                {/* Cognition Dial */}
                <div>
                  <Dial
                    value={scores.cognition}
                    onChange={(value) => setScores({ ...scores, cognition: value })}
                    label="Mental Clarity"
                    description="Focus & concentration"
                    color="hsl(var(--chart-3))"
                  />
                </div>

                {/* Emotion Dial */}
                <div>
                  <Dial
                    value={scores.emotion}
                    onChange={(value) => setScores({ ...scores, emotion: value })}
                    label="Emotional State"
                    description="Mood & wellbeing"
                    color="hsl(var(--chart-4))"
                  />
                </div>
              </div>

              {/* Notes */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Notes (Optional)</label>
                <Textarea
                  placeholder="Add any additional thoughts or observations..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="resize-none"
                />
              </div>

              <Button type="submit" disabled={submitting} className="w-full">
                {submitting ? 'Saving...' : 'Save Entry'}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Recent Entries */}
        {entries.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Recent Entries</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {entries.map((entry) => (
                  <div key={entry.id} className="border rounded-lg p-4">
                    <p className="font-semibold text-sm text-muted-foreground mb-2">
                      {new Date(entry.date || entry.entry_date || new Date()).toLocaleDateString()}
                    </p>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div>
                        <p className="text-xs text-muted-foreground">Behavior</p>
                        <p className="text-lg font-bold">{entry.behavior || entry.behavior_score}/5</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Activity</p>
                        <p className="text-lg font-bold">{entry.activity || entry.activity_score}/5</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Cognition</p>
                        <p className="text-lg font-bold">{entry.cognition || entry.cognition_score}/5</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Emotion</p>
                        <p className="text-lg font-bold">{entry.emotion || entry.emotion_score}/5</p>
                      </div>
                    </div>
                    {entry.notes && (
                      <p className="text-sm text-muted-foreground mt-3 italic">{entry.notes}</p>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
