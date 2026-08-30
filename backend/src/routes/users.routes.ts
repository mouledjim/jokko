import { Router } from 'express'
import { z } from 'zod'
import { supabaseAdmin } from '../services/supabase.service.js'
import { requireAuth, type AuthenticatedRequest } from '../middlewares/auth.middleware.js'

export const usersRouter = Router()

const createUserSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  first_name: z.string().min(1),
  last_name: z.string().min(1),
  role: z.enum(['super_admin', 'admin_regional', 'admin_hopital', 'medecin']),
  facility_id: z.string().uuid().nullable().optional(),
  region_id: z.string().uuid().nullable().optional(),
  specialty_id: z.string().uuid().nullable().optional(),
  phone: z.string().default(''),
})

/**
 * POST /api/users/create
 * Création sécurisée d'un utilisateur par un administrateur avec Supabase service_role.
 */
usersRouter.post('/create', requireAuth, async (req: AuthenticatedRequest, res, next) => {
  try {
    const parseResult = createUserSchema.safeParse(req.body)
    if (!parseResult.success) {
      res.status(400).json({
        success: false,
        error: { message: 'Données invalides', details: parseResult.error.format() },
      })
      return
    }

    const payload = parseResult.data

    // 1. Création du compte dans Supabase Auth
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email: payload.email,
      password: payload.password,
      email_confirm: true,
      user_metadata: {
        first_name: payload.first_name,
        last_name: payload.last_name,
        role: payload.role,
      },
    })

    if (authError || !authData.user) {
      res.status(400).json({
        success: false,
        error: { message: authError?.message || 'Échec de la création du compte Auth' },
      })
      return
    }

    // 2. Création ou mise à jour du profil métier dans la table 'profiles'
    const { data: profileData, error: profileError } = await supabaseAdmin
      .from('profiles')
      .insert({
        auth_id: authData.user.id,
        first_name: payload.first_name,
        last_name: payload.last_name,
        role: payload.role,
        facility_id: payload.facility_id || null,
        region_id: payload.region_id || null,
        specialty_id: payload.specialty_id || null,
        phone: payload.phone,
        avatar_seed: `${payload.first_name}-${payload.last_name}`,
        is_active: true,
      })
      .select()
      .single()

    if (profileError) {
      // Nettoyage si échec d'insertion du profil
      await supabaseAdmin.auth.admin.deleteUser(authData.user.id)
      res.status(500).json({
        success: false,
        error: { message: `Erreur profil: ${profileError.message}` },
      })
      return
    }

    res.status(201).json({
      success: true,
      data: {
        user_id: authData.user.id,
        profile: profileData,
      },
    })
  } catch (error) {
    next(error)
  }
})

/**
 * POST /api/users/reset-password
 * Réinitialisation directe de mot de passe par un administrateur.
 */
usersRouter.post('/reset-password', requireAuth, async (req, res, next) => {
  try {
    const { auth_id, new_password } = req.body
    if (!auth_id || !new_password || new_password.length < 8) {
      res.status(400).json({
        success: false,
        error: { message: 'auth_id et new_password (min 8 caractères) requis.' },
      })
      return
    }

    const { error } = await supabaseAdmin.auth.admin.updateUserById(auth_id, {
      password: new_password,
    })

    if (error) {
      res.status(400).json({
        success: false,
        error: { message: error.message },
      })
      return
    }

    res.status(200).json({
      success: true,
      message: 'Mot de passe mis à jour avec succès.',
    })
  } catch (error) {
    next(error)
  }
})
