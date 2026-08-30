-- ============================================================================
-- Migration 0010 : Module Don de Sang d'Urgence & CNTS (Jokko Donneur)
-- ============================================================================

-- 1. Types énumérés
DO $$ BEGIN
  CREATE TYPE blood_group_enum AS ENUM ('O-', 'O+', 'A-', 'A+', 'B-', 'B+', 'AB-', 'AB+');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE blood_urgency_enum AS ENUM ('vital', 'urgent', 'preventive');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE blood_alert_status_enum AS ENUM ('active', 'fulfilled', 'cancelled');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE donor_commitment_status_enum AS ENUM ('en_route', 'arrived', 'donated', 'cancelled');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- 2. Tables

-- Stocks hospitaliers et banque centrale CNTS
CREATE TABLE IF NOT EXISTS public.blood_stocks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  facility_id UUID REFERENCES public.facilities(id) ON DELETE CASCADE,
  blood_group blood_group_enum NOT NULL,
  quantity_bags INT NOT NULL DEFAULT 0 CHECK (quantity_bags >= 0),
  minimum_threshold INT NOT NULL DEFAULT 5 CHECK (minimum_threshold >= 0),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT uq_facility_blood_group UNIQUE (facility_id, blood_group)
);

-- Alertes d'urgence émises par les hôpitaux ou le CNTS
CREATE TABLE IF NOT EXISTS public.blood_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  facility_id UUID NOT NULL REFERENCES public.facilities(id) ON DELETE CASCADE,
  blood_group blood_group_enum NOT NULL,
  urgency blood_urgency_enum NOT NULL DEFAULT 'urgent',
  bags_needed INT NOT NULL DEFAULT 1 CHECK (bags_needed > 0),
  bags_collected INT NOT NULL DEFAULT 0 CHECK (bags_collected >= 0),
  clinical_reason TEXT NOT NULL,
  status blood_alert_status_enum NOT NULL DEFAULT 'active',
  donors_en_route INT NOT NULL DEFAULT 0 CHECK (donors_en_route >= 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  expires_at TIMESTAMPTZ NOT NULL DEFAULT (now() + interval '4 hours')
);

-- Engagements des citoyens donneurs
CREATE TABLE IF NOT EXISTS public.donor_commitments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  alert_id UUID NOT NULL REFERENCES public.blood_alerts(id) ON DELETE CASCADE,
  donor_name TEXT NOT NULL DEFAULT 'Citoyen Volontaire',
  donor_phone TEXT,
  donor_blood_group blood_group_enum NOT NULL,
  facility_id UUID NOT NULL REFERENCES public.facilities(id) ON DELETE CASCADE,
  status donor_commitment_status_enum NOT NULL DEFAULT 'en_route',
  eta_minutes INT NOT NULL DEFAULT 15,
  pass_code TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Profils de donneurs volontaires enregistrés (optionnel)
CREATE TABLE IF NOT EXISTS public.donor_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  auth_id UUID UNIQUE,
  full_name TEXT NOT NULL,
  phone TEXT,
  blood_group blood_group_enum,
  city TEXT NOT NULL DEFAULT 'Dakar',
  total_donations INT NOT NULL DEFAULT 0,
  last_donation_date DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3. Index pour la performance
CREATE INDEX IF NOT EXISTS idx_blood_stocks_facility ON public.blood_stocks(facility_id);
CREATE INDEX IF NOT EXISTS idx_blood_alerts_status ON public.blood_alerts(status, urgency);
CREATE INDEX IF NOT EXISTS idx_donor_commitments_alert ON public.donor_commitments(alert_id, status);

-- 4. Triggers pour synchronisation des compteurs

CREATE OR REPLACE FUNCTION public.fn_handle_donor_commitment()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.blood_alerts
    SET donors_en_route = donors_en_route + 1
    WHERE id = NEW.alert_id;
  ELSIF TG_OP = 'UPDATE' THEN
    IF OLD.status = 'en_route' AND NEW.status = 'donated' THEN
      UPDATE public.blood_alerts
      SET 
        donors_en_route = GREATEST(0, donors_en_route - 1),
        bags_collected = bags_collected + 1,
        status = CASE WHEN bags_collected + 1 >= bags_needed THEN 'fulfilled'::blood_alert_status_enum ELSE status END
      WHERE id = NEW.alert_id;

      -- Incrément du stock de l'établissement
      UPDATE public.blood_stocks
      SET quantity_bags = quantity_bags + 1, updated_at = now()
      WHERE facility_id = NEW.facility_id AND blood_group = NEW.donor_blood_group;
    ELSIF OLD.status = 'en_route' AND NEW.status = 'cancelled' THEN
      UPDATE public.blood_alerts
      SET donors_en_route = GREATEST(0, donors_en_route - 1)
      WHERE id = NEW.alert_id;
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_donor_commitment ON public.donor_commitments;
CREATE TRIGGER trg_donor_commitment
  AFTER INSERT OR UPDATE ON public.donor_commitments
  FOR EACH ROW
  EXECUTE FUNCTION public.fn_handle_donor_commitment();

-- 5. Row Level Security (RLS)

ALTER TABLE public.blood_stocks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blood_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.donor_commitments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.donor_profiles ENABLE ROW LEVEL SECURITY;

-- Lecture publique pour les citoyens et hôpitaux
CREATE POLICY "Public read blood stocks" ON public.blood_stocks FOR SELECT USING (true);
CREATE POLICY "Public read blood alerts" ON public.blood_alerts FOR SELECT USING (true);
CREATE POLICY "Public insert commitments" ON public.donor_commitments FOR INSERT WITH CHECK (true);
CREATE POLICY "Public read commitments" ON public.donor_commitments FOR SELECT USING (true);

-- Écriture réservée aux soignants et administrateurs
CREATE POLICY "Hospital staff manage blood stocks" ON public.blood_stocks
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Hospital staff manage blood alerts" ON public.blood_alerts
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Hospital staff update commitments" ON public.donor_commitments
  FOR UPDATE USING (auth.role() = 'authenticated');

-- 6. Publication Realtime Supabase
DO $$ BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE public.blood_alerts;
  ALTER PUBLICATION supabase_realtime ADD TABLE public.blood_stocks;
  ALTER PUBLICATION supabase_realtime ADD TABLE public.donor_commitments;
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;
