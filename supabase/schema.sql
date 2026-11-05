-- Run once in the Supabase SQL editor (see spec §3).
create table if not exists publications (
  id            text primary key,
  published_at  timestamptz not null,
  company_name  text not null,
  company_key   text not null,
  lei           text,
  isin          text,
  title         text not null,
  type          text not null,
  subtype       text not null,
  subtype_code  text,
  url           text not null,
  file_ext      text,
  cac40         boolean,
  score         int not null default 0,
  score_reasons text[] not null default '{}',
  raw           jsonb not null,
  imported_at   timestamptz not null default now()
);

create index if not exists publications_published_at_idx on publications (published_at);
create index if not exists publications_company_key_idx  on publications (company_key);
create index if not exists publications_type_idx         on publications (type);
create index if not exists publications_subtype_idx      on publications (subtype);
create index if not exists publications_score_idx        on publications (score);

create table if not exists briefs (
  publication_id   text primary key references publications (id) on delete cascade,
  title            text,
  chapo            text,
  body             text,
  key_facts        jsonb,
  figures          jsonb,
  segments         jsonb,
  unlisted_numbers jsonb,
  status           text,
  reason           text,
  word_count       int,
  source_text      text,
  model            text,
  prompt_version   text,
  created_at       timestamptz not null default now()
);

-- RLS without policies: only the server-side service_role key can access the tables.
alter table publications enable row level security;
alter table briefs       enable row level security;
