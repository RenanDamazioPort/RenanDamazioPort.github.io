-- Migração 04: lista de convidados sincronizada com a planilha do Google (a cada 2 min)
create extension if not exists pg_net;
create extension if not exists pg_cron;

create table if not exists public.sync_planilha (
  id int primary key default 1 check (id = 1),
  url text not null,
  ultimo_request bigint,
  pedido_em timestamptz,
  ultima_sync timestamptz,
  total int,
  erro text
);
alter table public.sync_planilha enable row level security;
drop policy if exists "sync admin" on public.sync_planilha;
create policy "sync admin" on public.sync_planilha for select using (public.eh_admin());

insert into public.sync_planilha (id, url) values
  (1, 'COLE_AQUI_O_LINK_CSV_PUBLICADO')
on conflict (id) do update set url = excluded.url;

create or replace function public.sync_planilha_processar()
returns void language plpgsql security definer set search_path = public, extensions as $$
declare
  s public.sync_planilha%rowtype;
  r record;
  v_loc text; v_tipo text; v_linhas text[]; v_linha text; v_nome text;
  v_nomes text[] := '{}';
  v_req bigint;
begin
  select * into s from public.sync_planilha where id = 1;
  if s.ultimo_request is not null then
    select status_code, content, headers, error_msg into r from net._http_response where id = s.ultimo_request;
    if not found then
      if s.pedido_em > now() - interval '5 minutes' then return; end if;  -- ainda esperando a resposta
    elsif r.status_code in (301, 302, 303, 307, 308) then
      v_loc := coalesce(r.headers ->> 'Location', r.headers ->> 'location');
      if v_loc is not null then
        v_req := net.http_get(v_loc);
        update public.sync_planilha set ultimo_request = v_req, pedido_em = now() where id = 1;
        return;
      end if;
    elsif r.status_code = 200 then
      v_tipo := coalesce(r.headers ->> 'Content-Type', r.headers ->> 'content-type', '');
      v_linhas := regexp_split_to_array(coalesce(r.content, ''), E'\r?\n');
      if coalesce(v_linhas[1], '') ilike '%nome%' then  -- o Google responde como application/binary
        for i in 2 .. coalesce(array_length(v_linhas, 1), 1) loop
          v_linha := v_linhas[i];
          if v_linha like '"%' then
            v_nome := replace(substring(v_linha from '^"((?:[^"]|"")*)"'), '""', '"');
          else
            v_nome := split_part(v_linha, ',', 1);
          end if;
          v_nome := regexp_replace(trim(coalesce(v_nome, '')), '\s+', ' ', 'g');
          if char_length(v_nome) between 2 and 120 then v_nomes := v_nomes || v_nome; end if;
        end loop;

        delete from public.convidados c
         where not exists (select 1 from unnest(v_nomes) n where public.normaliza(n) = public.normaliza(c.nome));
        insert into public.convidados (nome)
          select distinct on (public.normaliza(n)) n from unnest(v_nomes) n
          where not exists (select 1 from public.convidados c where public.normaliza(c.nome) = public.normaliza(n));
        update public.convidados c set nome = n.n
          from unnest(v_nomes) n(n) where public.normaliza(n.n) = public.normaliza(c.nome) and c.nome <> n.n;

        update public.sync_planilha set ultima_sync = now(), total = array_length(v_nomes, 1), erro = null where id = 1;
      else
        update public.sync_planilha set erro = 'resposta inesperada (planilha publicada como CSV?)' where id = 1;
      end if;
    else
      update public.sync_planilha set erro = coalesce(r.error_msg, 'HTTP ' || r.status_code) where id = 1;
    end if;
  end if;
  v_req := net.http_get(s.url || '&t=' || extract(epoch from now())::bigint);
  update public.sync_planilha set ultimo_request = v_req, pedido_em = now() where id = 1;
end $$;

revoke all on function public.sync_planilha_processar() from public, anon, authenticated;

select cron.unschedule('sync-convidados') where exists (select 1 from cron.job where jobname = 'sync-convidados');
select cron.schedule('sync-convidados', '*/2 * * * *', $$select public.sync_planilha_processar()$$);
select public.sync_planilha_processar();
