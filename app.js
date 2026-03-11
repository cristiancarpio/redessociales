/* ═══════════════════════════════════════════════════
   MOTOR VIRAL DE CONTENIDO OSCURO — Frontend JS
   Público: Latinoamérica y España
   ═══════════════════════════════════════════════════ */

'use strict';

const state = { activeTab: 'dashboard', generating: false };

document.addEventListener('DOMContentLoaded', () => {
  initTabs();
  initSubtabs();
  initCategoryButtons();
  initGenerators();
  initMultiplier();
  initDashboardRefresh();
  registerSW();
});

function registerSW() {
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('/sw.js').catch(() => {});
    });
  }
}

function initTabs() {
  document.getElementById('mainNav').addEventListener('click', e => {
    const btn = e.target.closest('.nav-btn');
    if (!btn) return;
    const tab = btn.dataset.tab;
    document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
    document.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'));
    btn.classList.add('active');
    document.getElementById('tab-' + tab)?.classList.add('active');
    state.activeTab = tab;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}

function initSubtabs() {
  document.querySelectorAll('.subtab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const subtab = btn.dataset.subtab;
      const parent = btn.closest('.tab-panel');
      parent.querySelectorAll('.subtab-btn').forEach(b => b.classList.remove('active'));
      parent.querySelectorAll('.subtab-panel').forEach(p => p.classList.remove('active'));
      btn.classList.add('active');
      document.getElementById('subtab-' + subtab)?.classList.add('active');
    });
  });
}

function initCategoryButtons() {
  document.querySelectorAll('.cat-grid').forEach(grid => {
    grid.addEventListener('click', e => {
      const btn = e.target.closest('.cat-btn');
      if (!btn) return;
      grid.querySelectorAll('.cat-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
    });
  });
}

function getActiveCat(gridId) {
  return document.querySelector(`#${gridId} .cat-btn.active`)?.dataset.value || '';
}

function val(id) {
  return document.getElementById(id)?.value || '';
}

function showLoading(msg = 'Generando contenido...') {
  document.getElementById('loadingText').textContent = msg;
  document.getElementById('loadingOverlay').classList.add('active');
  state.generating = true;
}

function hideLoading() {
  document.getElementById('loadingOverlay').classList.remove('active');
  state.generating = false;
}

function showToast(msg, type = '') {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.className = 'toast show ' + type;
  setTimeout(() => t.className = 'toast', 2800);
}

function showOutput(areaId, contentId, html) {
  document.getElementById(areaId).style.display = 'block';
  document.getElementById(contentId).innerHTML = html;
  document.getElementById(areaId).scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

async function callAPI(endpoint, payload) {
  const res = await fetch(`/api/${endpoint}`, {
    method:  'POST',
    headers: { 'Content-Type': 'application/json' },
    body:    JSON.stringify(payload),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || `Error HTTP ${res.status}`);
  }
  return res.json();
}

function safeRender(text) {
  const lines = text.split('\n');
  let html = '';
  let inUl = false;
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) { if (inUl) { html += '</ul>'; inUl = false; } continue; }
    if (/^#+\s/.test(trimmed)) {
      if (inUl) { html += '</ul>'; inUl = false; }
      html += `<h3>${trimmed.replace(/^#+\s*/, '')}</h3>`;
    } else if (/^[-•]\s/.test(trimmed)) {
      if (!inUl) { html += '<ul>'; inUl = true; }
      html += `<li>${trimmed.slice(2).replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')}</li>`;
    } else {
      if (inUl) { html += '</ul>'; inUl = false; }
      const f = trimmed.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>').replace(/\*(.+?)\*/g, '<em>$1</em>');
      html += `<p>${f}</p>`;
    }
  }
  if (inUl) html += '</ul>';
  return html;
}

function copyOutput(contentId) {
  const el = document.getElementById(contentId);
  if (!el) return;
  navigator.clipboard.writeText(el.innerText)
    .then(() => showToast('✓ Copiado al portapapeles', 'success'))
    .catch(() => showToast('Error al copiar'));
}

function copyText(btn, text) {
  navigator.clipboard.writeText(text)
    .then(() => showToast('✓ Copiado', 'success'))
    .catch(() => showToast('Error al copiar'));
}

function sendToMultiplier(contentId) {
  const text = document.getElementById(contentId)?.innerText || '';
  if (!text) return;
  document.getElementById('multiplierInput').value = text;
  document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
  document.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'));
  document.querySelector('[data-tab="multiply"]').classList.add('active');
  document.getElementById('tab-multiply').classList.add('active');
  showToast('Historia cargada en el Multiplicador', 'success');
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function initGenerators() {

  // Historia
  document.getElementById('generateStory').addEventListener('click', async () => {
    if (state.generating) return;
    showLoading('Escribiendo tu historia oscura...');
    try {
      const data = await callAPI('generate', {
        type:     'story',
        category: getActiveCat('storyCategory'),
        tone:     val('storyTone'),
        length:   val('storyLength'),
        angle:    val('storyAngle'),
      });
      showOutput('storyOutput', 'storyOutputContent', safeRender(data.content));
    } catch (e) { showToast('Error: ' + e.message); }
    finally { hideLoading(); }
  });

  // Guión
  document.getElementById('generateScript').addEventListener('click', async () => {
    if (state.generating) return;
    showLoading('Creando tu guión de video...');
    try {
      const data = await callAPI('generate', {
        type:     'script',
        platform: getActiveCat('scriptPlatform'),
        genre:    val('scriptGenre'),
        duration: val('scriptDuration'),
        topic:    val('scriptTopic'),
      });
      showOutput('scriptOutput', 'scriptOutputContent', safeRender(data.content));
    } catch (e) { showToast('Error: ' + e.message); }
    finally { hideLoading(); }
  });

  // Ideas
  document.getElementById('generateIdeas').addEventListener('click', async () => {
    if (state.generating) return;
    showLoading('Generando ideas virales...');
    try {
      const data = await callAPI('generate', {
        type:     'ideas',
        filter:   val('ideasFilter'),
        platform: val('ideasPlatform'),
      });
      const ideas = data.content.split('\n').filter(l => l.trim());
      let html = '';
      let count = 0;
      for (const line of ideas) {
        const clean = line.replace(/^\d+[\.\)]\s*/, '').replace(/^[-•]\s*/, '').trim();
        if (!clean) continue;
        count++;
        html += `<div class="idea-item"><span class="idea-num">${String(count).padStart(2,'0')}</span><span class="idea-text">${clean}</span></div>`;
        if (count >= 20) break;
      }
      showOutput('ideasOutput', 'ideasOutputContent', html);
    } catch (e) { showToast('Error: ' + e.message); }
    finally { hideLoading(); }
  });

  // Imágenes
  document.getElementById('generateImages').addEventListener('click', async () => {
    if (state.generating) return;
    showLoading('Generando prompts de imágenes...');
    try {
      const data = await callAPI('generate', {
        type:    'images',
        style:   getActiveCat('imageStyle'),
        subject: val('imageSubject'),
        count:   val('imageCount'),
      });
      showOutput('imageOutput', 'imageOutputContent', safeRender(data.content));
    } catch (e) { showToast('Error: ' + e.message); }
    finally { hideLoading(); }
  });

  // Hashtags
  document.getElementById('generateHashtags').addEventListener('click', async () => {
    if (state.generating) return;
    showLoading('Generando hashtags...');
    try {
      const data = await callAPI('generate', {
        type:     'hashtags',
        platform: getActiveCat('hashtagPlatform'),
        topic:    val('hashtagTopic'),
      });
      showOutput('hashtagOutput', 'hashtagOutputContent', safeRender(data.content));
    } catch (e) { showToast('Error: ' + e.message); }
    finally { hideLoading(); }
  });

  // Reescritor
  document.getElementById('generateRewrite').addEventListener('click', async () => {
    if (state.generating) return;
    const input = val('rewriterInput').trim();
    if (!input) { showToast('Primero pegá una historia'); return; }
    showLoading('Reescribiendo tu historia...');
    try {
      const data = await callAPI('generate', {
        type:  'rewrite',
        story: input,
        goal:  val('rewriterGoal'),
      });
      showOutput('rewriterOutput', 'rewriterOutputContent', safeRender(data.content));
    } catch (e) { showToast('Error: ' + e.message); }
    finally { hideLoading(); }
  });

  // Analizador
  document.getElementById('generateAnalysis').addEventListener('click', async () => {
    if (state.generating) return;
    const input = val('analyzerInput').trim();
    if (!input) { showToast('Primero pegá un post viral'); return; }
    showLoading('Analizando mecánicas virales...');
    try {
      const data = await callAPI('generate', {
        type: 'analyze',
        post: input,
      });
      showOutput('analyzerOutput', 'analyzerOutputContent', safeRender(data.content));
    } catch (e) { showToast('Error: ' + e.message); }
    finally { hideLoading(); }
  });
}

function initMultiplier() {
  document.getElementById('generateMultiply').addEventListener('click', async () => {
    if (state.generating) return;
    const story = val('multiplierInput').trim();
    if (!story) { showToast('Primero ingresá una historia'); return; }

    const selectedOutputs = Array.from(
      document.querySelectorAll('.checkbox-grid input[type="checkbox"]:checked')
    ).map(cb => cb.dataset.output);

    if (!selectedOutputs.length) { showToast('Seleccioná al menos un tipo de contenido'); return; }

    showLoading('Multiplicando tu contenido...');
    try {
      const data = await callAPI('generate', {
        type:    'multiply',
        story,
        outputs: selectedOutputs,
      });

      const container = document.getElementById('multiplyResults');
      container.innerHTML = '';

      const icons  = { facebook_post: '📘', reel_script: '🎬', short_video: '📱', image_prompts: '🖼', hashtags: '🏷' };
      const labels = { facebook_post: 'Post de Facebook', reel_script: 'Guión para Reel', short_video: 'Guión Video Corto', image_prompts: 'Prompts de Imágenes', hashtags: 'Hashtags' };

      let i = 0;
      for (const [key, content] of Object.entries(data.results)) {
        const card = document.createElement('div');
        card.className = 'multiply-card' + (i === 0 ? ' open' : '');
        card.innerHTML = `
          <div class="multiply-card-header" onclick="toggleMultiplyCard(this)">
            <span class="multiply-card-title">${icons[key] || '📄'} ${labels[key] || key}</span>
            <span class="multiply-card-toggle">▶</span>
          </div>
          <div class="multiply-card-body">
            ${safeRender(content)}
            <div class="multiply-card-actions">
              <button class="btn-ghost btn-xs" onclick="copyText(this, this.closest('.multiply-card-body').innerText.replace('Copiar','').trim())">Copiar</button>
            </div>
          </div>`;
        container.appendChild(card);
        i++;
      }

      document.getElementById('multiplierOutput').style.display = 'block';
      document.getElementById('multiplierOutput').scrollIntoView({ behavior: 'smooth' });
    } catch (e) { showToast('Error: ' + e.message); }
    finally { hideLoading(); }
  });
}

function toggleMultiplyCard(header) {
  header.closest('.multiply-card').classList.toggle('open');
}

const dashMsgs = {
  ideas:    'Cargando ideas virales...',
  stories:  'Cargando arranques de historias...',
  scripts:  'Cargando guiones para reels...',
  prompts:  'Cargando prompts de imágenes...',
  hashtags: 'Cargando hashtags...',
};

async function dashGenerate(type) {
  if (state.generating) return;
  showLoading(dashMsgs[type] || 'Cargando...');
  try {
    const payloads = {
      ideas:    { type: 'ideas',       filter: 'todo tipo de contenido de terror y misterio latinoamericano', platform: 'Facebook', count: 10 },
      stories:  { type: 'dash_stories' },
      scripts:  { type: 'dash_scripts' },
      prompts:  { type: 'images',      style: 'horror cinematográfico oscuro', count: '5' },
      hashtags: { type: 'hashtags',    platform: 'todas las plataformas', topic: 'terror crimen oscuro latinoamerica' },
    };
    const data = await callAPI('generate', payloads[type]);
    const bodyIds = { ideas: 'dc-ideas-body', stories: 'dc-stories-body', scripts: 'dc-scripts-body', prompts: 'dc-prompts-body', hashtags: 'dc-hashtags-body' };
    const el = document.getElementById(bodyIds[type]);
    if (el) el.innerHTML = safeRender(data.content);
  } catch (e) { showToast('Error: ' + e.message); }
  finally { hideLoading(); }
}

function initDashboardRefresh() {
  document.getElementById('refreshDashboard').addEventListener('click', async () => {
    for (const type of ['ideas', 'stories', 'scripts', 'prompts', 'hashtags']) {
      await dashGenerate(type);
    }
  });
}

window.dashGenerate       = dashGenerate;
window.copyOutput         = copyOutput;
window.copyText           = copyText;
window.sendToMultiplier   = sendToMultiplier;
window.toggleMultiplyCard = toggleMultiplyCard;

// ── PWA Install Banner ──────────────────────────────
(function() {
  let deferredPrompt = null;

  function showBanner() {
    const banner = document.getElementById('pwaBanner');
    if (banner) banner.style.display = 'block';
  }

  function hideBanner() {
    const banner = document.getElementById('pwaBanner');
    if (banner) banner.style.display = 'none';
  }

  // Captura el evento antes que el navegador lo descarte
  window.addEventListener('beforeinstallprompt', e => {
    e.preventDefault();
    deferredPrompt = e;
    showBanner();
  });

  window.addEventListener('appinstalled', () => {
    hideBanner();
    deferredPrompt = null;
  });

  document.addEventListener('DOMContentLoaded', () => {
    const banner     = document.getElementById('pwaBanner');
    const installBtn = document.getElementById('pwaInstallBtn');
    const closeBtn   = document.getElementById('pwaCloseBtn');
    const iosHint    = document.getElementById('pwaIos');

    if (!banner) return;

    // Ya instalada como app
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches
      || window.navigator.standalone === true;
    if (isStandalone) return;

    // Fue cerrada antes
    try {
      if (sessionStorage.getItem('pwaClosed')) return;
    } catch(e) {}

    // iOS → mostrar instrucciones manuales
    const isIOS = /iphone|ipad|ipod/i.test(navigator.userAgent.toLowerCase());
    if (isIOS && iosHint) {
      showBanner();
      if (installBtn) installBtn.style.display = 'none';
      iosHint.style.display = 'block';
    }

    // Click en Instalar (Android/Chrome)
    if (installBtn) {
      installBtn.addEventListener('click', async () => {
        if (!deferredPrompt) return;
        try {
          await deferredPrompt.prompt();
          const result = await deferredPrompt.userChoice;
          if (result.outcome === 'accepted') hideBanner();
        } catch(e) {}
        deferredPrompt = null;
      });
    }

    // Click en cerrar
    if (closeBtn) {
      closeBtn.addEventListener('click', () => {
        hideBanner();
        try { sessionStorage.setItem('pwaClosed', '1'); } catch(e) {}
      });
    }
  });
})();
