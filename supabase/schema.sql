-- Milano Vigo v1.0 — Esquema Supabase (plan gratuito)
-- Pegar en Supabase Studio → SQL Editor → Run

create extension if not exists "pgcrypto";

-- Inmuebles (públicos)
create table if not exists mv_properties (
  id text primary key,
  title text not null,
  zone text not null,
  rooms int,
  m2 numeric not null,
  price numeric not null,
  year int,
  condition text check (condition in ('reformar','bueno','reformado')),
  elevator boolean default false,
  features text[] default '{}',
  description text,
  rent_estimate numeric,
  published boolean default true,
  created_at timestamptz default now()
);

-- Perfil conversacional (1 por visitante)
create table if not exists mv_profiles (
  id uuid primary key default gen_random_uuid(),
  session_id text,
  name text,
  role text check (role in ('comprador','vendedor','inquilino','inversor')),
  budget_max numeric,
  rooms int,
  zones text[] default '{}',
  timeline text,
  phone text,
  email text,
  lang text default 'es',
  score int default 0,
  updated_at timestamptz default now()
);

-- Leads (pipeline del CRM)
create table if not exists mv_leads (
  id text primary key,
  name text default 'Invitado',
  role text,
  budget_max numeric,
  rooms int,
  zones text[] default '{}',
  phone text,
  email text,
  stage int default 0 check (stage between 0 and 4),
  score int default 0,
  next_action text,
  lang text default 'es',
  created_at timestamptz default now()
);

-- Mensajes (memoria conversacional en la nube)
create table if not exists mv_messages (
  id uuid primary key default gen_random_uuid(),
  lead_id text references mv_leads(id) on delete cascade,
  role text check (role in ('user','agent')),
  text text not null,
  created_at timestamptz default now()
);

-- Visitas agendadas
create table if not exists mv_visits (
  id uuid primary key default gen_random_uuid(),
  lead_id text references mv_leads(id) on delete cascade,
  property_id text references mv_properties(id),
  slot timestamptz not null,
  slot_label text,
  status text default 'confirmada' check (status in ('pendiente','confirmada','cancelada','hecha')),
  created_at timestamptz default now()
);

alter table mv_profiles enable row level security;
alter table mv_properties enable row level security;
alter table mv_leads enable row level security;
alter table mv_messages enable row level security;
alter table mv_visits enable row level security;

-- Público: leer inmuebles publicados
create policy "public read props" on mv_properties for select to anon using (published = true);

-- Público: escribir leads y mensajes (el agente crea los registros)
create policy "anon upsert leads" on mv_leads for insert to anon with check (true);
create policy "anon insert msgs" on mv_messages for insert to anon with check (true);
-- La lectura de leads solo con cuenta admin (Supabase Studio / dashboard):
-- no se otorga politica publica de select sobre mv_leads ni mv_messages.

-- Seed de inmuebles (los 12 del agente, estimaciones orientativas)
insert into mv_properties (id,title,zone,rooms,m2,price,year,condition,elevator,features,description,rent_estimate) values
('mv-01','Ático reformado con vistas a la ría','cascovello',2,68,158000,2019,'reformado',false,'{"Vistas ría","Suelos nuevos","Cocina abierta"}','Última planta rehabilitada en pleno Casco Vello.',920),
('mv-02','Piso junto al muelle de pescadores','bouzas',3,75,189000,1985,'bueno',true,'{"Junto al puerto","Ascensor"}','A cinco minutos del paseo y del Berbés.',900),
('mv-03','Estudio reformado a pasos de la ría','bouzas',0,35,99500,2021,'reformado',true,'{"Estudio","A/C"}','Entrada para inversor joven.',720),
('mv-04','Piso en Alcabre con terraza a la ría','alcabre',3,88,176000,1998,'reformado',true,'{"Terraza","Galería sur"}','Terraza orientada a la ría.',970),
('mv-05','Oportunidad sobre plano (Alcabre)','alcabre',2,72,124000,1974,'reformar',true,'{"Para reformar"}','Compra + reforma integral posiciona sobre media de zona.',690),
('mv-06','Piso frente a la playa de Samil','samil',2,74,172000,1998,'bueno',true,'{"A 50 m de arena"}','Mix residencia + temporada.',780),
('mv-07','Ático dúplex a 100 m del areal','samil',3,95,229000,2005,'reformado',true,'{"Terraza grande","Dúplex"}','Formato raro en Samil.',1100),
('mv-08','Piso con vistas al Castillo','ocastro',2,70,149900,1979,'bueno',true,'{"Vistas al Castro"}','Para habitar o reformar con margen.',730),
('mv-09','Familiar amplio en Coia','coia',4,105,169900,1992,'bueno',true,'{"4 hab"}','M² reales por euro en Coia.',880),
('mv-10','Chollo para invertir en Coia','coia',2,66,109000,1968,'reformar',false,'{"Yield objetivo 7 %"}','Tesis: compra + reforma para alquiler.',560),
('mv-11','Loft histórico rehabilitado (Berbés)','cascovello',1,54,139000,2018,'reformado',false,'{"Loft","Piedra vista"}','Explotación vacacional o pieza de diseño.',670),
('mv-12','Luminoso en Teis cerca de colegios','teis',3,82,152000,1987,'bueno',true,'{"Luz todo el día"}','Demanda familiar estable.',760)
on conflict (id) do nothing;
