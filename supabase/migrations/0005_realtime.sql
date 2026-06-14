-- ============================================================
-- Jokko Santé — 0005 : Realtime
-- Diffusion des changements sur les tables critiques.
-- La RLS s'applique aussi aux événements Realtime.
-- ============================================================

alter publication supabase_realtime add table public.beds;
alter publication supabase_realtime add table public.equipment;
alter publication supabase_realtime add table public.transfer_requests;
alter publication supabase_realtime add table public.notifications;
