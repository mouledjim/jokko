import { createApp } from './app.js'
import { env } from './config/env.js'

const app = createApp()

const server = app.listen(env.PORT, () => {
  console.log(`
🚀 [Jokko Santé Backend] Serveur démarré avec succès !
📍 Environnement : ${env.NODE_ENV}
🌐 Port          : ${env.PORT}
🏥 Healthcheck   : http://localhost:${env.PORT}/api/health
🔗 FHIR R4       : http://localhost:${env.PORT}/api/fhir/Location
  `)
})

// Arrêt gracieux pour conteneurs Docker / Railway
const shutdown = (signal: string) => {
  console.log(`\n🛑 Signal ${signal} reçu. Fermeture gracieuse du serveur...`)
  server.close(() => {
    console.log('✅ Serveur arrêté proprement.')
    process.exit(0)
  })
}

process.on('SIGTERM', () => shutdown('SIGTERM'))
process.on('SIGINT', () => shutdown('SIGINT'))
