import type { ReactNode } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/shadcn/dialog'
import { cn } from '@/lib/utils'

interface ModalProps {
  open: boolean
  onClose: () => void
  title?: ReactNode
  description?: ReactNode
  children: ReactNode
  footer?: ReactNode
  size?: 'sm' | 'md' | 'lg'
}

const SIZES = { sm: 'sm:max-w-sm', md: 'sm:max-w-lg', lg: 'sm:max-w-2xl' }

/** Adaptateur : conserve l'API maison, rend un Dialog shadcn. */
export function Modal({ open, onClose, title, description, children, footer, size = 'md' }: ModalProps) {
  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) onClose() }}>
      <DialogContent className={cn(SIZES[size])}>
        <DialogHeader>
          {title ? (
            <DialogTitle className="font-display">{title}</DialogTitle>
          ) : (
            <DialogTitle className="sr-only">Boîte de dialogue</DialogTitle>
          )}
          {description && <DialogDescription>{description}</DialogDescription>}
        </DialogHeader>
        {children}
        {footer && <DialogFooter>{footer}</DialogFooter>}
      </DialogContent>
    </Dialog>
  )
}
