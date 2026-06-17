import {
  createContext,
  useContext,
  useMemo,
  useState,
  type PropsWithChildren,
} from 'react'
import CssBaseline from '@mui/material/CssBaseline'
import { StyledEngineProvider, ThemeProvider as MuiThemeProvider, createTheme, responsiveFontSizes } from '@mui/material/styles'

export type ThemeMode = 'light' | 'dark'

type ThemeContextValue = {
  themeMode: ThemeMode
  setThemeMode: (theme: ThemeMode) => void
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined)

function buildTheme(themeMode: ThemeMode) {
  return responsiveFontSizes(
    createTheme({
      palette: {
        mode: themeMode,
        background: {
          default: themeMode === 'light' ? '#f2f4f8' : '#111827',
          paper: themeMode === 'light' ? '#ffffff' : '#1f2937',
        },
        text: {
          primary: themeMode === 'light' ? '#1a263e' : '#f8fafc',
          secondary: themeMode === 'light' ? '#64748b' : '#cbd5e1',
        },
        primary: {
          main: '#0188ac',
        },
        secondary: {
          main: '#619f11',
        },
        warning: {
          main: '#f37360',
        },
        error: {
          main: '#dc143c',
        },
        success: {
          main: '#619f11',
        },
      },
      shape: {
        borderRadius: 12,
      },
      typography: {
        fontFamily: ['Montserrat', 'Segoe UI', 'Tahoma', 'Geneva', 'Verdana', 'sans-serif'].join(','),
      },
      components: {
        MuiPaper: {
          styleOverrides: {
            root: {
              borderRadius: 12,
            },
          },
        },
        MuiButton: {
          defaultProps: {
            variant: 'contained',
          },
          styleOverrides: {
            root: {
              borderRadius: 12,
              textTransform: 'none',
              fontWeight: 700,
            },
          },
        },
        MuiOutlinedInput: {
          styleOverrides: {
            root: {
              borderRadius: 12,
            },
          },
        },
        MuiTextField: {
          defaultProps: {
            fullWidth: true,
            size: 'small',
            margin: 'none',
          },
        },
        MuiAppBar: {
          styleOverrides: {
            root: {
              boxShadow: 'none',
              borderRadius: 0,
            },
          },
        },
        MuiTableRow: {
          styleOverrides: {
            root: {
              '&:nth-of-type(odd)': {
                backgroundColor: themeMode === 'light' ? '#f2f4f8' : '#18212f',
              },
            },
          },
        },
        MuiTableHead: {
          styleOverrides: {
            root: {
              '& tr': {
                backgroundColor: themeMode === 'light' ? '#ffffff !important' : '#1f2937 !important',
              },
            },
          },
        },
      },
    }),
  )
}

export function ThemeProvider({ children }: PropsWithChildren) {
  const [themeMode, setThemeMode] = useState<ThemeMode>('light')
  const theme = useMemo(() => buildTheme(themeMode), [themeMode])

  return (
    <ThemeContext.Provider value={{ themeMode, setThemeMode }}>
      <StyledEngineProvider injectFirst>
        <MuiThemeProvider theme={theme}>
          <CssBaseline />
          {children}
        </MuiThemeProvider>
      </StyledEngineProvider>
    </ThemeContext.Provider>
  )
}

export function useAppTheme() {
  const context = useContext(ThemeContext)

  if (!context) {
    throw new Error('useAppTheme must be used within a ThemeProvider')
  }

  return context
}
