import Link from 'next/link'
import { AlertTriangle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { AuthShell } from '@/components/auth-shell'

export default function AuthErrorPage() {
  return (
    <AuthShell
      title="Something went wrong"
      description="We couldn't complete that authentication request."
    >
      <div className="flex flex-col items-center gap-5 text-center">
        <span className="flex h-14 w-14 items-center justify-center rounded-full bg-destructive/10 text-destructive">
          <AlertTriangle className="h-7 w-7" />
        </span>
        <p className="text-sm text-muted-foreground text-pretty">
          The confirmation link may have expired or already been used. Please
          try signing in, or create a new account.
        </p>
        <div className="flex w-full gap-3">
          <Button asChild variant="outline" className="flex-1">
            <Link href="/auth/sign-up">Sign up</Link>
          </Button>
          <Button asChild className="flex-1">
            <Link href="/auth/login">Sign in</Link>
          </Button>
        </div>
      </div>
    </AuthShell>
  )
}
