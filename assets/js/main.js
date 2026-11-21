/* ════════════════════════════════════════════════════════════════════
   Portfólio acadêmico — interações e animações
   Todo o conteúdo vem de /data/*.json, então o site é fácil de atualizar.
   ════════════════════════════════════════════════════════════════════ */

/* ✏️ CONFIGURAÇÃO PESSOAL — edite só este bloco ─────────────────────── */
const SITE = {
  // Formas como seu nome aparece na lista de autores dos artigos.
  // Elas ficam em negrito, e artigos onde você é 1º autor sobem na lista.
  authorNames: ['Tomaz, R. G.', 'Tomáz, R. G.', 'Tomaz, R.', 'Tomáz, R.', 'R. G. Tomaz', 'R. G. Tomáz', 'Ricardo Gomes Tomáz', 'Ricardo Tomáz'],
  // Frases do efeito "máquina de escrever" do topo.
  // ATENÇÃO: cada frase fica entre aspas simples. Não use apóstrofo (') dentro delas.
  typedPhrases: ['to disease risk', 'to crop protection', 'to decisions in the field', 'to sustainable management', 'to applied science'],
  // Idioma das datas: 'pt-BR' (português) ou 'en-US' (inglês).
  locale: 'pt-BR'
};
/* ─────────────────────────────────────────────────────────────────── */

document.addEventListener('DOMContentLoaded', () => {
  // Each step is isolated so a single failure can never blank the whole page.
  const run = fn => { try { fn(); } catch (err) { console.error(`[init] ${fn.name} failed:`, err); } };
  [
    initYear, initTheme, initNav, initScrollFx, initScaleRail, initReveal, initCounters,
    initHeroCanvas, initTyped, initTilt,
    loadJourney, loadProjects, loadPublications, loadBlog, loadAwards,
    loadMentees, loadGallery, initCharts
  ].forEach(run);
});

/* ── Footer year ─────────────────────────────────────────────────── */
function initYear() {
  document.getElementById('year').textContent = new Date().getFullYear();
}

/* ── Theme toggle (persisted) ────────────────────────────────────── */
function initTheme() {
  const btn = document.getElementById('theme-toggle');
  const saved = localStorage.getItem('theme');
  const theme = saved || 'dark';
  applyTheme(theme);
  btn.addEventListener('click', () => {
    const next = document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    applyTheme(next);
    localStorage.setItem('theme', next);
    if (window.__charts) refreshChartTheme();
  });
}
function applyTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
  const icon = document.querySelector('#theme-toggle i');
  if (icon) icon.className = theme === 'dark' ? 'fa-solid fa-sun' : 'fa-solid fa-moon';
}

/* ── Mobile nav + active link ────────────────────────────────────── */
function initNav() {
  const toggle = document.getElementById('nav-toggle');
  const links = document.getElementById('nav-links');
  toggle.addEventListener('click', () => links.classList.toggle('open'));
  links.querySelectorAll('a').forEach(a =>
    a.addEventListener('click', () => links.classList.remove('open'))
  );

  const sections = [...document.querySelectorAll('section[id]')];
  const navAnchors = [...links.querySelectorAll('a[href^="#"]')];
  const spy = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        navAnchors.forEach(a => a.classList.remove('active'));
        const match = links.querySelector(`a[href="#${e.target.id}"]`);
        if (match) match.classList.add('active');
      }
    });
  }, { rootMargin: '-45% 0px -50% 0px' });
  sections.forEach(s => spy.observe(s));
}

/* ── Navbar shadow, progress bar, back-to-top ────────────────────── */
function initScrollFx() {
  const navbar = document.getElementById('navbar');
  const progress = document.getElementById('scroll-progress');
  const toTop = document.getElementById('back-to-top');
  const onScroll = () => {
    const y = window.scrollY;
    navbar.classList.toggle('scrolled', y > 12);
    toTop.classList.toggle('show', y > 600);
    const h = document.documentElement.scrollHeight - window.innerHeight;
    progress.style.width = (y / h * 100) + '%';
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
}

/* ── Scale rail — altimeter that descends satellite → genome ──────── */
function initScaleRail() {
  const rail = document.getElementById('scale-rail');
  const fill = document.getElementById('rail-fill');
  if (!rail || !fill) return;
  const stops = [...rail.querySelectorAll('.rail-stop')];
  const marks = stops.map(s => parseFloat(s.dataset.progress) || 0);
  const trackH = () => rail.getBoundingClientRect().height - 20; // minus vertical padding

  const update = () => {
    const h = document.documentElement.scrollHeight - window.innerHeight;
    const p = h > 0 ? Math.min(1, Math.max(0, window.scrollY / h)) : 0;
    fill.style.height = (p * trackH()) + 'px';
    // nearest stop to the current progress becomes active
    let nearest = 0, best = Infinity;
    marks.forEach((m, i) => { const d = Math.abs(m - p); if (d < best) { best = d; nearest = i; } });
    stops.forEach((s, i) => s.classList.toggle('active', i === nearest));
  };
  window.addEventListener('scroll', update, { passive: true });
  window.addEventListener('resize', update, { passive: true });
  update();
}

/* ── Reveal-on-scroll ────────────────────────────────────────────── */
function initReveal() {
  const io = new IntersectionObserver((entries) => {
    entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('visible'); io.unobserve(e.target); } });
  }, { threshold: 0.12 });
  document.querySelectorAll('.section-head, .about-grid, .about-card').forEach(el => {
    el.classList.add('reveal'); io.observe(el);
  });
  window.__revealObserver = io;
}
function observeReveal(el) {
  el.classList.add('reveal');
  if (window.__revealObserver) window.__revealObserver.observe(el);
  else el.classList.add('visible');
}

/* ── Animated stat counters ──────────────────────────────────────── */
function initCounters() {
  const strip = document.getElementById('stats-strip');
  const nums = strip.querySelectorAll('.stat-num');
  let done = false;
  const io = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting && !done) {
        done = true;
        nums.forEach(n => {
          const target = +n.dataset.count;
          let cur = 0;
          const step = Math.max(1, Math.ceil(target / 40));
          const t = setInterval(() => {
            cur += step;
            if (cur >= target) { cur = target; clearInterval(t); }
            n.textContent = cur;
          }, 28);
        });
      }
    });
  }, { threshold: 0.5 });
  io.observe(strip);
}

/* ── Generic JSON fetch helper ───────────────────────────────────── */
async function getJSON(path) {
  const res = await fetch(path, { cache: 'no-cache' });
  if (!res.ok) throw new Error(`Failed to load ${path}`);
  return res.json();
}

/* ── Journey timeline ────────────────────────────────────────────── */
async function loadJourney() {
  const root = document.getElementById('timeline');
  try {
    const items = await getJSON('data/journey.json');
    root.innerHTML = items.map(it => `
      <div class="tl-item" data-type="${it.type || 'research'}">
        <span class="tl-date">${escapeHtml(it.date)}</span>
        <div class="tl-card">
          <div class="tl-head">
            ${it.logo ? `<span class="tl-logo"><img src="${escapeAttr(it.logo)}" alt="${escapeAttr(it.org || '')} logo" loading="lazy"></span>` : ''}
            <div class="tl-head-text">
              <h3>${escapeHtml(it.title)}</h3>
              <p class="tl-org">${escapeHtml(it.org || '')}</p>
            </div>
          </div>
          <p>${escapeHtml(it.description || '')}</p>
        </div>
      </div>`).join('');
    root.querySelectorAll('.tl-item').forEach(observeReveal);
  } catch (e) {
    root.innerHTML = `<p class="loading">Não foi possível carregar a trajetória.</p>`;
  }
}

/* ── Projects + filters ──────────────────────────────────────────── */
let _projects = [];
async function loadProjects() {
  const grid = document.getElementById('projects-grid');
  const filters = document.getElementById('project-filters');
  grid.innerHTML = `<p class="loading">Carregando projetos…</p>`;
  try {
    _projects = await getJSON('data/projects.json');
    const cats = ['All', ...new Set(_projects.flatMap(p => p.categories || []))];
    filters.innerHTML = cats.map((c, i) =>
      `<button class="filter-btn ${i === 0 ? 'active' : ''}" data-cat="${escapeAttr(c)}">${escapeHtml(c)}</button>`
    ).join('');
    filters.querySelectorAll('.filter-btn').forEach(btn =>
      btn.addEventListener('click', () => {
        filters.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        renderProjects(btn.dataset.cat);
      })
    );
    renderProjects('All');
  } catch (e) {
    grid.innerHTML = `<p class="loading">Não foi possível carregar os projetos.</p>`;
  }
}
function renderProjects(cat) {
  const grid = document.getElementById('projects-grid');
  const list = cat === 'All' ? _projects : _projects.filter(p => (p.categories || []).includes(cat));
  grid.innerHTML = list.map(p => `
    <article class="project-card">
      <div class="pc-icon"><i class="${escapeAttr(p.icon || 'fa-solid fa-code')}"></i></div>
      <h3 class="pc-title">${escapeHtml(p.title)}</h3>
      <p class="pc-desc">${escapeHtml(p.description)}</p>
      <div class="pc-tags">${(p.tags || []).map(t => `<span>${escapeHtml(t)}</span>`).join('')}</div>
      <div class="pc-links">
        ${p.repo ? `<a href="${escapeAttr(p.repo)}" target="_blank" rel="noopener"><i class="fa-brands fa-github"></i> Código</a>` : ''}
        ${p.demo ? `<a href="${escapeAttr(p.demo)}" target="_blank" rel="noopener"><i class="fa-solid fa-arrow-up-right-from-square"></i> Demo</a>` : ''}
      </div>
    </article>`).join('');
  grid.querySelectorAll('.project-card').forEach(observeReveal);
}

/* ── Publications ────────────────────────────────────────────────── */
async function loadPublications() {
  const root = document.getElementById('pub-list');
  root.innerHTML = `<p class="loading">Carregando publicações…</p>`;
  try {
    const pubs = await getJSON('data/publications.json');
    const isFirstAuthor = publication => authorPattern(true).test(publication.authors || '');
    pubs.sort((first, second) => (second.year || 0) - (first.year || 0) || Number(isFirstAuthor(second)) - Number(isFirstAuthor(first)));
    root.innerHTML = pubs.map(p => `
      <article class="pub-item">
        <span class="pub-year">${escapeHtml(String(p.year || '—'))}</span>
        <div class="pub-body">
          <h3>${escapeHtml(p.title)}</h3>
          <p class="pub-authors">${highlightAuthor(p.authors || '')}</p>
          <p class="pub-venue">${escapeHtml(p.venue || '')}</p>
          <div class="pub-links">
            ${p.link ? `<a href="${escapeAttr(p.link)}" target="_blank" rel="noopener"><i class="fa-solid fa-link"></i> Ver</a>` : ''}
            ${p.pdf ? `<a href="${escapeAttr(p.pdf)}" target="_blank" rel="noopener"><i class="fa-solid fa-file-pdf"></i> PDF</a>` : ''}
            ${p.doi ? `<a href="https://doi.org/${escapeAttr(p.doi)}" target="_blank" rel="noopener"><i class="fa-solid fa-fingerprint"></i> DOI</a>` : ''}
            ${p.scholar ? `<a href="${escapeAttr(p.scholar)}" target="_blank" rel="noopener"><i class="fa-solid fa-graduation-cap"></i> Scholar</a>` : ''}
          </div>
        </div>
      </article>`).join('');
    root.querySelectorAll('.pub-item').forEach(observeReveal);
  } catch (e) {
    root.innerHTML = `<p class="loading">Não foi possível carregar as publicações.</p>`;
  }
}
function highlightAuthor(authors) {
  return escapeHtml(authors).replace(authorPattern(false), '<b>$1</b>');
}
function authorPattern(atStart) {
  const alts = SITE.authorNames
    .map(n => escapeHtml(n).replace(/[.*+?^${}()|[\]\\]/g, '\\$&').replace(/\s+/g, '\\s*'))
    .join('|');
  return atStart ? new RegExp(`^\\s*(?:${alts})`, 'i') : new RegExp(`(${alts})`, 'gi');
}

/* ── Blog ────────────────────────────────────────────────────────── */
let _posts = [];
async function loadBlog() {
  const grid = document.getElementById('blog-grid');
  grid.innerHTML = `<p class="loading">Carregando posts…</p>`;
  try {
    _posts = await getJSON('data/blog/posts.json');
    _posts.sort((a, b) => new Date(b.date) - new Date(a.date));
    renderLatestPost(_posts[0]);
    grid.innerHTML = _posts.map((p, i) => `
      <article class="blog-card" data-idx="${i}">
        <div class="blog-cover"></div>
        <div class="blog-inner">
          <div class="blog-meta">
            <span><i class="fa-regular fa-calendar"></i> ${formatDate(p.date)}</span>
            <span><i class="fa-regular fa-clock"></i> ${escapeHtml(p.readTime || '3 min')}</span>
          </div>
          <h3>${escapeHtml(p.title)}</h3>
          <p class="blog-excerpt">${escapeHtml(p.excerpt || '')}</p>
          <div class="blog-tags">${(p.tags || []).map(t => `<span>${escapeHtml(t)}</span>`).join('')}</div>
          <span class="blog-read">Ler mais <i class="fa-solid fa-arrow-right"></i></span>
        </div>
      </article>`).join('');
    grid.querySelectorAll('.blog-card').forEach(card => {
      observeReveal(card);
      card.addEventListener('click', () => openPost(+card.dataset.idx, true));
    });
    const requestedPost = new URLSearchParams(location.search).get('post');
    const requestedIndex = _posts.findIndex(post => postSlug(post) === requestedPost);
    if (requestedIndex >= 0) openPost(requestedIndex);
  } catch (e) {
    grid.innerHTML = `<p class="loading">Nenhum post ainda — adicione em <code>data/blog/</code>.</p>`;
  }
  initModal();
}
function renderLatestPost(post) {
  if (!post) return;
  const link = document.getElementById('latest-post-link');
  document.getElementById('latest-post-title').textContent = post.title;
  document.getElementById('latest-post-excerpt').textContent = post.excerpt || '';
  document.getElementById('latest-post-meta').innerHTML =
    `<i class="fa-regular fa-calendar"></i> ${formatDate(post.date)} &nbsp;·&nbsp; ${escapeHtml(post.readTime || '3 min')} de leitura`;
  link.href = `?post=${encodeURIComponent(postSlug(post))}`;
  link.addEventListener('click', event => {
    event.preventDefault();
    openPost(0, true);
  });
}
function postSlug(post) {
  return post.file.replace(/\.md$/, '');
}
async function openPost(idx, updateUrl = false) {
  const post = _posts[idx];
  const modal = document.getElementById('post-modal');
  const body = document.getElementById('post-content');
  body.innerHTML = `<p class="loading">Carregando…</p>`;
  openModal();
  if (updateUrl) {
    const url = new URL(location.href);
    url.searchParams.set('post', postSlug(post));
    history.replaceState(null, '', url);
  }
  try {
    const md = await fetch(`data/blog/${post.file}`, { cache: 'no-cache' }).then(r => r.text());
    body.innerHTML =
      `<div class="post-head-meta"><i class="fa-regular fa-calendar"></i> ${formatDate(post.date)} · ${escapeHtml(post.readTime || '3 min')} de leitura</div>` +
      marked.parse(md);
  } catch (e) {
    body.innerHTML = `<p>Não foi possível carregar este post.</p>`;
  }
}

/* ── Modal control ───────────────────────────────────────────────── */
function initModal() {
  const modal = document.getElementById('post-modal');
  if (modal.dataset.bound) return;
  modal.dataset.bound = '1';
  modal.querySelectorAll('[data-close]').forEach(el => el.addEventListener('click', closeModal));
  document.addEventListener('keydown', e => { if (e.key === 'Escape') closeModal(); });
}
function openModal() {
  document.getElementById('post-modal').classList.add('open');
  document.body.style.overflow = 'hidden';
}
function closeModal() {
  document.getElementById('post-modal').classList.remove('open');
  document.body.style.overflow = '';
}

/* ── Awards ──────────────────────────────────────────────────────── */
async function loadAwards() {
  const grid = document.getElementById('awards-grid');
  grid.innerHTML = `<p class="loading">Carregando prêmios…</p>`;
  try {
    const awards = await getJSON('data/awards.json');
    grid.innerHTML = awards.map(a => `
      <article class="award-card">
        <div class="award-medal"><i class="${escapeAttr(a.icon || 'fa-solid fa-trophy')}"></i></div>
        <h3>${escapeHtml(a.title)}</h3>
        <p class="award-org">${escapeHtml(a.org || '')}</p>
        <p class="award-year">${escapeHtml(String(a.year || ''))}</p>
        <p class="award-story">${escapeHtml(a.story || '')}</p>
      </article>`).join('');
    grid.querySelectorAll('.award-card').forEach(observeReveal);
  } catch (e) {
    grid.innerHTML = `<p class="loading">Não foi possível carregar os prêmios.</p>`;
  }
}

/* ── Mentorship ──────────────────────────────────────────────────── */
async function loadMentees() {
  const grid = document.getElementById('mentor-grid');
  if (!grid) return;
  grid.innerHTML = `<p class="loading">Carregando…</p>`;
  try {
    const mentees = await getJSON('data/mentees.json');
    grid.innerHTML = mentees.map(m => `
      <article class="mentor-card">
        <div class="mentor-photo"><img src="${escapeAttr(m.photo || 'assets/profile.jpg')}" alt="${escapeAttr(m.name)}" loading="lazy" onerror="this.src='https://ui-avatars.com/api/?name=${encodeURIComponent(m.name)}&background=2563eb&color=fff&size=200'"></div>
        <h3>${escapeHtml(m.name)}</h3>
        ${m.role ? `<p class="mentor-role">${escapeHtml(m.role)}</p>` : ''}
        <p class="mentor-univ">${escapeHtml(m.university || '')}</p>
        <div class="mentor-links">
          ${m.linkedin ? `<a href="${escapeAttr(m.linkedin)}" target="_blank" rel="noopener" title="LinkedIn"><i class="fa-brands fa-linkedin-in"></i></a>` : ''}
          ${m.scholar ? `<a href="${escapeAttr(m.scholar)}" target="_blank" rel="noopener" title="Scholar"><i class="fa-solid fa-graduation-cap"></i></a>` : ''}
          ${m.email ? `<a href="mailto:${escapeAttr(m.email)}" title="Email"><i class="fa-solid fa-envelope"></i></a>` : ''}
        </div>
      </article>`).join('');
    grid.querySelectorAll('.mentor-card').forEach(observeReveal);
  } catch (e) {
    grid.innerHTML = `<p class="loading">Adicione as pessoas que você orienta em <code>data/mentees.json</code>.</p>`;
  }
}

/* ── Gallery + lightbox ──────────────────────────────────────────── */
let _gallery = [];
async function loadGallery() {
  const grid = document.getElementById('gallery-grid');
  if (!grid) return;
  grid.innerHTML = `<p class="loading">Carregando…</p>`;
  try {
    _gallery = await getJSON('data/gallery.json');
    _gallery.sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0));
    grid.innerHTML = _gallery.map((g, i) => `
      <figure class="gallery-item" data-idx="${i}">
        <img src="${escapeAttr(g.image)}" alt="${escapeAttr(g.caption || 'Photo')}" loading="lazy" onerror="this.closest('.gallery-item').style.display='none'">
        <figcaption class="gallery-cap">
          <span class="g-text">${escapeHtml(g.caption || '')}</span>
          ${g.date ? `<span class="g-date">${formatDate(g.date)}</span>` : ''}
        </figcaption>
      </figure>`).join('');
    grid.querySelectorAll('.gallery-item').forEach(item =>
      item.addEventListener('click', () => openLightbox(+item.dataset.idx))
    );
  } catch (e) {
    grid.innerHTML = `<p class="loading">Adicione fotos em <code>data/gallery.json</code> (imagens em <code>assets/gallery/</code>).</p>`;
  }
  initLightbox();
}
function initLightbox() {
  const lb = document.getElementById('lightbox');
  if (!lb || lb.dataset.bound) return;
  lb.dataset.bound = '1';
  lb.querySelectorAll('[data-lbclose]').forEach(el => el.addEventListener('click', closeLightbox));
  document.addEventListener('keydown', e => { if (e.key === 'Escape') closeLightbox(); });
}
function openLightbox(idx) {
  const g = _gallery[idx];
  const lb = document.getElementById('lightbox');
  document.getElementById('lightbox-img').src = g.image;
  document.getElementById('lightbox-img').alt = g.caption || '';
  document.getElementById('lightbox-cap').textContent =
    (g.caption || '') + (g.date ? `  ·  ${formatDate(g.date)}` : '');
  lb.classList.add('open');
  document.body.style.overflow = 'hidden';
}
function closeLightbox() {
  document.getElementById('lightbox').classList.remove('open');
  document.body.style.overflow = '';
}

/* ── Charts (Chart.js) ───────────────────────────────────────────── */
async function initCharts() {
  if (typeof Chart === 'undefined') return;
  let cfg;
  try { cfg = await getJSON('data/insights.json'); }
  catch { cfg = defaultInsights(); }

  let publications;
  try { publications = await getJSON('data/publications.json'); }
  catch {
    document.getElementById('chart-pubs').parentElement.innerHTML = '<p class="loading">Produção científica indisponível no momento.</p>';
  }

  Chart.defaults.font.family = "'Inter', sans-serif";
  Chart.defaults.animation.duration = window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 0 : 800;
  window.__charts = {};

  const c = chartColors();

  window.__charts.radar = new Chart(document.getElementById('chart-radar'), {
    type: 'radar',
    data: {
      labels: cfg.focus.labels.map(label => label.includes(' ') && !label.includes('/') ? label.split(' ') : label),
      datasets: [{
        label: 'Foco', data: cfg.focus.values,
        backgroundColor: c.fill, borderColor: c.brand, pointBackgroundColor: c.brand, borderWidth: 2,
      }]
    },
    options: radarOpts(c)
  });

  if (publications) {
    const counts = new Map();
    publications.forEach(publication => {
      if (Number.isInteger(publication.year)) counts.set(publication.year, (counts.get(publication.year) || 0) + 1);
    });
    const labels = [...counts.keys()].sort((first, second) => first - second);
    const values = labels.map(year => counts.get(year));
    const total = values.reduce((sum, count) => sum + count, 0);
    const options = barOpts(c, false);
    options.plugins.tooltip = { mode: 'index', intersect: false };
    options.scales.y.ticks.precision = 0;
    document.getElementById('outputs-summary').textContent = `${total} produções listadas · ${values.at(-1) || 0} em ${labels.at(-1) || 'no último ano'}`;
    document.getElementById('chart-pubs').setAttribute('aria-label', `Produção por ano: ${labels.map((year, index) => `${year}: ${values[index]}`).join(', ')}.`);
    window.__charts.pubs = new Chart(document.getElementById('chart-pubs'), {
      type: 'bar',
      data: {
        labels,
        datasets: [{ label: 'Publicações', data: values, backgroundColor: c.brand, borderRadius: 6, maxBarThickness: 42 }]
      },
      options
    });
  }

  window.__charts.skills = new Chart(document.getElementById('chart-skills'), {
    type: 'bar',
    data: {
      labels: cfg.skills.labels,
      datasets: [{ label: 'Ênfase relativa', data: cfg.skills.values, backgroundColor: c.brand2, borderRadius: 6, maxBarThickness: 22 }]
    },
    options: barOpts(c, true)
  });
}
function chartColors() {
  const css = getComputedStyle(document.documentElement);
  const brand = css.getPropertyValue('--brand').trim();
  const brand2 = css.getPropertyValue('--brand-2').trim();
  const grid = css.getPropertyValue('--border').trim();
  const text = css.getPropertyValue('--text-soft').trim();
  return { brand, brand2, grid, text, fill: hexA(brand, .18) };
}
function radarOpts(c) {
  return {
    responsive: true, maintainAspectRatio: false,
    layout: { padding: 12 },
    scales: { r: { angleLines: { color: c.grid }, grid: { color: c.grid }, pointLabels: { color: c.text, font: { size: 11 } }, ticks: { display: false }, suggestedMin: 0, suggestedMax: 100 } },
    plugins: { legend: { display: false } }
  };
}
function barOpts(c, horizontal) {
  return {
    responsive: true, maintainAspectRatio: false,
    indexAxis: horizontal ? 'y' : 'x',
    scales: {
      x: { grid: { color: c.grid, display: horizontal }, ticks: { color: c.text }, beginAtZero: true, max: horizontal ? 100 : undefined },
      y: { grid: { color: c.grid, display: !horizontal }, ticks: { color: c.text }, beginAtZero: true }
    },
    plugins: { legend: { display: false } }
  };
}
function refreshChartTheme() {
  const c = chartColors();
  Object.values(window.__charts).forEach(ch => {
    if (ch.config.type === 'radar') {
      ch.options.scales.r.angleLines.color = c.grid;
      ch.options.scales.r.grid.color = c.grid;
      ch.options.scales.r.pointLabels.color = c.text;
      ch.data.datasets[0].backgroundColor = c.fill;
      ch.data.datasets[0].borderColor = c.brand;
    } else {
      ch.options.scales.x.grid.color = c.grid;
      ch.options.scales.y.grid.color = c.grid;
      ch.options.scales.x.ticks.color = c.text;
      ch.options.scales.y.ticks.color = c.text;
      if (ch.options.plugins.legend.labels) ch.options.plugins.legend.labels.color = c.text;
      ch.data.datasets.forEach(dataset => {
        const color = ch === window.__charts.skills || dataset.type === 'line' ? c.brand2 : c.brand;
        dataset.backgroundColor = color;
        if (dataset.type === 'line') dataset.borderColor = color;
      });
    }
    ch.update();
  });
}
function defaultInsights() {
  return {
    focus: { labels: ['Área 1', 'Área 2', 'Área 3', 'Área 4', 'Área 5', 'Área 6'], values: [90, 85, 80, 75, 70, 65] },
    skills: { labels: ['Python', 'R', 'Estatística', 'Ferramenta 4', 'Ferramenta 5', 'Ferramenta 6'], values: [90, 85, 80, 75, 70, 65] }
  };
}

/* ── Utilities ───────────────────────────────────────────────────── */
function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, m => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[m]));
}
function escapeAttr(s) { return escapeHtml(s); }
function formatDate(d) {
  const dt = new Date(/^\d{4}-\d{2}-\d{2}$/.test(d) ? `${d}T00:00:00` : d);
  if (isNaN(dt)) return d;
  return dt.toLocaleDateString(SITE.locale, { year: 'numeric', month: 'short', day: 'numeric' });
}
function hexA(hex, a) {
  hex = hex.replace('#', '');
  if (hex.length === 3) hex = hex.split('').map(x => x + x).join('');
  const r = parseInt(hex.slice(0, 2), 16), g = parseInt(hex.slice(2, 4), 16), b = parseInt(hex.slice(4, 6), 16);
  return `rgba(${r},${g},${b},${a})`;
}

/* ── Hero: satellite scan over field plots (lightweight, reactive) ─ */
function initHeroCanvas() {
  const canvas = document.getElementById('hero-canvas');
  if (!canvas) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const ctx = canvas.getContext('2d');
  const hero = canvas.parentElement;
  let w, h, dpr, particles = [], plots = [], scanY = 0, raf;
  const mouse = { x: -9999, y: -9999 };

  function brand() {
    const css = getComputedStyle(document.documentElement);
    return {
      a: css.getPropertyValue('--brand').trim() || '#0e8f6e',
      b: css.getPropertyValue('--brand-2').trim() || '#12b3a6',
      c: css.getPropertyValue('--veg').trim() || '#63c132'
    };
  }
  let colors = brand();

  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    w = hero.clientWidth; h = hero.clientHeight;
    canvas.width = w * dpr; canvas.height = h * dpr;
    canvas.style.width = w + 'px'; canvas.style.height = h + 'px';
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    // sensor constellation
    const count = Math.min(64, Math.round(w / 22));
    particles = Array.from({ length: count }, () => ({
      x: Math.random() * w, y: Math.random() * h,
      vx: (Math.random() - 0.5) * 0.32, vy: (Math.random() - 0.5) * 0.32,
      r: Math.random() * 1.8 + 1
    }));

    // faint field-plot rectangles (breeding trial grid) with NDVI "vigour"
    const cell = 66, cols = Math.ceil(w / cell) + 1, rows = Math.ceil(h / cell) + 1;
    plots = [];
    for (let i = 0; i < cols; i++)
      for (let j = 0; j < rows; j++)
        plots.push({ x: i * cell, y: j * cell, s: cell - 8, v: Math.random(), ph: Math.random() * Math.PI * 2 });
    scanY = 0;
  }

  function step(t) {
    ctx.clearRect(0, 0, w, h);

    // 1) field-plot vigour grid (very subtle) — brightens as the scan passes
    for (const p of plots) {
      const near = 1 - Math.min(1, Math.abs(p.y - scanY) / 130);
      const base = 0.03 + 0.05 * (0.5 + 0.5 * Math.sin(t * 0.0006 + p.ph));
      const alpha = base + near * 0.16 * p.v;
      ctx.fillStyle = hexA(p.v > 0.5 ? colors.c : colors.a, alpha);
      ctx.fillRect(p.x + 4, p.y + 4, p.s, p.s);
    }

    // 2) push-broom scan line sweeping downward
    scanY += 0.9;
    if (scanY > h + 140) scanY = -140;
    const g = ctx.createLinearGradient(0, scanY - 60, 0, scanY + 60);
    g.addColorStop(0, hexA(colors.b, 0));
    g.addColorStop(0.5, hexA(colors.b, 0.14));
    g.addColorStop(1, hexA(colors.b, 0));
    ctx.fillStyle = g; ctx.fillRect(0, scanY - 60, w, 120);
    ctx.strokeStyle = hexA(colors.b, 0.35); ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(0, scanY); ctx.lineTo(w, scanY); ctx.stroke();

    // 3) sensor constellation (mouse-reactive) + links
    for (const p of particles) {
      const dx = mouse.x - p.x, dy = mouse.y - p.y, d2 = dx * dx + dy * dy;
      if (d2 < 26000) { p.vx += dx / d2 * 6; p.vy += dy / d2 * 6; }
      p.vx *= 0.96; p.vy *= 0.96;
      p.x += p.vx; p.y += p.vy;
      if (p.x < 0 || p.x > w) p.vx *= -1;
      if (p.y < 0 || p.y > h) p.vy *= -1;
      p.x = Math.max(0, Math.min(w, p.x));
      p.y = Math.max(0, Math.min(h, p.y));
    }
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const a = particles[i], b = particles[j];
        const dist = Math.hypot(a.x - b.x, a.y - b.y);
        if (dist < 118) {
          ctx.strokeStyle = hexA(colors.a, (1 - dist / 118) * 0.22);
          ctx.lineWidth = 1;
          ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
        }
      }
    }
    for (const p of particles) {
      ctx.fillStyle = hexA(colors.c, 0.7);
      ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2); ctx.fill();
    }
    raf = requestAnimationFrame(step);
  }

  hero.addEventListener('pointermove', e => {
    const r = hero.getBoundingClientRect();
    mouse.x = e.clientX - r.left; mouse.y = e.clientY - r.top;
  });
  hero.addEventListener('pointerleave', () => { mouse.x = -9999; mouse.y = -9999; });
  window.addEventListener('resize', resize, { passive: true });
  document.getElementById('theme-toggle')?.addEventListener('click', () => { colors = brand(); });

  // pause when off-screen to save battery
  const io = new IntersectionObserver(([e]) => {
    if (e.isIntersecting) { if (!raf) raf = requestAnimationFrame(step); }
    else { cancelAnimationFrame(raf); raf = null; }
  });
  resize();
  io.observe(hero);
}

/* ── Typed rotating role ─────────────────────────────────────────── */
function initTyped() {
  const el = document.getElementById('typed-role');
  if (!el) return;
  const phrases = SITE.typedPhrases;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) { el.textContent = phrases[0]; return; }
  let pi = 0, ci = 0, deleting = false;
  function tick() {
    const word = phrases[pi];
    el.textContent = word.slice(0, ci);
    if (!deleting && ci < word.length) { ci++; setTimeout(tick, 70); }
    else if (!deleting && ci === word.length) { deleting = true; setTimeout(tick, 1500); }
    else if (deleting && ci > 0) { ci--; setTimeout(tick, 35); }
    else { deleting = false; pi = (pi + 1) % phrases.length; setTimeout(tick, 250); }
  }
  tick();
}

/* ── 3D tilt on cards (delegated, pointer only) ──────────────────── */
function initTilt() {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  if (window.matchMedia('(hover: none)').matches) return;
  const SEL = '.project-card, .award-card, .mentor-card';
  let active = null;
  function reset(el) { el.style.transition = 'transform .35s ease'; el.style.transform = ''; el.style.willChange = ''; }
  document.addEventListener('pointermove', e => {
    const card = e.target.closest(SEL);
    if (card !== active) { if (active) reset(active); active = card; if (card) { card.style.willChange = 'transform'; card.style.transition = 'transform .08s ease-out'; } }
    if (!card) return;
    const r = card.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width - 0.5;
    const py = (e.clientY - r.top) / r.height - 0.5;
    const max = 7;
    card.style.transform = `perspective(820px) rotateX(${(-py * max).toFixed(2)}deg) rotateY(${(px * max).toFixed(2)}deg) translateY(-4px)`;
  }, { passive: true });
  document.addEventListener('pointercancel', () => { if (active) { reset(active); active = null; } });
}
