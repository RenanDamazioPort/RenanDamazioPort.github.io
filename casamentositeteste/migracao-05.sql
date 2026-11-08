-- Migração 05: registro do álbum dos convidados (os arquivos ficam no Google Drive)
create table if not exists public.fotos_convidados (
  id        bigserial primary key,
  drive_id  text not null check (drive_id ~ '^[A-Za-z0-9_-]{10,100}$'),
  tipo      text check (tipo ~ '^(image|video)/'),
  bytes     bigint,
  nome      text check (char_length(nome) <= 80),
  desafio   text check (char_length(desafio) <= 120),
  criado_em timestamptz not null default now()
);
alter table public.fotos_convidados enable row level security;
drop policy if exists "album enviar" on public.fotos_convidados;
create policy "album enviar" on public.fotos_convidados for insert to anon, authenticated with check (true);
drop policy if exists "album admin" on public.fotos_convidados;
create policy "album admin" on public.fotos_convidados for all using (public.eh_admin()) with check (public.eh_admin());
