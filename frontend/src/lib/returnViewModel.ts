export type ReturnViewModel<T = unknown> = {
  success: boolean
  messages: string[]
  value?: T
}
