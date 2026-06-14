-- ============================================================
-- Jokko Santé — 0006 : helper de réinitialisation de séquence
-- Permet au script de seed (service_role) de repartir de TRF-…-0001.
-- ============================================================

create or replace function public.reset_transfer_reference_seq()
returns void
language sql
security definer
set search_path = public
as $$
  select setval('public.transfer_reference_seq', 1, false);
$$;

revoke execute on function public.reset_transfer_reference_seq() from anon, authenticated;
