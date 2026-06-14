import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  useCallback,
  type ReactNode,
} from 'react'
import type { Session } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'
import { queryClient } from '@/lib/queryClient'
import { PERSIST_KEY } from '@/lib/persister'
import type { Profile } from '@/types/db'

export interface AuthFacility {
  id: string
  name: string
  region_id: string
}

interface AuthContextValue {
  session: Session | null
  profile: Profile | null
  facility: AuthFacility | null
  /** true tant que la session initiale n'a pas été résolue. */
  loading: boolean
  /** true quand le profil n'a pas pu être chargé (compte sans profil / désactivé). */
  profileError: boolean
  signIn: (email: string, password: string) => Promise<{ error: string | null }>
  signOut: () => Promise<void>
  refreshProfile: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [facility, setFacility] = useState<AuthFacility | null>(null)
  const [loading, setLoading] = useState(true)
  const [profileError, setProfileError] = useState(false)

  const loadProfile = useCallback(async (authId: string) => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('auth_id', authId)
      .maybeSingle()

    if (error || !data) {
      setProfile(null)
      setFacility(null)
      setProfileError(true)
      return
    }
    const prof = data as Profile
    setProfile(prof)
    setProfileError(false)

    if (prof.facility_id) {
      const { data: fac } = await supabase
        .from('facilities')
        .select('id, name, region_id')
        .eq('id', prof.facility_id)
        .maybeSingle()
      setFacility((fac as AuthFacility) ?? null)
    } else {
      setFacility(null)
    }
  }, [])

  useEffect(() => {
    let active = true

    supabase.auth.getSession().then(async ({ data }) => {
      if (!active) return
      setSession(data.session)
      if (data.session) await loadProfile(data.session.user.id)
      setLoading(false)
    })

    const { data: sub } = supabase.auth.onAuthStateChange((_event, newSession) => {
      if (!active) return
      setSession(newSession)
      if (newSession) {
        void loadProfile(newSession.user.id)
      } else {
        setProfile(null)
        setFacility(null)
        setProfileError(false)
      }
    })

    return () => {
      active = false
      sub.subscription.unsubscribe()
    }
  }, [loadProfile])

  const signIn = useCallback(async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    })
    if (error) {
      const msg =
        error.message === 'Invalid login credentials'
          ? 'Email ou mot de passe incorrect.'
          : error.message === 'Email not confirmed'
            ? "Ce compte n'est pas encore activé. Contactez votre administrateur."
            : 'Connexion impossible pour le moment. Réessayez.'
      return { error: msg }
    }
    return { error: null }
  }, [])

  const signOut = useCallback(async () => {
    await supabase.auth.signOut()
    setProfile(null)
    setFacility(null)
    // Vide le cache mémoire et le cache persisté (pas de fuite entre comptes).
    queryClient.clear()
    try {
      window.localStorage.removeItem(PERSIST_KEY)
    } catch {
      // ignore
    }
  }, [])

  const refreshProfile = useCallback(async () => {
    if (session) await loadProfile(session.user.id)
  }, [session, loadProfile])

  const value = useMemo<AuthContextValue>(
    () => ({ session, profile, facility, loading, profileError, signIn, signOut, refreshProfile }),
    [session, profile, facility, loading, profileError, signIn, signOut, refreshProfile],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth doit être utilisé dans un AuthProvider')
  return ctx
}
