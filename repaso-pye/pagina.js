// Comportamiento propio de esta guía: imprimir la hoja de fórmulas, resaltar las letras de las
// fórmulas "con números" y los niveles de práctica. El índice, la sección activa y el tema
// los maneja ../assets/guia.js, igual que en las otras guías.

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
    var bloque = tk.closest('.bloque-r') || document;
    bloque.querySelectorAll('.tk[data-k="' + tk.dataset.k + '"]').forEach(function (e) { e.classList.toggle('activo', on); });
  }
  document.addEventListener('pointerover', function (e) { marcar(e, true); });
  document.addEventListener('pointerout', function (e) { marcar(e, false); });
  document.addEventListener('focusin', function (e) { marcar(e, true); });
  document.addEventListener('focusout', function (e) { marcar(e, false); });
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
