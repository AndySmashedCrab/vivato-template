import {
  createContext,
  useContext,
  useState,
  type PropsWithChildren,
} from 'react'

export type AppRole = 'SuperAdmin' | 'Admin' | 'User'

type RoleContextValue = {
  roles: AppRole[]
  setRoles: (roles: AppRole[]) => void
  hasRole: (role: AppRole) => boolean
}

const RoleContext = createContext<RoleContextValue | undefined>(undefined)

export function RoleProvider({ children }: PropsWithChildren) {
  const [roles, setRoles] = useState<AppRole[]>([])

  const value: RoleContextValue = {
    roles,
    setRoles,
    hasRole: (role) => roles.includes(role),
  }

  return <RoleContext.Provider value={value}>{children}</RoleContext.Provider>
}

export function useRoles() {
  const context = useContext(RoleContext)

  if (!context) {
    throw new Error('useRoles must be used within a RoleProvider')
  }

  return context
}
