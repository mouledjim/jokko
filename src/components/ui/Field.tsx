import { forwardRef, useId, type InputHTMLAttributes, type SelectHTMLAttributes, type TextareaHTMLAttributes, type ReactNode } from 'react'
import { cn } from '@/lib/cn'

const baseControl =
  'w-full rounded-xl border bg-white px-3.5 text-sm text-slate-900 transition placeholder:text-slate-400 ' +
  'focus:border-bloc-clair focus:outline-none focus:ring-2 focus:ring-bloc-clair/30 ' +
  'disabled:cursor-not-allowed disabled:bg-slate-50 ' +
  'dark:bg-garde border-slate-200 dark:border-garde-bord dark:text-slate-100 dark:placeholder:text-slate-500'

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
    <div>
      {label && (
        <label htmlFor={htmlFor} className="mb-1.5 block text-[13px] font-medium text-slate-700 dark:text-slate-300">
          {label}
          {required && <span className="ml-0.5 text-vital">*</span>}
        </label>
      )}
      {children}
      {error ? (
        <p className="mt-1.5 text-[13px] font-medium text-vital">{error}</p>
      ) : hint ? (
        <p className="mt-1.5 text-[13px] text-slate-400 dark:text-slate-500">{hint}</p>
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
      <input
        ref={ref}
        id={fieldId}
        aria-invalid={!!error}
        className={cn(baseControl, 'h-10', error && 'border-vital focus:border-vital focus:ring-vital/30', className)}
        {...props}
      />
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
      <textarea
        ref={ref}
        id={fieldId}
        aria-invalid={!!error}
        className={cn(baseControl, 'min-h-[84px] py-2.5 leading-relaxed', error && 'border-vital focus:border-vital focus:ring-vital/30', className)}
        {...props}
      />
    </FieldWrapper>
  )
})

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string
  error?: string
  hint?: ReactNode
}

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
        className={cn(baseControl, 'h-10 cursor-pointer pr-9', error && 'border-vital focus:border-vital focus:ring-vital/30', className)}
        {...props}
      >
        {children}
      </select>
    </FieldWrapper>
  )
})
