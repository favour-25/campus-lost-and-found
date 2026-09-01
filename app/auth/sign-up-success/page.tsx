import Link from 'next/link'
import { MailCheck } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { AuthShell } from '@/components/auth-shell'

export default function SignUpSuccessPage() {
  return (
    <AuthShell
      title="Check your email"
      description="We've sent you a confirmation link to activate your account."
    >
      <div className="flex flex-col items-center gap-5 text-center">
        <span className="flex h-14 w-14 items-center justify-center rounded-full bg-success/10 text-success">
          <MailCheck className="h-7 w-7" />
        </span>
        <p className="text-sm text-muted-foreground text-pretty">
          Please confirm your email address by clicking the link we sent. Once
          confirmed, you can sign in and start reporting items.
        </p>
        <Button asChild className="w-full">
          <Link href="/auth/login">Go to sign in</Link>
        </Button>
      </div>
    </AuthShell>
  )
}
