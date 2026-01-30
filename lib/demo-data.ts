// Demo data for BACE tracking app
export const DEMO_MODE = true

export const DEMO_DOCTOR = {
  id: 'doctor-1',
  email: 'doctor@example.com',
  name: 'Dr. Sarah Johnson',
  role: 'doctor' as const,
}

export const DEMO_PATIENTS = [
  {
    id: 'patient-1',
    email: 'john@example.com',
    name: 'John Smith',
    role: 'patient' as const,
    doctor_id: 'doctor-1',
  },
  {
    id: 'patient-2',
    email: 'jane@example.com',
    name: 'Jane Doe',
    role: 'patient' as const,
    doctor_id: 'doctor-1',
  },
]

// Generate sample entries for the past 30 days
function generateDemoEntries() {
  const entries = []
  const today = new Date()

  for (let i = 29; i >= 0; i--) {
    const date = new Date(today)
    date.setDate(date.getDate() - i)

    // Patient 1 entries
    entries.push({
      id: `entry-p1-${i}`,
      user_id: 'patient-1',
      date: date.toISOString().split('T')[0],
      behavior: Math.floor(Math.random() * 3) + 2, // 2-5
      activity: Math.floor(Math.random() * 3) + 2,
      cognition: Math.floor(Math.random() * 3) + 2,
      emotion: Math.floor(Math.random() * 3) + 2,
      notes: ['Had a good day', 'Feeling better', 'Struggling a bit', 'Great progress!'][Math.floor(Math.random() * 4)],
      created_at: date.toISOString(),
    })

    // Patient 2 entries
    entries.push({
      id: `entry-p2-${i}`,
      user_id: 'patient-2',
      date: date.toISOString().split('T')[0],
      behavior: Math.floor(Math.random() * 3) + 2,
      activity: Math.floor(Math.random() * 3) + 2,
      cognition: Math.floor(Math.random() * 3) + 2,
      emotion: Math.floor(Math.random() * 3) + 2,
      notes: ['Productive day', 'Relaxed', 'Challenging day', 'Feeling energized'][Math.floor(Math.random() * 4)],
      created_at: date.toISOString(),
    })
  }

  return entries
}

export const DEMO_ENTRIES = generateDemoEntries()

export function getDemoUserByEmail(email: string) {
  if (email === DEMO_DOCTOR.email) return DEMO_DOCTOR
  return DEMO_PATIENTS.find((p) => p.email === email)
}

export function getDemoPatientsByDoctorId(doctorId: string) {
  return DEMO_PATIENTS.filter((p) => p.doctor_id === doctorId)
}

export function getDemoEntriesByUserId(userId: string, days = 30) {
  const today = new Date()
  const cutoffDate = new Date(today)
  cutoffDate.setDate(cutoffDate.getDate() - days)

  return DEMO_ENTRIES.filter((entry) => entry.user_id === userId && new Date(entry.created_at) >= cutoffDate)
}

export function getDemoEntryByDateAndUserId(userId: string, date: string) {
  return DEMO_ENTRIES.find((entry) => entry.user_id === userId && entry.date === date)
}

export function addDemoEntry(
  userId: string,
  data: {
    behavior: number
    activity: number
    cognition: number
    emotion: number
    notes?: string
  },
) {
  const today = new Date().toISOString().split('T')[0]
  const entry = {
    id: `entry-${userId}-${Date.now()}`,
    user_id: userId,
    date: today,
    behavior: data.behavior,
    activity: data.activity,
    cognition: data.cognition,
    emotion: data.emotion,
    notes: data.notes || '',
    created_at: new Date().toISOString(),
  }

  DEMO_ENTRIES.push(entry)
  return entry
}
