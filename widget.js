/*!
 * PADELORGANIZERS AI Widget v1.0
 * Embed the AI agent on any website with one script tag.
 *
 * Uso:
 * <script src="https://TU-DOMINIO/widget.js"
 *         data-agent-url="https://TU-DOMINIO"
 *         data-label="Hablar con la IA"
 *         data-color="#d6a94f"
 *         data-position="right"
 *         data-lang="es"></script>
 */
(function () {
  var s = document.currentScript || document.querySelector('script[src*="widget.js"]');
  if (!s || window.__poWidgetLoaded) return;
  window.__poWidgetLoaded = true;

  var origin;
  try { origin = new URL('.', s.src).origin; } catch (e) { origin = ''; }

  var cfg = {
    url: s.getAttribute('data-agent-url') || origin,
    label: s.getAttribute('data-label') || 'Hablar con la IA',
    color: s.getAttribute('data-color') || '#d6a94f',
    position: s.getAttribute('data-position') || 'right',
    offset: parseInt(s.getAttribute('data-offset') || '20', 10),
    lang: s.getAttribute('data-lang') || 'es'
  };
  if (!cfg.url) return;

  var css = document.createElement('style');
  css.textContent = [
    '.po-widget-btn{position:fixed;z-index:9998;bottom:' + cfg.offset + 'px;' + (cfg.position === 'left' ? 'left:' : 'right:') + cfg.offset + 'px;',
    'display:inline-flex;align-items:center;gap:8px;border:none;border-radius:999px;padding:12px 18px;',
    'color:#111;font:700 14px/1 system-ui,-apple-system,Segoe UI,sans-serif;cursor:pointer;',
    'box-shadow:0 12px 30px rgba(0,0,0,.28);transition:transform .15s ease,box-shadow .15s ease}',
    '.po-widget-btn:hover{transform:translateY(-2px);box-shadow:0 16px 36px rgba(0,0,0,.34)}',
    '.po-widget-overlay{position:fixed;inset:0;z-index:9999;display:none;background:rgba(0,0,0,.45);backdrop-filter:blur(2px)}',
    '.po-widget-overlay.open{display:block}',
    '.po-widget-panel{position:absolute;top:0;bottom:0;' + (cfg.position === 'left' ? 'left:0;' : 'right:0;') + 'width:min(440px,100%);background:#0b0f17;box-shadow:-20px 0 60px rgba(0,0,0,.35);display:flex;flex-direction:column}',
    '.po-widget-head{display:flex;align-items:center;justify-content:space-between;padding:10px 14px;color:#fff;font:700 13px/1.2 system-ui,sans-serif;background:#111827}',
    '.po-widget-close{background:transparent;border:0;color:#fff;font-size:22px;line-height:1;cursor:pointer;padding:4px 8px}',
    '.po-widget-frame{flex:1;width:100%;border:0;background:#fff}',
    '@media(max-width:600px){.po-widget-panel{width:100%}.po-widget-btn{padding:12px 14px}.po-widget-label{display:none}}'
  ].join('');
  document.head.appendChild(css);

  var btn = document.createElement('button');
  btn.className = 'po-widget-btn';
  btn.type = 'button';
  btn.setAttribute('aria-label', cfg.label);
  btn.style.background = cfg.color;
  btn.innerHTML = '<span aria-hidden="true">🤖</span><span class="po-widget-label">' + cfg.label + '</span>';
  document.body.appendChild(btn);

  var overlay = null;
  function open() {
    if (!overlay) {
      overlay = document.createElement('div');
      overlay.className = 'po-widget-overlay';
      var panel = document.createElement('div');
      panel.className = 'po-widget-panel';
      var head = document.createElement('div');
      head.className = 'po-widget-head';
      head.innerHTML = '<span>' + cfg.label + '</span>';
      var closeBtn = document.createElement('button');
      closeBtn.className = 'po-widget-close';
      closeBtn.type = 'button';
      closeBtn.setAttribute('aria-label', 'Cerrar');
      closeBtn.textContent = '×';
      head.appendChild(closeBtn);
      var iframe = document.createElement('iframe');
      iframe.className = 'po-widget-frame';
      iframe.title = cfg.label;
      iframe.src = cfg.url + (cfg.url.indexOf('?') >= 0 ? '&' : '?') + 'embed=1&lang=' + encodeURIComponent(cfg.lang);
      panel.appendChild(head);
      panel.appendChild(iframe);
      overlay.appendChild(panel);
      document.body.appendChild(overlay);
      closeBtn.addEventListener('click', close);
      overlay.addEventListener('click', function (e) { if (e.target === overlay) close(); });
    }
    overlay.classList.add('open');
    document.body.style.overflow = 'hidden';
  }
  function close() {
    if (!overlay) return;
    overlay.classList.remove('open');
    document.body.style.overflow = '';
  }
  btn.addEventListener('click', open);
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') close(); });
})();
