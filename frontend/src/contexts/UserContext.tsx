import {
  createContext,
  useContext,
  useState,
  type PropsWithChildren,
} from 'react'

export type UserProfile = {
  id: string
  email: string
  displayName: string
}

type UserContextValue = {
  currentUser: UserProfile | null
  setCurrentUser: (user: UserProfile | null) => void
}

const UserContext = createContext<UserContextValue | undefined>(undefined)

export function UserProvider({ children }: PropsWithChildren) {
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null)

  return (
    <UserContext.Provider value={{ currentUser, setCurrentUser }}>
      {children}
    </UserContext.Provider>
  )
}

export function useUser() {
  const context = useContext(UserContext)

  if (!context) {
    throw new Error('useUser must be used within a UserProvider')
  }

  return context
}
