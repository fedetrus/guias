// Etapa 4 · Entrenar: fit() como búsqueda, regresión logística, árbol de decisión y regularización.
(function () {
  var D = window.Dsia, add = D.add, fmt = D.fmt, pct = D.pct, texto = D.texto;

  function sigmoide(z) { return 1 / (1 + Math.exp(-z)); }
  function media(v) { return v.reduce(function (s, t) { return s + t; }, 0) / v.length; }
  function desvio(v) { var m = media(v); return Math.sqrt(media(v.map(function (t) { return (t - m) * (t - m); }))); }

  // ===== fit(): una recta que se ajusta sola =====
  (function () {
    var svg = document.getElementById('g-fit');
    if (!svg) return;
    var rb1 = document.getElementById('r-b1'), rb0 = document.getElementById('r-b0'), boton = document.getElementById('b-fit');
    var rnd = D.azar(7), pts = [];
    for (var i = 0; i < 14; i++) {
      var x = 1 + rnd() * 13;
      pts.push([x, Math.min(10, Math.max(1, 2 + 0.5 * x + D.normal(rnd) * 0.8))]);
    }
    var xs = pts.map(function (p) { return p[0]; }), mx = media(xs), sx = desvio(xs);
    function mse(b0, b1) { return media(pts.map(function (p) { var e = p[1] - (b0 + b1 * p[0]); return e * e; })); }
    // Mínimo exacto (mínimos cuadrados), solo para mostrar a cuánto se puede llegar.
    var my = media(pts.map(function (p) { return p[1]; }));
    var b1Opt = media(pts.map(function (p) { return (p[0] - mx) * (p[1] - my); })) / (sx * sx), b0Opt = my - b1Opt * mx;
    var minimo = mse(b0Opt, b1Opt), historia = [];

    function dibujar() {
      var b0 = Number(rb0.value), b1 = Number(rb1.value);
      var e = D.plano(svg, { xmin: 0, xmax: 15, ymin: 0, ymax: 10.5, xticks: [0, 5, 10, 15], yticks: [0, 2, 4, 6, 8, 10],
        xlabel: 'horas de estudio por semana', ylabel: 'nota' });
      pts.forEach(function (p) { add(e.capa, 'line', { class: 'residuo', x1: e.x(p[0]), x2: e.x(p[0]), y1: e.y(p[1]), y2: e.y(b0 + b1 * p[0]) }); });
      add(e.capa, 'line', { class: 'recta', x1: e.x(0), y1: e.y(b0), x2: e.x(15), y2: e.y(b0 + 15 * b1) });
      pts.forEach(function (p) { add(svg, 'circle', { class: 'punto', cx: e.x(p[0]), cy: e.y(p[1]), r: 4 }); });
      texto('o-b1', fmt(b1)); texto('o-b0', fmt(b0));
      var m = mse(b0, b1);
      texto('t-fit', 'Error (MSE) = ' + fmt(m, 2) + ' · el mínimo posible es ' + fmt(minimo, 2) +
        (m - minimo < 0.005 ? '. Llegó: ninguna otra recta se equivoca menos con estos alumnos. Cada hora de estudio suma ' + fmt(b1) + ' puntos de nota.' : '.'));
      dibujarHistoria();
    }

    var curva = document.getElementById('g-fit-mse');
    function dibujarHistoria() {
      curva.textContent = '';
      curva.setAttribute('viewBox', '0 0 320 90');
      if (historia.length < 2) {
        add(curva, 'text', { x: 160, y: 48, 'text-anchor': 'middle' }, 'Tocá "Entrenar" para ver cómo baja el error paso a paso');
        return;
      }
      var top = Math.max.apply(null, historia), L = 34, R = 310, T = 10, B = 70;
      var x = function (i) { return L + i / (PASOS) * (R - L); }, y = function (v) { return B - (v / top) * (B - T); };
      add(curva, 'line', { class: 'eje', x1: L, x2: R, y1: B, y2: B });
      add(curva, 'line', { class: 'eje', x1: L, x2: L, y1: T, y2: B });
      add(curva, 'text', { x: L - 4, y: T + 4, 'text-anchor': 'end' }, fmt(top, 1));
      add(curva, 'text', { x: L - 4, y: B + 4, 'text-anchor': 'end' }, '0');
      add(curva, 'text', { x: R, y: B + 16, 'text-anchor': 'end' }, 'pasos de entrenamiento →');
      add(curva, 'text', { x: L + 4, y: B + 16 }, 'error');
      add(curva, 'polyline', { class: 'recta', points: historia.map(function (v, i) { return x(i) + ',' + y(v); }).join(' ') });
    }

    // Descenso por gradiente sobre x estandarizado: cada paso mueve las perillas cuesta abajo del error.
    var PASOS = 60, LR = 0.12;
    function paso(c) {
      var g0 = 0, g1 = 0;
      pts.forEach(function (p) {
        var z = (p[0] - mx) / sx, e = c[0] + c[1] * z - p[1];
        g0 += 2 * e / pts.length; g1 += 2 * e * z / pts.length;
      });
      return [c[0] - LR * g0, c[1] - LR * g1];
    }
    function aPerillas(c) { return { b1: c[1] / sx, b0: c[0] - c[1] * mx / sx }; }

    function entrenar() {
      var b1 = Number(rb1.value), b0 = Number(rb0.value);
      var c = [b0 + b1 * mx, b1 * sx], n = 0;
      historia = [mse(b0, b1)];
      boton.disabled = rb0.disabled = rb1.disabled = true;
      function avanzar() {
        c = paso(c); n++;
        var p = aPerillas(c);
        rb1.value = p.b1; rb0.value = p.b0;
        historia.push(mse(p.b0, p.b1));
        if (n < PASOS && !D.menosMovimiento()) { dibujar(); requestAnimationFrame(avanzar); return; }
        if (n < PASOS) { avanzar(); return; }
        boton.disabled = rb0.disabled = rb1.disabled = false;
        dibujar();
      }
      avanzar();
    }

    boton.addEventListener('click', entrenar);
    [rb0, rb1].forEach(function (r) { r.addEventListener('input', function () { historia = []; dibujar(); }); });
    dibujar();
  })();

  // ===== Regresión logística: curva en S y umbral =====
  (function () {
    var svg = document.getElementById('g-log');
    if (!svg) return;
    var rUmbral = document.getElementById('r-umbral'), kRecta = document.getElementById('k-recta');
    // 40 alumnos: cuanto más estudian, más probable que aprueben (c = 1).
    var rnd = D.azar(11), pts = [];
    for (var i = 0; i < 40; i++) {
      var h = rnd() * 14;
      pts.push({ x: h, c: rnd() < sigmoide(h - 5.5) ? 1 : 0, j: rnd() });
    }
    var xs = pts.map(function (p) { return p.x; }), mx = media(xs), sx = desvio(xs);

    // Ajuste de la logística (descenso por gradiente sobre x estandarizado).
    var w0 = 0, w1 = 0;
    for (var it = 0; it < 3000; it++) {
      var g0 = 0, g1 = 0;
      pts.forEach(function (p) { var z = (p.x - mx) / sx, e = sigmoide(w0 + w1 * z) - p.c; g0 += e; g1 += e * z; });
      w0 -= 0.5 * g0 / pts.length; w1 -= 0.5 * g1 / pts.length;
    }
    var prob = function (x) { return sigmoide(w0 + w1 * (x - mx) / sx); };
    // Recta común sobre las etiquetas 0/1, para comparar.
    var my = media(pts.map(function (p) { return p.c; }));
    var a1 = media(pts.map(function (p) { return (p.x - mx) * (p.c - my); })) / (sx * sx), a0 = my - a1 * mx;

    function dibujar() {
      var u = Number(rUmbral.value), recta = kRecta.checked;
      var e = D.plano(svg, { xmin: 0, xmax: 15, ymin: -0.3, ymax: 1.3, h: 230, xticks: [0, 5, 10, 15], yticks: [0, 0.5, 1],
        xlabel: 'horas de estudio por semana', ylabel: 'P(aprobar)' });
      [0, 1].forEach(function (v) { add(e.capa, 'line', { class: 'guia', x1: e.L, x2: e.R, y1: e.y(v), y2: e.y(v) }); });
      var corte = mx + sx * (Math.log(u / (1 - u)) - w0) / w1;
      add(e.capa, 'rect', { class: 'region', x: e.x(corte), y: e.T, width: e.R - e.x(corte), height: e.B - e.T });
      add(e.capa, 'line', { class: 'guia', x1: e.L, x2: e.R, y1: e.y(u), y2: e.y(u) });
      add(e.capa, 'line', { class: 'eje', x1: e.x(corte), x2: e.x(corte), y1: e.T, y2: e.B, 'stroke-width': 2 });
      var camino = [];
      for (var x = 0; x <= 15; x += 0.1) camino.push(e.x(x) + ',' + e.y(prob(x)));
      add(e.capa, 'polyline', { class: 'recta', points: camino.join(' ') });
      if (recta) add(e.capa, 'line', { class: 'recta texto', x1: e.x(0), y1: e.y(a0), x2: e.x(15), y2: e.y(a0 + a1 * 15) });
      add(svg, 'text', { class: 't-acento', x: e.x(corte) + 4, y: e.T + 10 }, 'aprueba →');
      add(svg, 'text', { x: e.x(corte) - 4, y: e.T + 10, 'text-anchor': 'end' }, '← no aprueba');

      var errores = { 0: 0, 1: 0 };
      pts.forEach(function (p) {
        var cy = e.y(p.c === 1 ? 1 - p.j * 0.12 : p.j * 0.12);
        add(svg, 'circle', { class: p.c ? 'pA' : 'pB', cx: e.x(p.x), cy: cy, r: 4 });
        if ((prob(p.x) >= u ? 1 : 0) !== p.c) {
          errores[p.c]++;
          add(svg, 'circle', { class: 'mal', cx: e.x(p.x), cy: cy, r: 7 });
        }
      });
      texto('o-umbral', fmt(u));
      texto('t-log', 'Con umbral ' + fmt(u) + ', el modelo dice que aprueba desde ' + fmt(corte, 1) + ' horas. Errores: ' + (errores[0] + errores[1]) +
        ' de 40 (' + errores[0] + ' no aprobaron y el modelo dijo que sí; ' + errores[1] + ' al revés).' +
        (recta ? ' La recta da ' + fmt(a0) + ' para 0 horas y ' + fmt(a0 + a1 * 15) + ' para 15: no pueden ser probabilidades.' : ''));
    }
    rUmbral.addEventListener('input', dibujar);
    kRecta.addEventListener('change', dibujar);
    dibujar();
  })();

  // ===== Árbol de decisión: profundidad y sobreajuste =====
  (function () {
    var svg = document.getElementById('g-arbol');
    if (!svg) return;
    var rango = document.getElementById('r-prof'), MAX = 10;
    var NOMBRES = ['horas', 'asistencia'];

    // Alumnos simulados: aprobar (1) depende de las horas y de la asistencia, con casos que no siguen la regla.
    var rnd = D.azar(122);
    function caso() {
      var h = rnd() * 15, a = 40 + rnd() * 60;
      return { v: [h, a], c: rnd() < sigmoide(1.1 * (h - 5.5) + 0.09 * (a - 75)) ? 1 : 0 };
    }
    var train = [], test = [];
    for (var i = 0; i < 120; i++) train.push(caso());
    for (i = 0; i < 300; i++) test.push(caso());

    // CART con Gini: en cada nodo prueba todos los cortes posibles y se queda con el que deja hijos más "puros".
    function gini(casos) {
      if (!casos.length) return 0;
      var p = casos.filter(function (k) { return k.c === 1; }).length / casos.length;
      return 1 - p * p - (1 - p) * (1 - p);
    }
    function crecer(casos, prof) {
      var malos = casos.filter(function (k) { return k.c === 1; }).length;
      var nodo = { clase: malos * 2 > casos.length ? 1 : 0, prof: prof, n: casos.length };
      if (prof === MAX || malos === 0 || malos === casos.length) return nodo;
      var mejor = null;
      [0, 1].forEach(function (f) {
        var valores = casos.map(function (k) { return k.v[f]; }).sort(function (a, b) { return a - b; });
        for (var j = 1; j < valores.length; j++) {
          if (valores[j] === valores[j - 1]) continue;
          var u = (valores[j] + valores[j - 1]) / 2;
          var izq = casos.filter(function (k) { return k.v[f] <= u; }), der = casos.filter(function (k) { return k.v[f] > u; });
          var costo = (izq.length * gini(izq) + der.length * gini(der)) / casos.length;
          if (!mejor || costo < mejor.costo - 1e-12) mejor = { costo: costo, f: f, u: u, izq: izq, der: der };
        }
      });
      if (!mejor || mejor.costo >= gini(casos)) return nodo;
      nodo.f = mejor.f; nodo.u = mejor.u;
      nodo.izq = crecer(mejor.izq, prof + 1); nodo.der = crecer(mejor.der, prof + 1);
      return nodo;
    }
    var raiz = crecer(train, 0);
    // Un árbol con max_depth = d es el mismo árbol completo cortado en la profundidad d.
    function hoja(nodo, d) { return nodo.f == null || nodo.prof >= d; }
    function predecir(v, d) {
      var n = raiz;
      while (!hoja(n, d)) n = v[n.f] <= n.u ? n.izq : n.der;
      return n.clase;
    }
    function acierto(casos, d) { return casos.filter(function (k) { return predecir(k.v, d) === k.c; }).length / casos.length; }
    var curvaTrain = [], curvaTest = [];
    for (var d = 1; d <= MAX; d++) { curvaTrain.push(acierto(train, d)); curvaTest.push(acierto(test, d)); }
    var mejorD = curvaTest.indexOf(Math.max.apply(null, curvaTest)) + 1;

    var B = { xmin: 0, xmax: 15, ymin: 40, ymax: 100 };
    function zonas(nodo, d, caja, fn) {
      if (hoja(nodo, d)) { fn(caja, nodo); return; }
      var a = caja.slice(), b = caja.slice();   // caja = [xmin, xmax, ymin, ymax]
      a[nodo.f * 2 + 1] = nodo.u; b[nodo.f * 2] = nodo.u;
      zonas(nodo.izq, d, a, fn); zonas(nodo.der, d, b, fn);
    }
    // Clase de un subárbol si todas sus hojas dicen lo mismo (así no se muestran preguntas que no cambian nada).
    function unica(nodo, d) {
      if (hoja(nodo, d)) return nodo.clase;
      var a = unica(nodo.izq, d), b = unica(nodo.der, d);
      return a === b ? a : null;
    }
    function reglas(nodo, d) {
      var c0 = unica(nodo, d);
      if (c0 != null) return ' → <strong>' + (c0 ? 'aprueba' : 'no aprueba') + '</strong>';
      var c = NOMBRES[nodo.f] + ' ', u = nodo.f ? Math.round(nodo.u) + '%' : fmt(nodo.u, 1);
      return '<ul class="reglas"><li>' + c + '≤ ' + u + reglas(nodo.izq, d) + '</li><li>' + c + '> ' + u + reglas(nodo.der, d) + '</li></ul>';
    }

    function dibujar() {
      var dmax = Number(rango.value), hojas = 0;
      var e = D.plano(svg, { xmin: B.xmin, xmax: B.xmax, ymin: B.ymin, ymax: B.ymax, h: 230,
        xticks: [0, 5, 10, 15], yticks: [40, 60, 80, 100], xlabel: 'horas de estudio', ylabel: 'asistencia (%)' });
      zonas(raiz, dmax, [B.xmin, B.xmax, B.ymin, B.ymax], function (c, nodo) {
        hojas++;
        var r = { x: e.x(c[0]), y: e.y(c[3]), width: e.x(c[1]) - e.x(c[0]), height: e.y(c[2]) - e.y(c[3]) };
        if (nodo.clase) add(e.capa, 'rect', Object.assign({ class: 'region' }, r));
        add(e.capa, 'rect', Object.assign({ class: 'marco' }, r));
      });
      train.forEach(function (k) {
        var cx = e.x(k.v[0]), cy = e.y(k.v[1]);
        add(svg, 'circle', { class: k.c ? 'pA' : 'pB', cx: cx, cy: cy, r: 3.2 });
        if (predecir(k.v, dmax) !== k.c) add(svg, 'circle', { class: 'mal', cx: cx, cy: cy, r: 6 });
      });

      var tr = curvaTrain[dmax - 1], te = curvaTest[dmax - 1];
      texto('o-prof', dmax === MAX ? MAX + ' (sin límite)' : dmax);
      texto('t-arbol', 'Acierta ' + pct(tr) + ' en entrenamiento y ' + pct(te) + ' en prueba. ' +
        (tr - te > 0.06 ? 'La distancia entre las dos es sobreajuste: el árbol memorizó casos puntuales. ' : '') +
        'La mejor profundidad para la prueba es ' + mejorD + '.');
      document.getElementById('reglas-arbol').innerHTML = dmax <= 3
        ? '<p class="mb-1 fw-semibold">Las reglas que aprendió:</p>' + reglas(raiz, dmax).replace('<ul class="reglas">', '<ul class="reglas mb-2">')
        : '<p class="muted">Con profundidad ' + dmax + ' el árbol tiene ' + hojas + ' hojas: ya no se puede leer como reglas.</p>';
      dibujarCurva(dmax);
    }

    var curva = document.getElementById('g-arbol-curva');
    function dibujarCurva(dmax) {
      var e = D.plano(curva, { xmin: 1, xmax: MAX, ymin: 0.7, ymax: 1, h: 150, xticks: [1, 2, 4, 6, 8, 10], yticks: [0.7, 0.8, 0.9, 1],
        xlabel: 'profundidad', ylabel: 'acierto' });
      var linea = function (v) { return v.map(function (a, i) { return e.x(i + 1) + ',' + e.y(a); }).join(' '); };
      add(e.capa, 'line', { class: 'guia', x1: e.x(dmax), x2: e.x(dmax), y1: e.T, y2: e.B });
      add(e.capa, 'polyline', { class: 'recta', points: linea(curvaTrain) });
      add(e.capa, 'polyline', { class: 'recta texto', points: linea(curvaTest) });
      add(curva, 'circle', { class: 'punto', cx: e.x(dmax), cy: e.y(curvaTrain[dmax - 1]), r: 4 });
      add(curva, 'circle', { class: 'punto texto', cx: e.x(dmax), cy: e.y(curvaTest[dmax - 1]), r: 4 });
      // Leyenda arriba a la izquierda, donde las curvas todavía no llegan.
      add(curva, 'line', { class: 'recta', x1: e.L + 8, x2: e.L + 28, y1: e.T + 6, y2: e.T + 6 });
      add(curva, 'text', { class: 't-acento', x: e.L + 34, y: e.T + 10 }, 'entrenamiento');
      add(curva, 'line', { class: 'recta texto', x1: e.L + 8, x2: e.L + 28, y1: e.T + 22, y2: e.T + 22 });
      add(curva, 'text', { class: 'fuerte', x: e.L + 34, y: e.T + 26 }, 'prueba');
    }

    rango.addEventListener('input', dibujar);
    dibujar();
  })();

  // ===== Ridge y Lasso: coeficientes según alpha =====
  (function () {
    var svg = document.getElementById('g-reg');
    if (!svg) return;
    var rango = document.getElementById('r-alpha'), botones = document.querySelectorAll('[data-reg]');
    var VARS = ['horas de estudio', 'asistencia', 'horas de sueño', 'horas en biblioteca', 'dígito del DNI'];
    var tipo = 'ridge';

    // Datos simulados: "biblioteca" casi copia a las horas de estudio y el DNI es ruido puro.
    var rnd = D.azar(3), n = 80, X = [], y = [];
    for (var i = 0; i < n; i++) {
      var z = [D.normal(rnd), D.normal(rnd), D.normal(rnd), 0, D.normal(rnd)];
      z[3] = 0.95 * z[0] + 0.3 * D.normal(rnd);
      X.push(z);
      y.push(0.8 * z[0] + 0.35 * z[1] + 0.25 * z[2] + D.normal(rnd) * 0.5);
    }
    // Estandarizar columnas y centrar y (como hace StandardScaler antes del modelo).
    for (var j = 0; j < 5; j++) {
      var col = X.map(function (f) { return f[j]; }), m = media(col), s = desvio(col);
      X.forEach(function (f) { f[j] = (f[j] - m) / s; });
    }
    var my = media(y); y = y.map(function (v) { return v - my; });

    function resolver(A, b) {   // eliminación de Gauss, para el sistema de Ridge (5×5)
      var M = A.map(function (f, i) { return f.concat(b[i]); }), k = M.length;
      for (var c = 0; c < k; c++) {
        var p = c;
        for (var r = c + 1; r < k; r++) if (Math.abs(M[r][c]) > Math.abs(M[p][c])) p = r;
        var t = M[c]; M[c] = M[p]; M[p] = t;
        for (r = c + 1; r < k; r++) {
          var f = M[r][c] / M[c][c];
          for (var q = c; q <= k; q++) M[r][q] -= f * M[c][q];
        }
      }
      var w = new Array(k);
      for (c = k - 1; c >= 0; c--) {
        var s = M[c][k];
        for (q = c + 1; q < k; q++) s -= M[c][q] * w[q];
        w[c] = s / M[c][c];
      }
      return w;
    }
    // Ridge de scikit-learn: minimiza ‖y − Xw‖² + α‖w‖²  →  (XᵀX + αI) w = Xᵀy
    function ridge(alpha) {
      var A = [], b = [];
      for (var a = 0; a < 5; a++) {
        A.push([]);
        b.push(X.reduce(function (s, f, i) { return s + f[a] * y[i]; }, 0));
        for (var c = 0; c < 5; c++) A[a].push(X.reduce(function (s, f) { return s + f[a] * f[c]; }, 0) + (a === c ? alpha : 0));
      }
      return resolver(A, b);
    }
    // Lasso de scikit-learn: minimiza ‖y − Xw‖² / 2n + α‖w‖₁, por descenso de coordenadas.
    function lasso(alpha) {
      var w = [0, 0, 0, 0, 0];
      for (var it = 0; it < 300; it++) {
        for (var a = 0; a < 5; a++) {
          var rho = 0;
          X.forEach(function (f, i) {
            var pred = 0;
            for (var c = 0; c < 5; c++) if (c !== a) pred += f[c] * w[c];
            rho += f[a] * (y[i] - pred);
          });
          rho /= n;   // columnas estandarizadas: Σx²/n = 1
          w[a] = Math.sign(rho) * Math.max(Math.abs(rho) - alpha, 0);
        }
      }
      return w;
    }
    // Las dos clases miden alpha en escalas distintas: se recorre un rango útil para cada una.
    function alphaDe(v) {
      if (v === 0) return 0;
      return tipo === 'ridge' ? Math.pow(10, -1 + 4 * v / 100) : Math.pow(10, -3 + 3 * v / 100);
    }

    function dibujar() {
      var alpha = alphaDe(Number(rango.value)), w = tipo === 'ridge' ? ridge(alpha) : lasso(alpha);
      var L = 116, R = 284, x0 = L + (R - L) * 0.5 / 1.75, FILA = 30;
      var x = function (v) { return x0 + v * (R - L) / 1.75; };   // eje de −0,5 a 1,25 (deja lugar al rótulo)
      svg.textContent = '';
      svg.setAttribute('viewBox', '0 0 320 ' + (VARS.length * FILA + 26));
      add(svg, 'line', { class: 'eje', x1: x0, x2: x0, y1: 4, y2: VARS.length * FILA + 6 });
      add(svg, 'text', { x: x0, y: VARS.length * FILA + 22, 'text-anchor': 'middle' }, '0');
      VARS.forEach(function (nombre, i) {
        var yc = 8 + i * FILA, v = w[i], cero = Math.abs(v) < 1e-6;
        add(svg, 'text', { class: 'fuerte', x: L - 8, y: yc + 13, 'text-anchor': 'end' }, nombre);
        if (!cero) add(svg, 'rect', { class: 'barra' + (v < 0 ? ' neg' : ''), x: Math.min(x(0), x(v)), y: yc, width: Math.abs(x(v) - x(0)), height: 18, rx: 2 });
        add(svg, 'text', { class: cero ? 'fuerte' : '', x: v < 0 && !cero ? x(v) - 4 : x(Math.max(v, 0)) + 4, y: yc + 13,
          'text-anchor': v < 0 && !cero ? 'end' : 'start' }, cero ? '0 · apagada' : fmt(v));
      });
      var apagadas = VARS.filter(function (nombre, i) { return Math.abs(w[i]) < 1e-6; });
      texto('o-alpha', alpha === 0 ? '0' : fmt(alpha, alpha < 0.01 ? 3 : 2));
      texto('t-reg', alpha === 0
        ? 'Sin multa es LinearRegression: el DNI recibe algo de peso por pura casualidad, y estudio y biblioteca se reparten el peso de forma rara porque son casi lo mismo.'
        : tipo === 'ridge'
          ? 'Ridge: todos se achican y ninguno llega a 0. El DNI sigue ahí, con poco peso.'
          : (apagadas.length ? 'Lasso apagó ' + apagadas.length + ' de 5: ' + apagadas.join(', ') + '.' : 'Lasso todavía no apagó ninguna; subí alpha.') +
            (apagadas.length === 5 ? ' Con todas apagadas solo predice la nota promedio: es lo que casi le pasó a la clase con alpha = 1.' : ''));
    }

    botones.forEach(function (b) {
      b.addEventListener('click', function () {
        tipo = b.dataset.reg;
        botones.forEach(function (o) { o.setAttribute('aria-pressed', o === b); });
        dibujar();
      });
    });
    rango.addEventListener('input', dibujar);
    dibujar();
  })();
})();
