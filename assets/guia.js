/* ═══════════════════════════════════════════════════════════════
   Guías — único archivo de comportamiento.
   Construye el índice desde las <section>, marca la activa y
   alterna el tema. El panel lateral y el offcanvas son de Bootstrap.

   La página elige el modo de lectura con  <body data-mode="...">
     scroll  → todo seguido, el índice sigue el scroll
     panels  → un módulo por vez
   ═══════════════════════════════════════════════════════════════ */
(() => {
  const body  = document.body;
  const modo  = body.dataset.mode || 'scroll';
  const secs  = [...document.querySelectorAll('main section')];
  const crumb = document.getElementById('crumb');

  /* ── Índice (se agrupa con data-group="…" en la sección).
        La portada no tiene secciones: ahí solo corre el tema. ── */
  if (secs.length) {
  let grupo = null;
  const items = secs.map((s, i) => {
    const n     = String(i + 1).padStart(2, '0');
    const t     = s.querySelector('h2').textContent;
    const salto = s.dataset.group && s.dataset.group !== grupo
      ? `<p class="small fw-semibold text-uppercase opacity-50 px-2 pt-3 pb-1 mb-0">${(grupo = s.dataset.group)}</p>` : '';
    return `${salto}<a class="nav-link d-flex gap-2" href="#${s.id}" data-i="${i}"><span class="opacity-50">${n}</span>${t}</a>`;
  }).join('');
  document.querySelectorAll('.toc').forEach(n => n.innerHTML = items);

  /* ── Marcar la sección activa ── */
  const marcar = i => {
    document.querySelectorAll('.toc a').forEach(a => a.classList.toggle('active', +a.dataset.i === i));
    if (crumb) crumb.textContent = `${String(i + 1).padStart(2, '0')} / ${secs.length} · ${secs[i].querySelector('h2').textContent}`;
  };

  if (modo === 'panels') {
    const mostrar = i => {
      secs.forEach((s, j) => s.classList.toggle('is-active', i === j));
      marcar(i);
      scrollTo({ top: 0 });
    };
    document.querySelectorAll('.toc a').forEach(a =>
      a.addEventListener('click', e => { e.preventDefault(); mostrar(+a.dataset.i); }));
    mostrar(0);
  } else {
    const obs = new IntersectionObserver(es => {
      const v = es.filter(e => e.isIntersecting)
                  .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)[0];
      if (v) marcar(secs.indexOf(v.target));
    }, { rootMargin: '0px 0px -65% 0px' });
    secs.forEach(s => obs.observe(s));
    marcar(0);
  }

  /* ── Cerrar el panel al elegir una sección (mobile) ── */
  const panel = document.getElementById('toc');
  panel?.querySelectorAll('a').forEach(a =>
    a.addEventListener('click', () => bootstrap.Offcanvas.getInstance(panel)?.hide()));
  }

  /* ── Tema claro / oscuro ── */
  const root = document.documentElement;
  const tema = t => {
    root.dataset.bsTheme = t;
    try { localStorage.setItem('guias-tema', t); } catch (e) {}
    document.querySelectorAll('.theme-btn i').forEach(i =>
      i.className = `bi bi-${t === 'dark' ? 'sun' : 'moon'}${i.dataset.lg ? '' : ' fs-5'}`);
  };
  let guardado = null;
  try { guardado = localStorage.getItem('guias-tema'); } catch (e) {}
  tema(guardado || (matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'));
  document.querySelectorAll('.theme-btn').forEach(b =>
    b.addEventListener('click', () => tema(root.dataset.bsTheme === 'dark' ? 'light' : 'dark')));
})();
