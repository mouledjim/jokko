import type { UserRole, TransferSeverity, TransferStatus, BedStatus, EquipmentStatus } from '@/types/db'

export const ROLE_LABEL: Record<UserRole, string> = {
  super_admin: 'Super administrateur',
  admin_regional: 'Administrateur régional',
  admin_hopital: 'Administrateur hôpital',
  medecin: 'Médecin',
}

/** Libellé court affiché dans le badge de rôle du header. */
export const ROLE_BADGE: Record<UserRole, string> = {
  super_admin: 'MSAS',
  admin_regional: 'Région',
  admin_hopital: 'Hôpital',
  medecin: 'Médecin',
}

/** Préfixe d'URL de l'espace de chaque rôle. */
export const ROLE_BASE: Record<UserRole, string> = {
  super_admin: '/national',
  admin_regional: '/region',
  admin_hopital: '/admin',
  medecin: '/app',
}

/** Page d'accueil après connexion selon le rôle. */
export function roleHome(role: UserRole): string {
  return ROLE_BASE[role]
}

export const SEVERITY_LABEL: Record<TransferSeverity, string> = {
  stable: 'Stable',
  urgent: 'Urgent',
  critique: 'Critique',
}

export const STATUS_LABEL: Record<TransferStatus, string> = {
  en_attente: 'En attente',
  accepte: 'Accepté',
  refuse: 'Refusé',
  en_route: 'En route',
  arrive: 'Arrivé',
  annule: 'Annulé',
}

export const BED_STATUS_LABEL: Record<BedStatus, string> = {
  libre: 'Libre',
  occupe: 'Occupé',
  nettoyage: 'Nettoyage',
  hors_service: 'Hors service',
}

export const EQUIPMENT_LABEL: Record<string, string> = {
  scanner: 'Scanner',
  irm: 'IRM',
  bloc_operatoire: 'Bloc opératoire',
  generateur_oxygene: "Générateur d'oxygène",
  ambulance: 'Ambulance',
  laboratoire: 'Laboratoire',
}

export const EQUIPMENT_STATUS_LABEL: Record<EquipmentStatus, string> = {
  fonctionnel: 'Fonctionnel',
  en_panne: 'En panne',
  maintenance: 'Maintenance',
}

export const FACILITY_TYPE_LABEL: Record<string, string> = {
  hopital_national: 'Hôpital national',
  hopital_regional: 'Hôpital régional',
  centre_sante: 'Centre de santé',
  clinique_privee: 'Clinique privée',
}
