// Unidad 4 · Probabilidad: gráficos de ejercicios e interactivos.
(function () {
  var R = window.Repaso, add = R.add, fmt = R.fmt;
  var reducir = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  function $(id) { return document.getElementById(id); }
  function fmt4(v) { return (Math.round(v * 10000) / 10000).toLocaleString('es-AR', { maximumFractionDigits: 4 }); }
  function asignar(destino, a, b) { for (var k in a) destino[k] = a[k]; for (var j in b) destino[j] = b[j]; return destino; }

  // Botones de opción única: marca el elegido con aria-pressed y avisa al callback.
  function botonera(selector, atributo, alElegir, inicial) {
    var botones = document.querySelectorAll(selector);
    function elegir(valor) {
      botones.forEach(function (b) { b.setAttribute('aria-pressed', b.dataset[atributo] === valor); });
      alElegir(valor);
    }
    botones.forEach(function (b) { b.addEventListener('click', function () { elegir(b.dataset[atributo]); }); });
    if (botones.length) elegir(inicial);
  }

  // GENÉRICO: diagrama de Venn de dos eventos con una región sombreada.
  // cfg: { a, b, valores: { soloA, ambos, soloB, fuera } (textos), region: 'A'|'B'|'union'|'inter'|'soloA'|'soloB'|'Ac'|'Bc'|'ninguno' }
  function venn(svg, cfg) {
    svg.textContent = '';
    svg.setAttribute('viewBox', '0 0 320 180');
    var id = svg.id, A = { cx: 125, cy: 98, r: 60 }, B = { cx: 195, cy: 98, r: 60 };
    var S = { x: 8, y: 8, width: 304, height: 164, rx: 8 };
    var defs = add(svg, 'defs', {});
    function mascara(nombre, sacar) {
      var m = add(defs, 'mask', { id: id + '-' + nombre, maskUnits: 'userSpaceOnUse', x: 0, y: 0, width: 320, height: 180 });
      add(m, 'rect', { x: 0, y: 0, width: 320, height: 180, fill: 'white' });
      sacar.forEach(function (c) { add(m, 'circle', { cx: c.cx, cy: c.cy, r: c.r, fill: 'black' }); });
    }
    mascara('sinA', [A]); mascara('sinB', [B]); mascara('sinAB', [A, B]);
    add(add(defs, 'clipPath', { id: id + '-enB' }), 'circle', B);
    function url(n) { return 'url(#' + id + '-' + n + ')'; }
    var formas = {
      A: [['circle', A, {}]], B: [['circle', B, {}]],
      union: [['circle', A, {}], ['circle', B, {}]],
      inter: [['circle', A, { 'clip-path': url('enB') }]],
      soloA: [['circle', A, { mask: url('sinB') }]],
      soloB: [['circle', B, { mask: url('sinA') }]],
      Ac: [['rect', S, { mask: url('sinA') }]],
      Bc: [['rect', S, { mask: url('sinB') }]],
      ninguno: [['rect', S, { mask: url('sinAB') }]]
    };
    // La opacidad va en el grupo: así la zona donde se superponen A y B no queda más oscura.
    var g = add(svg, 'g', { class: 'u4-sombra' });
    (formas[cfg.region] || []).forEach(function (f) { add(g, f[0], asignar({}, f[1], f[2])); });

    add(svg, 'rect', asignar({ class: 'u4-borde' }, S));
    add(svg, 'circle', asignar({ class: 'u4-borde' }, A));
    add(svg, 'circle', asignar({ class: 'u4-borde' }, B));
    add(svg, 'text', { class: 'fuerte', x: 20, y: 28 }, 'S');
    add(svg, 'text', { class: 'fuerte', x: 88, y: 30, 'text-anchor': 'middle' }, cfg.a || 'A');
    add(svg, 'text', { class: 'fuerte', x: 232, y: 30, 'text-anchor': 'middle' }, cfg.b || 'B');
    var v = cfg.valores || {};
    [[v.soloA, 95], [v.ambos, 160], [v.soloB, 225]].forEach(function (p) {
      if (p[0] != null) add(svg, 'text', { class: 'fuerte', x: p[1], y: 102, 'text-anchor': 'middle' }, p[0]);
    });
    if (v.fuera != null) add(svg, 'text', { class: 'fuerte', x: 302, y: 164, 'text-anchor': 'end' }, v.fuera);
  }

  // GENÉRICO: los 36 resultados de tirar dos dados (fila = dado 1, columna = dado 2).
  // cfg: { cond(d1, d2) → bool (universo, opcional), fav(d1, d2) → bool }. Devuelve cuántos casos hay en cada uno.
  function gridDados(svg, cfg) {
    svg.textContent = '';
    svg.setAttribute('viewBox', '0 0 320 250');
    var t = 34, x0 = 78, y0 = 34, n = { cond: 0, fav: 0 };
    add(svg, 'text', { x: x0 + 3 * t, y: 14, 'text-anchor': 'middle' }, 'Dado 2 →');
    var yc = y0 + 3 * t;
    add(svg, 'text', { x: x0 - 30, y: yc, 'text-anchor': 'middle', transform: 'rotate(-90 ' + (x0 - 30) + ' ' + yc + ')' }, 'Dado 1 →');
    for (var i = 1; i <= 6; i++) {
      add(svg, 'text', { x: x0 + (i - 0.5) * t, y: y0 - 6, 'text-anchor': 'middle' }, i);
      add(svg, 'text', { x: x0 - 8, y: y0 + (i - 0.5) * t + 4, 'text-anchor': 'end' }, i);
      for (var j = 1; j <= 6; j++) {
        var enU = cfg.cond ? cfg.cond(i, j) : true;
        var esF = enU && !!cfg.fav && cfg.fav(i, j);
        if (enU) n.cond++;
        if (esF) n.fav++;
        var clase = esF ? ' fav' : cfg.cond ? (enU ? ' cond' : ' fuera') : '';
        var g = add(svg, 'g', { class: 'u4-celda' + clase });
        var r = add(g, 'rect', { x: x0 + (j - 1) * t + 1, y: y0 + (i - 1) * t + 1, width: t - 2, height: t - 2, rx: 4 });
        add(r, 'title', {}, '(' + i + ', ' + j + ') · suma ' + (i + j));
        add(g, 'text', { x: x0 + (j - 0.5) * t, y: y0 + (i - 0.5) * t + 4, 'text-anchor': 'middle' }, i + j);
      }
    }
    return n;
  }

  // GENÉRICO: árbol de probabilidades de dos etapas, dibujado de izquierda a derecha.
  // cfg: { ramas: [{ label, p, hijos: [{ label, p }] }], on(i, j) → false | 'on' | 'clave' (camino resaltado) }
  function arbol(svg, cfg) {
    svg.textContent = '';
    var n = cfg.ramas.length, paso = 36, alto = n * 2 * paso + 10;
    svg.setAttribute('viewBox', '0 0 320 ' + alto);
    var x0 = 10, x1 = 112, x2 = 190, raizY = alto / 2;
    function estado(i, j) { return (cfg.on && cfg.on(i, j)) || ''; }
    cfg.ramas.forEach(function (r, i) {
      var y1 = (2 * i + 1) * paso + 5;
      var eR = estado(i, 0) === 'clave' || estado(i, 1) === 'clave' ? 'clave' : (estado(i, 0) || estado(i, 1));
      add(svg, 'line', { class: 'u4-rama ' + eR, x1: x0, y1: raizY, x2: x1 - 32, y2: y1 });
      // El rótulo va pegado al nodo, del lado donde no pasa la línea.
      var dy = y1 < raizY - 1 ? -6 : y1 > raizY + 1 ? 14 : -6;
      add(svg, 'text', { class: eR ? 'fuerte' : '', x: x1 - 38, y: y1 + dy, 'text-anchor': 'end' }, fmt4(r.p));
      add(svg, 'rect', { class: 'nodo', x: x1 - 32, y: y1 - 11, width: 64, height: 22, rx: 6 });
      add(svg, 'text', { class: 'fuerte', x: x1, y: y1 + 4, 'text-anchor': 'middle' }, r.label);
      r.hijos.forEach(function (h, j) {
        var y2 = (2 * i + j + 0.5) * paso + 5, e = estado(i, j);
        add(svg, 'line', { class: 'u4-rama ' + e, x1: x1 + 32, y1: y1, x2: x2, y2: y2 });
        add(svg, 'text', { class: e ? 'fuerte' : '', x: (x1 + 32 + x2) / 2, y: (y1 + y2) / 2 + (j ? 12 : -4), 'text-anchor': 'middle' }, fmt4(h.p));
        add(svg, 'text', { class: e ? 'fuerte' : '', x: x2 + 4, y: y2 + 4 }, h.label);
        add(svg, 'text', { class: e ? 'fuerte' : '', x: 316, y: y2 + 4, 'text-anchor': 'end' }, fmt4(r.p * h.p));
      });
    });
    add(svg, 'circle', { class: 'punto', cx: x0, cy: raizY, r: 5 });
  }

  // GENÉRICO: fichas (pelotas, cartas…) agrupadas en filas; los grupos con hi: true se resaltan como favorables.
  function fichas(svg, grupos) {
    svg.textContent = '';
    svg.setAttribute('viewBox', '0 0 320 ' + (grupos.length * 28 + 8));
    grupos.forEach(function (g, i) {
      var y = 20 + i * 28;
      add(svg, 'text', { class: g.hi ? 'fuerte' : '', x: 4, y: y + 4 }, g.label);
      for (var k = 0; k < g.n; k++) add(svg, 'circle', { class: 'u4-ficha' + (g.hi ? ' fav' : ''), cx: 112 + k * 18, cy: y, r: 7 });
    });
  }

  // Mini Venn para las fichas del lenguaje de los eventos (112 px de ancho).
  // region: 'union' | 'inter' | 'Ac' | 'excl' | 'cond'
  function miniVenn(svg, region) {
    svg.textContent = '';
    svg.setAttribute('viewBox', '0 0 120 72');
    var id = svg.id, S = { x: 3, y: 3, width: 114, height: 66, rx: 6 };
    var A = region === 'excl' ? { cx: 36, cy: 38, r: 19 } : { cx: 48, cy: 38, r: 22 };
    var B = region === 'excl' ? { cx: 84, cy: 38, r: 19 } : { cx: 72, cy: 38, r: 22 };
    var defs = add(svg, 'defs', {});
    var sinA = add(defs, 'mask', { id: id + '-sinA', maskUnits: 'userSpaceOnUse', x: 0, y: 0, width: 120, height: 72 });
    add(sinA, 'rect', { x: 0, y: 0, width: 120, height: 72, fill: 'white' });
    add(sinA, 'circle', asignar({ fill: 'black' }, A));
    var sinB = add(defs, 'mask', { id: id + '-sinB', maskUnits: 'userSpaceOnUse', x: 0, y: 0, width: 120, height: 72 });
    add(sinB, 'rect', { x: 0, y: 0, width: 120, height: 72, fill: 'white' });
    add(sinB, 'circle', asignar({ fill: 'black' }, B));
    add(add(defs, 'clipPath', { id: id + '-enB' }), 'circle', B);
    function url(n) { return 'url(#' + id + '-' + n + ')'; }

    if (region === 'cond') add(svg, 'rect', asignar({ class: 'u4-afuera', mask: url('sinB') }, S));
    var g = add(svg, 'g', { class: 'u4-sombra' });
    if (region === 'union' || region === 'excl') { add(g, 'circle', A); add(g, 'circle', B); }
    if (region === 'inter' || region === 'cond') add(g, 'circle', asignar({ 'clip-path': url('enB') }, A));
    if (region === 'Ac') add(g, 'rect', asignar({ mask: url('sinA') }, S));

    add(svg, 'rect', asignar({ class: 'u4-borde' }, S));
    add(svg, 'circle', asignar({ class: 'u4-borde' }, A));
    add(svg, 'circle', asignar({ class: region === 'cond' ? 'u4-borde u4-universo' : 'u4-borde' }, B));
    add(svg, 'text', { class: 'fuerte', x: A.cx - (region === 'excl' ? 0 : 10), y: A.cy + 4, 'text-anchor': 'middle' }, 'A');
    add(svg, 'text', { class: 'fuerte', x: B.cx + (region === 'excl' ? 0 : 10), y: B.cy + 4, 'text-anchor': 'middle' }, 'B');
  }
  ['union', 'inter', 'Ac', 'excl', 'cond'].forEach(function (r) {
    var svg = $('g-u4-m-' + r);
    if (svg) miniVenn(svg, r);
  });

  // ===== Gráficos fijos de los ejercicios =====
  var ej1 = $('u4-ej1');
  if (ej1) fichas(ej1, [{ label: 'Azules (10)', n: 10 }, { label: 'Amarillas (4)', n: 4 }, { label: 'Rojas (7)', n: 7, hi: true }]);
  var ej3 = $('u4-ej3');
  if (ej3) venn(ej3, { a: 'Antígeno A', b: 'Antígeno B', region: 'Bc', valores: { soloA: '0,35', ambos: '0,05', soloB: '0,10', fuera: 'O: 0,50' } });
  var ej4 = $('u4-ej4');
  if (ej4) venn(ej4, { a: 'Produce A', b: 'Produce B', region: 'union', valores: { soloA: '0,2125', ambos: '0,0375', soloB: '0,1125', fuera: 'ninguna: 0,6375' } });
  var ej5a = $('u4-ej5a');
  if (ej5a) gridDados(ej5a, { cond: function (a, b) { return (a + b) % 2 === 1; }, fav: function (a, b) { return a + b === 7; } });
  var ej5b = $('u4-ej5b');
  if (ej5b) gridDados(ej5b, { cond: function (a, b) { return a + b > 6; }, fav: function (a, b) { return a + b === 7; } });
  var ej8 = $('u4-ej8');
  if (ej8) arbol(ej8, {
    ramas: [
      { label: 'Planta A', p: 0.15, hijos: [{ label: 'Funciona', p: 0.97 }, { label: 'No funciona', p: 0.03 }] },
      { label: 'Planta B', p: 0.35, hijos: [{ label: 'Funciona', p: 0.98 }, { label: 'No funciona', p: 0.02 }] },
      { label: 'Planta C', p: 0.5, hijos: [{ label: 'Funciona', p: 0.99 }, { label: 'No funciona', p: 0.01 }] }
    ],
    on: function (i, j) { return j === 0 ? (i === 1 ? 'clave' : 'on') : false; }
  });

  // ===== Interactivo: Laplace con dos dados =====
  (function () {
    var svg = $('u4-dados');
    if (!svg) return;
    var eventos = {
      suma7: { fav: function (a, b) { return a + b === 7; }, txt: 'Suma 7' },
      par: { fav: function (a, b) { return (a + b) % 2 === 0; }, txt: 'Suma par' },
      dobles: { fav: function (a, b) { return a === b; }, txt: 'Dobles (los dos iguales)' },
      seis: { fav: function (a, b) { return a === 6 || b === 6; }, txt: 'Al menos un 6' }
    };
    botonera('[data-u4-dados]', 'u4Dados', function (clave) {
      var n = gridDados(svg, { fav: eventos[clave].fav });
      $('u4-t-dados').textContent = eventos[clave].txt + ': ' + n.fav + ' casos favorables de 36 posibles → P = ' +
        n.fav + '/36 ≈ ' + fmt(n.fav / 36);
    }, 'suma7');
  })();

  // ===== Interactivo: frecuencia relativa → probabilidad =====
  (function () {
    var svg = $('u4-sim');
    if (!svg) return;
    var total = 0, seis = 0, serie = [], ultimo = null, corriendo = false, MAX = 5000;
    var L = 40, Rr = 300, T = 12, B = 140;
    function y(v) { return B - v * (B - T); }
    function dibujar() {
      svg.textContent = '';
      svg.setAttribute('viewBox', '0 0 320 170');
      var xmax = Math.max(10, total);
      function x(i) { return L + (i / xmax) * (Rr - L); }
      add(svg, 'line', { class: 'eje', x1: L, x2: Rr, y1: B, y2: B });
      add(svg, 'line', { class: 'eje', x1: L, x2: L, y1: T, y2: B });
      [[0, '0'], [0.5, '0,5'], [1, '1']].forEach(function (t) {
        add(svg, 'text', { x: L - 6, y: y(t[0]) + 4, 'text-anchor': 'end' }, t[1]);
      });
      add(svg, 'line', { class: 'u4-ref', x1: L, x2: Rr, y1: y(1 / 6), y2: y(1 / 6) });
      add(svg, 'text', { class: 't-media', x: L - 6, y: y(1 / 6) + 4, 'text-anchor': 'end' }, '1/6');
      add(svg, 'text', { x: L, y: B + 16 }, '0');
      add(svg, 'text', { x: Rr, y: B + 16, 'text-anchor': 'end' }, xmax + ' tiradas');
      if (serie.length) {
        var salto = Math.max(1, Math.floor(serie.length / 300)), pts = [];
        for (var i = 0; i < serie.length; i += salto) pts.push(x(i + 1) + ',' + y(serie[i]));
        pts.push(x(serie.length) + ',' + y(serie[serie.length - 1]));
        add(svg, 'polyline', { class: 'u4-linea', points: pts.join(' ') });
      }
      $('u4-t-sim').textContent = total === 0
        ? 'Todavía no tiraste. Probá "Tirar 10" varias veces y después "Tirar 1000".'
        : 'Tiradas: ' + total + ' · salió 6: ' + seis + ' veces · frecuencia relativa ' + seis + '/' + total + ' ≈ ' + fmt(seis / total) +
          ' (la probabilidad es 1/6 ≈ 0,17) · última tirada: ' + ultimo;
    }
    function una() {
      ultimo = 1 + Math.floor(Math.random() * 6);
      total++;
      if (ultimo === 6) seis++;
      serie.push(seis / total);
    }
    function tirar(k) {
      if (corriendo) return;
      k = Math.min(k, MAX - total);
      if (reducir || k <= 10) { for (var i = 0; i < k; i++) una(); dibujar(); return; }
      corriendo = true;
      var porCuadro = Math.ceil(k / 40);
      (function paso() {
        for (var i = 0; i < porCuadro && k > 0; i++, k--) una();
        dibujar();
        if (k > 0) requestAnimationFrame(paso); else corriendo = false;
      })();
    }
    document.querySelectorAll('[data-u4-tirar]').forEach(function (b) {
      b.addEventListener('click', function () { tirar(Number(b.dataset.u4Tirar)); });
    });
    $('u4-b-reiniciar').addEventListener('click', function () {
      if (corriendo) return;
      total = 0; seis = 0; serie = []; ultimo = null; dibujar();
    });
    dibujar();
  })();

  // ===== Interactivo: Venn =====
  (function () {
    var svg = $('u4-venn');
    if (!svg) return;
    var textos = {
      union: 'A ∪ B: "A o B (o ambos)". P(A∪B) = 0,5 + 0,4 − 0,2 = 0,7. La parte del medio está en A y también en B: si sumás P(A) + P(B) la contás dos veces, por eso se resta una vez.',
      inter: 'A ∩ B: "A y B a la vez". Es solo la parte del medio: P(A∩B) = 0,2.',
      Ac: 'Aᶜ: "no A". Es todo lo que queda afuera de A: P(Aᶜ) = 1 − P(A) = 1 − 0,5 = 0,5.',
      soloA: 'A ∩ Bᶜ: "A pero no B". P = P(A) − P(A∩B) = 0,5 − 0,2 = 0,3.',
      ninguno: '(A ∪ B)ᶜ: "ni A ni B". P = 1 − P(A∪B) = 1 − 0,7 = 0,3.'
    };
    botonera('[data-u4-region]', 'u4Region', function (region) {
      venn(svg, { region: region, valores: { soloA: '0,3', ambos: '0,2', soloB: '0,2', fuera: '0,3' } });
      $('u4-t-venn').textContent = textos[region];
    }, 'union');
  })();

  // ===== Interactivo: "al menos uno" con el complemento =====
  (function () {
    var svg = $('u4-comp'), rango = $('u4-r-comp');
    if (!svg) return;
    function dibujar() {
      var n = Number(rango.value), ninguno = Math.pow(5 / 6, n), L = 10, W = 300;
      svg.textContent = '';
      svg.setAttribute('viewBox', '0 0 320 76');
      add(svg, 'rect', { class: 'barra', x: L, y: 26, width: W * ninguno, height: 26, rx: 3 });
      add(svg, 'rect', { class: 'barra hi', x: L + W * ninguno, y: 26, width: W * (1 - ninguno), height: 26, rx: 3 });
      add(svg, 'text', { x: L, y: 18 }, 'Ningún 6: ' + fmt(ninguno));
      add(svg, 'text', { class: 'fuerte', x: L + W, y: 18, 'text-anchor': 'end' }, 'Al menos un 6: ' + fmt(1 - ninguno));
      add(svg, 'text', { x: L, y: 68 }, '0');
      add(svg, 'text', { x: L + W, y: 68, 'text-anchor': 'end' }, '1');
      $('u4-o-comp').textContent = n;
      $('u4-t-comp').textContent = 'P(ningún 6 en ' + n + ' tiradas) = (5/6)^' + n + ' ≈ ' + fmt4(ninguno) +
        ' → P(al menos un 6) = 1 − ' + fmt4(ninguno) + ' ≈ ' + fmt4(1 - ninguno);
    }
    rango.addEventListener('input', dibujar);
    dibujar();
  })();

  // ===== Interactivo: condicional = achicar el universo (tabla de la cátedra) =====
  (function () {
    var tabla = $('u4-tabla-car');
    if (!tabla) return;
    var filas = ['menor de 20', 'entre 20 y 50', 'mayor de 50'], cols = ['consume', 'no consume'];
    var datos = [[55, 15], [35, 20], [15, 10]];
    function totalFila(f) { return datos[f][0] + datos[f][1]; }
    function totalCol(c) { return datos[0][c] + datos[1][c] + datos[2][c]; }
    botonera('[data-u4-cond]', 'u4Cond', function (cond) {
      var tipo = cond[0], k = cond.slice(1);
      tabla.querySelectorAll('[data-f]').forEach(function (celda) {
        var dentro = cond === 'todos' || (tipo === 'c' && celda.dataset.c === k) || (tipo === 'f' && celda.dataset.f === k);
        celda.classList.toggle('sel', cond !== 'todos' && dentro);
        celda.classList.toggle('dim', !dentro);
      });
      var txt;
      if (cond === 'todos') {
        txt = 'Sin condición el universo son las 150 personas. P(mayor de 50 ∩ consume) = 15/150 = 0,1.';
      } else if (tipo === 'c') {
        var c = Number(k), u = totalCol(Number(k));
        txt = 'Sabiendo que ' + cols[c] + ', el universo pasa de 150 a ' + u + '. ' + filas.map(function (nombre, f) {
          return 'P(' + nombre + ' / ' + cols[c] + ') = ' + datos[f][c] + '/' + u + ' ≈ ' + fmt(datos[f][c] / u);
        }).join(' · ');
      } else {
        var f = Number(k), uf = totalFila(f);
        txt = 'Sabiendo que es ' + filas[f] + ', el universo pasa de 150 a ' + uf + '. ' + cols.map(function (nombre, c) {
          return 'P(' + nombre + ' / ' + filas[f] + ') = ' + datos[f][c] + '/' + uf + ' ≈ ' + fmt(datos[f][c] / uf);
        }).join(' · ');
      }
      $('u4-t-cond').textContent = txt;
    }, 'todos');
  })();

  // ===== Interactivo: árbol, probabilidad total y Bayes (ejemplo de la cátedra) =====
  (function () {
    var svg = $('u4-arbol');
    if (!svg) return;
    var ramas = [
      { label: 'Pequeño', p: 0.45, hijos: [{ label: 'Falla', p: 0.1 }, { label: 'No falla', p: 0.9 }] },
      { label: 'Mediano', p: 0.35, hijos: [{ label: 'Falla', p: 0.12 }, { label: 'No falla', p: 0.88 }] },
      { label: 'Grande', p: 0.2, hijos: [{ label: 'Falla', p: 0.15 }, { label: 'No falla', p: 0.85 }] }
    ];
    var modos = {
      rama: {
        on: function (i, j) { return i === 0 && j === 0 ? 'clave' : false; },
        txt: 'Multiplicación (una rama): P(pequeño ∩ falla) = P(pequeño) · P(falla / pequeño) = 0,45 · 0,1 = 0,045. A lo largo de un camino se multiplica.'
      },
      total: {
        on: function (i, j) { return j === 0 ? 'on' : false; },
        txt: 'Probabilidad total: P(falla) = 0,45·0,1 + 0,35·0,12 + 0,2·0,15 = 0,045 + 0,042 + 0,03 = 0,117. Entre caminos se suma: todos los que terminan en "Falla".'
      },
      bayes: {
        on: function (i, j) { return j === 0 ? (i === 0 ? 'clave' : 'on') : false; },
        txt: 'Bayes: P(pequeño / falla) = camino resaltado / todos los caminos a "Falla" = 0,045 / 0,117 = 5/13 ≈ 0,385. Sabés que falló y preguntás de qué rama vino.'
      }
    };
    botonera('[data-u4-modo]', 'u4Modo', function (m) {
      arbol(svg, { ramas: ramas, on: modos[m].on });
      $('u4-t-arbol').textContent = modos[m].txt;
    }, 'rama');
  })();
})();
