/* ════════════════════════════════════════════════════════════════════
   Música de fundo — LIGADA por padrão, com botão para desligar 🔊
     • ao abrir o site, tenta tocar na hora;
     • se o navegador bloquear (regra de todos os navegadores), começa
       no primeiro clique, toque ou tecla do visitante em qualquer lugar;
     • botão no menu, ao lado do botão de tema, para desligar/religar;
     • volume suave (fade) e loop;
     • se o visitante desligar, o site lembra e não toca nas próximas visitas.

   COMO USAR:
     1. Coloque sua música em assets/audio/ (ex.: assets/audio/music.mp3)
     2. No index.html, logo DEPOIS das outras linhas de script, adicione:
        <script src="assets/js/musica.js"></script>
   ════════════════════════════════════════════════════════════════════ */

/* ✏️ CONFIGURAÇÃO ───────────────────────────────────────────────────── */
const MUSIC = {
  file: 'assets/audio/music.mp3', // caminho da música
  volume: 0.35,                   // volume final (0 a 1)
  fadeMs: 1500,                   // duração do fade in/out em milissegundos
  startOn: true                   // true = começa ligada; false = só toca se o visitante clicar
};
/* ─────────────────────────────────────────────────────────────────── */

(function () {
  function setup() {
    const themeBtn = document.getElementById('theme-toggle');
    if (!themeBtn || document.getElementById('music-toggle')) return;

    // áudio
    const audio = new Audio(MUSIC.file);
    audio.loop = true;
    audio.addEventListener('playing', () => btn.classList.add('sounding'));
    audio.addEventListener('pause', () => btn.classList.remove('sounding'));
    audio.preload = 'none';
    audio.volume = 0;

    // botão (inserido antes do botão de tema)
    const li = document.createElement('li');
    li.innerHTML = '<button id="music-toggle" aria-label="Play music" title="Play music"><i class="fa-solid fa-volume-xmark"></i></button>';
    themeBtn.closest('li').before(li);
    const btn = li.querySelector('button');
    const icon = btn.querySelector('i');

    // estilo igual ao do botão de tema + animação quando está tocando
    const css = document.createElement('style');
    css.textContent = `
      #music-toggle {
        background: var(--surface-2); border: 1px solid var(--border); color: var(--text);
        width: 38px; height: 38px; border-radius: 10px; cursor: pointer; font-size: .95rem;
        display: grid; place-items: center; transition: transform .3s var(--ease), background .2s, color .2s, border-color .2s;
      }
      #music-toggle:hover { transform: scale(1.08); }
      #music-toggle.playing { color: var(--brand); border-color: var(--brand); }
      #music-toggle.sounding i { animation: music-pulse 1.6s ease-in-out infinite; }
      @keyframes music-pulse { 0%, 100% { transform: scale(1); } 50% { transform: scale(1.22); } }
      @media (prefers-reduced-motion: reduce) { #music-toggle.sounding i { animation: none; } }
    `;
    document.head.appendChild(css);

    let fadeTimer = null;
    function fadeTo(target, done) {
      clearInterval(fadeTimer);
      const steps = 30, stepMs = MUSIC.fadeMs / steps;
      const start = audio.volume, delta = (target - start) / steps;
      let i = 0;
      fadeTimer = setInterval(() => {
        i++;
        audio.volume = Math.min(1, Math.max(0, start + delta * i));
        if (i >= steps) { clearInterval(fadeTimer); audio.volume = target; done && done(); }
      }, stepMs);
    }

    function setUI(on) {
      btn.classList.toggle('playing', on);
      icon.className = on ? 'fa-solid fa-volume-high' : 'fa-solid fa-volume-xmark';
      const label = on ? 'Pause music' : 'Play music';
      btn.setAttribute('aria-label', label); btn.title = label;
    }

    async function play() {
      try {
        await audio.play();
        setUI(true);
        fadeTo(MUSIC.volume);
        save('on');
      } catch (e) {
        console.warn('[music] não foi possível tocar:', e);
        if (wanted) addStarters(); else setUI(false);
      }
    }
    function pause() {
      setUI(false);
      save('off');
      fadeTo(0, () => audio.pause());
    }
    function save(v) { try { localStorage.setItem('music', v); } catch {} }

    // estado desejado: ligado por padrão, a menos que o visitante tenha desligado antes
    let saved = null;
    try { saved = localStorage.getItem('music'); } catch {}
    let wanted = saved ? saved === 'on' : MUSIC.startOn;

    btn.addEventListener('click', e => {
      e.stopPropagation();
      if (wanted) { wanted = false; removeStarters(); pause(); }
      else { wanted = true; play(); }
    });

    // primeira interação em qualquer lugar da página inicia a música (se bloqueada)
    const starterEvents = ['pointerdown', 'keydown', 'touchstart'];
    function starter(e) {
      if (e.target.closest && e.target.closest('#music-toggle')) return;
      removeStarters();
      if (wanted && audio.paused) play();
    }
    function addStarters() { starterEvents.forEach(ev => document.addEventListener(ev, starter, { passive: true })); }
    function removeStarters() { starterEvents.forEach(ev => document.removeEventListener(ev, starter)); }

    if (wanted) {
      setUI(true);                       // botão já aparece como "som ligado"
      audio.preload = 'auto';
      audio.play()
        .then(() => { fadeTo(MUSIC.volume); save('on'); })
        .catch(() => addStarters());     // bloqueado: espera a primeira interação
    }
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', setup);
  else setup();
})();
