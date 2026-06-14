import type { ReactNode } from 'react'
import { cn } from '@/lib/cn'

export interface Column<T> {
  key: string
  header: ReactNode
  /** Rendu d'une cellule. */
  cell: (row: T) => ReactNode
  className?: string
  /** Cache la colonne sous le point de rupture md (mobile). */
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

export function Table<T>({ columns, data, rowKey, onRowClick, className }: TableProps<T>) {
  return (
    <div className={cn('overflow-x-auto', className)}>
      <table className="w-full border-collapse text-sm">
        <thead>
          <tr className="border-b border-slate-200 dark:border-garde-bord">
            {columns.map((col) => (
              <th
                key={col.key}
                className={cn(
                  'px-3 py-2.5 text-[12px] font-semibold tracking-wide text-slate-500 uppercase dark:text-slate-400',
                  ALIGN[col.align ?? 'left'],
                  col.hideOnMobile && 'hidden md:table-cell',
                  col.className,
                )}
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row) => (
            <tr
              key={rowKey(row)}
              onClick={onRowClick ? () => onRowClick(row) : undefined}
              className={cn(
                'border-b border-slate-100 transition last:border-0 dark:border-garde-bord/60',
                onRowClick && 'cursor-pointer hover:bg-slate-50 dark:hover:bg-white/[0.03]',
              )}
            >
              {columns.map((col) => (
                <td
                  key={col.key}
                  className={cn(
                    'px-3 py-3 text-slate-700 dark:text-slate-200',
                    ALIGN[col.align ?? 'left'],
                    col.hideOnMobile && 'hidden md:table-cell',
                    col.className,
                  )}
                >
                  {col.cell(row)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
