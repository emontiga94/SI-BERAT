import React, { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '../supabaseClient'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [session, setSession] = useState(undefined) // undefined = loading, null = logged out
  const [role, setRole] = useState(null) // null = belum dimuat / staf secara default

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session ?? null)
    })
    const { data: listener } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession)
    })
    return () => listener.subscription.unsubscribe()
  }, [])

  useEffect(() => {
    const userId = session?.user?.id
    if (!userId) {
      setRole(null)
      return
    }
    supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', userId)
      .maybeSingle()
      .then(({ data }) => {
        setRole(data?.role || 'staf')
      })
  }, [session?.user?.id])

  const value = {
    session,
    user: session?.user ?? null,
    loading: session === undefined,
    role,
    isAdmin: role === 'admin',
    signIn: (email, password) => supabase.auth.signInWithPassword({ email, password }),
    signOut: () => supabase.auth.signOut(),
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth harus dipakai di dalam AuthProvider')
  return ctx
}
