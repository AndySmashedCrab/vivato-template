import type { PropsWithChildren } from 'react'
import { ApiProvider } from '../../contexts/ApiContext'
import { AuthProvider } from '../../contexts/AuthContext'
import { UserProvider } from '../../contexts/UserContext'
import { RoleProvider } from '../../contexts/RoleContext'
import { ToastProvider } from '../../contexts/ToastContext'
import { ThemeProvider } from '../../contexts/ThemeContext'

export function AppProviders({ children }: PropsWithChildren) {
  return (
    <ApiProvider>
      <ThemeProvider>
        <ToastProvider>
          <AuthProvider>
            <UserProvider>
              <RoleProvider>{children}</RoleProvider>
            </UserProvider>
          </AuthProvider>
        </ToastProvider>
      </ThemeProvider>
    </ApiProvider>
  )
}
