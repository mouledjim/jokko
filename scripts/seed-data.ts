/**
 * Jokko Santé — données de référence du seed.
 * Séparé de la logique pour rester lisible.
 */

export const DEMO_PASSWORD = 'Jokko2026!'
export const EMAIL_DOMAIN = '@jokkosante.sn'

// ——— 14 régions médicales du Sénégal ———
export const REGIONS: { name: string; code: string }[] = [
  { name: 'Dakar', code: 'DK' },
  { name: 'Thiès', code: 'TH' },
  { name: 'Saint-Louis', code: 'SL' },
  { name: 'Diourbel', code: 'DB' },
  { name: 'Fatick', code: 'FK' },
  { name: 'Kaolack', code: 'KL' },
  { name: 'Kaffrine', code: 'KF' },
  { name: 'Kédougou', code: 'KE' },
  { name: 'Kolda', code: 'KD' },
  { name: 'Louga', code: 'LG' },
  { name: 'Matam', code: 'MT' },
  { name: 'Sédhiou', code: 'SE' },
  { name: 'Tambacounda', code: 'TC' },
  { name: 'Ziguinchor', code: 'ZG' },
]

// ——— Référentiel des spécialités ———
// icon_key = nom d'icône lucide ; color_key = clé mappée côté front (lib/specialties).
export const SPECIALTIES: { name: string; icon_key: string; color_key: string }[] = [
  { name: 'Urgences', icon_key: 'siren', color_key: 'rose' },
  { name: 'Réanimation', icon_key: 'heart-pulse', color_key: 'red' },
  { name: 'Maternité', icon_key: 'baby', color_key: 'pink' },
  { name: 'Néonatologie', icon_key: 'heart-handshake', color_key: 'fuchsia' },
  { name: 'Pédiatrie', icon_key: 'blocks', color_key: 'amber' },
  { name: 'Cardiologie', icon_key: 'heart', color_key: 'orange' },
  { name: 'Chirurgie générale', icon_key: 'cross', color_key: 'sky' },
  { name: 'Traumatologie', icon_key: 'bone', color_key: 'indigo' },
  { name: 'Médecine interne', icon_key: 'stethoscope', color_key: 'teal' },
  { name: 'Dialyse', icon_key: 'droplets', color_key: 'cyan' },
]

// Préfixes de libellé de lit par spécialité.
export const BED_PREFIX: Record<string, string> = {
  Urgences: 'URG',
  Réanimation: 'REA',
  Maternité: 'MAT',
  Néonatologie: 'NEO',
  Pédiatrie: 'PED',
  Cardiologie: 'CAR',
  'Chirurgie générale': 'CHI',
  Traumatologie: 'TRA',
  'Médecine interne': 'MED',
  Dialyse: 'DIA',
}

export type FacilityType =
  | 'hopital_national'
  | 'hopital_regional'
  | 'centre_sante'
  | 'clinique_privee'
export type FacilityLevel = 'niveau_1' | 'niveau_2' | 'niveau_3'

export interface FacilitySeed {
  slug: string
  name: string
  type: FacilityType
  level: FacilityLevel
  region: string
  latitude: number
  longitude: number
  address: string
  phone: string
  services: string[]
  /** Données de lits volontairement périmées (> 6 h) pour la démo carte. */
  stale?: boolean
}

// ——— 15 établissements réels ———
export const FACILITIES: FacilitySeed[] = [
  {
    slug: 'principal',
    name: 'Hôpital Principal de Dakar',
    type: 'hopital_national',
    level: 'niveau_3',
    region: 'Dakar',
    latitude: 14.658,
    longitude: -17.435,
    address: '1 Avenue Nelson Mandela, Dakar Plateau',
    phone: '+221 33 839 50 50',
    services: [
      'Urgences',
      'Réanimation',
      'Cardiologie',
      'Chirurgie générale',
      'Traumatologie',
      'Maternité',
      'Médecine interne',
      'Néonatologie',
    ],
  },
  {
    slug: 'fann',
    name: 'CHNU de Fann (Dakar)',
    type: 'hopital_national',
    level: 'niveau_3',
    region: 'Dakar',
    latitude: 14.69,
    longitude: -17.457,
    address: 'Avenue Cheikh Anta Diop, Fann, Dakar',
    phone: '+221 33 869 18 18',
    services: [
      'Urgences',
      'Réanimation',
      'Cardiologie',
      'Médecine interne',
      'Néonatologie',
      'Maternité',
    ],
  },
  {
    slug: 'abassndao',
    name: 'Hôpital Abass Ndao (Dakar)',
    type: 'hopital_national',
    level: 'niveau_3',
    region: 'Dakar',
    latitude: 14.681,
    longitude: -17.452,
    address: 'Avenue Cheikh Anta Diop, Dakar',
    phone: '+221 33 842 36 36',
    services: ['Urgences', 'Cardiologie', 'Médecine interne', 'Dialyse', 'Maternité'],
  },
  {
    slug: 'idrissapouye',
    name: 'Hôpital Général Idrissa Pouye (Grand Yoff)',
    type: 'hopital_national',
    level: 'niveau_3',
    region: 'Dakar',
    latitude: 14.733,
    longitude: -17.452,
    address: 'Grand Yoff, Dakar',
    phone: '+221 33 869 02 02',
    services: [
      'Urgences',
      'Chirurgie générale',
      'Traumatologie',
      'Réanimation',
      'Médecine interne',
    ],
  },
  {
    slug: 'dalaljamm',
    name: 'Hôpital Dalal Jamm (Guédiawaye)',
    type: 'hopital_national',
    level: 'niveau_3',
    region: 'Dakar',
    latitude: 14.772,
    longitude: -17.404,
    address: 'Guédiawaye, Dakar',
    phone: '+221 33 835 10 10',
    services: [
      'Urgences',
      'Réanimation',
      'Cardiologie',
      'Chirurgie générale',
      'Maternité',
      'Médecine interne',
    ],
  },
  {
    slug: 'pikine',
    name: 'Hôpital de Pikine',
    type: 'hopital_regional',
    level: 'niveau_2',
    region: 'Dakar',
    latitude: 14.755,
    longitude: -17.395,
    address: 'Pikine, Dakar',
    phone: '+221 33 854 12 12',
    services: ['Urgences', 'Médecine interne', 'Maternité', 'Pédiatrie'],
  },
  {
    slug: 'roibaudouin',
    name: 'Hôpital Roi Baudouin (Guédiawaye)',
    type: 'hopital_regional',
    level: 'niveau_2',
    region: 'Dakar',
    latitude: 14.769,
    longitude: -17.418,
    address: 'Guédiawaye, Dakar',
    phone: '+221 33 837 20 20',
    services: ['Urgences', 'Maternité', 'Pédiatrie', 'Médecine interne'],
  },
  {
    slug: 'militaire',
    name: 'Hôpital Militaire de Ouakam',
    type: 'hopital_national',
    level: 'niveau_3',
    region: 'Dakar',
    latitude: 14.722,
    longitude: -17.488,
    address: 'Ouakam, Dakar',
    phone: '+221 33 860 44 44',
    services: [
      'Urgences',
      'Chirurgie générale',
      'Réanimation',
      'Médecine interne',
      'Traumatologie',
    ],
  },
  {
    slug: 'thies',
    name: 'Hôpital Régional de Thiès',
    type: 'hopital_regional',
    level: 'niveau_2',
    region: 'Thiès',
    latitude: 14.79,
    longitude: -16.926,
    address: 'Avenue Léopold Sédar Senghor, Thiès',
    phone: '+221 33 951 11 11',
    services: [
      'Urgences',
      'Réanimation',
      'Maternité',
      'Pédiatrie',
      'Chirurgie générale',
      'Médecine interne',
    ],
  },
  {
    slug: 'saintlouis',
    name: 'Hôpital Régional de Saint-Louis',
    type: 'hopital_regional',
    level: 'niveau_2',
    region: 'Saint-Louis',
    latitude: 16.027,
    longitude: -16.49,
    address: 'Île de Saint-Louis',
    phone: '+221 33 961 10 10',
    services: ['Urgences', 'Maternité', 'Pédiatrie', 'Chirurgie générale', 'Médecine interne'],
  },
  {
    slug: 'kaolack',
    name: 'Hôpital El Hadj Ibrahima Niass (Kaolack)',
    type: 'hopital_regional',
    level: 'niveau_2',
    region: 'Kaolack',
    latitude: 14.146,
    longitude: -16.073,
    address: 'Kaolack',
    phone: '+221 33 941 10 10',
    services: ['Urgences', 'Maternité', 'Pédiatrie', 'Médecine interne', 'Chirurgie générale'],
  },
  {
    slug: 'touba',
    name: 'Hôpital Matlaboul Fawzaini (Touba)',
    type: 'hopital_regional',
    level: 'niveau_2',
    region: 'Diourbel',
    latitude: 14.866,
    longitude: -15.883,
    address: 'Touba, Diourbel',
    phone: '+221 33 978 10 10',
    services: [
      'Urgences',
      'Maternité',
      'Pédiatrie',
      'Médecine interne',
      'Chirurgie générale',
      'Réanimation',
    ],
  },
  {
    slug: 'ziguinchor',
    name: 'Hôpital Régional de Ziguinchor',
    type: 'hopital_regional',
    level: 'niveau_2',
    region: 'Ziguinchor',
    latitude: 12.568,
    longitude: -16.272,
    address: 'Ziguinchor',
    phone: '+221 33 991 10 10',
    services: ['Urgences', 'Maternité', 'Pédiatrie', 'Médecine interne', 'Chirurgie générale'],
  },
  {
    slug: 'kaffrine',
    name: 'Hôpital Thierno Birahim Ndao (Kaffrine)',
    type: 'hopital_regional',
    level: 'niveau_2',
    region: 'Kaffrine',
    latitude: 14.105,
    longitude: -15.55,
    address: 'Kaffrine',
    phone: '+221 33 946 10 10',
    services: ['Urgences', 'Maternité', 'Pédiatrie', 'Médecine interne'],
    stale: true,
  },
  {
    slug: 'tambacounda',
    name: 'Hôpital Régional de Tambacounda',
    type: 'hopital_regional',
    level: 'niveau_2',
    region: 'Tambacounda',
    latitude: 13.77,
    longitude: -13.667,
    address: 'Tambacounda',
    phone: '+221 33 981 10 10',
    services: ['Urgences', 'Maternité', 'Pédiatrie', 'Médecine interne', 'Chirurgie générale'],
    stale: true,
  },
]

export type EquipmentType =
  | 'scanner'
  | 'irm'
  | 'bloc_operatoire'
  | 'generateur_oxygene'
  | 'ambulance'
  | 'laboratoire'
export type EquipmentStatus = 'fonctionnel' | 'en_panne' | 'maintenance'

// Équipements par établissement (slug). Statut par défaut : fonctionnel.
// Les pannes ciblées sont déclarées dans EQUIPMENT_FAULTS.
export const EQUIPMENT_BY_FACILITY: Record<string, EquipmentType[]> = {
  principal: ['scanner', 'irm', 'bloc_operatoire', 'generateur_oxygene', 'ambulance', 'laboratoire'],
  fann: ['scanner', 'irm', 'bloc_operatoire', 'generateur_oxygene', 'ambulance', 'laboratoire'],
  abassndao: ['scanner', 'bloc_operatoire', 'generateur_oxygene', 'ambulance', 'laboratoire'],
  idrissapouye: ['scanner', 'bloc_operatoire', 'generateur_oxygene', 'ambulance', 'laboratoire'],
  dalaljamm: ['scanner', 'irm', 'bloc_operatoire', 'generateur_oxygene', 'ambulance', 'laboratoire'],
  pikine: ['scanner', 'bloc_operatoire', 'generateur_oxygene', 'ambulance', 'laboratoire'],
  roibaudouin: ['bloc_operatoire', 'generateur_oxygene', 'ambulance', 'laboratoire'],
  militaire: ['scanner', 'bloc_operatoire', 'generateur_oxygene', 'ambulance', 'laboratoire'],
  thies: ['scanner', 'bloc_operatoire', 'generateur_oxygene', 'ambulance', 'laboratoire'],
  saintlouis: ['scanner', 'bloc_operatoire', 'generateur_oxygene', 'ambulance', 'laboratoire'],
  kaolack: ['scanner', 'bloc_operatoire', 'generateur_oxygene', 'ambulance', 'laboratoire'],
  touba: ['scanner', 'bloc_operatoire', 'generateur_oxygene', 'ambulance', 'laboratoire'],
  ziguinchor: ['scanner', 'bloc_operatoire', 'generateur_oxygene', 'ambulance', 'laboratoire'],
  kaffrine: ['bloc_operatoire', 'generateur_oxygene', 'ambulance', 'laboratoire'],
  tambacounda: ['scanner', 'bloc_operatoire', 'generateur_oxygene', 'ambulance', 'laboratoire'],
}

// Pannes ciblées (scénario démo : scanner de Pikine en panne).
export const EQUIPMENT_FAULTS: { slug: string; type: EquipmentType; status: EquipmentStatus }[] = [
  { slug: 'pikine', type: 'scanner', status: 'en_panne' },
  { slug: 'tambacounda', type: 'scanner', status: 'en_panne' },
  { slug: 'saintlouis', type: 'bloc_operatoire', status: 'maintenance' },
]

// ——— Noms sénégalais réalistes pour la génération des profils ———
export const FIRST_NAMES_M = [
  'Abdoulaye', 'Ousmane', 'Cheikh', 'Mamadou', 'Ibrahima', 'Modou', 'Babacar', 'Pape',
  'Serigne', 'Moussa', 'Alioune', 'Idrissa', 'Lamine', 'Saliou', 'Daouda', 'Khadim',
  'Assane', 'Malick', 'El Hadji', 'Souleymane',
]
export const FIRST_NAMES_F = [
  'Fatou', 'Aïssatou', 'Khady', 'Mariama', 'Awa', 'Coumba', 'Ndèye', 'Sokhna',
  'Bineta', 'Astou', 'Rokhaya', 'Adja', 'Seynabou', 'Dieynaba', 'Fatima', 'Marème',
  'Yacine', 'Penda', 'Maïmouna', 'Ramatoulaye',
]
export const LAST_NAMES = [
  'Ndiaye', 'Diop', 'Fall', 'Sarr', 'Bâ', 'Sy', 'Mbengue', 'Cissé', 'Gueye', 'Faye',
  'Diallo', 'Sow', 'Ndour', 'Kane', 'Diouf', 'Camara', 'Touré', 'Sène', 'Thiam', 'Niang',
  'Wade', 'Mbaye', 'Seck', 'Bousso',
]

// Comptes de démonstration fixes (mot de passe commun).
export interface FixedAccount {
  email: string
  first: string
  last: string
  role: 'super_admin' | 'admin_regional' | 'admin_hopital' | 'medecin'
  facilitySlug?: string
  regionName?: string
  specialtyName?: string
}

export const FIXED_ACCOUNTS: FixedAccount[] = [
  {
    email: 'superadmin@jokkosante.sn',
    first: 'Mame Diarra Bousso',
    last: 'Fall',
    role: 'super_admin',
  },
  {
    email: 'region.dakar@jokkosante.sn',
    first: 'Cheikh Tidiane',
    last: 'Sy',
    role: 'admin_regional',
    regionName: 'Dakar',
  },
  {
    email: 'admin.principal@jokkosante.sn',
    first: 'Aïssatou',
    last: 'Bâ',
    role: 'admin_hopital',
    facilitySlug: 'principal',
  },
  {
    email: 'medecin.pikine@jokkosante.sn',
    first: 'Ousmane',
    last: 'Sarr',
    role: 'medecin',
    facilitySlug: 'pikine',
    specialtyName: 'Urgences',
  },
  {
    email: 'medecin.principal@jokkosante.sn',
    first: 'Abdoulaye',
    last: 'Ndiaye',
    role: 'medecin',
    facilitySlug: 'principal',
    specialtyName: 'Réanimation',
  },
]

// Nombre de médecins supplémentaires à générer par établissement (slug).
export const EXTRA_MEDECINS: Record<string, number> = {
  principal: 1,
  fann: 2,
  abassndao: 1,
  idrissapouye: 2,
  dalaljamm: 2,
  pikine: 1,
  roibaudouin: 1,
  militaire: 1,
  thies: 2,
  saintlouis: 1,
  kaolack: 2,
  touba: 1,
  ziguinchor: 1,
  kaffrine: 1,
  tambacounda: 2,
}

// Motifs cliniques crédibles -> spécialité requise + gravité typique.
export const MOTIFS: { motif: string; specialty: string; severity: 'stable' | 'urgent' | 'critique' }[] = [
  { motif: 'AVC ischémique, besoin imagerie + réanimation', specialty: 'Réanimation', severity: 'critique' },
  { motif: 'Détresse respiratoire néonatale', specialty: 'Néonatologie', severity: 'critique' },
  { motif: 'Polytraumatisé suite à un AVP', specialty: 'Traumatologie', severity: 'critique' },
  { motif: 'Éclampsie du troisième trimestre', specialty: 'Maternité', severity: 'critique' },
  { motif: 'Insuffisance rénale aiguë — dialyse urgente', specialty: 'Dialyse', severity: 'urgent' },
  { motif: 'Infarctus du myocarde', specialty: 'Cardiologie', severity: 'critique' },
  { motif: 'Péritonite aiguë', specialty: 'Chirurgie générale', severity: 'urgent' },
  { motif: 'Choc septique', specialty: 'Réanimation', severity: 'critique' },
  { motif: 'Hémorragie du post-partum', specialty: 'Maternité', severity: 'critique' },
  { motif: 'Crise convulsive fébrile du nourrisson', specialty: 'Pédiatrie', severity: 'urgent' },
  { motif: 'Occlusion intestinale', specialty: 'Chirurgie générale', severity: 'urgent' },
  { motif: 'Fracture ouverte du fémur', specialty: 'Traumatologie', severity: 'urgent' },
  { motif: 'Décompensation cardiaque globale', specialty: 'Cardiologie', severity: 'urgent' },
  { motif: 'Grande prématurité (32 SA)', specialty: 'Néonatologie', severity: 'critique' },
  { motif: 'Acidocétose diabétique', specialty: 'Médecine interne', severity: 'urgent' },
  { motif: 'Pneumopathie hypoxémiante', specialty: 'Médecine interne', severity: 'stable' },
  { motif: 'Surveillance post-opératoire compliquée', specialty: 'Chirurgie générale', severity: 'stable' },
]

export const REFUSAL_REASONS = [
  'Aucun lit disponible dans le service',
  'Plateau technique insuffisant pour ce cas',
  'Équipement requis indisponible',
  'Service en tension maximale',
]
