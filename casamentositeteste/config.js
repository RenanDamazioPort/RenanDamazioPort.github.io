/* ------------------------------------------------------------------
   Configuração do site do casamento — Tainara & Renan
   Edite só este arquivo para trocar dados, Pix e conexão do banco.
------------------------------------------------------------------- */
window.CASAMENTO = {
  // Banco de dados gratuito (Supabase · projeto casamento-tainara-renan)
  supabaseUrl: "https://ijvfslilqwuttazquikm.supabase.co",
  supabaseAnonKey: "sb_publishable_RQ3_ZuORhWztJGjs2bLmiw_AQC1gSyu", // chave pública (pode ficar no site)

  // Pix — quando a chave estiver preenchida, o site gera QR Code e
  // "copia e cola" com o valor exato e o código da reserva.
  pix: {
    chave: "reenandamazio@live.com", // e-mail, telefone (+5511...), CPF ou chave aleatória
    nome: "TAINARA E RENAN", // até 25 caracteres, sem acento
    cidade: "SAO PAULO"      // até 15 caracteres, sem acento
  },

  // E-mail automático de agradecimento (EmailJS, grátis). Vazio = o painel
  // abre o Gmail com o e-mail já escrito para vocês só clicarem em Enviar.
  emailjs: { publicKey: "", serviceId: "", templateId: "" },

  // Quanto tempo a cota fica segura esperando o Pix
  reservaHoras: 48,

  whatsapp: "5511994064761",
  mapa: "https://www.google.com/maps/search/?api=1&query=Av.+Cel.+Sezefredo+Fagundes,+7505+-+Jardim+das+Pedras,+S%C3%A3o+Paulo+-+SP",

  // Catálogo usado no modo demonstração (no banco, ele vem da tabela)
  presentes: [
    { id: "viagem",  ordem: 1, nome: "Um destino\nsó nosso",        cor: "#434b35", opcoes: [{ valor: 300, total: 40 }, { valor: 200, total: 40 }] },
    { id: "dias",    ordem: 2, nome: "Dias sem\npressa",            cor: "#79523e", opcoes: [{ valor: 300, total: 15 }, { valor: 200, total: 15 }] },
    { id: "a-dois",  ordem: 3, nome: "Novas\nhistórias a dois",     cor: "#315a5c", opcoes: [{ valor: 300, total: 5 },  { valor: 200, total: 15 }] },
    { id: "jantar",  ordem: 4, nome: "Mesa para\ndois, sem hora",   cor: "#8f4f3a", opcoes: [{ valor: 150, total: 10 }] },
    { id: "tainara", ordem: 5, nome: "Um mimo\npara a Tainara",     cor: "#6b2e3e", opcoes: [{ valor: 150, total: 5 }] },
    { id: "renan",   ordem: 6, nome: "O Renan\ntambém merece",      cor: "#584238", opcoes: [{ valor: 150, total: 5 }] }
  ]
};
