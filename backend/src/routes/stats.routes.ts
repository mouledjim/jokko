import { Router } from 'express'
import { supabaseAdmin } from '../services/supabase.service.js'

export const statsRouter = Router()

/**
 * GET /api/stats/overview
 * Synthèse globale nationale et régionale en temps réel.
 */
statsRouter.get('/overview', async (_req, res, next) => {
  try {
    const [facilitiesRes, transfersRes, bedsRes] = await Promise.all([
      supabaseAdmin.from('facilities').select('id, region_id, is_active', { count: 'exact' }),
      supabaseAdmin.from('transfer_requests').select('id, status, severity, created_at'),
      supabaseAdmin.from('beds').select('id, status'),
    ])

    const totalFacilities = facilitiesRes.count || 0
    const transfers = transfersRes.data || []
    const beds = bedsRes.data || []

    const freeBeds = beds.filter((b) => b.status === 'libre').length
    const occupiedBeds = beds.filter((b) => b.status === 'occupe').length
    const totalBeds = beds.length
    const occupancyRate = totalBeds > 0 ? Math.round((occupiedBeds / totalBeds) * 100) : 0

    const transfersCount = transfers.length
    const pendingTransfers = transfers.filter((t) => t.status === 'en_attente').length
    const criticalTransfers = transfers.filter((t) => t.severity === 'critique').length

    res.status(200).json({
      success: true,
      data: {
        timestamp: new Date().toISOString(),
        facilities: {
          total: totalFacilities,
        },
        beds: {
          total: totalBeds,
          free: freeBeds,
          occupied: occupiedBeds,
          occupancy_rate_percent: occupancyRate,
        },
        transfers: {
          total: transfersCount,
          pending: pendingTransfers,
          critical: criticalTransfers,
        },
      },
    })
  } catch (error) {
    next(error)
  }
})
