import {
  createContext,
  useContext,
  useEffect,
  useState,
  type PropsWithChildren,
} from 'react'
import { useApi } from './ApiContext'
import { useRoles, type AppRole } from './RoleContext'
import { useUser, type UserProfile } from './UserContext'

type AuthUser = UserProfile & {
  roles: AppRole[]
}

type AuthContextValue = {
  isAuthenticated: boolean
  isInitialised: boolean
  currentUser: UserProfile | null
  roles: AppRole[]
  login: (email: string, password: string) => Promise<{ success: boolean; messages: string[] }>
  logout: () => Promise<void>
  reloadCurrentUser: () => Promise<boolean>
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

export function AuthProvider({ children }: PropsWithChildren) {
  const { get, post, postResult } = useApi()
  const { currentUser, setCurrentUser } = useUser()
  const { roles, setRoles } = useRoles()
  const [isInitialised, setIsInitialised] = useState(false)

  const applyUser = (user: AuthUser | null) => {
    setCurrentUser(
      user
        ? {
            id: user.id,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            fullName: user.fullName,
          }
        : null,
    )

    setRoles(user?.roles ?? [])
  }

  const reloadCurrentUser = async () => {
    const user = await get<AuthUser>('Auth', 'Me', {
      suppressErrorToasts: true,
    })

    applyUser(user)
    setIsInitialised(true)
    return user !== null
  }

  useEffect(() => {
    void reloadCurrentUser()
  }, [])

  const value: AuthContextValue = {
    isAuthenticated: currentUser !== null,
    isInitialised,
    currentUser,
    roles,
    login: async (email, password) => {
      const result = await postResult<AuthUser, { email: string; password: string }>(
        'Auth',
        'Login',
        { email, password },
        { retryOnUnauthorized: false, suppressErrorToasts: true },
      )

      if (!result.success || !result.value) {
        return {
          success: false,
          messages: result.messages.length > 0 ? result.messages : ['Unable to sign in.'],
        }
      }

      applyUser(result.value)
      setIsInitialised(true)
      return { success: true, messages: [] }
    },
    logout: async () => {
      await post('Auth', 'Logout', undefined, {
        suppressErrorToasts: true,
        retryOnUnauthorized: false,
      })

      applyUser(null)
      setIsInitialised(true)
    },
    reloadCurrentUser,
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
