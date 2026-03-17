create extension if not exists "pgcrypto";

do $$ begin
  create type appointment_type as enum ('primeira_consulta', 'retorno', 'acompanhamento');
exception
  when duplicate_object then null;
end $$;

do $$ begin
  create type appointment_format as enum ('presencial', 'online');
exception
  when duplicate_object then null;
end $$;

do $$ begin
  create type preferred_period as enum ('manha', 'tarde', 'noite');
exception
  when duplicate_object then null;
end $$;

do $$ begin
  create type payment_choice as enum ('taxa_reserva_pix', 'pagamento_integral_pix');
exception
  when duplicate_object then null;
end $$;

do $$ begin
  create type payment_status as enum ('pending_payment', 'paid_reservation', 'paid_full', 'cancelled');
exception
  when duplicate_object then null;
end $$;

create table if not exists public.appointments (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  whatsapp text not null,
  email text not null,
  appointment_type appointment_type not null,
  appointment_format appointment_format not null,
  preferred_date date not null,
  preferred_period preferred_period not null,
  notes text,
  payment_choice payment_choice not null,
  payment_provider text not null default 'abacatepay',
  payment_status payment_status not null default 'pending_payment',
  appointment_status payment_status not null default 'pending_payment',
  amount_cents integer not null check (amount_cents > 0),
  currency text not null default 'BRL',
  external_payment_id text,
  external_payment_payload jsonb,
  policy_accepted boolean not null,
  contact_authorized boolean not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists appointments_external_payment_id_idx
  on public.appointments(external_payment_id)
  where external_payment_id is not null;

create index if not exists appointments_email_created_at_idx
  on public.appointments(email, created_at desc);

create table if not exists public.payment_logs (
  id bigserial primary key,
  appointment_id uuid references public.appointments(id) on delete set null,
  provider text not null,
  event_type text not null,
  external_payment_id text not null,
  payload_hash text not null unique,
  payload jsonb not null,
  created_at timestamptz not null default now()
);

create index if not exists payment_logs_external_payment_id_idx
  on public.payment_logs(external_payment_id, created_at desc);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_appointments_updated_at on public.appointments;
create trigger set_appointments_updated_at
before update on public.appointments
for each row execute function public.set_updated_at();
