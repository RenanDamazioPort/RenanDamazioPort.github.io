(async function () {
  var C = window.CASAMENTO, app = document.getElementById("app"), quem = document.getElementById("quem");
  var esc = function (s) { return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); };
  var reais = function (c) { return "R$ " + (c / 100).toLocaleString("pt-BR", { minimumFractionDigits: 2 }); };
  var data = function (d) { return d ? new Date(d).toLocaleString("pt-BR", { day: "2-digit", month: "2-digit", year: "2-digit", hour: "2-digit", minute: "2-digit" }) : "—"; };

  if (!C.supabaseUrl || !C.supabaseAnonKey) { app.innerHTML = "<p>O banco ainda não está conectado (config.js).</p>"; return; }
  var db = window.supabase.createClient(C.supabaseUrl, C.supabaseAnonKey);

  var sessao = (await db.auth.getSession()).data.session;
  db.auth.onAuthStateChange(function (_e, s) { if (!!s !== !!sessao) location.reload(); });
  if (!sessao) return telaLogin();

  quem.innerHTML = esc(sessao.user.email) + ' &nbsp; <button class="btn claro mini" id="sair">Sair</button>';
  document.getElementById("sair").onclick = async function () { await db.auth.signOut(); location.reload(); };

  var aba = "reservas";
  render();

  function telaLogin() {
    app.innerHTML = '<div class="login"><h2>Entrar no painel</h2><p>Digite seu e-mail. Você recebe um link de acesso.</p>' +
      '<form id="f"><input type="email" required placeholder="seu@email.com"><button class="btn" style="width:100%">Enviar link</button></form><p class="st" id="st"></p></div>';
    document.getElementById("f").onsubmit = async function (e) {
      e.preventDefault();
      var email = e.target.querySelector("input").value.trim(), st = document.getElementById("st");
      st.textContent = "Enviando…";
      var r = await db.auth.signInWithOtp({ email: email, options: { emailRedirectTo: location.href.split("#")[0] } });
      st.textContent = r.error ? "Erro: " + r.error.message : "Pronto! Abra o link que chegou em " + email + ".";
    };
  }

  async function render() {
    app.innerHTML = '<div class="abas">' + ["reservas", "rsvp", "cotas", "fotos"].map(function (a) {
      return '<button class="btn' + (a === aba ? " on" : "") + '" data-aba="' + a + '">' + { reservas: "Reservas", rsvp: "Confirmações", cotas: "Cotas", fotos: "Fotos" }[a] + "</button>";
    }).join("") + '</div><div id="conteudo"><p>Carregando…</p></div>';
    app.querySelectorAll("[data-aba]").forEach(function (b) { b.onclick = function () { aba = b.dataset.aba; render(); }; });
    var c = document.getElementById("conteudo");
    try { await ({ reservas: reservas, rsvp: rsvp, cotas: cotas, fotos: fotos })[aba](c); }
    catch (e) { console.error(e); c.innerHTML = '<p class="st">Sem acesso ou erro: ' + esc(e.message || e) + "<br>Seu e-mail precisa estar na tabela <b>admins</b>.</p>"; }
  }

  function csv(nome, linhas) {
    var txt = linhas.map(function (l) { return l.map(function (v) { return '"' + String(v == null ? "" : v).replace(/"/g, '""') + '"'; }).join(";"); }).join("\n");
    var a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob(["﻿" + txt], { type: "text/csv" }));
    a.download = nome; a.click();
  }

  async function reservas(c) {
    var r = await db.from("reservas_painel").select("*").order("criado_em", { ascending: false });
    if (r.error) throw r.error;
    var L = r.data, pago = 0, aguard = 0;
    L.forEach(function (x) { if (x.situacao === "paga") pago += x.valor_total_centavos; if (x.situacao === "reservada") aguard += x.valor_total_centavos; });
    c.innerHTML =
      '<div class="cards"><div class="card"><b>' + reais(pago) + '</b><span>Pix confirmados</span></div><div class="card"><b>' + reais(aguard) + '</b><span>Aguardando Pix</span></div><div class="card"><b>' + L.filter(function (x) { return x.situacao === "paga"; }).length + '</b><span>Reservas pagas</span></div><div class="card"><b>' + L.length + '</b><span>Reservas no total</span></div></div>' +
      '<div class="barra"><h2>Reservas de cotas</h2><button class="btn linha" id="exp">Exportar CSV</button></div>' +
      '<div class="scroll"><table><thead><tr><th>Código</th><th>Presente</th><th>Valor</th><th>Convidado</th><th>Mensagem</th><th>Situação</th><th>Ações</th></tr></thead><tbody>' +
      (L.length ? L.map(function (x) {
        return "<tr><td><b>" + esc(x.codigo) + "</b><br><small>" + data(x.criado_em) + "</small></td><td>" + esc(x.presente.replace(/\n/g, " ")) + "<br><small>" + x.quantidade + " × " + reais(x.valor_cota) + "</small></td><td>" + reais(x.valor_total_centavos) +
          "</td><td>" + esc(x.nome) + "<br><small>" + esc(x.email) + '<br><a href="https://wa.me/55' + esc(x.whatsapp) + '" target="_blank">' + esc(x.whatsapp) + '</a></small></td><td class="msg">' + esc(x.mensagem || "") +
          '</td><td><span class="tag ' + x.situacao + '">' + x.situacao + "</span>" + (x.situacao === "reservada" ? "<br><small>até " + data(x.expira_em) + "</small>" : x.pago_em ? "<br><small>" + data(x.pago_em) + "</small>" : "") +
          '</td><td style="white-space:nowrap">' +
          (x.status !== "paga" ? '<button class="btn mini" data-id="' + x.id + '" data-acao="paga">Pix recebido</button> ' : "") +
          (x.status !== "cancelada" ? '<button class="btn linha mini" data-id="' + x.id + '" data-acao="cancelada">Cancelar</button>' : '<button class="btn linha mini" data-id="' + x.id + '" data-acao="reservada">Reabrir</button>') +
          "</td></tr>";
      }).join("") : '<tr><td colspan="7">Nenhuma reserva ainda.</td></tr>') + "</tbody></table></div>";
    c.querySelectorAll("[data-acao]").forEach(function (b) {
      b.onclick = async function () {
        b.disabled = true;
        var upd = { status: b.dataset.acao };
        if (b.dataset.acao === "paga") { upd.pago_em = new Date().toISOString(); upd.verificacao = "manual: " + sessao.user.email; }
        if (b.dataset.acao === "reservada") upd.expira_em = new Date(Date.now() + (C.reservaHoras || 24) * 3600e3).toISOString();
        var u = await db.from("reservas").update(upd).eq("id", b.dataset.id);
        if (u.error) { alert(u.error.message); b.disabled = false; } else render();
      };
    });
    document.getElementById("exp").onclick = function () {
      csv("reservas-casamento.csv", [["codigo", "criado_em", "presente", "quantidade", "valor", "nome", "email", "whatsapp", "mensagem", "situacao", "pago_em"]].concat(
        L.map(function (x) { return [x.codigo, data(x.criado_em), x.presente.replace(/\n/g, " "), x.quantidade, (x.valor_total_centavos / 100).toFixed(2).replace(".", ","), x.nome, x.email, x.whatsapp, x.mensagem, x.situacao, data(x.pago_em)]; })));
    };
  }

  async function rsvp(c) {
    var r = await db.from("rsvp").select("*").order("criado_em", { ascending: false });
    if (r.error) throw r.error;
    var L = r.data, sim = L.filter(function (x) { return x.vai; }).length;
    c.innerHTML = '<div class="cards"><div class="card"><b>' + sim + '</b><span>Vão estar lá</span></div><div class="card"><b>' + (L.length - sim) + '</b><span>Não poderão ir</span></div></div>' +
      '<div class="barra"><h2>Confirmações de presença</h2><button class="btn linha" id="exp">Exportar CSV</button></div>' +
      '<div class="scroll"><table><thead><tr><th>Quando</th><th>Nome</th><th>Contato</th><th>Resposta</th></tr></thead><tbody>' +
      (L.length ? L.map(function (x) { return "<tr><td>" + data(x.criado_em) + "</td><td>" + esc(x.nome) + "</td><td>" + esc(x.contato) + '</td><td><span class="tag ' + (x.vai ? "paga" : "cancelada") + '">' + (x.vai ? "vai" : "não vai") + "</span></td></tr>"; }).join("") : '<tr><td colspan="4">Nenhuma resposta ainda.</td></tr>') +
      "</tbody></table></div>";
    document.getElementById("exp").onclick = function () {
      csv("confirmacoes-casamento.csv", [["quando", "nome", "contato", "vai"]].concat(L.map(function (x) { return [data(x.criado_em), x.nome, x.contato, x.vai ? "sim" : "não"]; })));
    };
  }

  async function cotas(c) {
    var r = await db.rpc("catalogo");
    if (r.error) throw r.error;
    c.innerHTML = '<h2>Cotas livres e ocupadas</h2><div class="scroll"><table><thead><tr><th>Presente</th><th>Cota</th><th>Total</th><th>Ocupadas</th><th>Livres</th></tr></thead><tbody>' +
      r.data.map(function (x) { return "<tr><td>" + esc(x.nome.replace(/\n/g, " ")) + "</td><td>" + reais(x.valor_centavos) + "</td><td>" + x.total + "</td><td>" + (x.total - x.disponivel) + "</td><td><b>" + x.disponivel + "</b></td></tr>"; }).join("") +
      "</tbody></table></div><p><small>Ocupadas = pagas + reservadas dentro do prazo. Reservas vencidas voltam sozinhas para o estoque.</small></p>";
  }

  async function fotos(c) {
    var nomes = { "01": "Retrato do casal (topo)", "02": "Foto do casal (boas-vindas)", "03": "Vocês com o Tobias (história)", "04": "Casal ou Tobias (RSVP)" };
    var base = C.supabaseUrl + "/storage/v1/object/public/fotos/";
    c.innerHTML = '<h2>Fotos do site</h2><p>Envie JPG ou PNG (de preferência até 2 MB). A foto aparece no site na hora.</p><div class="fotos">' +
      Object.keys(nomes).map(function (n) {
        return '<div class="foto"><div class="prev" id="p' + n + '" style="background-image:url(\'' + base + n + ".jpg?v=" + Date.now() + '\')">sem foto</div><b>' + n + " · " + nomes[n] + '</b><br><br><input type="file" accept="image/*" data-n="' + n + '"><p class="st" id="s' + n + '"></p></div>';
      }).join("") + "</div>";
    c.querySelectorAll("input[type=file]").forEach(function (inp) {
      inp.onchange = async function () {
        var f = inp.files[0], n = inp.dataset.n, st = document.getElementById("s" + n);
        if (!f) return;
        st.textContent = "Enviando…";
        var blob = await reduzir(f);
        var u = await db.storage.from("fotos").upload(n + ".jpg", blob, { upsert: true, contentType: "image/jpeg", cacheControl: "60" });
        if (u.error) { st.textContent = "Erro: " + u.error.message; return; }
        st.textContent = "Foto atualizada ✓";
        document.getElementById("p" + n).style.backgroundImage = "url('" + base + n + ".jpg?v=" + Date.now() + "')";
      };
    });
  }

  // Reduz a foto para no máximo 2400px e salva como JPG leve.
  function reduzir(file) {
    return new Promise(function (ok) {
      var img = new Image();
      img.onload = function () {
        var s = Math.min(1, 2400 / Math.max(img.width, img.height));
        var cv = document.createElement("canvas"); cv.width = Math.round(img.width * s); cv.height = Math.round(img.height * s);
        cv.getContext("2d").drawImage(img, 0, 0, cv.width, cv.height);
        cv.toBlob(function (b) { ok(b || file); }, "image/jpeg", 0.86);
      };
      img.onerror = function () { ok(file); };
      img.src = URL.createObjectURL(file);
    });
  }
})();
