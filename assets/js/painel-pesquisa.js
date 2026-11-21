/* ════════════════════════════════════════════════════════════════════
   Painel "Research at a glance" — só dados reais
     • calendário de contribuições do GitHub (últimos 12 meses)
     • repositórios públicos por linguagem
     • nuvem de palavras dos seus repositórios (tópicos, descrições e nomes)
     • toolkit (de data/toolkit.json)

   COMO USAR: no index.html, logo DEPOIS da linha do main.js, adicione:
     <script src="assets/js/painel-pesquisa.js"></script>
   ════════════════════════════════════════════════════════════════════ */

/* ✏️ CONFIGURAÇÃO ───────────────────────────────────────────────────── */
const PANEL = {
  githubUser: 'tomazrg',   // seu usuário do GitHub
  cloudWords: 45,          // quantas palavras na nuvem
  // palavras que você NÃO quer na nuvem (minúsculas)
  ignoreWords: ['tomazrg'],
  // palavras extras com peso, ex.: { 'epidemiology': 5 }
  extraWords: {},
  cacheHours: 6            // guarda os dados do GitHub por 6 h (evita limite da API)
};
/* ─────────────────────────────────────────────────────────────────── */

// Substitui os gráficos originais (radar + barras de habilidades)
async function initCharts() {
  panelStyles();
  window.__charts = {};          // o main.js não mexe mais nas cores destes gráficos
  window.__panelCharts = {};
  await Promise.allSettled([panelGithub(), panelToolkit()]);
  document.getElementById('theme-toggle')?.addEventListener('click', () => setTimeout(panelRetheme, 30));
}

/* ── Nuvem de palavras dos repositórios ──────────────────────────── */
const PANEL_STOP = new Set(('the and for with from this that these those using used use into via of in on to an a is are be by as at or its it our my your we i ' +
  'repo repos repository repositories github io page pages site website web code codes file files script scripts paper papers supplementary material ' +
  'readme project projects package packages example examples data dataset test tests new main version tool tools how what when which also can ' +
  'does do did due off pay under over low high based approach via per than all any each both such well more most other only very ' +
  'de da do das dos e em para com uma um os as no na nos nas por que se ao aos sobre entre mais').split(' '));
const PANEL_CASE = { dlnm: 'DLNM', bls: 'BLS', era5: 'ERA5', vpd: 'VPD', uav: 'UAV', cran: 'CRAN', gam: 'GAM', glmm: 'GLMM', ai: 'AI', ml: 'ML',
  ndvi: 'NDVI', yolo: 'YOLO', api: 'API', r: 'R', epiexposure: 'EpiExposure', r4pde: 'r4pde', ggplot2: 'ggplot2',
  'r package': 'R package', 'machine learning': 'machine learning', 'bls': 'BLS' };

function panelCloud(repos) {
  const el = document.getElementById('wordcloud');
  if (!el) return;
  const own = (repos || []).filter(r => !r.fork);
  const freq = new Map();
  const add = (w, k) => {
    w = w.toLowerCase().replace(/[-_]+/g, ' ').replace(/^[^a-z0-9à-ÿ]+|[^a-z0-9à-ÿ]+$/g, '').trim();
    if (w.length < 3 && !PANEL_CASE[w]) return;
    if (/^\d+$/.test(w) || PANEL_STOP.has(w) || PANEL.ignoreWords.includes(w)) return;
    freq.set(w, (freq.get(w) || 0) + k);
  };
  const words = t => (t || '').split(/[^A-Za-zÀ-ÿ0-9]+/).filter(Boolean);
  own.forEach(r => {
    const topics = (r.topics || []).map(t => t.replace(/-/g, ' '));
    const inTopic = new Set(topics.flatMap(t => t.split(' ')));
    topics.forEach(t => add(t, 3));                                        // tópicos (expressões) pesam mais
    r.name.split(/[-_.]+/).forEach(w => { if (!inTopic.has(w.toLowerCase())) add(w, 2); });
    words(r.description).forEach(w => { if (!inTopic.has(w.toLowerCase())) add(w, 1); });
  });
  Object.entries(PANEL.extraWords || {}).forEach(([w, k]) => add(w, k));
  const list = [...freq.entries()].sort((a, b) => b[1] - a[1]).slice(0, PANEL.cloudWords);
  if (!list.length) { el.innerHTML = '<p class="loading">Add descriptions and topics to your GitHub repositories to build this cloud.</p>'; return; }
  el._words = list;
  panelCloudLayout(el);
  if (!el._bound) {
    el._bound = true;
    let t; window.addEventListener('resize', () => { clearTimeout(t); t = setTimeout(() => panelCloudLayout(el), 200); }, { passive: true });
  }
}

function panelCloudLayout(el) {
  const list = el._words; if (!list) return;
  const W = el.clientWidth, H = el.clientHeight;
  const max = list[0][1], min = list[list.length - 1][1];
  const big = Math.max(24, Math.min(46, W / 12)), small = 11;
  const size = v => small + (big - small) * Math.sqrt((v - min) / Math.max(1, max - min));
  const ctx = document.createElement('canvas').getContext('2d');
  const colors = ['--brand', '--brand-2', '--sat', '--veg', '--gold', '--spectral'];
  const placed = [], out = [];
  list.forEach(([w, v], i) => {
    const label = PANEL_CASE[w] || w;
    const fs = size(v);
    ctx.font = `${i < 3 ? 800 : 700} ${fs}px Inter, sans-serif`;
    const bw = ctx.measureText(label).width + 6, bh = fs * 1.08;
    for (let t = 0; t < 900; t += 0.35) {          // espiral de Arquimedes a partir do centro
      const r = 3.2 * t;
      const x = W / 2 + r * Math.cos(t) * 1.6 - bw / 2;
      const y = H / 2 + r * Math.sin(t) * 0.75 - bh / 2;
      if (x < 2 || y < 2 || x + bw > W - 2 || y + bh > H - 2) { if (r > Math.max(W, H)) break; continue; }
      if (placed.some(p => x < p.x + p.w && x + bw > p.x && y < p.y + p.h && y + bh > p.y)) continue;
      placed.push({ x, y, w: bw, h: bh });
      out.push(`<span class="wc-word" style="left:${x.toFixed(1)}px;top:${y.toFixed(1)}px;font-size:${fs.toFixed(1)}px;font-weight:${i < 3 ? 800 : 700};` +
        `color:var(${colors[i % colors.length]});--o:${(0.55 + 0.45 * (v - min) / Math.max(1, max - min)).toFixed(2)};transition-delay:${(i * 25)}ms" ` +
        `title="${escapeAttr(label)}">${escapeHtml(label)}</span>`);
      break;
    }
  });
  el.innerHTML = out.join('');
  requestAnimationFrame(() => el.querySelectorAll('.wc-word').forEach(s => s.classList.add('in')));
}

/* ── GitHub: calendário + linguagens ─────────────────────────────── */
async function panelGithub() {
  const cal = document.getElementById('gh-calendar');
  const statsEl = document.getElementById('gh-stats');
  const user = PANEL.githubUser;
  const [contrib, repos, profile] = await Promise.allSettled([
    panelFetch(`https://github-contributions-api.jogruber.de/v4/${user}?y=last`, 'contrib'),
    panelFetch(`https://api.github.com/users/${user}/repos?per_page=100&type=owner&sort=updated`, 'repos'),
    panelFetch(`https://api.github.com/users/${user}`, 'profile')
  ]);

  const stats = [];
  // Calendário
  if (contrib.status === 'fulfilled' && cal) {
    const days = contrib.value.contributions || [];
    cal.innerHTML = panelCalendar(days);
    const total = contrib.value.total?.lastYear ?? days.reduce((s, d) => s + d.count, 0);
    const active = days.filter(d => d.count > 0).length;
    const { longest, current } = panelStreaks(days);
    stats.push([total, 'contributions in the last year'], [active, 'active days'], [longest, 'longest streak (days)'], [current, 'current streak (days)']);
    const sum = document.getElementById('outputs-summary');
    if (sum) sum.dataset.gh = `${total.toLocaleString('en-US')} GitHub contributions in the last year`;
    panelSummary();
  } else if (cal) {
    cal.innerHTML = `<p class="loading">GitHub activity is unavailable right now — see
      <a href="https://github.com/${user}" target="_blank" rel="noopener">github.com/${user}</a>.</p>`;
  }

  // Linguagens
  const langCanvas = document.getElementById('chart-langs');
  if (repos.status === 'fulfilled' && Array.isArray(repos.value)) {
    panelCloud(repos.value);
    const own = repos.value.filter(r => !r.fork);
    const stars = own.reduce((s, r) => s + (r.stargazers_count || 0), 0);
    const byLang = new Map();
    own.forEach(r => { const l = r.language || 'Other'; byLang.set(l, (byLang.get(l) || 0) + 1); });
    const sorted = [...byLang.entries()].sort((a, b) => b[1] - a[1]).slice(0, 8);
    stats.push([own.length, 'public repositories'], [stars, 'stars']);
    if (langCanvas && typeof Chart !== 'undefined' && sorted.length) {
      const c = chartColors();
      const opts = barOpts(c, true);
      delete opts.scales.x.max;
      opts.scales.x.ticks.precision = 0;
      opts.plugins.tooltip = { callbacks: { label: ctx => ` ${ctx.parsed.x} repositor${ctx.parsed.x === 1 ? 'y' : 'ies'}` } };
      window.__panelCharts.langs = new Chart(langCanvas, {
        type: 'bar',
        data: {
          labels: sorted.map(e => e[0]),
          datasets: [{ data: sorted.map(e => e[1]), backgroundColor: sorted.map(e => panelLangColor(e[0])), borderRadius: 6, maxBarThickness: 26 }]
        },
        options: opts
      });
    }
  } else {
    if (langCanvas) langCanvas.parentElement.innerHTML = '<p class="loading">Repository data is unavailable right now.</p>';
    const wc = document.getElementById('wordcloud');
    if (wc) wc.innerHTML = '<p class="loading">Keywords are unavailable right now.</p>';
  }
  if (profile.status === 'fulfilled' && profile.value?.followers != null) stats.push([profile.value.followers, 'followers']);

  if (statsEl) statsEl.innerHTML = stats.map(([n, l]) =>
    `<div class="gh-stat"><span class="gh-num">${Number(n).toLocaleString('en-US')}</span><span class="gh-lbl">${escapeHtml(l)}</span></div>`).join('');
}

function panelCalendar(days) {
  if (!days.length) return '<p class="loading">No contributions found.</p>';
  const first = new Date(days[0].date + 'T00:00:00');
  const pad = first.getDay();                         // começa no domingo, como no GitHub
  const cells = Array(pad).fill(null).concat(days);
  const weeks = Math.ceil(cells.length / 7);
  // rótulos dos meses: marca a semana em que um novo mês começa
  let months = '', last = -1;
  for (let w = 0; w < weeks; w++) {
    const d = cells.slice(w * 7, w * 7 + 7).find(Boolean);
    if (!d) continue;
    const dt = new Date(d.date + 'T00:00:00'), m = dt.getMonth();
    if (m !== last && w < weeks - 1) months += `<span style="grid-column:${w + 1}">${dt.toLocaleString('en-US', { month: 'short' })}</span>`;
    last = m;
  }
  const squares = cells.map(d => d
    ? `<i class="lv${d.level}" title="${d.count} contribution${d.count === 1 ? '' : 's'} on ${new Date(d.date + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}"></i>`
    : '<i class="empty"></i>').join('');
  return `<div class="gh-scroll"><div class="gh-wrap" style="--weeks:${weeks}">
      <div class="gh-months">${months}</div>
      <div class="gh-days">${squares}</div>
    </div></div>
    <div class="gh-legend">Less <i class="lv0"></i><i class="lv1"></i><i class="lv2"></i><i class="lv3"></i><i class="lv4"></i> More</div>`;
}

function panelStreaks(days) {
  let longest = 0, run = 0;
  days.forEach(d => { run = d.count > 0 ? run + 1 : 0; longest = Math.max(longest, run); });
  let current = 0;
  for (let i = days.length - 1; i >= 0; i--) {
    if (days[i].count > 0) current++;
    else if (i === days.length - 1) continue;          // hoje ainda pode estar vazio
    else break;
  }
  return { longest, current };
}

function panelSummary() {
  const el = document.getElementById('outputs-summary');
  if (!el) return;
  const parts = [el.dataset.pubs, el.dataset.gh].filter(Boolean);
  if (parts.length) el.textContent = parts.join(' · ');
}

const PANEL_LANG_COLORS = {
  'R': '#276DC3', 'Python': '#3572A5', 'HTML': '#e34c26', 'JavaScript': '#f1e05a', 'TeX': '#3D6117',
  'Jupyter Notebook': '#DA5B0B', 'CSS': '#563d7c', 'Shell': '#89e051', 'TypeScript': '#3178c6',
  'C++': '#f34b7d', 'Julia': '#a270ba', 'SCSS': '#c6538c', 'Quarto': '#75AADB', 'Other': '#8b949e'
};
function panelLangColor(l) { return PANEL_LANG_COLORS[l] || '#8b949e'; }

/* busca com cache no navegador */
async function panelFetch(url, key) {
  const k = `panel:${PANEL.githubUser}:${key}`;
  try {
    const hit = JSON.parse(localStorage.getItem(k) || 'null');
    if (hit && Date.now() - hit.t < PANEL.cacheHours * 3600e3) return hit.v;
  } catch {}
  const res = await fetch(url);
  if (!res.ok) throw new Error(`${res.status} ${url}`);
  const v = await res.json();
  try { localStorage.setItem(k, JSON.stringify({ t: Date.now(), v })); } catch {}
  return v;
}

/* ── Toolkit ─────────────────────────────────────────────────────── */
async function panelToolkit() {
  const root = document.getElementById('toolkit');
  if (!root) return;
  try {
    const groups = await getJSON('data/toolkit.json');
    root.innerHTML = groups.map(g => `
      <div class="tk-group">
        <h4>${g.icon ? `<i class="${escapeAttr(g.icon)}"></i> ` : ''}${escapeHtml(g.group)}</h4>
        <div class="tk-items">${(g.items || []).map(it => {
          const name = typeof it === 'string' ? it : it.name;
          const icon = typeof it === 'string' ? '' : (it.icon || '');
          const link = typeof it === 'string' ? '' : (it.link || '');
          const inner = `${icon ? `<i class="${escapeAttr(icon)}"></i>` : ''}${escapeHtml(name)}`;
          return link ? `<a class="tk-chip" href="${escapeAttr(link)}" target="_blank" rel="noopener">${inner}</a>` : `<span class="tk-chip">${inner}</span>`;
        }).join('')}</div>
      </div>`).join('');
  } catch {
    root.innerHTML = '<p class="loading">Add your tools in <code>data/toolkit.json</code>.</p>';
  }
}

/* ── tema claro/escuro ───────────────────────────────────────────── */
function panelRetheme() {
  const c = chartColors();
  Object.values(window.__panelCharts || {}).forEach(ch => {
    ['x', 'y'].forEach(a => { ch.options.scales[a].grid.color = c.grid; ch.options.scales[a].ticks.color = c.text; });
    ch.update();
  });
}

/* ── estilos do painel ───────────────────────────────────────────── */
function panelStyles() {
  if (document.getElementById('panel-css')) return;
  const s = document.createElement('style');
  s.id = 'panel-css';
  s.textContent = `
    .viz-card h3 i { color: var(--brand); margin-right: 6px; }
    .wordcloud { position: relative; height: 300px; overflow: hidden; }
    .wc-word { position: absolute; white-space: nowrap; line-height: 1.15; padding: 0 4px; letter-spacing: -.01em; cursor: default;
      transform: scale(.6); opacity: 0 !important; transition: transform .6s var(--ease), opacity .6s, text-shadow .2s; }
    .wc-word.in { transform: none; opacity: var(--o, 1) !important; }
    .wc-word.in:hover { transform: scale(1.12); text-shadow: 0 0 14px currentColor; z-index: 2; }
    .gh-stats { display: grid; grid-template-columns: repeat(auto-fit, minmax(120px, 1fr)); gap: 12px; margin-bottom: 22px; }
    .gh-stat { background: var(--surface-2); border: 1px solid var(--border); border-radius: 10px; padding: 12px 10px; text-align: center; }
    .gh-num { display: block; font-size: 1.45rem; font-weight: 800; background: var(--grad); -webkit-background-clip: text; background-clip: text; color: transparent; }
    .gh-lbl { display: block; font-size: .74rem; color: var(--muted); margin-top: 2px; }
    .gh-scroll { overflow-x: auto; padding-bottom: 6px; }
    .gh-wrap { --cell: 12px; --gap: 3px; width: max-content; margin: 0 auto; }
    .gh-months { display: grid; grid-template-columns: repeat(var(--weeks), var(--cell)); column-gap: var(--gap); font-size: .7rem; color: var(--muted); height: 16px; }
    .gh-months span { white-space: nowrap; }
    .gh-days { display: grid; grid-template-rows: repeat(7, var(--cell)); grid-auto-flow: column; grid-auto-columns: var(--cell); gap: var(--gap); }
    .gh-days i, .gh-legend i { display: block; width: var(--cell, 12px); height: var(--cell, 12px); border-radius: 3px; }
    .gh-days i.empty { visibility: hidden; }
    .lv0 { background: var(--surface-2); outline: 1px solid color-mix(in srgb, var(--border) 70%, transparent); outline-offset: -1px; }
    .lv1 { background: color-mix(in srgb, var(--brand) 30%, var(--surface-2)); }
    .lv2 { background: color-mix(in srgb, var(--brand) 55%, var(--surface-2)); }
    .lv3 { background: color-mix(in srgb, var(--brand) 80%, var(--surface-2)); }
    .lv4 { background: var(--brand); box-shadow: 0 0 6px color-mix(in srgb, var(--brand) 60%, transparent); }
    .gh-days i:hover { transform: scale(1.35); }
    .gh-legend { display: flex; align-items: center; justify-content: flex-end; gap: 4px; font-size: .72rem; color: var(--muted); margin-top: 10px; }
    .gh-legend i { width: 11px; height: 11px; }
    .toolkit { display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 22px; }
    .tk-group h4 { font-size: .82rem; text-transform: uppercase; letter-spacing: .08em; color: var(--muted); margin-bottom: 10px; }
    .tk-group h4 i { color: var(--brand); margin-right: 4px; }
    .tk-items { display: flex; flex-wrap: wrap; gap: 8px; }
    .tk-chip { display: inline-flex; align-items: center; gap: 7px; padding: 7px 12px; border-radius: 999px; font-size: .84rem; font-weight: 500;
      background: var(--surface-2); border: 1px solid var(--border); color: var(--text); text-decoration: none; transition: border-color .2s, transform .2s; }
    .tk-chip i { color: var(--brand); }
    .tk-chip:hover { border-color: var(--brand); transform: translateY(-2px); }
  `;
  document.head.appendChild(s);
}
