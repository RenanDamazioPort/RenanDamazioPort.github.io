(() => {
  const root = document.querySelector('.home-glitch-bg');
  const work = document.getElementById('work');
  if (!root || !work || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const canvas = document.createElement('canvas');
  canvas.className = 'tech-network';
  const burstLayer = document.createElement('div');
  burstLayer.className = 'tech-burst-layer';
  const ascii = document.createElement('div');
  ascii.className = 'tech-ascii-band';
  const scan = document.createElement('div');
  scan.className = 'tech-scan-slice';
  root.append(canvas, burstLayer, ascii, scan);

  const ctx = canvas.getContext('2d');
  const labels = [
    'ART_DIRECTION', 'NUBANK_JUROSJITSU', 'FEBRAFAR_VERAO', 'KEUNE_BLACK_FRIDAY',
    'BRAND_SYSTEM', 'AI_WORKFLOW', 'MIAMI_AD_SCHOOL', 'SUPER_CREATIVE',
    'CONCEPT_FIRST', 'VISUAL_IMPACT', 'CAMPAIGN_BUILD', 'RENAN_DAMAZIO'
  ];
  const bursts = [
    'ART_DIRECTION::SYSTEM_READY',
    'NUBANK_JUROSJITSU::CONCEPT_LOADED',
    'FEBRAFAR_VERAO::VISUAL_REBUILD',
    'KEUNE_BLACK_FRIDAY::CAMPAIGN_FRAME',
    'MIAMI_AD_SCHOOL::SUPER_CREATIVE',
    'AI_WORKFLOW::IMAGE_SEQUENCE_READY',
    'RENAN_DAMAZIO::ART_DIRECTOR_SP',
    'CONCEPT_FIRST::EXECUTION_NEXT',
    'BRAND_SYSTEM::VISUAL_LANGUAGE_ACTIVE'
  ];
  const asciiSets = [
    '.5Pzyo (<^|e ~tV/(|l/s|"i;/z== ++X0-- // SIGNAL_REWRITE',
    '001101 :: FRAME_SYNC :: +++X0X0 :: ART_DIRECTION :: 0x7F :: BUFFER',
    'NODE_07 / VISUAL_SYSTEM / INPUT_IDEA / RENDER_PASS / SIGNAL_OK / 110010'
  ];

  let dpr = 1, W = 0, H = 0, nodes = [], raf = 0, last = 0;
  const rand = (min, max) => min + Math.random() * (max - min);

  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 1.6);
    W = Math.max(320, innerWidth); H = Math.max(420, innerHeight);
    canvas.width = Math.floor(W * dpr); canvas.height = Math.floor(H * dpr);
    canvas.style.width = W + 'px'; canvas.style.height = H + 'px';
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    nodes = labels.map((label, i) => ({
      label,
      x: rand(W * .08, W * .92),
      y: rand(H * .14, H * .82),
      vx: rand(-4, 4), vy: rand(-2.5, 2.5),
      phase: rand(0, Math.PI * 2),
      alpha: rand(.16, .34),
      seed: (Math.random() * .18 + .012).toFixed(7),
      id: String(i + 1).padStart(2, '0')
    }));
  }

  function draw(t) {
    ctx.clearRect(0, 0, W, H);
    const dt = Math.min(.032, (t - last) / 1000 || .016); last = t;
    const inWork = root.classList.contains('is-work');
    const globalAlpha = inWork ? .34 : 1;

    nodes.forEach(n => {
      n.phase += dt * .32;
      n.x += Math.sin(n.phase) * n.vx * dt;
      n.y += Math.cos(n.phase * .8) * n.vy * dt;
    });

    ctx.save();
    ctx.globalAlpha = globalAlpha;
    ctx.lineWidth = .7;
    for (let i = 0; i < nodes.length; i++) {
      const a = nodes[i];
      const b = nodes[(i * 5 + 3) % nodes.length];
      if (!b || a === b) continue;
      const dist = Math.hypot(a.x - b.x, a.y - b.y);
      if (dist > W * .58) continue;
      ctx.strokeStyle = 'rgba(228,230,226,.105)';
      ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
    }

    nodes.forEach((n, i) => {
      const pulse = .62 + Math.sin(t * .0011 + n.phase) * .28;
      ctx.globalAlpha = globalAlpha * n.alpha * pulse;
      ctx.fillStyle = i % 4 === 0 ? 'rgba(215,255,63,.72)' : 'rgba(236,237,233,.72)';
      ctx.fillRect(n.x - 2, n.y - 2, 4, 4);
      ctx.strokeStyle = 'rgba(236,237,233,.30)';
      ctx.strokeRect(n.x - 5, n.y - 5, 10, 10);
      ctx.font = '8px Courier New, monospace';
      ctx.fillStyle = 'rgba(232,233,230,.66)';
      ctx.fillText(n.label, n.x + 8, n.y - 6);
      ctx.fillStyle = 'rgba(232,233,230,.44)';
      ctx.fillText(`${n.id} / ${n.seed}`, n.x + 8, n.y + 5);
    });
    ctx.restore();
    raf = requestAnimationFrame(draw);
  }

  function makeBurst() {
    if (document.hidden) return;
    const el = document.createElement('div');
    el.className = 'tech-burst';
    el.textContent = bursts[Math.floor(Math.random() * bursts.length)];
    el.style.left = rand(6, 68) + '%';
    el.style.top = rand(12, 82) + '%';
    el.style.setProperty('--life', rand(.85, 1.45).toFixed(2) + 's');
    burstLayer.appendChild(el);
    el.addEventListener('animationend', () => el.remove(), { once: true });
  }

  function makeGlitchBand() {
    if (document.hidden) return;
    ascii.textContent = asciiSets[Math.floor(Math.random() * asciiSets.length)];
    ascii.style.top = rand(20, 76) + '%';
    ascii.classList.remove('show');
    void ascii.offsetWidth;
    ascii.classList.add('show');

    scan.style.top = rand(14, 84) + '%';
    scan.classList.remove('show');
    void scan.offsetWidth;
    scan.classList.add('show');
  }

  function scheduleBurst() {
    window.setTimeout(() => { makeBurst(); scheduleBurst(); }, rand(1350, 3000));
  }
  function scheduleBand() {
    window.setTimeout(() => { makeGlitchBand(); scheduleBand(); }, rand(4300, 8200));
  }

  function updateScrollState() {
    const boundary = Math.min(innerHeight * .74, 640);
    root.classList.toggle('is-work', work.getBoundingClientRect().top <= boundary);
  }

  resize(); updateScrollState();
  raf = requestAnimationFrame(draw);
  scheduleBurst(); scheduleBand();
  addEventListener('resize', resize);
  addEventListener('scroll', updateScrollState, { passive: true });
  addEventListener('beforeunload', () => cancelAnimationFrame(raf), { once: true });
})();