import {
  createContext,
  useContext,
  type PropsWithChildren,
} from 'react'

type ApiContextValue = {
  baseUrl: string
}

const ApiContext = createContext<ApiContextValue | undefined>(undefined)

export function ApiProvider({ children }: PropsWithChildren) {
  const value: ApiContextValue = {
    baseUrl: import.meta.env.VITE_API_BASE_URL ?? 'https://localhost:5001',
  }

  return <ApiContext.Provider value={value}>{children}</ApiContext.Provider>
}

export function useApi() {
  const context = useContext(ApiContext)

  if (!context) {
    throw new Error('useApi must be used within an ApiProvider')
  }

  return context
}
