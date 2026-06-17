import AppBar from '@mui/material/AppBar'
import Avatar from '@mui/material/Avatar'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Container from '@mui/material/Container'
import Divider from '@mui/material/Divider'
import IconButton from '@mui/material/IconButton'
import Menu from '@mui/material/Menu'
import MenuItem from '@mui/material/MenuItem'
import Stack from '@mui/material/Stack'
import Toolbar from '@mui/material/Toolbar'
import Typography from '@mui/material/Typography'
import { useState, type MouseEvent } from 'react'
import { Link, Outlet, useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'

export function AppLayout() {
  const { currentUser, logout } = useAuth()
  const navigate = useNavigate()
  const [menuAnchor, setMenuAnchor] = useState<HTMLElement | null>(null)

  const initials = [currentUser?.firstName, currentUser?.lastName]
    .filter(Boolean)
    .map((name) => name?.[0])
    .join('')
    .toUpperCase()

  const openUserMenu = (event: MouseEvent<HTMLElement>) => {
    setMenuAnchor(event.currentTarget)
  }

  const closeUserMenu = () => {
    setMenuAnchor(null)
  }

  const handleLogout = async () => {
    closeUserMenu()
    await logout()
    navigate('/login', { replace: true })
  }

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background:
          'radial-gradient(circle at top, rgba(1, 136, 172, 0.14), transparent 35%), linear-gradient(180deg, #f6f8fb 0%, #eef2f7 100%)',
      }}
    >
      <AppBar
        position="sticky"
        color="transparent"
        sx={{
          borderBottom: '1px solid',
          borderColor: 'divider',
          backdropFilter: 'blur(18px)',
          backgroundColor: 'rgba(255,255,255,0.82)',
        }}
      >
        <Container maxWidth="xl">
          <Toolbar disableGutters sx={{ minHeight: 88, gap: 2 }}>
            <Box sx={{ flexGrow: 1 }}>
              <Typography
                variant="overline"
                sx={{ color: 'primary.main', fontWeight: 800, letterSpacing: '0.14em' }}
              >
                Vivato
              </Typography>
              <Typography variant="h4" sx={{ color: 'text.primary', fontWeight: 700 }}>
                React + ASP.NET Core platform foundation
              </Typography>
            </Box>

            <Stack direction="row" spacing={1.5} alignItems="center">
              <Button component={Link} to="/" color="inherit" variant="text">
                Home
              </Button>
              <IconButton
                aria-label="Open user menu"
                aria-controls={menuAnchor ? 'user-menu' : undefined}
                aria-haspopup="true"
                aria-expanded={menuAnchor ? 'true' : undefined}
                onClick={openUserMenu}
                sx={{ p: 0 }}
              >
                <Avatar sx={{ bgcolor: 'primary.main', color: 'primary.contrastText', fontWeight: 800 }}>
                  {initials || 'V'}
                </Avatar>
              </IconButton>
            </Stack>
          </Toolbar>
        </Container>
      </AppBar>

      <Menu
        id="user-menu"
        anchorEl={menuAnchor}
        open={Boolean(menuAnchor)}
        onClose={closeUserMenu}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Box sx={{ minWidth: 240, px: 2, py: 1.25 }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>
            {currentUser?.fullName || currentUser?.email}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {currentUser?.email}
          </Typography>
        </Box>
        <Divider />
        <MenuItem
          onClick={() => {
            closeUserMenu()
            navigate('/account')
          }}
        >
          Account settings
        </MenuItem>
        <MenuItem onClick={handleLogout}>Sign out</MenuItem>
      </Menu>

      <Container maxWidth="lg" sx={{ py: { xs: 3, md: 4 } }}>
        <Outlet />
      </Container>
    </Box>
  )
}
