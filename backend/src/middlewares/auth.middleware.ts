import type { Request, Response, NextFunction } from 'express'
import { supabaseAdmin } from '../services/supabase.service.js'

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string
    email?: string
    role?: string
  }
}

export async function requireAuth(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  const authHeader = req.headers.authorization

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({
      success: false,
      error: { message: 'Jeton d\'authentification manquant ou invalide.' },
    })
    return
  }

  const token = authHeader.split(' ')[1]

  try {
    const { data, error } = await supabaseAdmin.auth.getUser(token)

    if (error || !data.user) {
      res.status(401).json({
        success: false,
        error: { message: 'Session expirée ou non autorisée.' },
      })
      return
    }

    req.user = {
      id: data.user.id,
      email: data.user.email,
    }

    next()
  } catch (err) {
    next(err)
  }
}
