import { createContext, useContext, useState, useEffect } from 'react'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser]     = useState(null)
  const [token, setToken]   = useState(null)
  const [loading, setLoading] = useState(true)

  // On app load, restore session from localStorage
  useEffect(() => {
    const savedToken = localStorage.getItem('cf_token')
    const savedUser  = localStorage.getItem('cf_user')
    if (savedToken && savedUser) {
      setToken(savedToken)
      setUser(JSON.parse(savedUser))
    }
    setLoading(false)
  }, [])

  function login(userData, jwtToken) {
    setUser(userData)
    setToken(jwtToken)
    localStorage.setItem('cf_token', jwtToken)
    localStorage.setItem('cf_user', JSON.stringify(userData))
  }

  function logout() {
    setUser(null)
    setToken(null)
    localStorage.removeItem('cf_token')
    localStorage.removeItem('cf_user')
  }

  return (
    <AuthContext.Provider value={{ user, token, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  )
}

// Custom hook — use this in any component
export function useAuth() {
  return useContext(AuthContext)
}