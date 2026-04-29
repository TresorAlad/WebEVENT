import { Routes, Route, Navigate } from 'react-router-dom'
import MainLayout from './components/layout/MainLayout'
import Dashboard from './pages/Dashboard'
import Events from './pages/Events'
import Users from './pages/Users'
import Analytics from './pages/Analytics'
import Financials from './pages/Financials'
import Settings from './pages/Settings'
import Profile from './pages/Profile'
import Login from './pages/Login'

import { useAuth } from './hooks/useAuth'

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, dbUser, loading } = useAuth()
  
  if (loading) return <div>Loading...</div>
  if (!user) return <Navigate to="/login" replace />
  if (!dbUser || dbUser.role !== 'ADMIN') return <Navigate to="/login" replace />
  
  return <>{children}</>
}

function App() {
  return (
    <Routes>
      {/* Auth Route */}
      <Route path="/login" element={<Login />} />

      {/* App Routes */}
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <MainLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="events" element={<Events />} />
        <Route path="users" element={<Users />} />
        <Route path="analytics" element={<Analytics />} />
        <Route path="financials" element={<Financials />} />
        <Route path="settings" element={<Settings />} />
        <Route path="profile" element={<Profile />} />
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  )
}

export default App
