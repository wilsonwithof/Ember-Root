/* Ember Root – interacties. Vanilla JS, geen libraries. Respecteert prefers-reduced-motion. */
(() => {
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const finePointer = window.matchMedia('(pointer: fine)').matches;
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];

  /* ---------- Hero-titel woord per woord ---------- */
  const title = $('[data-split]');
  if (title) {
    let i = 0;
    const wrap = (node) => {
      [...node.childNodes].forEach((child) => {
        if (child.nodeType === 3) {
          const frag = document.createDocumentFragment();
          child.textContent.split(/(\s+)/).forEach((part) => {
            if (!part) return;
            if (/^\s+$/.test(part)) { frag.append(part); return; }
            const w = document.createElement('span'); w.className = 'w';
            const inner = document.createElement('span'); inner.textContent = part; inner.style.setProperty('--i', i++);
            w.append(inner); frag.append(w);
          });
          child.replaceWith(frag);
        } else if (child.nodeType === 1) wrap(child);
      });
    };
    title.setAttribute('aria-label', title.textContent);
    wrap(title);
    $$('.w', title).forEach((w) => w.setAttribute('aria-hidden', 'true'));
  }
  requestAnimationFrame(() => requestAnimationFrame(() => document.body.classList.add('is-loaded')));

  /* ---------- Reveal bij scroll (gestaffeld per groep) ---------- */
  const revealIO = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (!e.isIntersecting) return;
      e.target.classList.add('is-in');
      revealIO.unobserve(e.target);
    });
  }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });
  $$('.reveal').forEach((el) => {
    const sibs = [...el.parentElement.children].filter((c) => c.classList.contains('reveal'));
    el.style.setProperty('--d', `${sibs.indexOf(el) * 90}ms`);
    revealIO.observe(el);
  });
  $$('.day li').forEach((li) => revealIO.observe(li));

  /* ---------- Nav: compacter bij scroll + actieve link ---------- */
  const nav = $('#nav');
  const links = $$('.nav__links a');
  const sectionIO = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (!e.isIntersecting) return;
      links.forEach((a) => a.classList.toggle('is-active', a.getAttribute('href') === `#${e.target.id}`));
    });
  }, { rootMargin: '-45% 0px -50% 0px' });
  ['verhaal', 'smaken', 'ritueel', 'nieuwsbrief'].forEach((id) => { const s = document.getElementById(id); if (s) sectionIO.observe(s); });

  /* ---------- Scroll-gedreven effecten ---------- */
  const stamp = $('.stamp > svg');
  const parallax = $$('[data-parallax]');
  const quote = $('[data-words]');
  const steps = $$('.step');
  let qWords = [];
  if (quote) {
    const hot = ['gloed', 'vuur'];
    quote.setAttribute('aria-label', quote.textContent);
    quote.innerHTML = quote.textContent.split(' ').map((w) => {
      const clean = w.replace(/[^\wÀ-ÿ]/g, '').toLowerCase();
      return `<span class="qw${hot.includes(clean) ? ' is-hot' : ''}" aria-hidden="true">${w}</span>`;
    }).join(' ');
    qWords = $$('.qw', quote);
  }

  const onScroll = () => {
    const y = window.scrollY;
    const vh = window.innerHeight;
    nav.classList.toggle('is-scrolled', y > 20);
    if (reduce) return;
    if (stamp) stamp.style.setProperty('--rot', `${y * 0.25}deg`);
    parallax.forEach((el) => {
      const r = el.getBoundingClientRect();
      const mid = r.top + r.height / 2 - vh / 2;
      el.style.setProperty('--py', `${mid * parseFloat(el.dataset.parallax)}px`);
    });
    if (quote) {
      const r = quote.getBoundingClientRect();
      const p = Math.min(1, Math.max(0, (vh * 0.85 - r.top) / (vh * 0.5)));
      const n = Math.round(p * qWords.length);
      qWords.forEach((w, i) => {
        w.classList.toggle('on', i < n);
        w.classList.toggle('hot', i < n && w.classList.contains('is-hot'));
      });
    }
    let active = -1;
    steps.forEach((s, i) => { if (s.getBoundingClientRect().top < vh * 0.7) active = i; });
    steps.forEach((s, i) => s.classList.toggle('is-active', i === active));
  };
  let ticking = false;
  window.addEventListener('scroll', () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => { onScroll(); ticking = false; });
  }, { passive: true });
  onScroll();
  if (reduce) { qWords.forEach((w) => w.classList.add('on')); steps.forEach((s) => s.classList.add('is-active')); }

  /* ---------- Hero: muis-parallax ---------- */
  const area = $('[data-tilt-area]');
  if (area && finePointer && !reduce) {
    const layers = $$('[data-depth]', area);
    area.addEventListener('pointermove', (e) => {
      const r = area.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width - 0.5;
      const yy = (e.clientY - r.top) / r.height - 0.5;
      layers.forEach((l) => {
        const d = parseFloat(l.dataset.depth) * 18;
        l.style.setProperty('--mx', `${x * d}px`);
        l.style.setProperty('--my', `${yy * d}px`);
      });
    });
    area.addEventListener('pointerleave', () => layers.forEach((l) => { l.style.setProperty('--mx', '0px'); l.style.setProperty('--my', '0px'); }));
  }

  /* ---------- Hero: zwevende kruiden (canvas) ---------- */
  const canvas = $('.hero__herbs');
  if (canvas && !reduce) {
    const ctx = canvas.getContext('2d');
    const colors = ['#C07259', '#D9A93F', '#7C9A4E', '#8E2F3C', '#E3A58C', '#C9893F'];
    let w, h, dpr, parts = [], running = true;
    const size = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = canvas.clientWidth; h = canvas.clientHeight;
      canvas.width = w * dpr; canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    const make = (initial) => ({
      x: w * (0.25 + Math.random() * 0.5),
      y: initial ? Math.random() * h : -10,
      r: 1.5 + Math.random() * 3.5,
      len: 1 + Math.random() * 2.2,
      vy: 0.25 + Math.random() * 0.55,
      sway: Math.random() * Math.PI * 2,
      rot: Math.random() * Math.PI,
      vr: (Math.random() - 0.5) * 0.03,
      c: colors[(Math.random() * colors.length) | 0],
      a: 0.55 + Math.random() * 0.4,
    });
    size();
    parts = Array.from({ length: 34 }, () => make(true));
    window.addEventListener('resize', size);
    const tick = () => {
      if (!running) return;
      ctx.clearRect(0, 0, w, h);
      parts.forEach((p, i) => {
        p.sway += 0.015; p.y += p.vy; p.x += Math.sin(p.sway) * 0.35; p.rot += p.vr;
        if (p.y > h * 0.62) { p.a -= 0.02; }
        if (p.a <= 0 || p.y > h) parts[i] = make(false);
        ctx.save(); ctx.globalAlpha = Math.max(0, p.a); ctx.translate(p.x, p.y); ctx.rotate(p.rot);
        ctx.fillStyle = p.c; ctx.beginPath(); ctx.ellipse(0, 0, p.r * p.len, p.r, 0, 0, Math.PI * 2); ctx.fill(); ctx.restore();
      });
      requestAnimationFrame(tick);
    };
    new IntersectionObserver(([e]) => { const was = running; running = e.isIntersecting; if (running && !was) tick(); }).observe(canvas);
    tick();
  }

  /* ---------- Klok 07:00 → 15:00 en tellers ---------- */
  const clock = $('#clock');
  if (clock && !reduce) {
    const start = 7 * 60, end = 15 * 60, dur = 1800, t0 = performance.now() + 600;
    const fmt = (m) => `${String(Math.floor(m / 60)).padStart(2, '0')}:${String(Math.round(m % 60)).padStart(2, '0')}`;
    clock.textContent = fmt(start);
    const step = (t) => {
      const p = Math.min(1, Math.max(0, (t - t0) / dur));
      const e = 1 - Math.pow(1 - p, 3);
      clock.textContent = fmt(Math.round((start + (end - start) * e) / 5) * 5);
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }
  if (!reduce) {
    $$('[data-count]').forEach((el) => {
      const target = +el.dataset.count; el.textContent = '0';
      const t0 = performance.now() + 700;
      const step = (t) => {
        const p = Math.min(1, Math.max(0, (t - t0) / 1000));
        el.textContent = Math.round(target * (1 - Math.pow(1 - p, 3)));
        if (p < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    });
  }

  /* ---------- Video: speelt in beeld, met pauzeknop ---------- */
  const video = $('#steamVideo');
  const toggle = $('.video-toggle');
  if (video && toggle) {
    let userPaused = reduce;
    const setBtn = () => {
      const paused = video.paused;
      toggle.setAttribute('aria-pressed', String(paused));
      toggle.setAttribute('aria-label', paused ? 'Video afspelen' : 'Video pauzeren');
    };
    toggle.addEventListener('click', () => {
      if (video.paused) { userPaused = false; video.play().catch(() => {}); } else { userPaused = true; video.pause(); }
    });
    video.addEventListener('play', setBtn); video.addEventListener('pause', setBtn);
    new IntersectionObserver(([e]) => {
      if (e.isIntersecting && !userPaused) { video.preload = 'auto'; video.play().catch(() => {}); } else if (!e.isIntersecting) video.pause();
    }, { threshold: 0.35 }).observe(video);
    setBtn();
  }

  /* ---------- Smaakkaarten: 3D-tilt + omdraaien ---------- */
  $$('.card').forEach((card) => {
    const inner = $('.card__inner', card);
    const front = $('.card__front', card);
    const back = $('.card__back', card);
    const name = $('.card__front .card__name', card).textContent;
    if (finePointer && !reduce) {
      card.addEventListener('pointermove', (e) => {
        const r = card.getBoundingClientRect();
        const x = (e.clientX - r.left) / r.width - 0.5;
        const y = (e.clientY - r.top) / r.height - 0.5;
        inner.style.setProperty('--ry', `${x * 10}deg`);
        inner.style.setProperty('--rx', `${-y * 10}deg`);
      });
      card.addEventListener('pointerleave', () => { inner.style.setProperty('--ry', '0deg'); inner.style.setProperty('--rx', '0deg'); });
    }
    inner.addEventListener('click', () => {
      const flipped = card.classList.toggle('is-flipped');
      inner.setAttribute('aria-pressed', String(flipped));
      inner.setAttribute('aria-label', flipped ? `${name}, toon de voorkant` : `${name}, toon tasting notes`);
      front.setAttribute('aria-hidden', String(flipped));
      back.setAttribute('aria-hidden', String(!flipped));
    });
  });

  /* ---------- Trektimer (4:00) ---------- */
  const timer = $('.timer');
  const timeEl = $('#timerTime');
  const btn = $('#timerBtn');
  const ring = $('.timer__progress');
  if (timer && timeEl && btn && ring) {
    const TOTAL = 240, C = 276.46;
    let left = TOTAL, iv = null;
    const render = () => {
      timeEl.textContent = `${Math.floor(left / 60)}:${String(left % 60).padStart(2, '0')}`;
      ring.style.strokeDashoffset = String(C * (1 - left / TOTAL));
    };
    const stop = () => { clearInterval(iv); iv = null; };
    btn.addEventListener('click', () => {
      if (left === 0) { left = TOTAL; timer.classList.remove('is-done'); render(); btn.textContent = 'Start'; return; }
      if (iv) { stop(); btn.textContent = 'Verder'; return; }
      btn.textContent = 'Pauze';
      iv = setInterval(() => {
        left -= 1; render();
        if (left <= 0) { stop(); left = 0; timeEl.textContent = 'Klaar'; btn.textContent = 'Opnieuw'; timer.classList.add('is-done'); }
      }, 1000);
    });
    render();
  }
})();
