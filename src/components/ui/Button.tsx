import { forwardRef, type ButtonHTMLAttributes } from 'react'
import { cn } from '@/lib/cn'
import { Spinner } from './Spinner'

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'subtle'
type Size = 'sm' | 'md' | 'lg'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
  size?: Size
  loading?: boolean
  /** Bouton qui occupe toute la largeur. */
  block?: boolean
}

const VARIANTS: Record<Variant, string> = {
  primary:
    'bg-bloc text-white hover:bg-bloc-fonce active:bg-bloc-fonce shadow-sm disabled:bg-bloc/60',
  secondary:
    'border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 active:bg-slate-100 dark:border-garde-bord dark:bg-garde-surface dark:text-slate-200 dark:hover:bg-white/5',
  ghost:
    'text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-white/5 dark:hover:text-white',
  danger: 'bg-vital text-white hover:bg-red-700 active:bg-red-800 shadow-sm disabled:bg-vital/60',
  subtle:
    'bg-bloc/10 text-bloc hover:bg-bloc/15 dark:bg-bloc-clair/15 dark:text-bloc-clair dark:hover:bg-bloc-clair/25',
}

const SIZES: Record<Size, string> = {
  sm: 'h-9 px-3 text-[13px] gap-1.5 rounded-lg',
  md: 'h-10 px-4 text-sm gap-2 rounded-xl',
  lg: 'h-12 px-6 text-[15px] gap-2 rounded-xl',
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variant = 'primary', size = 'md', loading = false, block = false, className, children, disabled, ...props },
  ref,
) {
  return (
    <button
      ref={ref}
      disabled={disabled || loading}
      className={cn(
        'inline-flex items-center justify-center font-semibold whitespace-nowrap transition select-none',
        'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-bloc-clair',
        'disabled:cursor-not-allowed disabled:opacity-70',
        VARIANTS[variant],
        SIZES[size],
        block && 'w-full',
        className,
      )}
      {...props}
    >
      {loading && <Spinner className={size === 'sm' ? 'h-3.5 w-3.5' : 'h-4 w-4'} />}
      {children}
    </button>
  )
})
