// Herramientas compartidas por los interactivos de esta guía (SVG sin librerías).
// Cada etapa (preparar.js, entrenar.js, evaluar.js) las usa a través de window.Dsia.
(function () {
  var NS = 'http://www.w3.org/2000/svg';

  function add(parent, tag, attrs, text) {
    var n = document.createElementNS(NS, tag);
    for (var k in attrs) n.setAttribute(k, attrs[k]);
    if (text != null) n.textContent = text;
    parent.appendChild(n);
    return n;
  }
  function fmt(v, dec) {
    var d = dec == null ? 2 : dec, m = Math.pow(10, d);
    return (Math.round(v * m) / m).toLocaleString('es-AR');
  }
  function pct(v) { return Math.round(v * 100) + '%'; }
  function texto(id, t) { var n = document.getElementById(id); if (n) n.textContent = t; }

  // Números al azar reproducibles: la misma semilla da siempre los mismos datos (como random_state).
  function azar(semilla) {
    var a = semilla >>> 0;
    return function () {
      a = (a + 0x6D2B79F5) >>> 0;
      var t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }
  function normal(rnd) {
    return Math.sqrt(-2 * Math.log(1 - rnd())) * Math.cos(2 * Math.PI * rnd());
  }
  function mezclar(arr, rnd) {
    var a = arr.slice();
    for (var i = a.length - 1; i > 0; i--) {
      var j = Math.floor(rnd() * (i + 1)), t = a[i];
      a[i] = a[j]; a[j] = t;
    }
    return a;
  }

  // Plano cartesiano: ejes, marcas y rótulos. Devuelve las escalas {x, y} y el área útil.
  function plano(svg, c) {
    svg.textContent = '';
    var W = c.w || 320, H = c.h || 210;
    var L = 34, R = W - 10, T = 16, B = H - 28;
    svg.setAttribute('viewBox', '0 0 ' + W + ' ' + H);
    var x = function (v) { return L + (v - c.xmin) / (c.xmax - c.xmin) * (R - L); };
    var y = function (v) { return B - (v - c.ymin) / (c.ymax - c.ymin) * (B - T); };
    add(svg, 'line', { class: 'eje', x1: L, x2: R, y1: B, y2: B });
    add(svg, 'line', { class: 'eje', x1: L, x2: L, y1: T, y2: B });
    (c.xticks || []).forEach(function (t) { add(svg, 'text', { x: x(t), y: B + 14, 'text-anchor': 'middle' }, fmt(t)); });
    (c.yticks || []).forEach(function (t) { add(svg, 'text', { x: L - 4, y: y(t) + 4, 'text-anchor': 'end' }, fmt(t)); });
    if (c.xlabel) add(svg, 'text', { x: R, y: H - 2, 'text-anchor': 'end' }, c.xlabel);
    if (c.ylabel) add(svg, 'text', { x: L + 4, y: T - 4 }, c.ylabel);
    // Lo que puede salirse del área (rectas, regiones) se dibuja dentro de esta capa recortada.
    var id = svg.id + '-clip';
    add(add(add(svg, 'defs', {}), 'clipPath', { id: id }), 'rect', { x: L, y: T, width: R - L, height: B - T });
    var capa = add(svg, 'g', { 'clip-path': 'url(#' + id + ')' });
    return { x: x, y: y, L: L, R: R, T: T, B: B, capa: capa };
  }

  var menosMovimiento = matchMedia('(prefers-reduced-motion: reduce)');

  window.Dsia = {
    add: add, fmt: fmt, pct: pct, texto: texto,
    azar: azar, normal: normal, mezclar: mezclar, plano: plano,
    menosMovimiento: function () { return menosMovimiento.matches; }
  };
})();
