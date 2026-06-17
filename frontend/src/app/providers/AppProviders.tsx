import type { PropsWithChildren } from 'react'
import { SnackbarProvider } from 'notistack'
import { ApiProvider } from '../../contexts/ApiContext'
import { AuthProvider } from '../../contexts/AuthContext'
import { UserProvider } from '../../contexts/UserContext'
import { RoleProvider } from '../../contexts/RoleContext'
import { ThemeProvider } from '../../contexts/ThemeContext'

export function AppProviders({ children }: PropsWithChildren) {
  return (
    <ThemeProvider>
      <SnackbarProvider maxSnack={3} autoHideDuration={5000} anchorOrigin={{ vertical: 'top', horizontal: 'right' }}>
        <ApiProvider>
          <UserProvider>
            <RoleProvider>
              <AuthProvider>{children}</AuthProvider>
            </RoleProvider>
          </UserProvider>
        </ApiProvider>
      </SnackbarProvider>
    </ThemeProvider>
  )
}
