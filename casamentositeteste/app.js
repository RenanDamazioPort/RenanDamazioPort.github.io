(function () {
  var C = window.CASAMENTO;
  var db = (C.supabaseUrl && C.supabaseAnonKey && window.supabase)
    ? window.supabase.createClient(C.supabaseUrl, C.supabaseAnonKey, { auth: { persistSession: false } })
    : null;
  var $ = function (s, el) { return (el || document).querySelector(s); };
  var $$ = function (s, el) { return Array.prototype.slice.call((el || document).querySelectorAll(s)); };
  var reais = function (v) { return "R$ " + Number(v).toLocaleString("pt-BR", { minimumFractionDigits: 0, maximumFractionDigits: 2 }); };

  /* ---------- links fixos ---------- */
  $("#btnMapa").href = C.mapa;
  $("#linkWhats").href = "https://wa.me/" + C.whatsapp + "?text=" + encodeURIComponent("Oi! Vim pelo site do casamento.");

  /* ---------- menu celular ---------- */
  var nav = $("#nav"), menuBtn = $("#menuBtn");
  menuBtn.addEventListener("click", function () {
    var aberto = nav.classList.toggle("aberta");
    menuBtn.setAttribute("aria-expanded", aberto);
    menuBtn.textContent = aberto ? "Fechar" : "Menu";
  });
  $$("a", nav).forEach(function (a) { a.addEventListener("click", function () { nav.classList.remove("aberta"); menuBtn.textContent = "Menu"; menuBtn.setAttribute("aria-expanded", false); }); });

  /* ---------- fotos (Supabase Storage → bucket "fotos": 01.jpg … 04.jpg) ---------- */
  $$("[data-foto]").forEach(function (fig) {
    var nome = fig.getAttribute("data-foto");
    var url = (C.fotos && C.fotos[nome]) || (db ? C.supabaseUrl + "/storage/v1/object/public/fotos/" + nome + ".jpg" : "");
    if (!url) return;
    var img = new Image();
    img.onload = function () { fig.style.backgroundImage = "url('" + url + "')"; fig.classList.add("tem-foto"); };
    img.src = url;
  });

  /* ---------- animação de entrada ---------- */
  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (es) { es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add("visivel"); io.unobserve(e.target); } }); }, { threshold: .12 });
    $$(".boas__texto, .historia__texto, .dia > *, .rsvp__conteudo, .presentes__topo, .passos, .rodape > *").forEach(function (el) { el.classList.add("revela"); io.observe(el); });
  }

  /* ---------- RSVP ---------- */
  var formRsvp = $("#formRsvp");
  formRsvp.addEventListener("submit", async function (ev) {
    ev.preventDefault();
    var st = $(".form__status", formRsvp), f = new FormData(formRsvp);
    var nome = (f.get("nome") || "").trim(), contato = (f.get("contato") || "").trim(), vai = f.get("vai");
    st.className = "form__status";
    if (nome.length < 3 || contato.length < 5 || !vai) { st.textContent = "Preencha nome, contato e se você vem."; return; }
    var btn = $("button[type=submit]", formRsvp); btn.disabled = true; st.textContent = "Enviando…";
    try {
      if (db) {
        var r = await db.from("rsvp").insert({ nome: nome, contato: contato, vai: vai === "sim" });
        if (r.error) throw r.error;
      }
      formRsvp.reset();
      st.classList.add("ok");
      st.textContent = vai === "sim" ? "Resposta recebida. Que alegria ter você com a gente! ♥" : "Resposta recebida. Obrigado por avisar — vamos sentir sua falta.";
      if (!db) st.textContent += " (modo teste: nada foi salvo)";
    } catch (e) {
      console.error(e); st.textContent = "Não conseguimos enviar agora. Tente de novo em instantes.";
    } finally { btn.disabled = false; }
  });

  /* ---------- catálogo de presentes ---------- */
  var catalogo = [];
  async function carregarCatalogo() {
    if (db) {
      var r = await db.rpc("catalogo");
      if (!r.error && r.data && r.data.length) {
        var mapa = {};
        r.data.forEach(function (l) {
          var p = mapa[l.presente_id] || (mapa[l.presente_id] = { id: l.presente_id, nome: l.nome, cor: l.cor, ordem: l.ordem, opcoes: [] });
          p.opcoes.push({ id: l.opcao_id, valor: l.valor_centavos / 100, total: l.total, livres: l.disponivel });
        });
        return Object.keys(mapa).map(function (k) { return mapa[k]; }).sort(function (a, b) { return a.ordem - b.ordem; });
      }
      console.warn("Catálogo do banco indisponível, usando o local.", r.error);
    }
    return C.presentes.map(function (p) {
      return { id: p.id, nome: p.nome, cor: p.cor, ordem: p.ordem, opcoes: p.opcoes.map(function (o, i) { return { id: p.id + "-" + i, valor: o.valor, total: o.total, livres: o.total }; }) };
    });
  }

  function descreverCotas(p) {
    var tot = p.opcoes.reduce(function (s, o) { return s + o.total; }, 0);
    if (p.opcoes.length === 1) return tot + " cotas de " + reais(p.opcoes[0].valor);
    return tot + " cotas · " + p.opcoes.map(function (o) { return o.total + " de " + reais(o.valor); }).join(" + ");
  }

  function desenharCartoes() {
    var box = $("#cartoes");
    box.innerHTML = "";
    catalogo.forEach(function (p, i) {
      var tot = p.opcoes.reduce(function (s, o) { return s + o.total; }, 0);
      var livres = p.opcoes.reduce(function (s, o) { return s + o.livres; }, 0);
      var min = Math.min.apply(null, p.opcoes.map(function (o) { return o.valor; }));
      var unico = p.opcoes.length === 1;
      var el = document.createElement("article");
      el.className = "cartao revela visivel" + (livres <= 0 ? " esgotado" : "");
      el.style.setProperty("--cor", p.cor);
      el.innerHTML =
        '<div class="cartao__img" hidden></div>' +
        '<p class="cartao__num">' + String(i + 1).padStart(2, "0") + "</p>" +
        '<h3 class="cartao__nome"></h3><hr>' +
        '<p class="cartao__cotas">' + descreverCotas(p) + "</p>" +
        (db ? '<p class="cartao__livres">' + livres + " de " + tot + ' cotas disponíveis</p><div class="barra"><i></i></div>' : "") +
        '<p class="cartao__preco">' + (unico ? reais(min) + " / cota" : "A partir de " + reais(min)) + "</p>" +
        '<button class="btn btn--escuro" type="button"' + (livres <= 0 ? " disabled" : "") + ">" + (livres <= 0 ? "Esgotado" : 'Escolher cota <span aria-hidden="true">→</span>') + "</button>";
      $(".cartao__nome", el).textContent = p.nome;
      (function (box) {
        var im = new Image();
        im.onload = function () { box.style.backgroundImage = "url('" + im.src + "')"; box.hidden = false; el.classList.add("com-img"); };
        im.src = "img/presentes/" + p.id + ".jpg";
      })($(".cartao__img", el));
      $("button", el).addEventListener("click", function () { abrirJornada(p, i); });
      box.appendChild(el);
      var barra = $(".barra i", el);
      if (barra) requestAnimationFrame(function () { barra.style.width = Math.round(100 * (tot - livres) / tot) + "%"; });
    });
  }

  /* ---------- jornada da cota ---------- */
  var dlg = $("#jornada"), escolhido = null, opcao = null, qtd = 1, numero = "";
  function irPara(passo) {
    $$(".etapa", dlg).forEach(function (s) { s.hidden = s.getAttribute("data-passo") !== String(passo); });
    $$(".jornada__etapas li", dlg).forEach(function (li) { li.classList.toggle("ativa", Number(li.getAttribute("data-etapa")) <= passo); });
    dlg.scrollTop = 0;
  }
  function atualizarTotal() {
    $("#qtdValor").textContent = qtd;
    $("#jTotal").textContent = reais(opcao ? opcao.valor * qtd : 0);
    $("#qtdMenos").disabled = qtd <= 1;
    $("#qtdMais").disabled = !opcao || qtd >= Math.min(opcao.livres, 10);
    $("#irCadastro").disabled = !opcao;
  }
  function abrirJornada(p, i) {
    escolhido = p; numero = String(i + 1).padStart(2, "0"); qtd = 1;
    dlg.style.setProperty("--cor", p.cor);
    $("#jPresenteNum").textContent = "Presente " + numero + " · " + p.nome.replace(/\n/g, " ");
    var box = $("#jOpcoes"); box.innerHTML = "";
    opcao = null;
    p.opcoes.forEach(function (o) {
      var lab = document.createElement("label");
      lab.className = "opcao" + (o.livres <= 0 ? " indisponivel" : "");
      lab.innerHTML = '<span><input type="radio" name="opcao"' + (o.livres <= 0 ? " disabled" : "") + ">Cota de " + reais(o.valor) + "</span><small>" + (o.livres <= 0 ? "esgotada" : (db ? o.livres + " disponíveis" : o.total + " cotas")) + "</small>";
      $("input", lab).addEventListener("change", function () { opcao = o; qtd = 1; atualizarTotal(); });
      box.appendChild(lab);
      if (!opcao && o.livres > 0) { opcao = o; $("input", lab).checked = true; }
    });
    atualizarTotal(); irPara(1);
    $(".form__status", dlg).textContent = "";
    if (dlg.showModal) dlg.showModal(); else dlg.setAttribute("open", "");
  }
  $("#qtdMenos").addEventListener("click", function () { if (qtd > 1) { qtd--; atualizarTotal(); } });
  $("#qtdMais").addEventListener("click", function () { qtd++; atualizarTotal(); });
  $("#irCadastro").addEventListener("click", function () {
    $("#jResumo1").textContent = escolhido.nome.replace(/\n/g, " ") + " · " + qtd + (qtd > 1 ? " cotas" : " cota") + " · " + reais(opcao.valor * qtd);
    irPara(2);
    setTimeout(function () { var i = $("#formReserva input[name=nome]"); i && i.focus(); }, 50);
  });
  $$("[data-voltar]", dlg).forEach(function (b) { b.addEventListener("click", function () { irPara(1); }); });
  $$("[data-fechar]", dlg).forEach(function (b) { b.addEventListener("click", function () { dlg.close ? dlg.close() : dlg.removeAttribute("open"); }); });
  dlg.addEventListener("click", function (e) { if (e.target === dlg) dlg.close(); });
  dlg.addEventListener("close", function () { if (precisaRecarregar) { precisaRecarregar = false; iniciar(); } });
  var precisaRecarregar = false;

  var formRes = $("#formReserva");
  formRes.addEventListener("submit", async function (ev) {
    ev.preventDefault();
    var st = $(".form__status", formRes), f = new FormData(formRes);
    var d = {
      nome: (f.get("nome") || "").trim(), email: (f.get("email") || "").trim(),
      whatsapp: (f.get("whatsapp") || "").replace(/\D/g, ""), mensagem: (f.get("mensagem") || "").trim().slice(0, 500),
      consentimento: !!f.get("consentimento")
    };
    $$(".campo", formRes).forEach(function (c) { c.classList.remove("erro"); });
    var erros = [];
    if (d.nome.split(/\s+/).length < 2) erros.push("nome");
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(d.email)) erros.push("email");
    if (d.whatsapp.length < 10 || d.whatsapp.length > 13) erros.push("whatsapp");
    erros.forEach(function (n) { formRes.elements[n].closest(".campo").classList.add("erro"); });
    if (erros.length) { st.textContent = "Confira " + erros.join(", ").replace("nome", "nome completo") + "."; return; }
    if (!d.consentimento) { st.textContent = "Marque o aceite para seguirmos com a reserva."; return; }

    var btn = $("button[type=submit]", formRes); btn.disabled = true; st.textContent = "Reservando sua cota…";
    try {
      var res;
      if (db) {
        var r = await db.rpc("reservar_cota", {
          p_opcao_id: opcao.id, p_quantidade: qtd, p_nome: d.nome, p_email: d.email,
          p_whatsapp: d.whatsapp, p_mensagem: d.mensagem || null, p_consentimento: d.consentimento
        });
        if (r.error) throw r.error;
        res = Array.isArray(r.data) ? r.data[0] : r.data;
        precisaRecarregar = true;
      } else {
        res = { codigo: "TR-TESTE", valor_total_centavos: opcao.valor * qtd * 100, expira_em: new Date(Date.now() + C.reservaHoras * 3600e3).toISOString() };
      }
      mostrarPix(res);
      formRes.reset();
      st.textContent = "";
    } catch (e) {
      console.error(e);
      var msg = String(e && (e.message || e.details) || "");
      st.textContent = /esgot|dispon/i.test(msg) ? "Essa cota acabou de ser reservada por outra pessoa. Volte e escolha outra." : "Não conseguimos reservar agora. Tente de novo em instantes.";
    } finally { btn.disabled = false; }
  });

  var codigoPix = "";
  function mostrarPix(res) {
    var valor = res.valor_total_centavos / 100;
    $("#jResumo2").textContent = escolhido.nome.replace(/\n/g, " ") + "  ·  " + qtd + (qtd > 1 ? " cotas" : " cota") + "  ·  " + reais(valor);
    $("#jCodigo").textContent = res.codigo;
    $("#jStatus").textContent = db ? "aguardando pagamento" : "modo teste — nada foi salvo";
    var exp = new Date(res.expira_em);
    $("#jPrazo").textContent = "Sua cota fica guardada até " + exp.toLocaleString("pt-BR", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" }) + ".";
    codigoPix = window.gerarPix({ chave: C.pix.chave, nome: C.pix.nome, cidade: C.pix.cidade, valor: valor, txid: res.codigo });
    var qr = $("#pixQr"), btn = $("#copiarPix");
    if (codigoPix && window.qrcode) {
      var q = window.qrcode(0, "M"); q.addData(codigoPix); q.make();
      qr.innerHTML = q.createSvgTag({ cellSize: 4, margin: 0, scalable: true });
      qr.classList.add("tem-qr");
      btn.disabled = false; btn.textContent = "Copiar código Pix";
    } else {
      qr.innerHTML = "<span>QR CODE<br>PIX A INSERIR</span>"; qr.classList.remove("tem-qr");
      btn.disabled = true; btn.textContent = "Pix em breve";
    }
    irPara(4);
  }
  $("#copiarPix").addEventListener("click", async function () {
    if (!codigoPix) return;
    try { await navigator.clipboard.writeText(codigoPix); } catch (e) {
      var t = document.createElement("textarea"); t.value = codigoPix; document.body.appendChild(t); t.select(); document.execCommand("copy"); t.remove();
    }
    this.textContent = "Código copiado ✓";
    var b = this; setTimeout(function () { b.textContent = "Copiar código Pix"; }, 2500);
  });

  async function iniciar() {
    catalogo = await carregarCatalogo();
    desenharCartoes();
  }
  iniciar();
})();
