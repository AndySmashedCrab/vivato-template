import Box from '@mui/material/Box'
import CircularProgress from '@mui/material/CircularProgress'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'

type AuthRouteProps = {
  children: React.ReactElement
}

export function AuthRoute({ children }: AuthRouteProps) {
  const { isAuthenticated, isInitialised } = useAuth()
  const location = useLocation()

  if (!isInitialised) {
    return (
      <Box sx={{ display: 'grid', minHeight: '100vh', placeItems: 'center' }}>
        <CircularProgress />
      </Box>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to={`/login?return=${encodeURIComponent(location.pathname + location.search)}`} replace />
  }

  return children
}
