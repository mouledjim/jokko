import { createContext, useCallback, useContext, useRef, useState, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { CheckCircle2, AlertTriangle, Info, X } from 'lucide-react'
import { cn } from '@/lib/cn'

type ToastKind = 'success' | 'error' | 'info'

interface Toast {
  id: number
  kind: ToastKind
  title: string
  description?: string
}

interface ToastContextValue {
  toast: (t: { kind?: ToastKind; title: string; description?: string }) => void
  success: (title: string, description?: string) => void
  error: (title: string, description?: string) => void
  info: (title: string, description?: string) => void
}

const ToastContext = createContext<ToastContextValue | null>(null)

const MAX_TOASTS = 3
const DURATION = 5000

const STYLES: Record<ToastKind, { icon: typeof CheckCircle2; accent: string }> = {
  success: { icon: CheckCircle2, accent: 'text-constante' },
  error: { icon: AlertTriangle, accent: 'text-vital' },
  info: { icon: Info, accent: 'text-bloc-clair' },
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])
  const counter = useRef(0)
  const timers = useRef<Map<number, ReturnType<typeof setTimeout>>>(new Map())

  const dismiss = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
    const timer = timers.current.get(id)
    if (timer) {
      clearTimeout(timer)
      timers.current.delete(id)
    }
  }, [])

  const push = useCallback(
    (t: { kind?: ToastKind; title: string; description?: string }) => {
      const id = ++counter.current
      const toast: Toast = { id, kind: t.kind ?? 'info', title: t.title, description: t.description }
      setToasts((prev) => [...prev.slice(-(MAX_TOASTS - 1)), toast])
      const timer = setTimeout(() => dismiss(id), DURATION)
      timers.current.set(id, timer)
    },
    [dismiss],
  )

  const value: ToastContextValue = {
    toast: push,
    success: (title, description) => push({ kind: 'success', title, description }),
    error: (title, description) => push({ kind: 'error', title, description }),
    info: (title, description) => push({ kind: 'info', title, description }),
  }

  return (
    <ToastContext.Provider value={value}>
      {children}
      {createPortal(
        <div
          className="pointer-events-none fixed right-4 bottom-4 z-[100] flex w-[min(92vw,22rem)] flex-col gap-2"
          aria-live="polite"
          aria-atomic="false"
        >
          <AnimatePresence initial={false}>
            {toasts.map((t) => {
              const { icon: Icon, accent } = STYLES[t.kind]
              return (
                <motion.div
                  key={t.id}
                  layout
                  initial={{ opacity: 0, y: 16, scale: 0.96 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, x: 24, scale: 0.96 }}
                  transition={{ duration: 0.18, ease: 'easeOut' }}
                  className="pointer-events-auto flex items-start gap-3 rounded-[14px] border border-slate-200 bg-white p-3.5 shadow-[var(--shadow-card-hover)] dark:border-garde-bord dark:bg-garde-surface"
                  role="status"
                >
                  <Icon className={cn('mt-0.5 h-5 w-5 shrink-0', accent)} aria-hidden />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                      {t.title}
                    </p>
                    {t.description && (
                      <p className="mt-0.5 text-[13px] leading-snug text-slate-500 dark:text-slate-400">
                        {t.description}
                      </p>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => dismiss(t.id)}
                    className="-m-1 rounded-md p-1 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-white/5"
                    aria-label="Fermer la notification"
                  >
                    <X className="h-4 w-4" aria-hidden />
                  </button>
                </motion.div>
              )
            })}
          </AnimatePresence>
        </div>,
        document.body,
      )}
    </ToastContext.Provider>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast doit être utilisé dans un ToastProvider')
  return ctx
}
