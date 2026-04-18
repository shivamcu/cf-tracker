import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function PrivateRoute() {
  const { user, loading } = useAuth()

  // Wait until localStorage is checked before deciding
  if (loading) return <div>Loading...</div>

  // If not logged in, kick to /login
  return user ? <Outlet /> : <Navigate to="/login" replace />
}