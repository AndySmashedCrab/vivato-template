import Chip from '@mui/material/Chip'
import Paper from '@mui/material/Paper'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { useRoutes, type RouteObject } from 'react-router-dom'
import { AccountPage } from '../auth/AccountPage'
import { AuthRoute } from '../auth/AuthRoute'
import { LoginPage } from '../auth/LoginPage'
import { AppLayout } from '../layout/AppLayout'
import { getModuleRoutes } from './moduleRoutes'

function HomePage() {
  return (
    <Paper
      elevation={0}
      sx={{
        p: { xs: 3, md: 4 },
        border: '1px solid',
        borderColor: 'divider',
        background: 'linear-gradient(180deg, rgba(255,255,255,0.95) 0%, rgba(246,249,252,0.98) 100%)',
        boxShadow: '0 18px 45px rgba(15, 23, 42, 0.08)',
      }}
    >
      <Stack spacing={2.5}>
        <Chip
          label="Platform ready"
          color="primary"
          sx={{ alignSelf: 'flex-start', fontWeight: 700 }}
        />
        <Typography variant="h4" sx={{ maxWidth: '14ch', fontWeight: 700 }}>
          Template shell is ready for real project work
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 720 }}>
          Use the backend host, JWT cookie authentication, frontend app shell, and explicit module
          registration points as the starting point for rebuilding the donor project feature by
          feature.
        </Typography>
      </Stack>
    </Paper>
  )
}

const protectedRoutes: RouteObject[] = [
  {
    index: true,
    element: <HomePage />,
  },
  {
    path: 'account',
    element: <AccountPage />,
  },
  ...getModuleRoutes(),
]

const routes: RouteObject[] = [
  {
    path: '/login',
    element: <LoginPage />,
  },
  {
    path: '/',
    element: (
      <AuthRoute>
        <AppLayout />
      </AuthRoute>
    ),
    children: protectedRoutes,
  },
]

export function RouteContainer() {
  return useRoutes(routes)
}
