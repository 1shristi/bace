import { Button } from '@/components/ui/button'
import { redirect } from 'next/navigation'
import Link from 'next/link'

export default async function Home() {
  // Safely handle missing Supabase config
  let user = null

  if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    try {
      const { createClient } = await import('@/lib/supabase/server')
      const supabase = await createClient()
      const { data } = await supabase.auth.getUser()
      user = data.user
    } catch (e) {
      console.log('[v0] Supabase not configured')
    }
  }

  if (user) {
    redirect('/protected')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex flex-col items-center justify-center p-4">
      <div className="max-w-2xl mx-auto text-center space-y-8">
        <div className="space-y-4">
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900">BACE</h1>
          <p className="text-xl text-gray-600">Daily Mental Health Tracking</p>
        </div>

        <p className="text-lg text-gray-700 leading-relaxed max-w-xl mx-auto">
          Monitor your mental wellbeing across Behavior, Activity, Cognition, and Emotion. Connect with your
          healthcare provider to share your progress.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/auth/sign-up">
            <Button size="lg" className="w-full sm:w-auto">
              Get Started
            </Button>
          </Link>
          <Link href="/auth/login">
            <Button size="lg" variant="outline" className="w-full sm:w-auto bg-transparent">
              Log In
            </Button>
          </Link>
          <Link href="/demo/login">
            <Button size="lg" variant="outline" className="w-full sm:w-auto bg-transparent">
              Try Demo
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-12">
          <div className="space-y-2">
            <div className="text-3xl font-bold text-blue-600">B</div>
            <p className="font-semibold text-gray-900">Behavior</p>
            <p className="text-sm text-gray-600">Track behavioral patterns</p>
          </div>
          <div className="space-y-2">
            <div className="text-3xl font-bold text-green-600">A</div>
            <p className="font-semibold text-gray-900">Activity</p>
            <p className="text-sm text-gray-600">Monitor activity levels</p>
          </div>
          <div className="space-y-2">
            <div className="text-3xl font-bold text-amber-600">C</div>
            <p className="font-semibold text-gray-900">Cognition</p>
            <p className="text-sm text-gray-600">Assess mental clarity</p>
          </div>
          <div className="space-y-2">
            <div className="text-3xl font-bold text-red-600">E</div>
            <p className="font-semibold text-gray-900">Emotion</p>
            <p className="text-sm text-gray-600">Record emotional state</p>
          </div>
        </div>
      </div>
    </div>
  )
}
