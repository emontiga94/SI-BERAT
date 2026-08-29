import React from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../lib/AuthContext'

export default function ProtectedRoute({ children }) {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#F4F6F8]">
        <div className="flex items-center gap-3 text-navy-900">
          <span className="h-5 w-5 animate-spin rounded-full border-2 border-navy-900 border-t-transparent" />
          <span className="font-medium">Memuat sesi&hellip;</span>
        </div>
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/login" replace />
  }

  return children
}
