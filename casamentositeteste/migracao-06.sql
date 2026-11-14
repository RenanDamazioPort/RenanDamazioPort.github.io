-- Migração 06: "Um destino só nosso" passa a somar R$ 15.000
-- (30 cotas de R$ 300 + 30 cotas de R$ 200, antes eram 40 + 40 = R$ 20.000).
-- Rodar uma vez em: Supabase → SQL Editor → New query → Run.
-- As reservas já feitas continuam valendo.

update public.opcoes_cota set quantidade_total = 30
 where presente_id = 'viagem' and valor_centavos = 30000;

update public.opcoes_cota set quantidade_total = 30
 where presente_id = 'viagem' and valor_centavos = 20000;

-- Confira o resultado (deve dar 15000,00):
select p.nome, o.valor_centavos/100 as valor, o.quantidade_total,
       sum(o.valor_centavos * o.quantidade_total) over (partition by p.id)/100 as total_do_presente
  from public.opcoes_cota o join public.presentes p on p.id = o.presente_id
 where p.id = 'viagem';
