import {
  createContext,
  useContext,
  useState,
  type PropsWithChildren,
} from 'react'

type AuthState = {
  isAuthenticated: boolean
  token: string | null
}

type AuthContextValue = AuthState & {
  setSession: (token: string) => void
  clearSession: () => void
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

export function AuthProvider({ children }: PropsWithChildren) {
  const [token, setToken] = useState<string | null>(null)

  const value: AuthContextValue = {
    isAuthenticated: token !== null,
    token,
    setSession: (nextToken) => setToken(nextToken),
    clearSession: () => setToken(null),
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)

  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }

  return context
}
