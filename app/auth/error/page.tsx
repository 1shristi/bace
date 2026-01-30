import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import Link from 'next/link'

export default function AuthError() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-2">
          <CardTitle>Authentication Error</CardTitle>
          <CardDescription>Something went wrong during authentication</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            There was an issue processing your authentication. Please try again or contact support if the problem persists.
          </p>
          <div className="flex gap-2">
            <Link href="/auth/login" className="flex-1">
              <Button className="w-full">Try Again</Button>
            </Link>
            <Link href="/" className="flex-1">
              <Button variant="outline" className="w-full bg-transparent">
                Home
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
