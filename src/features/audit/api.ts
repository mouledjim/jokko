import { useQuery, keepPreviousData } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import type { AuditLog } from '@/types/db'

export interface AuditLogWithActor extends AuditLog {
  actor: { first_name: string; last_name: string } | null
}

export interface AuditQuery {
  entityType?: string
  page: number
  pageSize: number
}

export function useAuditLogs(query: AuditQuery) {
  const { entityType, page, pageSize } = query
  return useQuery({
    queryKey: ['audit', entityType ?? 'all', page, pageSize],
    placeholderData: keepPreviousData,
    queryFn: async (): Promise<{ rows: AuditLogWithActor[]; total: number }> => {
      let q = supabase
        .from('audit_logs')
        .select('*, actor:profiles(first_name, last_name)', { count: 'exact' })
        .order('created_at', { ascending: false })
        .range(page * pageSize, page * pageSize + pageSize - 1)
      if (entityType) q = q.eq('entity_type', entityType)
      const { data, error, count } = await q
      if (error) throw error
      return { rows: (data ?? []) as unknown as AuditLogWithActor[], total: count ?? 0 }
    },
  })
}
