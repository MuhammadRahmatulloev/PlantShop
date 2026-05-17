import { createContext, useContext, useState } from 'react'

const AuthContext = createContext()

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [token, setToken] = useState(localStorage.getItem('access') || null)

  const loginUser = (accessToken) => {
    localStorage.setItem('access', accessToken)
    setToken(accessToken)
  }

  const logoutUser = () => {
    localStorage.removeItem('access')
    setToken(null)
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ token, user, setUser, loginUser, logoutUser }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)