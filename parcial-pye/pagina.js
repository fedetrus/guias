// Comportamiento de la página (no dibuja gráficos): ruta, impresión, fórmulas, menú activo e índice.

// Progreso de la ruta de estudio
(function () {
  // Guarda el progreso de la ruta en este navegador; si el storage no está disponible, la página funciona igual.
  document.querySelectorAll('.ruta input').forEach(function (box) {
    var key = 'pye-ruta-' + box.dataset.id;
    try { box.checked = localStorage.getItem(key) === '1'; } catch (e) {}
    box.addEventListener('change', function () {
      try { localStorage.setItem(key, box.checked ? '1' : '0'); } catch (e) {}
    });
  });

})();

// Imprimir solo la hoja de fórmulas
(function () {
  var b = document.getElementById('b-imprimir');
  if (!b) return;
  b.addEventListener('click', function () {
    document.body.classList.add('imprimir-formulas');
    window.print();
  });
  window.addEventListener('afterprint', function () { document.body.classList.remove('imprimir-formulas'); });
})();

// Fórmulas "con números": al señalar una letra se iluminan todas las piezas con la misma clave (data-k) de su tarjeta.
(function () {
  document.querySelectorAll('.tk').forEach(function (tk) { tk.tabIndex = 0; });
  function marcar(ev, on) {
    var tk = ev.target.closest && ev.target.closest('.tk');
    if (!tk) return;
    var bloque = tk.closest('.card') || document;
    bloque.querySelectorAll('.tk[data-k="' + tk.dataset.k + '"]').forEach(function (e) { e.classList.toggle('activo', on); });
  }
  document.addEventListener('pointerover', function (e) { marcar(e, true); });
  document.addEventListener('pointerout', function (e) { marcar(e, false); });
  document.addEventListener('focusin', function (e) { marcar(e, true); });
  document.addEventListener('focusout', function (e) { marcar(e, false); });
})();

// Menú: marca la sección visible, la mantiene a la vista y muestra el progreso de lectura.
(function () {
  var nav = document.querySelector('nav');
  if (!nav) return;
  var lista = nav.querySelector('ul');
  var links = Array.prototype.slice.call(nav.querySelectorAll('a[href^="#"]'));
  var secciones = links.map(function (a) { return document.getElementById(a.getAttribute('href').slice(1)); });
  var barra = document.createElement('div');
  barra.className = 'progreso';
  nav.appendChild(barra);
  var suave = !window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var actual = null, pendiente = false;

  function activar(link) {
    if (link === actual) return;
    if (actual) actual.removeAttribute('aria-current');
    actual = link;
    link.setAttribute('aria-current', 'true');
    var destino = link.offsetLeft - (lista.clientWidth - link.offsetWidth) / 2;
    lista.scrollTo({ left: destino, behavior: suave ? 'smooth' : 'auto' });
  }
  function actualizar() {
    pendiente = false;
    var limite = nav.offsetHeight + 24, elegido = 0;
    secciones.forEach(function (s, i) { if (s && s.getBoundingClientRect().top <= limite) elegido = i; });
    activar(links[elegido]);
    var max = document.documentElement.scrollHeight - window.innerHeight;
    barra.style.transform = 'scaleX(' + (max > 0 ? window.scrollY / max : 0) + ')';
  }
  window.addEventListener('scroll', function () {
    if (!pendiente) { pendiente = true; requestAnimationFrame(actualizar); }
  }, { passive: true });
  window.addEventListener('resize', actualizar);
  actualizar();
})();

// Índice flotante: se arma solo con los h2 y h3 de cada sección.
(function () {
  var dialogo = document.createElement('dialog');
  dialogo.className = 'indice';
  dialogo.setAttribute('aria-label', 'Índice');
  var html = '<button type="button" class="btn cerrar">Cerrar</button><strong>Índice</strong><ol>';
  document.querySelectorAll('main > section[id], main > header[id]').forEach(function (sec) {
    var h2 = sec.querySelector('h2, h1');
    if (!h2) return;
    html += '<li><a href="#' + sec.id + '">' + h2.textContent + '</a>';
    var subs = sec.querySelectorAll(':scope > h3');
    if (subs.length) {
      html += '<ol>';
      subs.forEach(function (h3, i) {
        if (!h3.id) h3.id = sec.id + '-t' + i;
        h3.style.scrollMarginTop = '72px';
        html += '<li><a href="#' + h3.id + '">' + h3.textContent + '</a></li>';
      });
      html += '</ol>';
    }
    html += '</li>';
  });
  dialogo.innerHTML = html + '</ol>';
  document.body.appendChild(dialogo);

  var boton = document.createElement('button');
  boton.type = 'button';
  boton.className = 'btn-indice';
  boton.setAttribute('aria-haspopup', 'dialog');
  boton.innerHTML = '<svg class="icono" viewBox="0 0 24 24" aria-hidden="true"><path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01"/></svg> Índice';
  document.body.appendChild(boton);

  boton.addEventListener('click', function () { dialogo.showModal(); });
  dialogo.querySelector('.cerrar').addEventListener('click', function () { dialogo.close(); });
  dialogo.addEventListener('click', function (e) {
    if (e.target.closest('a')) dialogo.close();
  });
})();

// Niveles de práctica: cada botón muestra su panel y oculta los otros; tocarlo de nuevo lo cierra.
// Sin JS los paneles quedan visibles, así que el contenido nunca se pierde.
(function () {
  document.querySelectorAll('.niveles').forEach(function (grupo) {
    var ejercicio = grupo.closest('.ejercicio') || grupo.parentNode;
    var botones = grupo.querySelectorAll('[data-nivel]');
    var paneles = ejercicio.querySelectorAll('.panel-nivel');
    function mostrar(nivel) {
      botones.forEach(function (b) { b.setAttribute('aria-pressed', b.dataset.nivel === nivel); });
      paneles.forEach(function (p) { p.hidden = p.dataset.panel !== nivel; });
    }
    botones.forEach(function (b) {
      b.addEventListener('click', function () {
        mostrar(b.getAttribute('aria-pressed') === 'true' ? null : b.dataset.nivel);
      });
    });
    mostrar(null);
  });
})();
