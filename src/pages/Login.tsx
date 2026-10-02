import { useState } from 'react'
import type { FormEvent } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import type { Variants } from 'framer-motion'
import { supabase } from '@/lib/supabase'
import { Logo } from '@/components/Logo'

const container: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08, delayChildren: 0.1 } },
}
const item: Variants = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } },
}

export function Login() {
  const [mode, setMode] = useState<'signin' | 'signup'>('signin')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [notice, setNotice] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  async function submit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    setNotice(null)
    setBusy(true)
    if (mode === 'signin') {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) setError(error.message)
    } else {
      const { data, error } = await supabase.auth.signUp({ email, password })
      if (error) {
        setError(error.message)
      } else if (data.user && data.user.identities && data.user.identities.length === 0) {
        // Supabase returns a user with no identities when the email already exists.
        setError('This email is already registered. Try signing in instead.')
      } else if (data.session) {
        // Confirmation is off — the user is already signed in; AuthProvider redirects.
        setNotice('Account created — signing you in…')
      } else {
        setNotice('Almost there — check your email to confirm your account, then sign in.')
      }
    }
    setBusy(false)
  }

  return (
    <div className="relative flex min-h-full items-center justify-center overflow-hidden bg-gradient-to-br from-[#0c2a24] via-[#0e2130] to-[#122a3e] p-4 text-white">
      {/* Animated aurora blobs */}
      <motion.div
        aria-hidden
        className="pointer-events-none absolute -left-32 -top-32 h-[30rem] w-[30rem] rounded-full bg-emerald-400/45 blur-[120px]"
        animate={{ x: [0, 60, -20, 0], y: [0, 40, 80, 0], scale: [1, 1.15, 0.95, 1] }}
        transition={{ duration: 18, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        aria-hidden
        className="pointer-events-none absolute -bottom-40 -right-24 h-[34rem] w-[34rem] rounded-full bg-cyan-400/35 blur-[130px]"
        animate={{ x: [0, -50, 30, 0], y: [0, -30, -70, 0], scale: [1, 1.1, 1.05, 1] }}
        transition={{ duration: 22, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-1/4 h-80 w-80 rounded-full bg-violet-500/25 blur-[120px]"
        animate={{ x: [0, 40, -40, 0], y: [0, 50, -20, 0] }}
        transition={{ duration: 26, repeat: Infinity, ease: 'easeInOut' }}
      />

      {/* Subtle grid overlay */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.07]"
        style={{
          backgroundImage:
            'linear-gradient(to right, #fff 1px, transparent 1px), linear-gradient(to bottom, #fff 1px, transparent 1px)',
          backgroundSize: '44px 44px',
          maskImage: 'radial-gradient(ellipse 70% 60% at 50% 45%, #000 40%, transparent 100%)',
          WebkitMaskImage: 'radial-gradient(ellipse 70% 60% at 50% 45%, #000 40%, transparent 100%)',
        }}
      />

      {/* Card */}
      <motion.div
        initial={{ opacity: 0, y: 24, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="relative z-10 w-full max-w-sm rounded-2xl border border-white/10 bg-white/[0.04] p-8 shadow-[0_0_60px_-15px_rgba(16,185,129,0.4)] backdrop-blur-xl"
      >
        <motion.div variants={container} initial="hidden" animate="show">
          <motion.div variants={item} className="mb-6 flex flex-col items-center text-center">
            <motion.div
              className="mb-3 rounded-2xl"
              animate={{ boxShadow: [
                '0 0 24px rgba(16,185,129,0.4)',
                '0 0 42px rgba(16,185,129,0.75)',
                '0 0 24px rgba(16,185,129,0.4)',
              ] }}
              transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
            >
              <Logo className="h-14 w-14" />
            </motion.div>
            <h1 className="text-2xl font-bold tracking-tight">Munshi</h1>
            <AnimatePresence mode="wait">
              <motion.p
                key={mode}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.25 }}
                className="mt-1 text-sm text-white/50"
              >
                {mode === 'signin' ? 'Welcome back — sign in to continue' : 'Create your account'}
              </motion.p>
            </AnimatePresence>
          </motion.div>

          <form onSubmit={submit} className="space-y-4">
            <motion.div variants={item}>
              <label htmlFor="email" className="mb-1.5 block text-xs font-medium text-white/60">
                Email
              </label>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-11 w-full rounded-lg border border-white/10 bg-white/5 px-3 text-sm text-white placeholder-white/30 outline-none transition focus:border-emerald-400/60 focus:bg-white/[0.07] focus:ring-2 focus:ring-emerald-400/30"
                placeholder="you@example.com"
              />
            </motion.div>

            <motion.div variants={item}>
              <label htmlFor="password" className="mb-1.5 block text-xs font-medium text-white/60">
                Password
              </label>
              <input
                id="password"
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="h-11 w-full rounded-lg border border-white/10 bg-white/5 px-3 text-sm text-white placeholder-white/30 outline-none transition focus:border-emerald-400/60 focus:bg-white/[0.07] focus:ring-2 focus:ring-emerald-400/30"
                placeholder="••••••••"
              />
            </motion.div>

            <AnimatePresence>
              {error && (
                <motion.p
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="text-sm text-red-400"
                >
                  {error}
                </motion.p>
              )}
              {notice && (
                <motion.p
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="text-sm text-emerald-400"
                >
                  {notice}
                </motion.p>
              )}
            </AnimatePresence>

            <motion.div variants={item}>
              <motion.button
                type="submit"
                disabled={busy}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="relative h-11 w-full overflow-hidden rounded-lg bg-gradient-to-r from-emerald-400 to-teal-500 text-sm font-semibold text-[#050b09] shadow-[0_0_24px_-4px_rgba(16,185,129,0.6)] transition disabled:opacity-60"
              >
                {busy ? 'Please wait…' : mode === 'signin' ? 'Sign in' : 'Create account'}
              </motion.button>
            </motion.div>
          </form>

          <motion.button
            variants={item}
            onClick={() => {
              setMode(mode === 'signin' ? 'signup' : 'signin')
              setError(null)
              setNotice(null)
            }}
            className="mt-5 w-full text-center text-sm text-white/50 transition hover:text-white"
          >
            {mode === 'signin' ? "Don't have an account? Sign up" : 'Already have an account? Sign in'}
          </motion.button>
        </motion.div>
      </motion.div>
    </div>
  )
}
