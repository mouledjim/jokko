import { Router } from 'express'

export const bloodRouter = Router()

// Endpoints dédiés au module de gestion du sang / CNTS
bloodRouter.get('/alerts', (_req, res) => {
  res.status(200).json({
    success: true,
    message: 'Flux public des alertes sang CNTS en direct',
    timestamp: new Date().toISOString(),
  })
})
