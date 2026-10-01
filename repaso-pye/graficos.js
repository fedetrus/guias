// Herramientas de dibujo compartidas por todas las unidades (SVG sin librerías).
// Cada unidad (u1.js, u2.js…) las usa a través de window.Repaso y no las modifica:
// para un gráfico nuevo se agrega una función acá, no se tocan las existentes.
(function () {
  var NS = 'http://www.w3.org/2000/svg';
  function add(parent, tag, attrs, text) {
    var n = document.createElementNS(NS, tag);
    for (var k in attrs) n.setAttribute(k, attrs[k]);
    if (text != null) n.textContent = text;
    parent.appendChild(n);
    return n;
  }
  function fmt(v) { return (Math.round(v * 100) / 100).toLocaleString('es-AR'); }
  function clamp(v, a, b) { return Math.max(a, Math.min(b, v)); }

  // Dibuja sobre una recta numérica: barras, puntos apilados, banda y líneas de referencia (media, mediana…).
  function chart(svg, c) {
    svg.textContent = '';
    var H = c.h || 170, L = 24, R = 296, base = H - 26;
    var top = c.lines ? 14 + c.lines.length * 12 : 12;
    svg.setAttribute('viewBox', '0 0 320 ' + H);
    var x = function (v) { return L + (v - c.min) / (c.max - c.min) * (R - L); };

    if (c.band) add(svg, 'rect', { class: 'banda', x: x(c.band[0]), y: top, width: x(c.band[1]) - x(c.band[0]), height: base - top });

    if (c.bars) {
      var maxF = Math.max.apply(null, c.bars.map(function (b) { return b.f; }));
      c.bars.forEach(function (b) {
        var h = b.f / maxF * (base - top - 16);
        var x0 = x(b.x - b.w / 2) + 1, x1 = x(b.x + b.w / 2) - 1;
        var r = add(svg, 'rect', { class: 'barra' + (b.hi ? ' hi' : ''), x: x0, y: base - h, width: x1 - x0, height: h, rx: 3 });
        add(r, 'title', {}, (b.label || fmt(b.x)) + ': ' + b.f);
        add(svg, 'text', { x: (x0 + x1) / 2, y: base - h - 4, 'text-anchor': 'middle' }, b.f);
      });
    }

    add(svg, 'line', { class: 'eje', x1: L - 6, x2: R + 6, y1: base, y2: base });
    (c.ticks || []).forEach(function (t) {
      add(svg, 'text', { x: x(t), y: base + 16, 'text-anchor': 'middle' }, fmt(t));
    });

    if (c.dots) {
      var pila = {};
      c.dots.forEach(function (v) {
        var k = pila[v] = (pila[v] || 0) + 1;
        var d = add(svg, 'circle', { class: 'punto', cx: x(v), cy: base - 6 - (k - 1) * 10, r: 4.5 });
        add(d, 'title', {}, fmt(v));
      });
    }

    // Rótulos escalonados de izquierda a derecha, al costado de su línea, para que no se pisen.
    (c.lines || []).slice().sort(function (a, b) { return a.v - b.v; }).forEach(function (l, i) {
      var y = 12 + i * 12, xl = x(l.v), derecha = xl < 250;
      add(svg, 'line', { class: l.cls, x1: xl, x2: xl, y1: y - 8, y2: base });
      add(svg, 'text', { class: 't-' + l.cls, x: derecha ? xl + 4 : xl - 4, y: y, 'text-anchor': derecha ? 'start' : 'end' }, l.label);
    });
  }

  // Diagrama de caja: mínimo, Q1, mediana, Q3, máximo.
  function boxplot(svg, c) {
    var L = 24, R = 296, y = 60;
    var x = function (v) { return L + (v - c.min) / (c.max - c.min) * (R - L); };
    svg.setAttribute('viewBox', '0 0 320 120');
    add(svg, 'line', { class: 'eje', x1: x(c.v[0]), x2: x(c.v[1]), y1: y, y2: y });
    add(svg, 'line', { class: 'eje', x1: x(c.v[3]), x2: x(c.v[4]), y1: y, y2: y });
    [0, 4].forEach(function (i) { add(svg, 'line', { class: 'eje', x1: x(c.v[i]), x2: x(c.v[i]), y1: y - 10, y2: y + 10 }); });
    add(svg, 'rect', { class: 'caja', x: x(c.v[1]), y: y - 20, width: x(c.v[3]) - x(c.v[1]), height: 40, rx: 3 });
    add(svg, 'line', { class: 'mediana', x1: x(c.v[2]), x2: x(c.v[2]), y1: y - 20, y2: y + 20 });
    add(svg, 'text', { x: (x(c.v[1]) + x(c.v[3])) / 2, y: y - 28, 'text-anchor': 'middle' }, '50% central');
    var nombres = ['mín', 'Q1', 'Me', 'Q3', 'máx'];
    c.v.forEach(function (v, i) {
      add(svg, 'text', { class: i === 2 ? 't-mediana' : '', x: x(v), y: y + 36 + (i % 2) * 13, 'text-anchor': 'middle' }, nombres[i] + ' ' + fmt(v));
    });
  }


  // Una o varias cajas (boxplots) sobre el mismo eje. c.filas: [{ label, v: [mín, Q1, Me, Q3, máx], atipicos: [] }].
  // c.mini: versión chica para fichas (sin eje ni rótulos). c.valores: escribe los 5 números bajo la caja (una sola fila).
  function cajas(svg, c) {
    svg.textContent = '';
    var mini = !!c.mini, W = mini ? 120 : 320, alto = mini ? 26 : 34, paso = mini ? 0 : 58;
    var conLabel = c.filas.some(function (f) { return f.label; });
    var L = mini ? 8 : (conLabel ? 78 : 24), R = W - (mini ? 8 : 24);
    var top = mini ? 23 : 14, extra = c.valores ? 34 : 0;
    var H = mini ? 72 : top + (c.filas.length - 1) * paso + alto + extra + 40;
    svg.setAttribute('viewBox', '0 0 ' + W + ' ' + H);
    var x = function (v) { return L + (v - c.min) / (c.max - c.min) * (R - L); };
    c.filas.forEach(function (f, i) {
      var yc = top + i * paso + alto / 2, v = f.v;
      add(svg, 'line', { class: 'eje', x1: x(v[0]), x2: x(v[1]), y1: yc, y2: yc });
      add(svg, 'line', { class: 'eje', x1: x(v[3]), x2: x(v[4]), y1: yc, y2: yc });
      [0, 4].forEach(function (k) { add(svg, 'line', { class: 'eje', x1: x(v[k]), x2: x(v[k]), y1: yc - alto / 4, y2: yc + alto / 4 }); });
      var caja = add(svg, 'rect', { class: 'caja', x: x(v[1]), y: yc - alto / 2, width: x(v[3]) - x(v[1]), height: alto, rx: 3 });
      add(caja, 'title', {}, 'mín ' + fmt(v[0]) + ' · Q1 ' + fmt(v[1]) + ' · Me ' + fmt(v[2]) + ' · Q3 ' + fmt(v[3]) + ' · máx ' + fmt(v[4]));
      add(svg, 'line', { class: 'mediana', x1: x(v[2]), x2: x(v[2]), y1: yc - alto / 2, y2: yc + alto / 2 });
      (f.atipicos || []).forEach(function (a) { add(svg, 'circle', { class: 'punto hueco', cx: x(a), cy: yc, r: 4 }); });
      if (f.label) add(svg, 'text', { class: 'fuerte', x: L - 8, y: yc + 4, 'text-anchor': 'end' }, f.label);
      if (c.valores) {
        var nombres = ['mín', 'Q1', 'Me', 'Q3', 'máx'];
        v.forEach(function (val, k) {
          add(svg, 'text', { class: k === 2 ? 't-mediana' : '', x: x(val), y: yc + alto / 2 + 14 + (k % 2) * 13, 'text-anchor': 'middle' }, nombres[k] + ' ' + fmt(val));
        });
      }
    });
    if (!mini) {
      var base = H - 22;
      add(svg, 'line', { class: 'eje', x1: L, x2: R, y1: base, y2: base });
      (c.ticks || []).forEach(function (t) {
        add(svg, 'line', { class: 'eje', x1: x(t), x2: x(t), y1: base, y2: base + 4 });
        add(svg, 'text', { x: x(t), y: base + 16, 'text-anchor': 'middle' }, fmt(t));
      });
    }
    return x;
  }

  window.Repaso = { NS: NS, add: add, fmt: fmt, clamp: clamp, chart: chart, boxplot: boxplot, cajas: cajas };
})();
