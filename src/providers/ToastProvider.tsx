import { createContext, useContext, type ReactNode } from 'react'
import { toast as sonnerToast } from 'sonner'
import { Toaster } from '@/components/shadcn/sonner'

type ToastKind = 'success' | 'error' | 'info'

interface ToastContextValue {
  toast: (t: { kind?: ToastKind; title: string; description?: string }) => void
  success: (title: string, description?: string) => void
  error: (title: string, description?: string) => void
  info: (title: string, description?: string) => void
}

const value: ToastContextValue = {
  toast: ({ kind = 'info', title, description }) => {
    if (kind === 'success') sonnerToast.success(title, { description })
    else if (kind === 'error') sonnerToast.error(title, { description })
    else sonnerToast(title, { description })
  },
  success: (title, description) => sonnerToast.success(title, { description }),
  error: (title, description) => sonnerToast.error(title, { description }),
  info: (title, description) => sonnerToast(title, { description }),
}

const ToastContext = createContext<ToastContextValue>(value)

/** Conserve l'API maison ; les toasts sont rendus par Sonner (shadcn). */
export function ToastProvider({ children }: { children: ReactNode }) {
  return (
    <ToastContext.Provider value={value}>
      {children}
      <Toaster richColors closeButton />
    </ToastContext.Provider>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export function useToast(): ToastContextValue {
  return useContext(ToastContext)
}
