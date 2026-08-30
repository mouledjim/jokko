import { Router } from 'express'
import { generateFhirAvailabilityBundle } from '../services/fhir.service.js'

export const fhirRouter = Router()

/**
 * GET /api/fhir/Location
 * Expose les disponibilités sous forme de Bundle FHIR R4 standard.
 * Paramètres optionnels : ?region=xxxx
 */
fhirRouter.get('/Location', async (req, res, next) => {
  try {
    const regionId = req.query.region as string | undefined
    const bundle = await generateFhirAvailabilityBundle(regionId)

    res.setHeader('Content-Type', 'application/fhir+json; charset=utf-8')
    res.status(200).json(bundle)
  } catch (error) {
    next(error)
  }
})

/**
 * GET /api/fhir/availability
 * Alias simplifié pour l'interopérabilité DPU / DHIS2.
 */
fhirRouter.get('/availability', async (req, res, next) => {
  try {
    const regionId = req.query.region as string | undefined
    const bundle = await generateFhirAvailabilityBundle(regionId)
    res.status(200).json(bundle)
  } catch (error) {
    next(error)
  }
})
