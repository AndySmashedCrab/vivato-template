import {
  createContext,
  useContext,
  useState,
  type PropsWithChildren,
} from 'react'

export type Toast = {
  id: string
  message: string
  level: 'info' | 'success' | 'warning' | 'error'
}

type AddToastInput = Omit<Toast, 'id'>

type ToastContextValue = {
  toasts: Toast[]
  addToast: (toast: AddToastInput) => void
  removeToast: (id: string) => void
}

const ToastContext = createContext<ToastContextValue | undefined>(undefined)

export function ToastProvider({ children }: PropsWithChildren) {
  const [toasts, setToasts] = useState<Toast[]>([])

  const value: ToastContextValue = {
    toasts,
    addToast: (toast) =>
      setToasts((current) => [...current, { ...toast, id: crypto.randomUUID() }]),
    removeToast: (id) =>
      setToasts((current) => current.filter((toast) => toast.id !== id)),
  }

  return <ToastContext.Provider value={value}>{children}</ToastContext.Provider>
}

export function useToasts() {
  const context = useContext(ToastContext)

  if (!context) {
    throw new Error('useToasts must be used within a ToastProvider')
  }

  return context
}
