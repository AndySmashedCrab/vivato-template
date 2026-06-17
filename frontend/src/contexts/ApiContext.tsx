import {
  createContext,
  useContext,
  useMemo,
  useRef,
  useState,
  type PropsWithChildren,
} from 'react'
import { useSnackbar } from 'notistack'
import type { ReturnViewModel } from '../lib/returnViewModel'

type ApiRequestOptions = {
  signal?: AbortSignal
  suppressErrorToasts?: boolean
  retryOnUnauthorized?: boolean
}

type ApiContextValue = {
  baseUrl: string
  loading: boolean
  getResult: <T>(controller: string, action: string, options?: ApiRequestOptions) => Promise<ReturnViewModel<T>>
  postResult: <TResponse, TBody = unknown>(
    controller: string,
    action: string,
    body?: TBody,
    options?: ApiRequestOptions,
  ) => Promise<ReturnViewModel<TResponse>>
  get: <T>(controller: string, action: string, options?: ApiRequestOptions) => Promise<T | null>
  post: <TResponse, TBody = unknown>(
    controller: string,
    action: string,
    body?: TBody,
    options?: ApiRequestOptions,
  ) => Promise<TResponse | null>
}

const ApiContext = createContext<ApiContextValue | undefined>(undefined)

export function ApiProvider({ children }: PropsWithChildren) {
  const { enqueueSnackbar } = useSnackbar()
  const [pendingRequestCount, setPendingRequestCount] = useState(0)
  const refreshPromiseRef = useRef<Promise<boolean> | null>(null)
  const baseUrl = import.meta.env.VITE_API_BASE_URL?.trim() ?? ''

  const value = useMemo<ApiContextValue>(() => {
    const buildUrl = (controller: string, action: string) => {
      const trimmedBaseUrl = baseUrl.replace(/\/$/, '')
      const apiPath = `/api/${controller}/${action}`.replace(/\/{2,}/g, '/')

      return trimmedBaseUrl ? `${trimmedBaseUrl}${apiPath}` : apiPath
    }

    const showMessages = (messages: string[], suppressErrorToasts?: boolean) => {
      if (suppressErrorToasts) {
        return
      }

      messages.forEach((message) =>
        enqueueSnackbar(message, {
          variant: 'error',
          anchorOrigin: { vertical: 'top', horizontal: 'right' },
        }),
      )
    }

    const parseJson = async <T,>(response: Response): Promise<ReturnViewModel<T> | null> => {
      const contentType = response.headers.get('content-type') ?? ''
      if (!contentType.includes('application/json')) {
        return null
      }

      return (await response.json()) as ReturnViewModel<T>
    }

    const refreshAuth = async () => {
      if (refreshPromiseRef.current) {
        return refreshPromiseRef.current
      }

      refreshPromiseRef.current = (async () => {
        try {
          const response = await fetch(buildUrl('Auth', 'Refresh'), {
            method: 'POST',
            credentials: 'include',
          })

          if (!response.ok) {
            return false
          }

          const result = await parseJson<unknown>(response)
          return result?.success ?? false
        } catch {
          return false
        } finally {
          refreshPromiseRef.current = null
        }
      })()

      return refreshPromiseRef.current
    }

    const failureResult = <TResponse,>(messages: string[]): ReturnViewModel<TResponse> => ({
      success: false,
      messages,
    })

    const requestResult = async <TResponse, TBody = unknown>(
      method: 'GET' | 'POST',
      controller: string,
      action: string,
      body?: TBody,
      options?: ApiRequestOptions,
      hasRetried?: boolean,
    ): Promise<ReturnViewModel<TResponse>> => {
      setPendingRequestCount((current) => current + 1)

      try {
        const response = await fetch(buildUrl(controller, action), {
          method,
          credentials: 'include',
          headers:
            method === 'POST'
              ? {
                  'Content-Type': 'application/json',
                }
              : undefined,
          body: method === 'POST' && body !== undefined ? JSON.stringify(body) : undefined,
          signal: options?.signal,
        })

        if (response.status === 401 && options?.retryOnUnauthorized !== false && !hasRetried) {
          const refreshed = await refreshAuth()
          if (refreshed) {
            return requestResult(method, controller, action, body, options, true)
          }

          return failureResult(['Your session has expired. Please sign in again.'])
        }

        if (response.status === 204) {
          return { success: true, messages: [] }
        }

        const result = await parseJson<TResponse>(response)
        if (!result) {
          const messages = ['The server returned an unexpected response.']
          if (!response.ok && !options?.suppressErrorToasts) {
            enqueueSnackbar(messages[0], {
              variant: 'error',
              anchorOrigin: { vertical: 'top', horizontal: 'right' },
            })
          }

          return failureResult(messages)
        }

        if (!result.success) {
          showMessages(result.messages, options?.suppressErrorToasts)
        }

        return result
      } catch (error) {
        if (error instanceof DOMException && error.name === 'AbortError') {
          return failureResult(['The request was cancelled.'])
        }

        const messages = ['Something went wrong while calling the API.']
        if (!options?.suppressErrorToasts) {
          enqueueSnackbar(messages[0], {
            variant: 'error',
            anchorOrigin: { vertical: 'top', horizontal: 'right' },
          })
        }

        return failureResult(messages)
      } finally {
        setPendingRequestCount((current) => Math.max(0, current - 1))
      }
    }

    const request = async <TResponse, TBody = unknown>(
      method: 'GET' | 'POST',
      controller: string,
      action: string,
      body?: TBody,
      options?: ApiRequestOptions,
    ): Promise<TResponse | null> => {
      const result = await requestResult<TResponse, TBody>(method, controller, action, body, options)
      return result.success ? result.value ?? null : null
    }

    return {
      baseUrl,
      loading: pendingRequestCount > 0,
      getResult: <T,>(controller: string, action: string, options?: ApiRequestOptions) =>
        requestResult<T>('GET', controller, action, undefined, options),
      postResult: <TResponse, TBody = unknown>(
        controller: string,
        action: string,
        body?: TBody,
        options?: ApiRequestOptions,
      ) => requestResult<TResponse, TBody>('POST', controller, action, body, options),
      get: <T,>(controller: string, action: string, options?: ApiRequestOptions) =>
        request<T>('GET', controller, action, undefined, options),
      post: <TResponse, TBody = unknown>(
        controller: string,
        action: string,
        body?: TBody,
        options?: ApiRequestOptions,
      ) => request<TResponse, TBody>('POST', controller, action, body, options),
    }
  }, [baseUrl, enqueueSnackbar, pendingRequestCount])

  return <ApiContext.Provider value={value}>{children}</ApiContext.Provider>
}

export function useApi() {
  const context = useContext(ApiContext)

  if (!context) {
    throw new Error('useApi must be used within an ApiProvider')
  }

  return context
}
