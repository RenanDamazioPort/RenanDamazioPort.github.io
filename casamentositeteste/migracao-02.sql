-- Migração 02: sem WhatsApp na reserva, prazo de 48h
alter table public.reservas alter column whatsapp drop not null;
drop function if exists public.reservar_cota(int,int,text,text,text,text,boolean);
create or replace function public.reservar_cota(
  p_opcao_id int, p_quantidade int, p_nome text, p_email text,
  p_mensagem text, p_consentimento boolean)
returns table (codigo text, valor_total_centavos int, expira_em timestamptz)
language plpgsql volatile security definer set search_path = public as $$
declare
  v_op public.opcoes_cota%rowtype;
  v_ocupadas int;
  v_codigo text;
  v_expira timestamptz := now() + interval '48 hours';
begin
  if p_quantidade is null or p_quantidade < 1 or p_quantidade > 10 then raise exception 'quantidade invalida'; end if;
  if coalesce(p_consentimento,false) = false then raise exception 'consentimento obrigatorio'; end if;
  if char_length(trim(coalesce(p_nome,''))) < 3 or coalesce(p_email,'') !~ '^[^@\s]+@[^@\s]+\.[^@\s]+$' then
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
                               mensagem, consentimento, expira_em)
  values (v_codigo, p_opcao_id, p_quantidade, v_op.valor_centavos * p_quantidade, trim(p_nome),
          lower(trim(p_email)), nullif(left(trim(coalesce(p_mensagem,'')),500),''), true, v_expira);
  return query select v_codigo, v_op.valor_centavos * p_quantidade, v_expira;
end $$;
revoke all on function public.reservar_cota(int,int,text,text,text,boolean) from public;
grant execute on function public.reservar_cota(int,int,text,text,text,boolean) to anon, authenticated;
