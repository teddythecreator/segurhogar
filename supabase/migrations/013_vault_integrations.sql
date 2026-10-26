-- ============================================================================
-- SEGUHOGAR - Gestión Segura de Integraciones con Supabase Vault
-- ============================================================================
-- IMPORTANTE: Requiere tener activada la extensión Vault en Supabase
-- ============================================================================

-- 1. Activar extensión Vault (si no está ya activada)
-- Nota: En Supabase, esto se hace desde el dashboard en Database > Extensions
-- O ejecutando:
create extension if not exists "supabase_vault" schema "vault";

-- 2. Tabla de integraciones (SIN secretos, solo metadatos)
create table if not exists integrations (
  id uuid default uuid_generate_v4() primary key,
  service text not null unique,
  status text not null default 'sin_configurar' check (status in ('sin_configurar', 'configurada', 'error')),
  mode text default 'prueba' check (mode in ('prueba', 'real')),
  last_test_at timestamptz,
  last_test_result text,
  last_test_error text,
  -- Metadatos de claves (últimos 4 caracteres, nunca la clave completa)
  key_metadata jsonb default '{}'::jsonb,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- 3. Tabla de auditoría (quién hizo qué y cuándo)
create table if not exists integration_audit_log (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users(id) on delete set null,
  user_email text,
  action text not null check (action in ('save', 'test', 'delete', 'mode_change')),
  service text not null,
  success boolean not null,
  details jsonb,
  ip_address inet,
  user_agent text,
  created_at timestamptz default now()
);

-- 4. Índices
create index if not exists idx_integrations_service on integrations(service);
create index if not exists idx_integrations_status on integrations(status);
create index if not exists idx_integration_audit_user on integration_audit_log(user_id);
create index if not exists idx_integration_audit_service on integration_audit_log(service);
create index if not exists idx_integration_audit_created on integration_audit_log(created_at desc);

-- 5. Inicializar registros para cada servicio
insert into integrations (service, status) values
  ('stripe', 'sin_configurar'),
  ('resend', 'sin_configurar'),
  ('claude', 'sin_configurar'),
  ('aliexpress', 'sin_configurar'),
  ('affiliate', 'sin_configurar')
on conflict (service) do nothing;

-- 6. Habilitar RLS
alter table integrations enable row level security;
alter table integration_audit_log enable row level security;

-- 7. Políticas RLS
-- Solo admin puede ver integraciones
create policy "Admin puede ver integraciones" on integrations
  for select using (
    exists (select 1 from profiles where id = auth.uid() and role = 'admin')
  );

-- Solo admin puede actualizar integraciones (a través de Edge Functions)
create policy "Admin puede actualizar integraciones" on integrations
  for update using (
    exists (select 1 from profiles where id = auth.uid() and role = 'admin')
  );

-- Solo admin puede ver el log de auditoría
create policy "Admin puede ver auditoría" on integration_audit_log
  for select using (
    exists (select 1 from profiles where id = auth.uid() and role = 'admin')
  );

-- Edge Functions pueden insertar en auditoría (con service role)
create policy "Edge Functions pueden insertar auditoría" on integration_audit_log
  for insert with check (true);

-- 8. Función para guardar secreto en Vault (SECURITY DEFINER)
-- Esta función solo puede ser llamada por service role (Edge Functions)
create or replace function save_integration_secret(
  p_service text,
  p_secret_name text,
  p_secret_value text
) returns void
language plpgsql
security definer
set search_path = public, vault
as $$
begin
  -- Verificar que el caller es service role (no usuario autenticado)
  if current_setting('request.jwt.claim.role', true) != 'service_role' then
    raise exception 'Solo Edge Functions pueden guardar secretos';
  end if;
  
  -- Guardar o actualizar en Vault
  perform vault.update_secret(
    p_secret_name,
    p_secret_value,
    p_secret_name
  );
  
  -- Si el secreto no existía, crearlo
  exception when others then
    perform vault.create_secret(
      p_secret_value,
      p_secret_name,
      p_secret_name
    );
end;
$$;

-- 9. Función para leer secreto desde Vault (SECURITY DEFINER)
create or replace function get_integration_secret(
  p_secret_name text
) returns text
language plpgsql
security definer
set search_path = public, vault
as $$
declare
  v_secret text;
begin
  -- Verificar que el caller es service role
  if current_setting('request.jwt.claim.role', true) != 'service_role' then
    raise exception 'Solo Edge Functions pueden leer secretos';
  end if;
  
  -- Leer de Vault
  select decrypted_secret into v_secret
  from vault.decrypted_secrets
  where name = p_secret_name
  limit 1;
  
  return v_secret;
end;
$$;

-- 10. Función para eliminar secreto de Vault
create or replace function delete_integration_secret(
  p_secret_name text
) returns void
language plpgsql
security definer
set search_path = public, vault
as $$
begin
  -- Verificar que el caller es service role
  if current_setting('request.jwt.claim.role', true) != 'service_role' then
    raise exception 'Solo Edge Functions pueden eliminar secretos';
  end if;
  
  -- Eliminar de Vault
  perform vault.destroy_secret(p_secret_name);
end;
$$;

-- 11. Revocar acceso a funciones Vault para roles anon y authenticated
-- Esto asegura que solo service role puede acceder
revoke all on function save_integration_secret from anon, authenticated;
revoke all on function get_integration_secret from anon, authenticated;
revoke all on function delete_integration_secret from anon, authenticated;

-- 12. Trigger para actualizar updated_at
create trigger integrations_updated_at
  before update on integrations
  for each row
  execute function update_updated_at();

-- 13. Nombres de secretos en Vault (convención)
-- stripe_secret_key_prueba
-- stripe_secret_key_real
-- stripe_webhook_secret_prueba
-- stripe_webhook_secret_real
-- resend_api_key
-- resend_from_email
-- claude_api_key
-- claude_daily_limit
-- claude_monthly_limit
-- aliexpress_app_key
-- aliexpress_app_secret
-- aliexpress_access_token
-- aliexpress_refresh_token
-- affiliate_amazon_id
-- affiliate_other_ids

-- 14. Función auxiliar para actualizar metadatos de clave (últimos 4 chars)
create or replace function update_integration_metadata(
  p_service text,
  p_key_name text,
  p_key_value text
) returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_last_four text;
  v_metadata jsonb;
begin
  -- Verificar que el caller es service role
  if current_setting('request.jwt.claim.role', true) != 'service_role' then
    raise exception 'Solo Edge Functions pueden actualizar metadatos';
  end if;
  
  -- Obtener últimos 4 caracteres
  v_last_four := right(p_key_value, 4);
  
  -- Obtener metadata actual
  select key_metadata into v_metadata
  from integrations
  where service = p_service;
  
  -- Actualizar metadata
  v_metadata := coalesce(v_metadata, '{}'::jsonb) || jsonb_build_object(
    p_key_name, jsonb_build_object(
      'last_four', v_last_four,
      'updated_at', now()
    )
  );
  
  -- Guardar
  update integrations
  set key_metadata = v_metadata,
      updated_at = now()
  where service = p_service;
end;
$$;

revoke all on function update_integration_metadata from anon, authenticated;

-- 15. Función para registrar en auditoría
create or replace function log_integration_action(
  p_user_id uuid,
  p_user_email text,
  p_action text,
  p_service text,
  p_success boolean,
  p_details jsonb default null,
  p_ip_address inet default null,
  p_user_agent text default null
) returns void
language sql
security definer
set search_path = public
as $$
  insert into integration_audit_log (
    user_id, user_email, action, service, success, details, ip_address, user_agent
  ) values (
    p_user_id, p_user_email, p_action, p_service, p_success, p_details, p_ip_address, p_user_agent
  );
$$;

revoke all on function log_integration_action from anon, authenticated;
