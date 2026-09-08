(() => {
  const RANDOM_CHARS = '_!X$0-+*#';
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduceMotion) return;

  const TARGETS = [
    'header .brand strong',
    'header .brand small',
    '.nav a',
    '.hero-top > span',
    '.hero-title > span:not(.hero-rotator)',
    '.hero-word',
    '.hero-cta',
    '.section-head > span',
    '.project-title',
    '.project-meta',
    '.about h2',
    '.skills span',
    '.contact h2',
    '.contact-links a',
    'footer span',
    '.modal-top > span',
    '.modal-top .close',
    '.modal-content h1',
    '.modal-content h2',
    '.modal-content h3',
    '.modal-content .eyebrow',
    '.modal-content .meta',
    '.modal-content .stat strong',
    '.modal-content .stat span'
  ].join(',');

  const prepared = new WeakSet();
  const animated = new WeakSet();

  function randomChar(previous = '') {
    let char = previous;
    while (char === previous) {
      char = RANDOM_CHARS[Math.floor(Math.random() * RANDOM_CHARS.length)];
    }
    return char;
  }

  function scrambleChar(sourceChar, previous = '') {
    if (/\s/.test(sourceChar)) return sourceChar;
    return randomChar(previous);
  }

  function speedFor(element, textLength) {
    const size = parseFloat(getComputedStyle(element).fontSize) || 16;
    let speed = size >= 42 ? 10 : size >= 22 ? 14 : 20;
    if (textLength > 30) speed = Math.min(speed, 12);
    return speed;
  }

  function durationFor(speed, length) {
    return Math.max(420, Math.min(1400, length * speed * 3.25));
  }

  function animateChunk(chunk) {
    if (!chunk || animated.has(chunk)) return;
    animated.add(chunk);

    const text = chunk.dataset.specialText || '';
    if (!text.trim()) return;

    const speed = speedFor(chunk, text.length);
    const duration = durationFor(speed, text.length);
    const phaseOneEnd = 0.42;
    const start = performance.now();
    let lastPaint = 0;

    chunk.classList.add('special-text-running');

    function render(now) {
      if (now - lastPaint < speed) {
        requestAnimationFrame(render);
        return;
      }
      lastPaint = now;

      const progress = Math.min(1, (now - start) / duration);
      const chars = new Array(text.length);

      if (progress < phaseOneEnd) {
        const local = progress / phaseOneEnd;
        const activeLength = Math.max(1, Math.ceil(text.length * local));
        let prev = '';
        for (let i = 0; i < text.length; i++) {
          if (i < activeLength) {
            chars[i] = scrambleChar(text[i], prev);
            prev = chars[i];
          } else {
            chars[i] = /\s/.test(text[i]) ? text[i] : '\u00A0';
          }
        }
      } else {
        const local = (progress - phaseOneEnd) / (1 - phaseOneEnd);
        const revealed = Math.floor(text.length * local);
        let prev = '';
        for (let i = 0; i < text.length; i++) {
          if (i < revealed) {
            chars[i] = text[i];
            prev = chars[i];
          } else if (i === revealed && !/\s/.test(text[i] || '')) {
            chars[i] = Math.floor(local * text.length * 2) % 2 === 0 ? '_' : randomChar(prev);
            prev = chars[i];
          } else {
            chars[i] = scrambleChar(text[i], prev);
            prev = chars[i];
          }
        }
      }

      chunk.textContent = chars.join('');

      if (progress < 1) {
        requestAnimationFrame(render);
      } else {
        chunk.textContent = text;
        chunk.classList.remove('special-text-running');
        chunk.classList.add('special-text-done');
      }
    }

    requestAnimationFrame(render);
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      observer.unobserve(entry.target);
      const delay = Number(entry.target.dataset.specialDelay || 0);
      window.setTimeout(() => animateChunk(entry.target), delay);
    });
  }, { rootMargin: '0px 0px -8% 0px', threshold: 0.12 });

  function wrapTextNode(node, index) {
    const text = node.nodeValue || '';
    if (!text.trim()) return null;

    const range = document.createRange();
    range.selectNodeContents(node);
    const width = range.getBoundingClientRect().width;

    const span = document.createElement('span');
    span.className = 'special-text-chunk';
    span.dataset.specialText = text;
    span.dataset.specialDelay = String((index % 6) * 34);
    span.textContent = text;
    if (width > 0 && text.length <= 44) span.style.minWidth = `${Math.ceil(width)}px`;
    node.replaceWith(span);
    observer.observe(span);
    return span;
  }

  function prepareElement(element) {
    if (!element || prepared.has(element)) return;
    if (element.closest('.hero-emoji-layer, .easter-overlay, .boot')) return;
    prepared.add(element);

    if (!element.hasAttribute('aria-label')) {
      const label = (element.innerText || element.textContent || '').replace(/\s+/g, ' ').trim();
      if (label) element.setAttribute('aria-label', label);
    }

    const walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT, {
      acceptNode(node) {
        if (!node.nodeValue || !node.nodeValue.trim()) return NodeFilter.FILTER_REJECT;
        const parent = node.parentElement;
        if (!parent || parent.classList.contains('special-text-chunk')) return NodeFilter.FILTER_REJECT;
        if (parent.closest('.hero-emoji-layer, .easter-overlay, .boot')) return NodeFilter.FILTER_REJECT;
        return NodeFilter.FILTER_ACCEPT;
      }
    });

    const nodes = [];
    let current;
    while ((current = walker.nextNode())) nodes.push(current);
    nodes.forEach((node, index) => wrapTextNode(node, index));
  }

  function scan(root = document) {
    if (root.matches?.(TARGETS)) prepareElement(root);
    root.querySelectorAll?.(TARGETS).forEach(prepareElement);
  }

  scan(document);

  const modal = document.getElementById('modalContent');
  if (modal) {
    new MutationObserver(() => scan(modal)).observe(modal, { childList: true, subtree: true });
  }
})();
