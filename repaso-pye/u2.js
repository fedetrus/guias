// Unidad 2 · Regresión lineal: gráficos de ejercicios e interactivos.
(function () {
  var R = window.Repaso, add = R.add, fmt = R.fmt;

  // GENÉRICO: recta de mínimos cuadrados y sumas de cuadrados de un conjunto de pares [x, y].
  function ajuste(pts) {
    var n = pts.length, mx = 0, my = 0, sxx = 0, sxy = 0, syy = 0, sce = 0;
    pts.forEach(function (p) { mx += p[0] / n; my += p[1] / n; });
    pts.forEach(function (p) {
      sxx += (p[0] - mx) * (p[0] - mx);
      sxy += (p[0] - mx) * (p[1] - my);
      syy += (p[1] - my) * (p[1] - my);
    });
    var b1 = sxy / sxx, b0 = my - b1 * mx;
    pts.forEach(function (p) { var e = p[1] - (b0 + b1 * p[0]); sce += e * e; });
    return { mx: mx, my: my, b0: b0, b1: b1, r: syy ? sxy / Math.sqrt(sxx * syy) : 1, sct: syy, sce: sce, scr: syy - sce };
  }

  // GENÉRICO: diagrama de dispersión con recta, residuos (y sus cuadrados) y líneas de medias.
  // Devuelve las escalas {x, y} para dibujar anotaciones encima.
  function dispersion(svg, c) {
    svg.textContent = '';
    var W = c.w || 320, H = c.h || 200;
    var L = c.mini ? 8 : 34, Rr = W - 10, T = c.mini ? 8 : 20, B = c.mini ? H - 8 : H - 30;
    svg.setAttribute('viewBox', '0 0 ' + W + ' ' + H);
    var x = function (v) { return L + (v - c.xmin) / (c.xmax - c.xmin) * (Rr - L); };
    var y = function (v) { return B - (v - c.ymin) / (c.ymax - c.ymin) * (B - T); };

    // Todo lo que puede salirse del área (recta, cuadrados) se recorta.
    var clipId = svg.id + '-clip';
    var clip = add(add(svg, 'defs', {}), 'clipPath', { id: clipId });
    add(clip, 'rect', { x: L, y: T, width: Rr - L, height: B - T });
    var capa = add(svg, 'g', { 'clip-path': 'url(#' + clipId + ')' });

    add(svg, 'line', { class: 'eje', x1: L, x2: Rr, y1: B, y2: B });
    add(svg, 'line', { class: 'eje', x1: L, x2: L, y1: T, y2: B });
    (c.xticks || []).forEach(function (t) { add(svg, 'text', { x: x(t), y: B + 14, 'text-anchor': 'middle' }, fmt(t)); });
    (c.yticks || []).forEach(function (t) { add(svg, 'text', { x: L - 4, y: y(t) + 4, 'text-anchor': 'end' }, fmt(t)); });
    if (c.xlabel) add(svg, 'text', { x: Rr, y: H - 2, 'text-anchor': 'end' }, c.xlabel);
    if (c.ylabel) add(svg, 'text', { x: L + 4, y: T - 8 }, c.ylabel);

    var a = c.medias ? ajuste(c.pts) : null;
    if (a) {
      add(capa, 'line', { class: 'guia', x1: x(a.mx), x2: x(a.mx), y1: T, y2: B });
      add(capa, 'line', { class: 'guia', x1: L, x2: Rr, y1: y(a.my), y2: y(a.my) });
      add(svg, 'text', { x: x(a.mx) + 4, y: T + 10 }, 'x̄');
      add(svg, 'text', { x: Rr - 4, y: y(a.my) - 4, 'text-anchor': 'end' }, 'ȳ');
    }

    var r = c.recta;
    if (r) {
      var x0 = r.desde != null ? r.desde : c.xmin, x1 = r.hasta != null ? r.hasta : c.xmax;
      if (c.residuos) {
        c.pts.forEach(function (p) {
          var yp = y(p[1]), yh = y(r.b0 + r.b1 * p[0]), lado = Math.abs(yp - yh);
          // El cuadrado va del lado donde la recta se aleja; si no, la recta lo atraviesa en diagonal.
          var aLaIzquierda = (p[1] - (r.b0 + r.b1 * p[0])) * r.b1 > 0;
          if (c.cuadrados) add(capa, 'rect', { class: 'cuadrado-e', x: aLaIzquierda ? x(p[0]) - lado : x(p[0]), y: Math.min(yp, yh), width: lado, height: lado });
          add(capa, 'line', { class: 'residuo', x1: x(p[0]), x2: x(p[0]), y1: yp, y2: yh });
        });
      }
      add(capa, 'line', { class: 'recta' + (r.cls ? ' ' + r.cls : ''), x1: x(x0), y1: y(r.b0 + r.b1 * x0), x2: x(x1), y2: y(r.b0 + r.b1 * x1) });
    }

    c.pts.forEach(function (p, i) {
      var cls = 'punto';
      if (a && c.cuadrantes && (p[0] - a.mx) * (p[1] - a.my) < 0) cls += ' resta';
      if (c.hi && c.hi.indexOf(i) >= 0) cls += ' hi';
      var d = add(svg, 'circle', { class: cls, cx: x(p[0]), cy: y(p[1]), r: c.mini ? 3 : 4.5 });
      add(d, 'title', {}, '(' + fmt(p[0]) + '; ' + fmt(p[1]) + ')');
    });
    return { x: x, y: y };
  }

  function texto(id, t) { var n = document.getElementById(id); if (n) n.textContent = t; }
  function fuerza(r) {
    var a = Math.abs(r);
    if (a < 0.05) return 'sin correlación lineal';
    var nivel = a >= 0.999 ? 'perfecta' : a >= 0.7 ? 'fuerte' : a >= 0.3 ? 'moderada' : 'débil';
    return 'correlación ' + (r > 0 ? 'positiva ' : 'negativa ') + nivel;
  }
  function pct(v) { return Math.round(v * 100) + '%'; }

  // Datos compartidos: ejercicio 3 (horas de estudio y nota)
  var EJ3 = [[1, 3], [2, 5], [3, 6], [4, 8], [5, 8]];

  // ===== Panorama: anatomía de la regresión =====
  (function () {
    var svg = document.getElementById('g-u2-anatomia');
    if (!svg) return;
    var e = dispersion(svg, { pts: EJ3, xmin: 0, xmax: 6, ymin: 0, ymax: 10, h: 210,
      xticks: [0, 1, 2, 3, 4, 5, 6], yticks: [0, 2, 4, 6, 8, 10], xlabel: 'x: horas de estudio', ylabel: 'y: nota',
      recta: { b0: 2.1, b1: 1.3 }, hi: [3] });
    add(svg, 'line', { class: 'residuo', x1: e.x(4), x2: e.x(4), y1: e.y(8), y2: e.y(7.3), 'stroke-width': 3 });
    add(svg, 'text', { class: 't-residuo', x: e.x(4) - 6, y: e.y(8.6), 'text-anchor': 'end' }, 'residuo e = y − ŷ');
    add(svg, 'circle', { class: 'punto hi', cx: e.x(0), cy: e.y(2.1), r: 4 });
    add(svg, 'text', { class: 't-recta', x: e.x(0) + 8, y: e.y(2.1) + 16 }, 'b0 = 2,1 (corte con el eje y)');
    add(svg, 'text', { class: 't-recta', x: e.x(5.9), y: e.y(9.9), 'text-anchor': 'end' }, 'ŷ = 2,1 + 1,3x');
  })();

  // ===== Situación: correlación en vivo =====
  (function () {
    var svg = document.getElementById('g-u2-corr'), rango = document.getElementById('r-u2-corr');
    if (!svg) return;
    // Nube fija generada con una semilla: z1 y z2 centrados, sin correlación y con desvío 1,
    // así y = r·z1 + √(1−r²)·z2 tiene exactamente la correlación r elegida.
    var semilla = 7, n = 40, z1 = [], z2 = [];
    function azar() { semilla = (semilla * 16807) % 2147483647; return semilla / 2147483647; }
    for (var i = 0; i < n; i++) {
      var u = azar(), v = azar();
      z1.push(Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v));
      z2.push(Math.sqrt(-2 * Math.log(u)) * Math.sin(2 * Math.PI * v));
    }
    function normalizar(z) {
      var m = z.reduce(function (s, t) { return s + t; }, 0) / n;
      z = z.map(function (t) { return t - m; });
      var s = Math.sqrt(z.reduce(function (acc, t) { return acc + t * t; }, 0) / n);
      return z.map(function (t) { return t / s; });
    }
    z1 = normalizar(z1);
    var proy = z1.reduce(function (s, t, k) { return s + t * z2[k]; }, 0) / n;
    z2 = normalizar(z2.map(function (t, k) { return t - proy * z1[k]; }));

    function dibujar() {
      var r = Number(rango.value), s = Math.sqrt(Math.max(0, 1 - r * r));
      var pts = z1.map(function (t, k) { return [t, r * t + s * z2[k]]; });
      dispersion(svg, { pts: pts, xmin: -3, xmax: 3, ymin: -3.2, ymax: 3.2, h: 210, medias: true, cuadrantes: true,
        xlabel: 'x', ylabel: 'y' });
      var suman = pts.filter(function (p) { return p[0] * p[1] >= 0; }).length;
      texto('o-u2-corr', fmt(r));
      texto('t-u2-corr', 'r = ' + fmt(r) + ' → ' + fuerza(r) + '. Suman (I y III, llenos): ' + suman + ' · Restan (II y IV, vacíos): ' + (n - suman));
    }
    rango.addEventListener('input', dibujar);
    dibujar();
  })();

  // ===== Situación: r ≈ 0 con relación curva =====
  (function () {
    var svg = document.getElementById('g-u2-cero');
    if (!svg) return;
    dispersion(svg, { pts: [[1, 4], [2, 9], [3, 14], [4, 17], [5, 18], [6, 17], [7, 13], [8, 10], [9, 3]],
      xmin: 0, xmax: 10, ymin: 0, ymax: 20, h: 180, xticks: [0, 2, 4, 6, 8, 10], yticks: [0, 10, 20],
      xlabel: 'estrés', ylabel: 'rendimiento', medias: true });
  })();

  // ===== Situación: qué significan b0 y b1 =====
  (function () {
    var svg = document.getElementById('g-u2-pend');
    if (!svg) return;
    var e = dispersion(svg, { pts: [], xmin: 0, xmax: 10, ymin: 30, ymax: 100, h: 210,
      xticks: [0, 2, 4, 6, 8, 10], yticks: [30, 40, 60, 80, 100], xlabel: 'x: horas', ylabel: 'ŷ: nota',
      recta: { b0: 40, b1: 5 } });
    // Escalón de 2 horas: +10 puntos (5 por hora)
    add(svg, 'path', { class: 'escalon', fill: 'none', d: 'M' + e.x(4) + ',' + e.y(60) + ' H' + e.x(6) + ' V' + e.y(70) });
    add(svg, 'text', { x: e.x(5), y: e.y(60) + 14, 'text-anchor': 'middle' }, '+2 horas');
    add(svg, 'text', { class: 't-recta', x: e.x(6) + 6, y: e.y(65) + 4 }, '+10 puntos');
    add(svg, 'text', { class: 't-recta', x: e.x(10), y: e.y(46), 'text-anchor': 'end' }, 'b1 = 10 / 2 = 5 por hora');
    add(svg, 'circle', { class: 'punto hi', cx: e.x(0), cy: e.y(40), r: 4.5 });
    add(svg, 'text', { class: 't-recta', x: e.x(0) + 8, y: e.y(40) + 16 }, 'b0 = 40 (x = 0)');
  })();

  // ===== Situación: mínimos cuadrados =====
  (function () {
    var svg = document.getElementById('g-u2-mc'), curva = document.getElementById('g-u2-mc-curva'), rango = document.getElementById('r-u2-mc');
    if (!svg) return;
    var a = ajuste(EJ3);
    function sce(b1) {
      return EJ3.reduce(function (s, p) { var e = p[1] - (a.my + b1 * (p[0] - a.mx)); return s + e * e; }, 0);
    }
    function dibujar() {
      var b1 = Math.round(Number(rango.value) * 100) / 100, b0 = a.my - b1 * a.mx, s = sce(b1);
      dispersion(svg, { pts: EJ3, xmin: 0, xmax: 6, ymin: 0, ymax: 12, h: 210, xticks: [0, 1, 2, 3, 4, 5, 6], yticks: [0, 4, 8, 12],
        xlabel: 'x', ylabel: 'y', recta: { b0: b0, b1: b1 }, residuos: true, cuadrados: true });

      // Curva SCE según la pendiente: una parábola con el mínimo en b1 = 1,3
      curva.textContent = '';
      var W = 320, H = 110, L = 34, Rr = 310, T = 10, B = 84, bmin = -0.5, bmax = 3, smax = 34;
      curva.setAttribute('viewBox', '0 0 ' + W + ' ' + H);
      var cx = function (v) { return L + (v - bmin) / (bmax - bmin) * (Rr - L); };
      var cy = function (v) { return B - v / smax * (B - T); };
      var d = '';
      for (var b = bmin; b <= bmax + 1e-9; b += 0.05) d += (d ? ' L' : 'M') + cx(b) + ',' + cy(sce(b));
      add(curva, 'line', { class: 'eje', x1: L, x2: Rr, y1: B, y2: B });
      add(curva, 'path', { class: 'recta', d: d });
      add(curva, 'line', { class: 'guia', x1: cx(a.b1), x2: cx(a.b1), y1: T, y2: B });
      [-0.5, 0, 1, 1.3, 2, 3].forEach(function (t) { add(curva, 'text', { x: cx(t), y: B + 14, 'text-anchor': 'middle' }, fmt(t)); });
      add(curva, 'text', { x: Rr, y: H - 2, 'text-anchor': 'end' }, 'pendiente b1');
      add(curva, 'text', { x: L + 4, y: T + 4 }, 'SCE');
      add(curva, 'circle', { class: 'punto hi', cx: cx(b1), cy: cy(s), r: 6 });

      texto('o-u2-mc', fmt(b1));
      var minimo = Math.abs(b1 - a.b1) < 0.001;
      texto('t-u2-mc', 'b1 = ' + fmt(b1) + ' → SCE = ' + fmt(s) +
        (minimo ? ' ← ¡mínimo! Es la recta de mínimos cuadrados: ŷ = 2,1 + 1,3x' : '. Buscá la pendiente que la haga lo más chica posible.'));
    }
    rango.addEventListener('input', dibujar);
    dibujar();
  })();

  // ===== Situación: R² como porcentaje explicado =====
  (function () {
    var svg = document.getElementById('g-u2-r2'), barra = document.getElementById('g-u2-r2-barra'), rango = document.getElementById('r-u2-r2');
    if (!svg) return;
    var ruido = [1.2, -0.8, 0.5, -1.5, 0.9, -0.3, 1.4, -1.1, 0.2, -0.6];
    function dibujar() {
      var k = Number(rango.value);
      var pts = ruido.map(function (e, i) { return [i + 1, 2 + 0.8 * (i + 1) + k * e]; });
      var a = ajuste(pts), r2 = a.sct ? a.scr / a.sct : 1;
      dispersion(svg, { pts: pts, xmin: 0, xmax: 11, ymin: 0, ymax: 14, h: 190, xticks: [0, 2, 4, 6, 8, 10], yticks: [0, 7, 14],
        xlabel: 'x', ylabel: 'y', recta: { b0: a.b0, b1: a.b1 }, residuos: true });

      barra.textContent = '';
      barra.setAttribute('viewBox', '0 0 320 58');
      var ancho = 300 * r2;
      if (ancho > 0) add(barra, 'rect', { class: 'barra-scr', x: 10, y: 8, width: ancho, height: 22, rx: 3 });
      if (ancho < 300) add(barra, 'rect', { class: 'barra-sce', x: 10 + ancho, y: 8, width: 300 - ancho, height: 22, rx: 3 });
      add(barra, 'text', { class: 't-recta', x: 10, y: 46 }, 'SCR explicada ' + pct(r2));
      add(barra, 'text', { class: 't-residuo', x: 310, y: 46, 'text-anchor': 'end' }, 'SCE error ' + pct(1 - r2));

      texto('o-u2-r2', fmt(k));
      texto('t-u2-r2', 'R² = ' + fmt(Math.round(r2 * 100) / 100) + ': la recta explica el ' + pct(r2) + ' de la variabilidad de y. r = √R² = ' + fmt(Math.sqrt(r2)) + '.');
    }
    rango.addEventListener('input', dibujar);
    dibujar();
  })();

  // ===== Situación: extrapolar =====
  (function () {
    var svg = document.getElementById('g-u2-extra');
    if (!svg) return;
    var pts = [[2, 86], [3, 95], [4, 102], [5, 109], [6, 115], [7, 121], [8, 128], [9, 133], [10, 138]];
    var a = ajuste(pts);
    var e = dispersion(svg, { pts: pts, xmin: 0, xmax: 42, ymin: 0, ymax: 360, h: 210,
      xticks: [0, 10, 20, 30, 40], yticks: [0, 100, 200, 300], xlabel: 'edad (años)', ylabel: 'altura (cm)',
      recta: { b0: a.b0, b1: a.b1, desde: 2, hasta: 10 } });
    add(svg, 'line', { class: 'recta extrapolada', x1: e.x(10), y1: e.y(a.b0 + a.b1 * 10), x2: e.x(40), y2: e.y(a.b0 + a.b1 * 40) });
    add(svg, 'circle', { class: 'punto hi', cx: e.x(40), cy: e.y(a.b0 + a.b1 * 40), r: 5 });
    add(svg, 'text', { class: 't-residuo', x: e.x(40) - 8, y: e.y(a.b0 + a.b1 * 40) + 4, 'text-anchor': 'end' }, '¿333 cm a los 40 años?');
    add(svg, 'text', { x: e.x(6), y: e.y(20), 'text-anchor': 'middle' }, 'datos');
  })();

  // ===== Gráficos de ejercicios =====
  var MINI = {
    'g-u2-ej1-a': [[3.7, 4.3], [1.0, 1.8], [8.3, 7.2], [6.3, 5.5], [3.2, 3.7], [1.6, 2.5], [2.8, 4.2], [2.7, 3.6], [3.1, 3.4], [4.4, 4.3], [1.3, 1.4], [5.0, 6.0], [3.1, 3.4], [3.6, 4.1]],
    'g-u2-ej1-b': [[6.7, 3.4], [6.6, 5.9], [7.4, 1.5], [8.5, 4.2], [5.5, 8.1], [5.1, 5.9], [7.3, 7.1], [2.8, 8.3], [6.7, 7.6], [6.7, 7.7], [5.0, 7.4], [4.8, 8.8], [1.8, 2.0], [8.0, 8.5]],
    'g-u2-ej1-c': [[1.3, 2.3], [1.6, 3.3], [1.9, 3.7], [2.3, 5.2], [2.8, 6.5], [2.8, 5.9], [4.4, 9.0], [5.8, 8.0], [6.7, 7.5], [6.8, 6.9], [7.8, 5.0], [8.3, 3.2], [8.4, 3.4], [8.7, 2.4]],
    'g-u2-ej1-d': [[5.6, 4.8], [8.3, 3.1], [3.8, 8.5], [8.4, 2.1], [8.6, 3.7], [1.1, 7.7], [7.7, 5.5], [4.2, 6.7], [7.7, 6.3], [2.3, 8.0], [2.7, 5.5], [6.1, 2.9], [2.9, 4.3], [3.0, 4.1]]
  };
  for (var id in MINI) {
    var s = document.getElementById(id);
    if (s) dispersion(s, { pts: MINI[id], xmin: 0, xmax: 10, ymin: 0, ymax: 10, w: 160, h: 130, mini: true });
  }

  var EJERCICIOS = {
    'g-u2-ej3': { pts: EJ3, xmin: 0, xmax: 6, ymin: 0, ymax: 10, xticks: [0, 1, 2, 3, 4, 5, 6], yticks: [0, 2, 4, 6, 8, 10],
      xlabel: 'horas', ylabel: 'nota', recta: { b0: 2.1, b1: 1.3 }, residuos: true },
    'g-u2-ej4': { pts: [[0, 2.4], [4, 7.2], [14, 10.3], [10, 9.1], [9, 10.2], [8, 4.1], [6, 7.6], [1, 3.5]],
      xmin: 0, xmax: 15, ymin: 0, ymax: 12, xticks: [0, 5, 10, 15], yticks: [0, 4, 8, 12],
      xlabel: 'publicidad (%)', ylabel: 'ventas (%)', recta: { b0: 3.2958, b1: 0.5391 }, residuos: true, hi: [5] },
    'g-u2-ej6': { pts: [[80, 300], [79, 302], [83, 315], [84, 330], [78, 300], [60, 250], [82, 300], [85, 340], [79, 315], [84, 330], [80, 310], [62, 240]],
      xmin: 55, xmax: 90, ymin: 220, ymax: 360, xticks: [55, 60, 65, 70, 75, 80, 85, 90], yticks: [220, 260, 300, 340],
      xlabel: 'horas', ylabel: 'producción', recta: { b0: 31.7411, b1: 3.4734 }, residuos: true }
  };
  for (var k in EJERCICIOS) {
    var g = document.getElementById(k);
    if (g) dispersion(g, EJERCICIOS[k]);
  }
})();
