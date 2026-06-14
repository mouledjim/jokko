import type { ButtonHTMLAttributes } from 'react'
import { Button as ShadcnButton } from '@/components/shadcn/button'
import { cn } from '@/lib/utils'
import { Spinner } from './Spinner'

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'subtle'
type Size = 'sm' | 'md' | 'lg'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
  size?: Size
  loading?: boolean
  block?: boolean
}

/** Adaptateur : conserve l'API maison, rend un Button shadcn (tokens médicaux). */
const SHADCN_VARIANT = {
  primary: 'default',
  secondary: 'outline',
  ghost: 'ghost',
  danger: 'destructive',
  subtle: 'ghost',
} as const

const SIZE: Record<Size, string> = {
  sm: 'h-9 px-3 text-[13px] gap-1.5',
  md: 'h-10 px-4 text-sm gap-2',
  lg: 'h-11 px-6 text-[15px] gap-2',
}

const EXTRA: Partial<Record<Variant, string>> = {
  // Danger solide (les actions destructives doivent être visibles).
  danger: 'bg-destructive text-white hover:bg-destructive/90 dark:bg-destructive dark:hover:bg-destructive/90',
  // Teinte primaire douce.
  subtle: 'bg-primary/10 text-primary hover:bg-primary/15 dark:bg-primary/15 dark:hover:bg-primary/25',
}

export function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  block = false,
  className,
  children,
  disabled,
  ...props
}: ButtonProps) {
  return (
    <ShadcnButton
      variant={SHADCN_VARIANT[variant]}
      disabled={disabled || loading}
      className={cn('rounded-xl', SIZE[size], EXTRA[variant], block && 'w-full', className)}
      {...props}
    >
      {loading && <Spinner className={size === 'sm' ? 'h-3.5 w-3.5' : 'h-4 w-4'} />}
      {children}
    </ShadcnButton>
  )
}
