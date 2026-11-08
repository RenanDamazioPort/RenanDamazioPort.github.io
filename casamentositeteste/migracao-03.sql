-- Migração 03: lista de convidados (RSVP por busca de nome)
create table if not exists public.convidados (
  id            bigserial primary key,
  nome          text not null check (char_length(nome) between 2 and 120),
  grupo         text,
  vai           boolean,
  respondido_em timestamptz,
  criado_em     timestamptz not null default now()
);
alter table public.convidados enable row level security;
drop policy if exists "convidados admin" on public.convidados;
create policy "convidados admin" on public.convidados for all using (public.eh_admin()) with check (public.eh_admin());

create or replace function public.normaliza(t text) returns text language sql immutable as $$
  select lower(translate(coalesce(t,''), 'áàâãäéèêëíìîïóòôõöúùûüçñÁÀÂÃÄÉÈÊËÍÌÎÏÓÒÔÕÖÚÙÛÜÇÑ', 'aaaaaeeeeiiiiooooouuuucnAAAAAEEEEIIIIOOOOOUUUUCN'));
$$;

-- Busca: mínimo 3 letras, no máximo 6 resultados (a lista inteira nunca fica exposta)
create or replace function public.buscar_convidado(q text)
returns table (id bigint, nome text, vai boolean)
language sql stable security definer set search_path = public as $$
  select c.id, c.nome, c.vai from public.convidados c
  where char_length(trim(coalesce(q,''))) >= 3
    and public.normaliza(c.nome) like '%' || public.normaliza(trim(q)) || '%'
  order by c.nome limit 6;
$$;

create or replace function public.responder_convidado(p_id bigint, p_vai boolean)
returns void language plpgsql volatile security definer set search_path = public as $$
begin
  if p_vai is null then raise exception 'resposta obrigatoria'; end if;
  update public.convidados set vai = p_vai, respondido_em = now() where id = p_id;
  if not found then raise exception 'convidado nao encontrado'; end if;
end $$;

grant execute on function public.buscar_convidado(text) to anon, authenticated;
grant execute on function public.responder_convidado(bigint, boolean) to anon, authenticated;
