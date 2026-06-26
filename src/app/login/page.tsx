'use client'
import { useState, Suspense } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import Link from 'next/link'
import Image from 'next/image'
import { useAuth } from '@/context/AuthContext'
import { useSearchParams } from 'next/navigation'
import toast from 'react-hot-toast'
import axios from 'axios'

const schema = z.object({
  email:    z.string().email('Enter a valid email'),
  password: z.string().min(1, 'Password is required'),
})
type FormData = z.infer<typeof schema>

function LoginContent() {
  const { login }                             = useAuth()
  const [busy, setBusy]                       = useState(false)
  const [unverifiedEmail, setUnverifiedEmail] = useState<string | null>(null)
  const [resendBusy, setResendBusy]           = useState(false)
  const [resendDone, setResendDone]           = useState(false)
  const searchParams                          = useSearchParams()
  const registered                            = searchParams.get('registered') === '1'
  const verified                              = searchParams.get('verified') === '1'
  const reason                                = searchParams.get('reason')

  const bannerMessages: Record<string, { msg: string; warn: boolean }> = {
    admin_only:      { msg: 'Admin access only. Please sign in with an admin account.', warn: true },
    vendor_only:     { msg: 'Vendor dashboard access only. Please sign in as a vendor.', warn: true },
    session_expired: { msg: 'Your session expired. Please sign in again.', warn: true },
  }
  const banner = reason ? bannerMessages[reason] : null

  const { register, handleSubmit, getValues, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  })

  const onSubmit = async (data: FormData) => {
    setBusy(true)
    setUnverifiedEmail(null)
    try {
      await login(data.email, data.password)
      toast.success('Welcome back!')
    } catch (err: any) {
      const code = err?.response?.data?.code
      if (code === 'EMAIL_NOT_VERIFIED') {
        setUnverifiedEmail(data.email)
      } else {
        const msg = err?.response?.data?.error || 'Invalid email or password.'
        toast.error(msg)
      }
    } finally {
      setBusy(false)
    }
  }

  const handleResend = async () => {
    const email = unverifiedEmail || getValues('email')
    if (!email) return
    setResendBusy(true)
    try {
      await axios.post('/api/auth/verify-email/resend-public', { email })
      setResendDone(true)
      toast.success('Verification email sent! Check your inbox.')
    } catch {
      toast.error('Could not send verification email. Please try again.')
    } finally {
      setResendBusy(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex flex-col items-center gap-1">
            <Image src="/images/ecove-logo.png" alt="Ecove" width={72} height={72} priority />
            <span className="text-2xl font-extrabold text-orange-500">
              eco<span className="text-gray-800">ve</span>
            </span>
          </Link>
          <p className="text-gray-500 mt-2 text-sm">Sign in to your account</p>
        </div>

        {registered && (
          <div className="mb-4 p-4 rounded-xl text-sm font-medium bg-green-50 text-green-700">
            ✅ Account created! Check your email to verify before signing in.
          </div>
        )}
        {verified && (
          <div className="mb-4 p-4 rounded-xl text-sm font-medium bg-green-50 text-green-700">
            ✅ Email verified! You can now sign in.
          </div>
        )}
        {banner && (
          <div className={`mb-4 p-4 rounded-xl text-sm font-medium ${banner.warn ? 'bg-amber-50 text-amber-800' : 'bg-blue-50 text-blue-800'}`}>
            ⚠️ {banner.msg}
          </div>
        )}

        {/* Email not verified state */}
        {unverifiedEmail && (
          <div className="mb-4 p-4 rounded-xl border border-amber-200 bg-amber-50">
            <p className="text-sm font-semibold text-amber-800 mb-1">📧 Email not verified</p>
            <p className="text-sm text-amber-700 mb-3">
              Please verify your email address before signing in. Check your inbox for the link we sent to{' '}
              <span className="font-semibold">{unverifiedEmail}</span>.
            </p>
            {resendDone ? (
              <p className="text-sm font-medium text-green-700">✅ Verification email resent — check your inbox.</p>
            ) : (
              <button
                type="button"
                onClick={handleResend}
                disabled={resendBusy}
                className="text-sm font-semibold text-orange-600 hover:text-orange-700 underline disabled:opacity-50"
              >
                {resendBusy ? 'Sending…' : "Didn't get the email? Resend verification link"}
              </button>
            )}
          </div>
        )}

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Email address</label>
              <input
                type="email"
                placeholder="you@example.com"
                className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent"
                {...register('email')}
              />
              {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
            </div>

            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="text-sm font-semibold text-gray-700">Password</label>
                <Link href="/forgot-password" className="text-xs text-orange-500 hover:underline">Forgot password?</Link>
              </div>
              <input
                type="password"
                placeholder="Enter your password"
                className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent"
                {...register('password')}
              />
              {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>}
            </div>

            <button
              type="submit"
              disabled={busy}
              className={`w-full py-3 rounded-xl font-bold text-white text-sm transition-all ${busy ? 'bg-gray-300' : 'bg-[#f68b1f] hover:bg-[#d4720e]'}`}
            >
              {busy ? 'Signing in…' : 'Sign In'}
            </button>
          </form>

          <div className="mt-6 text-center text-sm text-gray-500">
            Don&apos;t have an account?{' '}
            <Link href="/register" className="text-orange-500 font-semibold hover:underline">Create account</Link>
          </div>

          <div className="mt-4 text-center">
            <Link href="/vendor/register" className="text-sm text-gray-400 hover:text-orange-500">
              Want to sell on Ecove? Apply as a vendor →
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-white flex items-center justify-center"><img src="/images/ecove-logo.png" alt="Ecove" width={72} height={72} className="animate-pulse" /></div>}>
      <LoginContent />
    </Suspense>
  )
}
