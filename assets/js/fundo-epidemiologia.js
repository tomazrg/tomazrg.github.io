/* ════════════════════════════════════════════════════════════════════
   Fundo animado — Epidemiologia (superfície de curvas)
   Uma superfície de exposição–defasagem desenhada só com curvas:
     • dezenas de linhas finas em perspectiva, formando um "tecido";
     • ondas de defasagem que percorrem a superfície de trás para a frente;
     • curvas principais com brilho e pulsos de luz correndo por elas;
     • as curvas se erguem suavemente perto do cursor.
   Sem textos, sem eixos.

   COMO USAR: no index.html, logo DEPOIS da linha do main.js, adicione:
     <script src="assets/js/fundo-epidemiologia.js"></script>
   ════════════════════════════════════════════════════════════════════ */

/* ✏️ CONFIGURAÇÃO ───────────────────────────────────────────────────── */
const EPI = {
  // Paleta das curvas (de trás para a frente da superfície)
  colors: ['#3b6cff', '#22c1d6', '#4fd49a', '#b9dc4f', '#f5c542', '#f5973a', '#ef5a3a'],
  lines: 38,          // quantidade de curvas finas (20–60)
  pulses: 6,          // pulsos de luz correndo pelas curvas principais
  speed: 1,           // velocidade geral (0.5 = mais lento, 2 = mais rápido)
  mouse: true,        // curvas reagem ao cursor
  // Trilho lateral: [escala, nome]
  rail: [
  ['1000 km', 'Continent'],
  ['100 km',  'Region'],
  ['100 m',   'Field'],
  ['1 m',     'Plant'],
  ['5 mm',    'Lesion'],
  ['20 µm',   'Spore']
]
};
/* ─────────────────────────────────────────────────────────────────── */

function initHeroCanvas() {
  epiApplyChrome();

  const canvas = document.getElementById('hero-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const hero = canvas.parentElement;
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  let w = 0, h = 0, dpr = 1, raf = null;
  let pulses = [];
  const HERO_U = [0.22, 0.5, 0.78];                 // curvas principais (posição na superfície)
  const mouse = { x: -9999, y: -9999, sx: -9999, sy: -9999, k: 0 };
  const palette = EPI.colors.map(epiHex);
  const isDark = () => document.documentElement.getAttribute('data-theme') !== 'light';

  /* brilho pré-renderizado */
  const glowCache = {};
  function glow(rgb) {
    const key = rgb.join(',');
    if (glowCache[key]) return glowCache[key];
    const s = 96, c = document.createElement('canvas');
    c.width = c.height = s;
    const g = c.getContext('2d');
    const rg = g.createRadialGradient(s / 2, s / 2, 0, s / 2, s / 2, s / 2);
    rg.addColorStop(0, `rgba(255,255,255,1)`);
    rg.addColorStop(0.12, `rgba(${key},0.9)`);
    rg.addColorStop(0.4, `rgba(${key},0.25)`);
    rg.addColorStop(1, `rgba(${key},0)`);
    g.fillStyle = rg; g.fillRect(0, 0, s, s);
    return (glowCache[key] = c);
  }

  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    w = hero.clientWidth; h = hero.clientHeight;
    canvas.width = w * dpr; canvas.height = h * dpr;
    canvas.style.width = w + 'px'; canvas.style.height = h + 'px';
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    pulses = Array.from({ length: EPI.pulses }, (_, i) => ({
      u: HERO_U[i % HERO_U.length],
      p: Math.random(),
      v: 0.05 + Math.random() * 0.035,
      trail: []
    }));
  }

  /* ── a superfície ───────────────────────────────────────────────── */
  const mobile = () => w < 760;
  function geom(u) {
    // projeção oblíqua: curvas "de trás" ficam mais altas e deslocadas
    return {
      x0: w * (mobile() ? -0.05 : 0.02) + u * w * 0.07,
      span: w * (mobile() ? 1.1 : 0.98) - w * 0.07,
      base: h * (mobile() ? 0.76 + 0.2 * u : 0.66 + 0.24 * u),
      H: h * (mobile() ? 0.22 : 0.4) * (0.75 + 0.25 * u)
    };
  }
  // altura normalizada da superfície no ponto x (0–1) da curva u, no tempo t
  function surf(x, u, t) {
    const wave = 0.5 + 0.5 * Math.sin(t * 0.55 - u * 5.2);           // onda de defasagem
    const swell = Math.sin(Math.PI * Math.min(1, Math.max(0, u * 0.9 + 0.08)));
    const A = (0.32 + 0.68 * wave) * (0.55 + 0.45 * swell);
    const c = 0.32 + 0.42 * u + 0.05 * Math.sin(t * 0.21 + u * 2.4);  // pico se desloca com a defasagem
    const s = 0.085 + 0.05 * u;
    const main = Math.exp(-((x - c) ** 2) / (2 * s * s));
    const c2 = c + 0.2 + 0.03 * Math.sin(t * 0.33 + u * 3);
    const second = 0.38 * (0.5 + 0.5 * Math.sin(t * 0.4 + u * 3.6)) * Math.exp(-((x - c2) ** 2) / (2 * (s * 0.8) ** 2));
    const ripple = 0.018 * Math.sin(x * 11 + t * 0.9 + u * 6) * (0.4 + 0.6 * wave);
    return A * (main + second) + ripple;
  }
  function point(x, u, t, g) {
    let X = g.x0 + x * g.span;
    let Y = g.base - g.H * surf(x, u, t);
    if (mouse.k > 0.001) {
      const dx = X - mouse.sx, dy = g.base - mouse.sy;
      Y -= 46 * mouse.k * Math.exp(-(dx * dx) / (2 * 140 * 140)) * Math.exp(-(dy * dy) / (2 * 170 * 170));
    }
    return [X, Y];
  }
  function colorAt(u) {
    const f = u * (palette.length - 1), i = Math.min(palette.length - 2, Math.floor(f)), k = f - i;
    return palette[i].map((v, j) => Math.round(v + (palette[i + 1][j] - v) * k));
  }
  // transparência ao longo da curva: some nas pontas e fica discreta sob o texto
  function strokeFor(g, rgb, a) {
    const gr = ctx.createLinearGradient(g.x0, 0, g.x0 + g.span, 0);
    const c = rgb.join(',');
    const left = mobile() ? 1 : (isDark() ? 0.2 : 0.16);
    a *= mobile() ? 0.55 : 1;
    gr.addColorStop(0, `rgba(${c},0)`);
    gr.addColorStop(0.08, `rgba(${c},${a * left})`);
    gr.addColorStop(0.46, `rgba(${c},${a * left})`);
    gr.addColorStop(0.68, `rgba(${c},${a})`);
    gr.addColorStop(0.9, `rgba(${c},${a * 0.8})`);
    gr.addColorStop(1, `rgba(${c},0)`);
    return gr;
  }
  function trace(u, t, g) {
    const step = Math.max(4, Math.round(w / 320)) / g.span;
    ctx.beginPath();
    for (let x = 0; x <= 1 + 1e-6; x += step) {
      const [X, Y] = point(x, u, t, g);
      x === 0 ? ctx.moveTo(X, Y) : ctx.lineTo(X, Y);
    }
  }

  function frame(ms) {
    const t = (ms / 1000) * EPI.speed;
    const dark = isDark();
    // suaviza o cursor
    const target = mouse.x > -999 && EPI.mouse ? 1 : 0;
    mouse.k += (target - mouse.k) * 0.06;
    if (mouse.x > -999) { mouse.sx += (mouse.x - mouse.sx) * 0.12; mouse.sy += (mouse.y - mouse.sy) * 0.12; }

    ctx.clearRect(0, 0, w, h);
    ctx.save();
    ctx.globalCompositeOperation = dark ? 'lighter' : 'source-over';
    ctx.lineCap = 'round'; ctx.lineJoin = 'round';

    // 1) tecido de curvas finas (de trás para a frente)
    const N = EPI.lines;
    for (let k = 0; k < N; k++) {
      const u = k / (N - 1), g = geom(u), rgb = colorAt(u);
      trace(u, t, g);
      ctx.strokeStyle = strokeFor(g, rgb, dark ? 0.34 : 0.42);
      ctx.lineWidth = 0.9;
      ctx.stroke();
    }

    // 2) curvas principais com brilho
    for (const u of HERO_U) {
      const g = geom(u), rgb = colorAt(u);
      trace(u, t, g);
      ctx.strokeStyle = strokeFor(g, rgb, dark ? 0.16 : 0.12);
      ctx.lineWidth = 9; ctx.stroke();
      ctx.strokeStyle = strokeFor(g, rgb, dark ? 0.35 : 0.3);
      ctx.lineWidth = 3.5; ctx.stroke();
      ctx.strokeStyle = strokeFor(g, dark ? rgb.map(v => Math.min(255, v + 70)) : rgb, 1);
      ctx.lineWidth = 1.6; ctx.stroke();
    }

    // 3) pulsos de luz correndo pelas curvas principais
    for (const p of pulses) {
      if (!reduced) p.p += p.v / 60 * EPI.speed;
      if (p.p > 1.05) { p.p = -0.05; p.trail = []; p.v = 0.05 + Math.random() * 0.035; }
      const x = Math.max(0, Math.min(1, p.p));
      const g = geom(p.u), rgb = colorAt(p.u);
      const [X, Y] = point(x, p.u, t, g);
      p.trail.push([X, Y]); if (p.trail.length > 26) p.trail.shift();
      const edge = Math.min(1, x / 0.1, (1 - x) / 0.1);
      const fadeLeft = x < 0.48 && !mobile() ? 0.3 : 1;
      if (p.trail.length > 2) {
        ctx.beginPath();
        p.trail.forEach(([a, b], i) => i ? ctx.lineTo(a, b) : ctx.moveTo(a, b));
        const [sx, sy] = p.trail[0];
        const tg = ctx.createLinearGradient(sx, sy, X, Y);
        tg.addColorStop(0, `rgba(${rgb},0)`);
        tg.addColorStop(1, `rgba(255,255,255,${0.85 * edge * fadeLeft})`);
        ctx.strokeStyle = tg; ctx.lineWidth = 2.2; ctx.stroke();
      }
      ctx.globalAlpha = edge * fadeLeft * (dark ? 1 : 0.7);
      const s = 34;
      ctx.drawImage(glow(rgb), X - s / 2, Y - s / 2, s, s);
      ctx.globalAlpha = 1;
    }
    ctx.restore();

    if (!reduced) raf = requestAnimationFrame(frame);
  }

  hero.addEventListener('pointermove', e => {
    const r = hero.getBoundingClientRect();
    mouse.x = e.clientX - r.left; mouse.y = e.clientY - r.top;
    if (mouse.sx < -999) { mouse.sx = mouse.x; mouse.sy = mouse.y; }
  });
  hero.addEventListener('pointerleave', () => { mouse.x = -9999; mouse.y = -9999; });
  window.addEventListener('resize', () => { resize(); if (reduced) frame(8000); }, { passive: true });
  document.getElementById('theme-toggle')?.addEventListener('click', () => { if (reduced) setTimeout(() => frame(8000), 0); });

  resize();
  if (reduced) { frame(8000); return; }
  new IntersectionObserver(([e]) => {
    if (e.isIntersecting) { if (!raf) raf = requestAnimationFrame(frame); }
    else { cancelAnimationFrame(raf); raf = null; }
  }).observe(hero);
}

/* limpa o cenário herdado (piso quadriculado, linhas de varredura, ícones) */
function epiApplyChrome() {
  const css = document.createElement('style');
  css.textContent = `
    .hero-bg::before, .hero-bg::after { display: none; }
    .hero-bg {
      background:
        radial-gradient(55% 45% at 72% 78%, color-mix(in srgb, #f5a53a 14%, transparent), transparent 70%),
        radial-gradient(50% 40% at 45% 70%, color-mix(in srgb, #22c1d6 9%, transparent), transparent 70%),
        radial-gradient(80% 60% at 10% 5%, color-mix(in srgb, var(--brand) 16%, transparent), transparent 70%);
    }
    .hero-flyer { display: none !important; }
  `;
  document.head.appendChild(css);

  document.querySelectorAll('#scale-rail .rail-stop').forEach((stop, i) => {
    if (!EPI.rail[i]) return;
    const sc = stop.querySelector('.rail-scale'), nm = stop.querySelector('.rail-name');
    if (sc) sc.textContent = EPI.rail[i][0];
    if (nm) nm.textContent = EPI.rail[i][1];
  });
}

function epiHex(hex) {
  hex = hex.replace('#', '');
  if (hex.length === 3) hex = hex.split('').map(x => x + x).join('');
  const n = parseInt(hex, 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}
