-- =====================================================================
--  Site do casamento Tainara & Renan — banco de dados (Supabase, grátis)
--  Rodar uma vez em: Supabase → SQL Editor → New query → Run
-- =====================================================================

-- ---------- 1. Tabelas ----------
create table if not exists public.presentes (
  id          text primary key,
  nome        text not null,
  descricao   text,
  cor         text not null default '#1d3a2b',
  ordem       int  not null default 0,
  ativo       boolean not null default true,
  imagem_url  text
);

create table if not exists public.opcoes_cota (
  id               serial primary key,
  presente_id      text not null references public.presentes(id) on delete cascade,
  valor_centavos   int  not null check (valor_centavos > 0),
  quantidade_total int  not null check (quantidade_total >= 0),
  unique (presente_id, valor_centavos)
);

create sequence if not exists public.reserva_numero;

create table if not exists public.reservas (
  id                   uuid primary key default gen_random_uuid(),
  codigo               text unique not null,
  opcao_id             int  not null references public.opcoes_cota(id),
  quantidade           int  not null check (quantidade between 1 and 10),
  valor_total_centavos int  not null,
  nome                 text not null,
  email                text not null,
  whatsapp             text not null,
  mensagem             text check (char_length(mensagem) <= 500),
  consentimento        boolean not null default false,
  status               text not null default 'reservada'
                         check (status in ('reservada','paga','cancelada')),
  criado_em            timestamptz not null default now(),
  expira_em            timestamptz not null,
  pago_em              timestamptz,
  verificacao          text
);
create index if not exists reservas_opcao_idx on public.reservas (opcao_id, status);

create table if not exists public.rsvp (
  id        bigserial primary key,
  nome      text not null check (char_length(nome) between 2 and 120),
  contato   text not null check (char_length(contato) between 3 and 120),
  vai       boolean not null,
  criado_em timestamptz not null default now()
);

-- Quem pode ver o painel (/admin.html). Coloque os e-mails de vocês dois.
create table if not exists public.admins ( email text primary key );

-- ---------- 2. Regras de acesso (RLS) ----------
alter table public.presentes   enable row level security;
alter table public.opcoes_cota enable row level security;
alter table public.reservas    enable row level security;
alter table public.rsvp        enable row level security;
alter table public.admins      enable row level security;

create or replace function public.eh_admin() returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.admins a where lower(a.email) = lower(auth.jwt() ->> 'email'));
$$;

drop policy if exists "presentes publicos" on public.presentes;
create policy "presentes publicos" on public.presentes for select using (ativo or public.eh_admin());
drop policy if exists "presentes admin" on public.presentes;
create policy "presentes admin" on public.presentes for all using (public.eh_admin()) with check (public.eh_admin());

drop policy if exists "opcoes publicas" on public.opcoes_cota;
create policy "opcoes publicas" on public.opcoes_cota for select using (true);
drop policy if exists "opcoes admin" on public.opcoes_cota;
create policy "opcoes admin" on public.opcoes_cota for all using (public.eh_admin()) with check (public.eh_admin());

-- reservas: ninguém de fora lê (mensagens são privadas); só o painel.
drop policy if exists "reservas admin" on public.reservas;
create policy "reservas admin" on public.reservas for all using (public.eh_admin()) with check (public.eh_admin());

-- rsvp: qualquer convidado envia; só o painel lê.
drop policy if exists "rsvp enviar" on public.rsvp;
create policy "rsvp enviar" on public.rsvp for insert to anon, authenticated with check (true);
drop policy if exists "rsvp admin" on public.rsvp;
create policy "rsvp admin" on public.rsvp for all using (public.eh_admin()) with check (public.eh_admin());

drop policy if exists "admins ver" on public.admins;
create policy "admins ver" on public.admins for select using (public.eh_admin());

-- ---------- 3. Funções públicas ----------
-- Catálogo com cotas disponíveis em tempo real (reservas vencidas voltam ao estoque).
create or replace function public.catalogo()
returns table (presente_id text, nome text, cor text, ordem int, opcao_id int,
               valor_centavos int, total int, disponivel int)
language sql stable security definer set search_path = public as $$
  select p.id, p.nome, p.cor, p.ordem, o.id, o.valor_centavos, o.quantidade_total,
         greatest(0, o.quantidade_total - coalesce((
           select sum(r.quantidade) from public.reservas r
           where r.opcao_id = o.id
             and (r.status = 'paga' or (r.status = 'reservada' and r.expira_em > now()))
         ), 0))::int
  from public.presentes p join public.opcoes_cota o on o.presente_id = p.id
  where p.ativo
  order by p.ordem, o.valor_centavos desc;
$$;

-- Reserva atômica: trava a opção, confere estoque e devolve código + prazo.
create or replace function public.reservar_cota(
  p_opcao_id int, p_quantidade int, p_nome text, p_email text,
  p_whatsapp text, p_mensagem text, p_consentimento boolean)
returns table (codigo text, valor_total_centavos int, expira_em timestamptz)
language plpgsql volatile security definer set search_path = public as $$
declare
  v_op public.opcoes_cota%rowtype;
  v_ocupadas int;
  v_codigo text;
  v_expira timestamptz := now() + interval '24 hours';
begin
  if p_quantidade is null or p_quantidade < 1 or p_quantidade > 10 then raise exception 'quantidade invalida'; end if;
  if coalesce(p_consentimento,false) = false then raise exception 'consentimento obrigatorio'; end if;
  if char_length(trim(coalesce(p_nome,''))) < 3 or position('@' in coalesce(p_email,'')) = 0
     or char_length(regexp_replace(coalesce(p_whatsapp,''),'\D','','g')) < 10 then
    raise exception 'dados invalidos';
  end if;

  select * into v_op from public.opcoes_cota where id = p_opcao_id for update;
  if not found then raise exception 'cota inexistente'; end if;

  select coalesce(sum(r.quantidade),0) into v_ocupadas from public.reservas r
   where r.opcao_id = p_opcao_id
     and (r.status = 'paga' or (r.status = 'reservada' and r.expira_em > now()));
  if v_ocupadas + p_quantidade > v_op.quantidade_total then
    raise exception 'cota esgotada ou indisponivel';
  end if;

  v_codigo := 'TR-' || lpad(nextval('public.reserva_numero')::text, 4, '0');
  insert into public.reservas (codigo, opcao_id, quantidade, valor_total_centavos, nome, email,
                               whatsapp, mensagem, consentimento, expira_em)
  values (v_codigo, p_opcao_id, p_quantidade, v_op.valor_centavos * p_quantidade, trim(p_nome),
          lower(trim(p_email)), regexp_replace(p_whatsapp,'\D','','g'),
          nullif(left(trim(coalesce(p_mensagem,'')),500),''), true, v_expira);

  return query select v_codigo, v_op.valor_centavos * p_quantidade, v_expira;
end $$;

revoke all on function public.reservar_cota(int,int,text,text,text,text,boolean) from public;
grant execute on function public.catalogo() to anon, authenticated;
grant execute on function public.reservar_cota(int,int,text,text,text,text,boolean) to anon, authenticated;

-- Painel: lista completa das reservas com nome do presente.
create or replace view public.reservas_painel with (security_invoker = true) as
  select r.*, p.nome as presente, o.valor_centavos as valor_cota,
         case when r.status = 'reservada' and r.expira_em <= now() then 'expirada' else r.status end as situacao
  from public.reservas r
  join public.opcoes_cota o on o.id = r.opcao_id
  join public.presentes p on p.id = o.presente_id;

-- ---------- 4. Fotos (Storage) ----------
insert into storage.buckets (id, name, public) values ('fotos', 'fotos', true)
on conflict (id) do update set public = true;

drop policy if exists "fotos admin envia" on storage.objects;
create policy "fotos admin envia" on storage.objects for insert to authenticated
  with check (bucket_id = 'fotos' and public.eh_admin());
drop policy if exists "fotos admin altera" on storage.objects;
create policy "fotos admin altera" on storage.objects for update to authenticated
  using (bucket_id = 'fotos' and public.eh_admin());
drop policy if exists "fotos admin apaga" on storage.objects;
create policy "fotos admin apaga" on storage.objects for delete to authenticated
  using (bucket_id = 'fotos' and public.eh_admin());

-- ---------- 5. Dados iniciais (presentes do Figma) ----------
insert into public.presentes (id, nome, cor, ordem) values
  ('viagem',  E'Um destino\nsó nosso',      '#434b35', 1),
  ('dias',    E'Dias sem\npressa',          '#79523e', 2),
  ('a-dois',  E'Novas\nhistórias a dois',   '#315a5c', 3),
  ('jantar',  E'Mesa para\ndois, sem hora', '#8f4f3a', 4),
  ('tainara', E'Um mimo\npara a Tainara',   '#6b2e3e', 5),
  ('renan',   E'O Renan\ntambém merece',    '#584238', 6)
on conflict (id) do nothing;

insert into public.opcoes_cota (presente_id, valor_centavos, quantidade_total) values
  ('viagem', 30000, 40), ('viagem', 20000, 40),
  ('dias',   30000, 15), ('dias',   20000, 15),
  ('a-dois', 30000, 5),  ('a-dois', 20000, 15),
  ('jantar', 15000, 10),
  ('tainara',15000, 5),
  ('renan',  15000, 5)
on conflict (presente_id, valor_centavos) do nothing;

insert into public.admins (email) values ('reenandamazio@gmail.com') on conflict do nothing;
