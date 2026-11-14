/* =====================================================================
   Tainara & Renan — camada de animação
   Não mexe em nada do RSVP, presentes ou Pix (app.js). Só observa a página
   e adiciona movimento. Carregado depois do app.js.
===================================================================== */
(function () {
  "use strict";
  window.__mo = true;

  var html = document.documentElement;
  var $ = function (s, el) { return (el || document).querySelector(s); };
  var $$ = function (s, el) { return Array.prototype.slice.call((el || document).querySelectorAll(s)); };
  var reduz = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var animar = html.classList.contains("mo") && !reduz && "IntersectionObserver" in window;
  var ponteiroFino = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
  var celular = function () { return window.innerWidth <= 820; };
  var foraDoModal = function (el) { return !el.closest(".jornada"); };

  /* ================= contagem regressiva (funciona sempre) ================= */
  var alvo = new Date("2027-07-09T20:30:00-03:00").getTime();
  var cont = $("#contagem");
  if (cont) {
    var unidades = $$("[data-u]", cont);
    var ultimo = {};
    var pad = function (n, z) { n = String(n); while (n.length < z) n = "0" + n; return n; };
    var tick = function () {
      var f = Math.max(0, alvo - Date.now());
      var v = {
        d: Math.floor(f / 864e5),
        h: Math.floor(f / 36e5) % 24,
        m: Math.floor(f / 6e4) % 60,
        s: Math.floor(f / 1e3) % 60
      };
      unidades.forEach(function (b) {
        var u = b.getAttribute("data-u");
        var txt = u === "d" ? String(v.d) : pad(v[u], 2);
        if (ultimo[u] === txt) return;
        ultimo[u] = txt;
        var s = document.createElement("span");
        s.textContent = txt;
        if (animar && b.firstChild) s.className = "vira";
        b.innerHTML = "";
        b.appendChild(s);
      });
      if (f === 0) cont.setAttribute("data-chegou", "");
    };
    tick();
    setInterval(tick, 1000);
  }

  if (!animar) { html.classList.remove("mo", "mo-intro-on"); return; }

  /* ================= utilidades ================= */
  function dividir(el, porLetra) {
    var original = el.textContent.replace(/\s+/g, " ").trim();
    var nos = Array.prototype.slice.call(el.childNodes);
    var i = 0;
    el.innerHTML = "";
    nos.forEach(function (n) {
      if (n.nodeType !== 3) { el.appendChild(n); return; }
      n.textContent.split(/(\s+)/).forEach(function (parte) {
        if (!parte) return;
        if (/^\s+$/.test(parte)) { el.appendChild(document.createTextNode(" ")); return; }
        var w = document.createElement("span");
        w.className = "mo-w";
        w.setAttribute("aria-hidden", "true");
        if (porLetra) {
          Array.from(parte).forEach(function (ch) {
            var c = document.createElement("span");
            c.className = "mo-c"; c.textContent = ch; c.style.setProperty("--i", i++);
            w.appendChild(c);
          });
        } else {
          var wi = document.createElement("span");
          wi.className = "mo-wi"; wi.textContent = parte; wi.style.setProperty("--i", i++);
          w.appendChild(wi);
        }
        el.appendChild(w);
      });
    });
    el.setAttribute("aria-label", original);
  }

  function marcar(seletor, classe, opcoes) {
    opcoes = opcoes || {};
    $$(seletor).filter(foraDoModal).forEach(function (el) {
      el.classList.add("mo-alvo", classe);
      if (opcoes.d != null) { el.style.setProperty("--d", opcoes.d + "ms"); el.setAttribute("data-mo-fixo", ""); }
    });
  }

  /* limpa as classes de entrada quando acaba, para o hover voltar ao normal */
  function limparAoTerminar(el) {
    if (!el.classList.contains("mo-sobe")) return;
    var d = parseFloat(getComputedStyle(el).getPropertyValue("--d")) || 0;
    setTimeout(function () { el.classList.remove("mo-sobe"); }, d + 1400);
  }

  /* ================= marcação ================= */
  // hero com tempos fixos
  var nomes = $(".hero__nomes");
  if (nomes) { dividir(nomes, true); nomes.classList.add("mo-alvo"); nomes.style.setProperty("--d", "250ms"); nomes.setAttribute("data-mo-fixo", ""); }
  marcar(".hero__lado .rotulo", "mo-rotulo", { d: 0 });
  marcar(".hero__lado .filete", "mo-filete", { d: 900 });
  marcar(".hero__data", "mo-sobe", { d: 1000 });
  marcar(".hero__lugar", "mo-sobe", { d: 1100 });
  marcar(".contagem", "mo-sobe", { d: 1200 });
  marcar(".hero__lado .btn", "mo-sobe", { d: 1320 });
  marcar(".hero__scroll", "mo-sobe", { d: 1500 });
  marcar(".hero__foto", "mo-foto", { d: 150 });
  var heroFoto = $(".hero__foto"); if (heroFoto) heroFoto.classList.add("mo-foto--lado");

  // títulos por palavra
  $$(".titulo").filter(foraDoModal).forEach(function (t) { dividir(t, false); t.classList.add("mo-alvo"); });

  marcar("main .rotulo:not(.hero__lado .rotulo), .rodape .rotulo", "mo-rotulo");
  marcar("main .filete:not(.hero__lado .filete)", "mo-filete");
  marcar("main .foto:not(.hero__foto)", "mo-foto");
  marcar(".boas .corpo, .historia .corpo, .rsvp .corpo, .presentes .corpo, .rodape .corpo, .ps, .assinatura, " +
    ".dia__data, .dia__hora, .dia__grade > div, .dia > .btn, .lista, .sem-obrigacao, .link-claro, .rodape__assina, .tobias-passeio", "mo-sobe");
  marcar(".paleta", "mo-paleta");
  $$(".paleta li").forEach(function (li, k) { li.style.setProperty("--k", k); });
  marcar(".roteiro", "mo-roteiro");
  $$(".roteiro li").forEach(function (li, k) { li.style.setProperty("--k", k); });
  marcar(".passos", "mo-passos");
  $$(".passos li").forEach(function (li, k) { li.style.setProperty("--k", k); });
  marcar("img.tobias", "mo-tobias");
  marcar(".rodape__mao", "mo-mao");

  // ícones que se desenham
  $$("main .ico").forEach(function (svg) {
    $$("path, circle, rect, line, polyline", svg).forEach(function (p) { p.setAttribute("pathLength", "1"); });
    var pai = svg.parentElement;
    pai.classList.add("mo-alvo", "mo-icones");
  });
  $$(".roteiro li").forEach(function (li) { li.classList.remove("mo-alvo"); }); // seguem o .roteiro

  /* ================= fotos: camada interna para zoom/parallax ================= */
  var camadas = [];
  $$(".foto").forEach(function (fig) {
    var c = document.createElement("div");
    c.className = "foto__img";
    c.setAttribute("aria-hidden", "true");
    fig.insertBefore(c, fig.firstChild);
    camadas.push({ fig: fig, img: c });
    var mover = function () {
      var bg = fig.style.backgroundImage;
      if (bg && bg !== "none") {
        c.style.backgroundImage = bg;
        fig.classList.add("mo-com-camada");
      }
    };
    mover();
    new MutationObserver(mover).observe(fig, { attributes: true, attributeFilter: ["style", "class"] });
  });

  /* ================= observador de entrada ================= */
  // elementos totalmente recortados (clip-path) não são "vistos" pelo observador:
  // nesses casos observamos o pai e repassamos a entrada
  var procuracao = new Map();
  function observar(el) {
    if (el.classList.contains("mo-foto") || el.classList.contains("mo-mao")) {
      var pai = el.parentElement;
      if (!procuracao.has(pai)) procuracao.set(pai, []);
      procuracao.get(pai).push(el);
      io.observe(pai);
    } else io.observe(el);
  }
  var io = new IntersectionObserver(function (es) {
    var entrando = [];
    es.forEach(function (e) {
      if (!e.isIntersecting) return;
      var lista = procuracao.get(e.target);
      if (lista) { procuracao.delete(e.target); io.unobserve(e.target); entrando = entrando.concat(lista); if (!e.target.classList.contains("mo-alvo") || e.target.classList.contains("in")) return; }
      entrando.push(e.target);
    });
    entrando.sort(function (a, b) { return a.compareDocumentPosition(b) & 4 ? -1 : 1; });
    entrando.forEach(function (el, i) {
      if (!el.hasAttribute("data-mo-fixo") && !el.classList.contains("mo-cartao")) el.style.setProperty("--d", (i * 90) + "ms");
      el.classList.add("in");
      io.unobserve(el);
      limparAoTerminar(el);
      if (el.classList.contains("mo-tobias")) setTimeout(function () { el.classList.add("mo-ok"); }, 1200);
      if (el.classList.contains("mo-foto")) setTimeout(function () { el.classList.add("mo-pronta"); }, 2800);
      if (el.classList.contains("mo-cartao")) aoMostrarCartao(el);
    });
  }, { rootMargin: "0px 0px -8% 0px", threshold: 0.01 });

  function comecar() {
    html.classList.remove("mo-intro-on");
    $$(".mo-alvo").forEach(observar);
  }

  /* ================= intro ================= */
  var intro = $(".mo-intro");
  if (intro && html.classList.contains("mo-intro-on")) {
    var saiu = false;
    var sair = function () {
      if (saiu) return; saiu = true;
      try { sessionStorage.setItem("mo-intro", "1"); } catch (e) {}
      intro.classList.add("sai");
      setTimeout(comecar, 450);
      setTimeout(function () { intro.remove(); }, 1300);
    };
    intro.addEventListener("click", sair);
    window.addEventListener("keydown", sair, { once: true });
    setTimeout(sair, 2300);
  } else {
    if (intro) intro.remove();
    comecar();
  }

  /* ================= cartões de presente (gerados pelo app.js) ================= */
  var cartoes = $("#cartoes");
  function prepararCartoes() {
    $$(".cartao:not([data-mo-ok])", cartoes).forEach(function (c, i) {
      c.setAttribute("data-mo-ok", "");
      c.classList.add("mo-alvo", "mo-cartao");
      c.style.setProperty("--d", ((i % 3) * 130) + "ms");
      var brilho = document.createElement("span");
      brilho.className = "cartao__brilho";
      c.appendChild(brilho);
      if (!html.classList.contains("mo-intro-on")) observar(c);
    });
  }
  function aoMostrarCartao(c) {
    var d = parseFloat(c.style.getPropertyValue("--d")) || 0;
    setTimeout(function () { c.classList.add("mo-cheio"); }, d + 300);
    setTimeout(function () { c.classList.remove("mo-cartao"); c.classList.add("mo-tilt"); }, d + 1500);
  }
  if (cartoes) {
    prepararCartoes();
    new MutationObserver(prepararCartoes).observe(cartoes, { childList: true });
    if (ponteiroFino) {
      cartoes.addEventListener("pointermove", function (e) {
        var c = e.target.closest(".cartao.mo-tilt"); if (!c) return;
        var r = c.getBoundingClientRect();
        var x = (e.clientX - r.left) / r.width, y = (e.clientY - r.top) / r.height;
        c.style.transform = "perspective(1000px) rotateX(" + ((0.5 - y) * 7).toFixed(2) + "deg) rotateY(" + ((x - 0.5) * 9).toFixed(2) + "deg) translateY(-6px)";
        c.style.setProperty("--gx", (x * 100) + "%");
        c.style.setProperty("--gy", (y * 100) + "%");
      });
      cartoes.addEventListener("pointerout", function (e) {
        var c = e.target.closest(".cartao.mo-tilt");
        if (c && !c.contains(e.relatedTarget)) c.style.transform = "";
      });
    }
  }

  /* ================= botões magnéticos ================= */
  if (ponteiroFino) {
    document.addEventListener("pointermove", function (e) {
      var b = e.target.closest && e.target.closest(".btn");
      if (!b || b.disabled || b.closest(".cartao") || b.classList.contains("mo-sobe")) return;
      var r = b.getBoundingClientRect();
      var dx = e.clientX - (r.left + r.width / 2), dy = e.clientY - (r.top + r.height / 2);
      b.classList.add("mo-ima");
      b.style.transform = "translate(" + (dx * 0.12).toFixed(1) + "px," + (dy * 0.3).toFixed(1) + "px)";
    });
    document.addEventListener("pointerout", function (e) {
      var b = e.target.closest && e.target.closest(".btn");
      if (b && !b.contains(e.relatedTarget)) b.style.transform = "";
    });
  }

  /* ================= topo fixo, link ativo, progresso ================= */
  var topo = $("#topo");
  var hero = $(".hero");
  var barra = document.createElement("div");
  barra.className = "mo-progresso";
  document.body.appendChild(barra);

  var links = {};
  $$("#nav a").forEach(function (a) { links[a.getAttribute("href").slice(1)] = a; });
  var ioNav = new IntersectionObserver(function (es) {
    es.forEach(function (e) {
      if (!e.isIntersecting) return;
      Object.keys(links).forEach(function (k) { links[k].classList.toggle("ativo", k === e.target.id); });
    });
  }, { rootMargin: "-45% 0px -50% 0px" });
  Object.keys(links).forEach(function (id) { var s = document.getElementById(id); if (s) ioNav.observe(s); });

  /* ================= loop: parallax, faixa, data gigante ================= */
  var faixa = $(".faixa__trilho"), faixaVisivel = false, fx = 0, larguraBloco = 0;
  var fundoDia = $(".dia__fundo"), dia = $(".dia");
  var ultimoY = window.scrollY, velocidade = 0, ultimoT = performance.now();

  if (faixa) {
    var medir = function () { var s = faixa.firstElementChild; larguraBloco = s ? s.getBoundingClientRect().width : 0; };
    medir();
    window.addEventListener("resize", medir);
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(medir);
    new IntersectionObserver(function (es) { faixaVisivel = es[0].isIntersecting; }).observe(faixa.parentElement);
  }

  function quadro(t) {
    var dt = Math.min(64, t - ultimoT); ultimoT = t;
    var y = window.scrollY, vh = window.innerHeight;
    velocidade += ((y - ultimoY) - velocidade) * 0.2; ultimoY = y;

    // progresso
    var total = document.documentElement.scrollHeight - vh;
    barra.style.setProperty("--p", total > 0 ? (y / total).toFixed(4) : 0);

    // topo fixo no desktop
    if (topo && hero) {
      var fixa = !celular() && y > hero.offsetHeight * 0.8;
      if (fixa !== topo.classList.contains("mo-fixa")) topo.classList.toggle("mo-fixa", fixa);
    }

    // parallax das fotos
    var amp = celular() ? 0.05 : 0.1;
    camadas.forEach(function (c) {
      var r = c.fig.getBoundingClientRect();
      if (r.bottom < -100 || r.top > vh + 100) return;
      var p = (r.top + r.height / 2 - vh / 2);
      c.img.style.setProperty("--py", (-p * amp).toFixed(1) + "px");
    });

    // data gigante no grande dia
    if (fundoDia && dia) {
      var rd = dia.getBoundingClientRect();
      if (rd.bottom > 0 && rd.top < vh) fundoDia.style.setProperty("--fx", ((rd.top - vh / 2) * 0.25).toFixed(1) + "px");
    }

    // faixa: anda sozinha e acelera com a rolagem
    if (faixa && faixaVisivel && larguraBloco) {
      fx -= (dt * 0.045) + Math.abs(velocidade) * 0.35;
      if (fx <= -larguraBloco) fx += larguraBloco;
      faixa.style.setProperty("--fx", fx.toFixed(1) + "px");
    }
    requestAnimationFrame(quadro);
  }
  requestAnimationFrame(quadro);

  /* ================= confete ================= */
  var cores = ["#8f4f3a", "#434b35", "#6b2e3e", "#79523e", "#315a5c", "#584238", "#fbf8f0", "#1d3a2b"];
  function confete(hospede, ox, oy) {
    var cv = document.createElement("canvas");
    cv.className = "mo-confete";
    (hospede || document.body).appendChild(cv);
    var dpr = Math.min(2, window.devicePixelRatio || 1);
    var W = cv.width = window.innerWidth * dpr, H = cv.height = window.innerHeight * dpr;
    var ctx = cv.getContext("2d");
    var ps = [];
    for (var i = 0; i < 160; i++) {
      var a = -Math.PI / 2 + (Math.random() - 0.5) * 1.9, v = (6 + Math.random() * 11) * dpr;
      ps.push({
        x: ox * dpr, y: oy * dpr, vx: Math.cos(a) * v, vy: Math.sin(a) * v,
        w: (5 + Math.random() * 7) * dpr, h: (8 + Math.random() * 12) * dpr,
        r: Math.random() * 6.28, vr: (Math.random() - 0.5) * 0.35,
        c: cores[i % cores.length], fase: Math.random() * 6.28
      });
    }
    var inicio = performance.now();
    (function passo(t) {
      var e = t - inicio;
      ctx.clearRect(0, 0, W, H);
      ps.forEach(function (p) {
        p.vy += 0.32 * dpr; p.vx *= 0.985; p.vy *= 0.985;
        p.x += p.vx + Math.sin(e / 300 + p.fase) * 0.8 * dpr; p.y += p.vy; p.r += p.vr;
        ctx.save();
        ctx.globalAlpha = Math.max(0, 1 - e / 3200);
        ctx.translate(p.x, p.y); ctx.rotate(p.r);
        ctx.scale(1, Math.abs(Math.cos(e / 180 + p.fase)));
        ctx.fillStyle = p.c; ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
        ctx.restore();
      });
      if (e < 3300) requestAnimationFrame(passo); else cv.remove();
    })(inicio);
  }
  window.moConfete = confete;

  // RSVP confirmado
  var st = $("#listaStatus");
  if (st) {
    new MutationObserver(function () {
      if (st.classList.contains("ok") && /confirmada/i.test(st.textContent) && !st.hasAttribute("data-festejou")) {
        st.setAttribute("data-festejou", "");
        var r = st.getBoundingClientRect();
        confete(document.body, r.left + Math.min(r.width, 300) / 2, r.top);
      }
      if (!st.classList.contains("ok")) st.removeAttribute("data-festejou");
    }).observe(st, { attributes: true, childList: true, characterData: true, subtree: true });
  }

  // cota reservada (dentro do modal)
  var dlg = $("#jornada"), passo4 = dlg && $('.etapa[data-passo="4"]', dlg);
  if (passo4) {
    new MutationObserver(function () {
      if (!passo4.hidden && dlg.open) {
        var r = passo4.getBoundingClientRect();
        confete(dlg, r.left + r.width / 2, r.top + 60);
      }
    }).observe(passo4, { attributes: true, attributeFilter: ["hidden"] });
  }
})();
