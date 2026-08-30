import express, { type Application } from 'express'
import cors from 'cors'
import helmet from 'helmet'
import compression from 'compression'
import morgan from 'morgan'
import { env } from './config/env.js'
import { healthRouter } from './routes/health.routes.js'
import { fhirRouter } from './routes/fhir.routes.js'
import { usersRouter } from './routes/users.routes.js'
import { statsRouter } from './routes/stats.routes.js'
import { bloodRouter } from './routes/blood.routes.js'
import { errorHandler } from './middlewares/error.middleware.js'

export function createApp(): Application {
  const app = express()

  // Middlewares de sécurité et de performance
  app.use(helmet())
  app.use(
    cors({
      origin: env.CORS_ORIGIN === '*' ? true : env.CORS_ORIGIN.split(','),
      credentials: true,
    })
  )
  app.use(compression())
  app.use(express.json({ limit: '5mb' }))
  app.use(express.urlencoded({ extended: true, limit: '5mb' }))

  if (env.NODE_ENV !== 'test') {
    app.use(morgan(env.NODE_ENV === 'production' ? 'combined' : 'dev'))
  }

  // Racine informative
  app.get('/', (_req, res) => {
    res.json({
      message: 'Jokko Santé API — Système National de Coordination des Lits & Don de Sang (Sénégal)',
      documentation: '/api/health',
      fhirEndpoint: '/api/fhir/Location',
      version: '1.0.0',
    })
  })

  // Montage des routes API
  app.use('/api/health', healthRouter)
  app.use('/api/fhir', fhirRouter)
  app.use('/api/users', usersRouter)
  app.use('/api/stats', statsRouter)
  app.use('/api/blood', bloodRouter)

  // Gestion des routes inexistantes (404)
  app.use((_req, res) => {
    res.status(404).json({
      success: false,
      error: { message: 'Route introuvable sur le serveur Jokko Santé.' },
    })
  })

  // Middleware global d'erreur
  app.use(errorHandler)

  return app
}
