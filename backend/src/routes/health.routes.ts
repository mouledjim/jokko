import { Router } from 'express'

export const healthRouter = Router()

healthRouter.get('/', (_req, res) => {
  res.status(200).json({
    status: 'healthy',
    service: 'Jokko Santé Railway Backend',
    region: 'Senegal (SN)',
    timestamp: new Date().toISOString(),
    uptimeSeconds: Math.floor(process.uptime()),
    version: '1.0.0',
    platform: 'Railway Cloud',
  })
})
