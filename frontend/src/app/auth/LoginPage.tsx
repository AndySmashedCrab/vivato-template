import Alert from '@mui/material/Alert'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import { FormEvent, useState } from 'react'
import { Navigate, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'

export function LoginPage() {
  const { isAuthenticated, login } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [messages, setMessages] = useState<string[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const returnUrl = new URLSearchParams(location.search).get('return') ?? '/'

  if (isAuthenticated) {
    return <Navigate to={returnUrl} replace />
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setMessages([])
    setIsSubmitting(true)

    const result = await login(email, password)
    setIsSubmitting(false)

    if (!result.success) {
      setMessages(result.messages)
      return
    }

    navigate(returnUrl, { replace: true })
  }

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'grid',
        placeItems: 'center',
        px: 2,
        background:
          'radial-gradient(circle at 20% 20%, rgba(1, 136, 172, 0.22), transparent 30%), linear-gradient(135deg, #f2f4f8 0%, #e8eef6 100%)',
      }}
    >
      <Card sx={{ width: '100%', maxWidth: 460, boxShadow: '0 24px 70px rgba(26, 38, 62, 0.14)' }}>
        <CardContent sx={{ p: { xs: 3, md: 4 } }}>
          <Stack component="form" spacing={2.5} onSubmit={handleSubmit}>
            <Box>
              <Typography variant="overline" sx={{ color: 'primary.main', fontWeight: 800, letterSpacing: '0.14em' }}>
                Vivato
              </Typography>
              <Typography variant="h4" sx={{ mt: 0.5, fontWeight: 800 }}>
                Sign in
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ mt: 1 }}>
                Access your Vivato workspace.
              </Typography>
            </Box>

            {messages.length > 0 && (
              <Alert severity="error">
                {messages.map((message) => (
                  <Typography key={message} variant="body2">
                    {message}
                  </Typography>
                ))}
              </Alert>
            )}

            <TextField
              label="Email"
              autoComplete="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
            />
            <TextField
              label="Password"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
            />
            <Button type="submit" size="large" disabled={isSubmitting}>
              {isSubmitting ? 'Signing in...' : 'Sign in'}
            </Button>
          </Stack>
        </CardContent>
      </Card>
    </Box>
  )
}
