-- ============================================================
-- Jokko Santé — 0007 : paramètres plateforme (singleton)
-- Seuil de tension + bandeau d'information national.
-- ============================================================

create table public.app_settings (
  id boolean primary key default true,
  tension_threshold integer not null default 85 check (tension_threshold between 50 and 100),
  national_banner text not null default '',
  updated_at timestamptz not null default now(),
  updated_by uuid references public.profiles(id) on delete set null,
  constraint app_settings_singleton check (id)
);

insert into public.app_settings (id) values (true);

alter table public.app_settings enable row level security;

create policy "app_settings_select" on public.app_settings
  for select to authenticated using (true);

create policy "app_settings_update" on public.app_settings
  for update to authenticated
  using (public.current_user_role() = 'super_admin')
  with check (public.current_user_role() = 'super_admin');
