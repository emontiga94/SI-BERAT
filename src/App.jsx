import React from 'react'
import { Route, Routes } from 'react-router-dom'
import { AuthProvider } from './lib/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'
import Layout from './components/Layout'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import AlatBerat from './pages/AlatBerat'
import Sewa from './pages/Sewa'
import CetakRincian from './pages/CetakRincian'

export default function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route
          path="/sewa/:id/cetak"
          element={
            <ProtectedRoute>
              <CetakRincian />
            </ProtectedRoute>
          }
        />
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Layout>
                <Dashboard />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/alat"
          element={
            <ProtectedRoute>
              <Layout>
                <AlatBerat />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/sewa"
          element={
            <ProtectedRoute>
              <Layout>
                <Sewa />
              </Layout>
            </ProtectedRoute>
          }
        />
      </Routes>
    </AuthProvider>
  )
}
