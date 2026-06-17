import Alert from '@mui/material/Alert'
import Button from '@mui/material/Button'
import Grid from '@mui/material/Grid'
import Paper from '@mui/material/Paper'
import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import { FormEvent, useEffect, useState } from 'react'
import { useApi } from '../../contexts/ApiContext'
import { useAuth } from '../../contexts/AuthContext'

type AuthenticationConfig = {
  useEmailAsUserName: boolean
  requiresUserName: boolean
  requireUniqueEmail: boolean
  password: {
    requiredLength: number
    requiredUniqueChars: number
    requireDigit: boolean
    requireLowercase: boolean
    requireUppercase: boolean
    requireNonAlphanumeric: boolean
  }
}

export function AccountPage() {
  const { currentUser, reloadCurrentUser } = useAuth()
  const { get, postResult } = useApi()
  const [firstName, setFirstName] = useState(currentUser?.firstName ?? '')
  const [lastName, setLastName] = useState(currentUser?.lastName ?? '')
  const [email, setEmail] = useState(currentUser?.email ?? '')
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [config, setConfig] = useState<AuthenticationConfig | null>(null)
  const [profileMessages, setProfileMessages] = useState<string[]>([])
  const [passwordMessages, setPasswordMessages] = useState<string[]>([])

  useEffect(() => {
    setFirstName(currentUser?.firstName ?? '')
    setLastName(currentUser?.lastName ?? '')
    setEmail(currentUser?.email ?? '')
  }, [currentUser])

  useEffect(() => {
    void get<AuthenticationConfig>('Auth', 'GetAuthenticationConfig', {
      suppressErrorToasts: true,
    }).then(setConfig)
  }, [get])

  const handleProfileSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setProfileMessages([])

    const nameResult = await postResult('Auth', 'ChangeName', { firstName, lastName }, { suppressErrorToasts: true })
    if (!nameResult.success) {
      setProfileMessages(nameResult.messages)
      return
    }

    if (email !== currentUser?.email) {
      const emailResult = await postResult('Auth', 'ChangeEmail', { email }, { suppressErrorToasts: true })
      if (!emailResult.success) {
        setProfileMessages(emailResult.messages)
        return
      }
    }

    await reloadCurrentUser()
    setProfileMessages(['Profile updated.'])
  }

  const handlePasswordSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setPasswordMessages([])

    const result = await postResult(
      'Auth',
      'ChangePassword',
      { currentPassword, newPassword },
      { suppressErrorToasts: true },
    )

    if (!result.success) {
      setPasswordMessages(result.messages)
      return
    }

    setCurrentPassword('')
    setNewPassword('')
    setPasswordMessages(['Password updated.'])
  }

  return (
    <Grid container spacing={3}>
      <Grid size={{ xs: 12, md: 6 }}>
        <Paper sx={{ p: 3 }}>
          <Stack component="form" spacing={2} onSubmit={handleProfileSubmit}>
            <Typography variant="h5" sx={{ fontWeight: 800 }}>
              Profile
            </Typography>
            {profileMessages.length > 0 && (
              <Alert severity={profileMessages.includes('Profile updated.') ? 'success' : 'error'}>
                {profileMessages.join(' ')}
              </Alert>
            )}
            <TextField label="First name" value={firstName} onChange={(event) => setFirstName(event.target.value)} required />
            <TextField label="Last name" value={lastName} onChange={(event) => setLastName(event.target.value)} required />
            <TextField label="Email" value={email} onChange={(event) => setEmail(event.target.value)} required />
            {config?.useEmailAsUserName && (
              <Alert severity="info">Your email address is also used as your username.</Alert>
            )}
            <Button type="submit">Save profile</Button>
          </Stack>
        </Paper>
      </Grid>

      <Grid size={{ xs: 12, md: 6 }}>
        <Paper sx={{ p: 3 }}>
          <Stack component="form" spacing={2} onSubmit={handlePasswordSubmit}>
            <Typography variant="h5" sx={{ fontWeight: 800 }}>
              Password
            </Typography>
            {passwordMessages.length > 0 && (
              <Alert severity={passwordMessages.includes('Password updated.') ? 'success' : 'error'}>
                {passwordMessages.join(' ')}
              </Alert>
            )}
            <TextField
              label="Current password"
              type="password"
              value={currentPassword}
              onChange={(event) => setCurrentPassword(event.target.value)}
              required
            />
            <TextField
              label="New password"
              type="password"
              value={newPassword}
              onChange={(event) => setNewPassword(event.target.value)}
              helperText={
                config
                  ? [
                      `Minimum ${config.password.requiredLength} characters`,
                      `minimum ${config.password.requiredUniqueChars} unique characters`,
                      config.password.requireUppercase && 'uppercase letter',
                      config.password.requireLowercase && 'lowercase letter',
                      config.password.requireDigit && 'number',
                      config.password.requireNonAlphanumeric && 'symbol',
                    ]
                      .filter(Boolean)
                      .join(', ') + '.'
                  : undefined
              }
              required
            />
            <Button type="submit">Change password</Button>
          </Stack>
        </Paper>
      </Grid>
    </Grid>
  )
}
