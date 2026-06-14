import type { ReactNode } from 'react'
import {
  Table as ShadcnTable,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '@/components/shadcn/table'
import { cn } from '@/lib/utils'

export interface Column<T> {
  key: string
  header: ReactNode
  cell: (row: T) => ReactNode
  className?: string
  hideOnMobile?: boolean
  align?: 'left' | 'right' | 'center'
}

interface TableProps<T> {
  columns: Column<T>[]
  data: T[]
  rowKey: (row: T) => string
  onRowClick?: (row: T) => void
  className?: string
}

const ALIGN = { left: 'text-left', right: 'text-right', center: 'text-center' }

/** Adaptateur : conserve l'API générique, rend une Table shadcn. */
export function Table<T>({ columns, data, rowKey, onRowClick, className }: TableProps<T>) {
  return (
    <ShadcnTable className={className}>
      <TableHeader>
        <TableRow>
          {columns.map((col) => (
            <TableHead
              key={col.key}
              className={cn(
                'text-[12px] font-semibold tracking-wide text-muted-foreground uppercase',
                ALIGN[col.align ?? 'left'],
                col.hideOnMobile && 'hidden md:table-cell',
                col.className,
              )}
            >
              {col.header}
            </TableHead>
          ))}
        </TableRow>
      </TableHeader>
      <TableBody>
        {data.map((row) => (
          <TableRow
            key={rowKey(row)}
            onClick={onRowClick ? () => onRowClick(row) : undefined}
            className={cn(onRowClick && 'cursor-pointer')}
          >
            {columns.map((col) => (
              <TableCell
                key={col.key}
                className={cn(ALIGN[col.align ?? 'left'], col.hideOnMobile && 'hidden md:table-cell', col.className)}
              >
                {col.cell(row)}
              </TableCell>
            ))}
          </TableRow>
        ))}
      </TableBody>
    </ShadcnTable>
  )
}
