import { forwardRef, useId, type InputHTMLAttributes, type SelectHTMLAttributes, type TextareaHTMLAttributes, type ReactNode } from 'react'
import { Input as ShadcnInput } from '@/components/shadcn/input'
import { Textarea as ShadcnTextarea } from '@/components/shadcn/textarea'
import { Label } from '@/components/shadcn/label'
import { cn } from '@/lib/utils'

function FieldWrapper({
  label,
  htmlFor,
  error,
  hint,
  required,
  children,
}: {
  label?: string
  htmlFor?: string
  error?: string
  hint?: ReactNode
  required?: boolean
  children: ReactNode
}) {
  return (
    <div className="grid gap-1.5">
      {label && (
        <Label htmlFor={htmlFor}>
          {label}
          {required && <span className="ml-0.5 text-destructive">*</span>}
        </Label>
      )}
      {children}
      {error ? (
        <p className="text-[13px] font-medium text-destructive">{error}</p>
      ) : hint ? (
        <p className="text-[13px] text-muted-foreground">{hint}</p>
      ) : null}
    </div>
  )
}

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  hint?: ReactNode
}
export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { label, error, hint, required, className, id, ...props },
  ref,
) {
  const autoId = useId()
  const fieldId = id ?? autoId
  return (
    <FieldWrapper label={label} htmlFor={fieldId} error={error} hint={hint} required={required}>
      <ShadcnInput ref={ref} id={fieldId} aria-invalid={!!error} className={cn('h-10', className)} {...props} />
    </FieldWrapper>
  )
})

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string
  error?: string
  hint?: ReactNode
}
export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(function Textarea(
  { label, error, hint, required, className, id, ...props },
  ref,
) {
  const autoId = useId()
  const fieldId = id ?? autoId
  return (
    <FieldWrapper label={label} htmlFor={fieldId} error={error} hint={hint} required={required}>
      <ShadcnTextarea ref={ref} id={fieldId} aria-invalid={!!error} className={cn('min-h-[84px]', className)} {...props} />
    </FieldWrapper>
  )
})

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string
  error?: string
  hint?: ReactNode
}
// Select natif (conserve l'API <option>), stylé comme les champs shadcn.
export const Select = forwardRef<HTMLSelectElement, SelectProps>(function Select(
  { label, error, hint, required, className, id, children, ...props },
  ref,
) {
  const autoId = useId()
  const fieldId = id ?? autoId
  return (
    <FieldWrapper label={label} htmlFor={fieldId} error={error} hint={hint} required={required}>
      <select
        ref={ref}
        id={fieldId}
        aria-invalid={!!error}
        className={cn(
          'h-10 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs transition-[color,box-shadow] outline-none',
          'focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50',
          'aria-invalid:border-destructive aria-invalid:ring-destructive/20',
          'disabled:cursor-not-allowed disabled:opacity-50 dark:bg-input/30',
          className,
        )}
        {...props}
      >
        {children}
      </select>
    </FieldWrapper>
  )
})
