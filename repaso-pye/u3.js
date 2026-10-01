// Unidad 3 · Métodos de conteo: asistente de fórmulas, interactivos y gráficos de ejercicios.
(function () {
  var R = window.Repaso, add = R.add, fmt = R.fmt;
  var sinMovimiento = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  function $(id) { return document.getElementById(id); }
  function activarTransiciones(svg) { setTimeout(function () { svg.classList.add('listo'); }, 50); }

  // GENÉRICO: casilleros "a × b × c = total", uno por decisión, con su rótulo debajo.
  // slots: [{ v: '32', t: 'abanderado', hi: true }] · o: { res, sep, w, gap }
  function casilleros(svg, slots, o) {
    o = o || {};
    svg.textContent = '';
    var n = slots.length, gap = o.gap || 14;
    var w = o.w || Math.min(44, (300 - (n - 1) * gap) / n);
    var x0 = (320 - (n * w + (n - 1) * gap)) / 2;
    svg.setAttribute('viewBox', '0 0 320 ' + (o.res ? 96 : 66));
    slots.forEach(function (s, i) {
      var x = x0 + i * (w + gap);
      var g = add(svg, 'g', { class: 'ficha' + (s.hi ? ' hi' : '') });
      add(g, 'rect', { x: x, y: 8, width: w, height: 32, rx: 5 });
      add(g, 'text', { x: x + w / 2, y: 29, 'text-anchor': 'middle' }, s.v);
      if (s.t) add(svg, 'text', { x: x + w / 2, y: 56, 'text-anchor': 'middle' }, s.t);
      if (i < n - 1) add(svg, 'text', { class: 'fuerte', x: x + w + gap / 2, y: 29, 'text-anchor': 'middle' }, o.sep || '×');
    });
    if (o.res) add(svg, 'text', { class: 't-grande', x: 160, y: 86, 'text-anchor': 'middle' }, o.res);
  }

  // GENÉRICO: grilla de fichas (una fila por arreglo de textos). Devuelve las fichas por fila para animarlas.
  // o: { w, gx, x0 }
  function fichas(svg, filas, o) {
    o = o || {};
    svg.textContent = '';
    var w = o.w || 44, h = 26, gx = o.gx || 6, gy = 8;
    var cols = Math.max.apply(null, filas.map(function (f) { return f.length; }));
    var x0 = o.x0 != null ? o.x0 : (320 - (cols * w + (cols - 1) * gx)) / 2;
    svg.setAttribute('viewBox', '0 0 320 ' + (filas.length * (h + gy) + 8));
    return filas.map(function (fila, r) {
      return fila.map(function (txt, c) {
        var x = x0 + c * (w + gx), y = 4 + r * (h + gy);
        var g = add(svg, 'g', { class: 'ficha' });
        add(g, 'rect', { x: x, y: y, width: w, height: h, rx: 5 });
        g.texto = add(g, 'text', { x: x + w / 2, y: y + 17, 'text-anchor': 'middle' }, txt);
        return g;
      });
    });
  }

  // ===== Asistente: ¿qué fórmula uso? =====
  (function () {
    var cont = $('u3-asistente');
    if (!cont) return;
    var formulas = {
      perm: ['Permutación', 'Pₙ = n!', 'Ordenar los 7 colores del arcoíris: 7! = 5.040'],
      circ: ['Permutación circular', 'P = (n − 1)!', 'Una ruleta con 8 premios: 7! = 5.040'],
      bloq: ['Permutación en bloques', 'r! · n₁! · n₂! ··· nᵣ!', 'Dos familias (4 y 3) juntas en una fila: 2! · 4! · 3! = 288'],
      prep: ['Permutación con repetición', "P'ⁿ = n! / (n₁! · n₂! ···)", 'Anagramas de AMAR (dos A): 4! / 2! = 12'],
      vari: ['Variación', 'Vⁿᵣ = n! / (n − r)!', 'Abanderado y 2 escoltas de 32 alumnos: 32 · 31 · 30 = 29.760'],
      vrep: ['Variación con repetición', "V'ⁿᵣ = nʳ", 'Prode de 14 partidos (L, E o V): 3¹⁴ = 4.782.969'],
      comb: ['Combinación', 'Cⁿᵣ = n! / [(n − r)! · r!]', 'Elegir 5 remeras de 12: 792'],
      crep: ['Combinación con repetición', "C'ⁿᵣ = Cⁿ⁺ʳ⁻¹ᵣ", 'Repartir 2 caramelos iguales entre 3 chicos: C⁴₂ = 6']
    };
    var arbol = { p: '¿Importa el orden?', ops: [
      ['Sí, importa', { p: '¿Ordenás a todos los elementos?', ops: [
        ['Sí, a todos', { p: '¿Hay elementos iguales entre sí?', ops: [
          ['Sí, hay iguales', 'prep'],
          ['No, todos distintos', { p: '¿Cómo se ubican?', ops: [['En fila', 'perm'], ['En ronda', 'circ'], ['Con grupos pegados', 'bloq']] }]
        ] }],
        ['No, elijo algunos', { p: '¿Se puede repetir un elemento?', ops: [['No', 'vari'], ['Sí', 'vrep']] }]
      ] }],
      ['No importa', { p: '¿Se puede repetir un elemento?', ops: [['No', 'comb'], ['Sí', 'crep']] }]
    ] };
    var camino = $('u3-asis-camino'), pregunta = $('u3-asis-pregunta'), botones = $('u3-asis-botones'), res = $('u3-asis-res');

    function boton(texto, alClic) {
      var b = document.createElement('button');
      b.type = 'button'; b.className = 'btn'; b.textContent = texto;
      b.addEventListener('click', alClic);
      botones.appendChild(b);
      return b;
    }
    function mostrar(nodo, pasos) {
      botones.textContent = ''; res.textContent = ''; res.hidden = true;
      camino.textContent = pasos.length ? pasos.join(' → ') : 'Respondé las preguntas:';
      if (typeof nodo === 'string') {
        var f = formulas[nodo];
        pregunta.textContent = 'Es una ' + f[0].toLowerCase() + '.';
        var titulo = document.createElement('strong'); titulo.textContent = f[0];
        var formula = document.createElement('div'); formula.className = 'formula'; formula.textContent = f[1];
        var ej = document.createElement('p'); ej.style.margin = '0'; ej.textContent = 'Ejemplo: ' + f[2];
        res.append(titulo, formula, ej); res.hidden = false;
      } else {
        pregunta.textContent = nodo.p;
        nodo.ops.forEach(function (op) {
          boton(op[0], function () { mostrar(op[1], pasos.concat(op[0])); botones.querySelector('button') && botones.querySelector('button').focus(); });
        });
      }
      if (pasos.length) boton('Empezar de nuevo', function () { mostrar(arbol, []); botones.querySelector('button').focus(); });
    }
    mostrar(arbol, []);
  })();

  // ===== Árbol del principio de multiplicación =====
  (function () {
    var svg = $('u3-arbol');
    if (!svg) return;
    // Opciones de cada decisión: remera, pantalón y calzado.
    var niveles = [['R', 'A', 'N'], ['j', 's'], ['z', 'o']];
    var textos = [
      '3 remeras (R, A, N) → 3 opciones.',
      '3 remeras × 2 pantalones (j, s) = 6 combinaciones.',
      '3 remeras × 2 pantalones × 2 calzados (z, o) = 12 conjuntos distintos.'
    ];
    var prof = 1, btn = $('u3-arbol-mas');

    function dibujar(animar) {
      svg.textContent = '';
      svg.setAttribute('viewBox', '0 0 320 170');
      var cant = [1];
      for (var k = 0; k < prof; k++) cant.push(cant[k] * niveles[k].length);
      var xs = [];
      xs[prof] = [];
      for (var i = 0; i < cant[prof]; i++) xs[prof].push(12 + (296 / cant[prof]) * (i + 0.5));
      for (k = prof - 1; k >= 0; k--) {
        var m = niveles[k].length;
        xs[k] = [];
        for (i = 0; i < cant[k]; i++) {
          var suma = 0;
          for (var j = 0; j < m; j++) suma += xs[k + 1][i * m + j];
          xs[k].push(suma / m);
        }
      }
      var y = function (k) { return 16 + k * 48; };
      for (k = 1; k <= prof; k++) {
        var gr = add(svg, 'g', { class: animar && k === prof ? 'aparece' : '' });
        xs[k].forEach(function (x, i) {
          var padre = Math.floor(i / niveles[k - 1].length);
          add(gr, 'line', { class: 'rama', x1: xs[k - 1][padre], y1: y(k - 1), x2: x, y2: y(k) - 10 });
          add(gr, 'circle', { class: 'nodo', cx: x, cy: y(k), r: 10 });
          add(gr, 'text', { class: 'fuerte', x: x, y: y(k) + 4, 'text-anchor': 'middle' }, niveles[k - 1][i % niveles[k - 1].length]);
        });
      }
      add(svg, 'circle', { class: 'punto', cx: 160, cy: y(0), r: 5 });
      add(svg, 'text', { class: 't-grande', x: 160, y: 164, 'text-anchor': 'middle' }, cant[prof] + ' caminos = ' + cant[prof] + ' resultados');
      $('u3-arbol-txt').textContent = textos[prof - 1];
      btn.textContent = prof < 3 ? 'Sumar ' + (prof === 1 ? 'pantalón (2 opciones)' : 'calzado (2 opciones)') : 'Empezar de nuevo';
    }
    btn.addEventListener('click', function () {
      prof = prof < 3 ? prof + 1 : 1;
      dibujar(prof > 1);
    });
    dibujar(false);
  })();

  // ===== Ordenar A, B, C =====
  (function () {
    var svg = $('u3-abc');
    if (!svg) return;
    casilleros($('u3-abc-slots'), [{ v: '3', t: '1.º lugar' }, { v: '2', t: '2.º lugar' }, { v: '1', t: '3.º lugar' }], { res: '3 · 2 · 1 = 3! = 6', gap: 30 });
    var filas = fichas(svg, [['ABC', 'ACB'], ['BAC', 'BCA'], ['CAB', 'CBA']], { w: 52, gx: 8, x0: 60 });
    // El rótulo de cada fila aparece junto con sus fichas.
    ['A', 'B', 'C'].forEach(function (l, r) {
      var g = add(svg, 'g', { class: 'ficha' });
      add(g, 'text', { x: 186, y: 4 + r * 34 + 17 }, '← empiezan con ' + l);
      filas[r].push(g);
    });
    var todas = [].concat.apply([], filas);
    var btn = $('u3-abc-btn'), visibles = true;
    function mostrar(v) {
      visibles = v;
      todas.forEach(function (g, i) {
        if (!v) { g.classList.add('oculta'); return; }
        setTimeout(function () { g.classList.remove('oculta'); }, sinMovimiento ? 0 : i * 250);
      });
      btn.textContent = v ? 'Ocultar' : 'Mostrar las 6';
    }
    btn.addEventListener('click', function () { mostrar(!visibles); });
    mostrar(false);
    activarTransiciones(svg);
  })();

  // ===== Podio vs grupo: V = C · r! =====
  (function () {
    var svg = $('u3-podio');
    if (!svg) return;
    function permutar(s) {
      if (s.length <= 1) return [s];
      var out = [];
      s.split('').forEach(function (c, i) {
        permutar(s.slice(0, i) + s.slice(i + 1)).forEach(function (p) { out.push(c + p); });
      });
      return out;
    }
    var filas = fichas(svg, ['ABC', 'ABD', 'ACD', 'BCD'].map(permutar), { w: 44, gx: 5 });
    var btn = $('u3-podio-btn'), txt = $('u3-podio-txt');
    function modo(grupo) {
      filas.forEach(function (fila) {
        fila.forEach(function (g, c) {
          g.classList.toggle('tenue', grupo && c > 0);
          g.classList.toggle('hi', grupo && c === 0);
        });
      });
      btn.setAttribute('aria-pressed', grupo);
      btn.textContent = grupo ? 'Volver al podio' : 'Ahora es un grupo';
      txt.textContent = grupo
        ? 'Grupo: cada fila es el mismo trío → cuento 1 por fila. 24 / 3! = 4 = C⁴₃'
        : 'Podio (importa el orden): 4 tríos × 3! órdenes = 24 = V⁴₃';
    }
    var grupo = false;
    btn.addEventListener('click', function () { grupo = !grupo; modo(grupo); });
    modo(false);
    activarTransiciones(svg);
  })();

  // ===== Repetidos: por qué se divide por 2! =====
  (function () {
    var svg = $('u3-repe');
    if (!svg) return;
    var filas = fichas(svg, [['A₁A₂B', 'A₂A₁B'], ['A₁BA₂', 'A₂BA₁'], ['BA₁A₂', 'BA₂A₁']], { w: 64, gx: 10 });
    var btn = $('u3-repe-btn'), txt = $('u3-repe-txt'), iguales = false;
    function modo(v) {
      filas.forEach(function (fila) {
        fila.forEach(function (g, c) {
          var original = g.dataset.original || (g.dataset.original = g.texto.textContent);
          g.texto.textContent = v ? original.replace(/[₁₂]/g, '') : original;
          g.classList.toggle('tenue', v && c === 1);
        });
      });
      btn.setAttribute('aria-pressed', v);
      btn.textContent = v ? 'Volver a numerar las A' : 'Pintar las A iguales';
      txt.textContent = v
        ? 'Sin números, cada fila es la misma palabra dos veces → 3! / 2! = 3 palabras: AAB, ABA, BAA.'
        : 'Si las A fueran distintas (A₁ y A₂) habría 3! = 6 órdenes.';
    }
    btn.addEventListener('click', function () { iguales = !iguales; modo(iguales); });
    modo(false);
    activarTransiciones(svg);
  })();

  // ===== Bloque pegado =====
  (function () {
    var svg = $('u3-bloque');
    if (!svg) return;
    var unidades = [['A', 'B', 'X'], ['A', 'X', 'B'], ['B', 'A', 'X'], ['B', 'X', 'A'], ['X', 'A', 'B'], ['X', 'B', 'A']];
    var filas = fichas(svg, unidades.map(function (u) {
      return [u.join(' ').replace('X', '[CD]'), u.join(' ').replace('X', '[DC]')];
    }), { w: 96, gx: 12 });
    var btn = $('u3-bloque-btn'), txt = $('u3-bloque-txt'), adentro = false;
    function modo(v) {
      filas.forEach(function (fila) { fila[1].classList.toggle('oculta', !v); });
      btn.setAttribute('aria-pressed', v);
      btn.textContent = v ? 'Solo el bloque como unidad' : 'Sumar el orden adentro del bloque';
      txt.textContent = v
        ? '3! órdenes de las unidades × 2! órdenes adentro (CD o DC) = 6 · 2 = 12'
        : 'Con [CD] pegados hay 3 unidades: A, B y el bloque → 3! = 6';
    }
    btn.addEventListener('click', function () { adentro = !adentro; modo(adentro); });
    modo(false);
    activarTransiciones(svg);
  })();

  // ===== Ronda: girar no cambia nada =====
  (function () {
    var svg = $('u3-ronda');
    if (!svg) return;
    var cx = 160, cy = 88, r = 50;
    var asientos = [-90, 30, 150].map(function (a) {
      var rad = a * Math.PI / 180;
      return [cx + r * Math.cos(rad), cy + r * Math.sin(rad)];
    });
    add(svg, 'circle', { class: 'rama', cx: cx, cy: cy, r: r });
    add(svg, 'text', { x: cx, y: 14, 'text-anchor': 'middle' }, 'leo desde arriba, en sentido horario ↻');
    var ninos = ['A', 'B', 'C'].map(function (l) {
      var g = add(svg, 'g', { class: 'u3-mov' });
      add(g, 'circle', { class: 'nodo', cx: 0, cy: 0, r: 16 });
      add(g, 'text', { class: 'fuerte', x: 0, y: 4, 'text-anchor': 'middle' }, l);
      return g;
    });
    var giro = 0, txt = $('u3-ronda-txt');
    function ubicar() {
      var lectura = [];
      ninos.forEach(function (g, i) {
        var s = (i + giro) % 3;
        g.style.transform = 'translate(' + asientos[s][0] + 'px,' + asientos[s][1] + 'px)';
        lectura[s] = ['A', 'B', 'C'][i];
      });
      txt.textContent = 'Leída desde arriba: ' + lectura.join('') + (giro ? ' → es la MISMA ronda: cada uno tiene los mismos vecinos.' : '. Tocá "Girar".');
    }
    $('u3-ronda-btn').addEventListener('click', function () { giro = (giro + 1) % 3; ubicar(); });
    ubicar();
    activarTransiciones(svg);
  })();

  // ===== El factorial explota =====
  (function () {
    var svg = $('u3-fact'), rango = $('u3-fact-n');
    if (!svg) return;
    function duracion(seg) {
      var u = [[31536000, 'años'], [86400, 'días'], [3600, 'horas'], [60, 'minutos'], [1, 'segundos']];
      for (var i = 0; i < u.length; i++) {
        if (seg >= u[i][0]) return fmt(Math.round(seg / u[i][0])) + ' ' + u[i][1];
      }
      return '1 segundo';
    }
    function dibujar() {
      var n = Number(rango.value), f = 1;
      for (var i = 2; i <= n; i++) f *= i;
      var slots = [];
      if (n <= 7) { for (i = n; i >= 1; i--) slots.push({ v: String(i) }); }
      else slots = [{ v: String(n) }, { v: String(n - 1) }, { v: String(n - 2) }, { v: '…' }, { v: '1' }];
      casilleros(svg, slots, { res: n + '! = ' + fmt(f) });
      $('u3-fact-o').textContent = n;
      $('u3-fact-txt').textContent = 'Escribiendo un orden por segundo, tardarías ' + duracion(f) + '.';
    }
    rango.addEventListener('input', dibujar);
    dibujar();
  })();

  // ===== Gráficos de las soluciones =====
  function slots(id, lista, o) { var s = $(id); if (s) casilleros(s, lista, o); }
  slots('u3-ej1', [7, 6, 5, 4, 3, 2, 1].map(function (v) { return { v: String(v) }; }), { res: '7! = 5.040' });
  slots('u3-ej2', [{ v: '8', t: 'presidente' }, { v: '7', t: 'vice' }, { v: '6', t: 'secretario' }], { res: '8 · 7 · 6 = 336', gap: 40 });
  slots('u3-ej4a', [27, 27, 27, 10, 10, 10].map(function (v) { return { v: String(v), t: v === 27 ? 'letra' : 'dígito' }; }), { res: '27³ · 10³ = 19.683.000' });
  slots('u3-ej4b', [27, 26, 25, 10, 9, 8].map(function (v, i) { return { v: String(v), t: i < 3 ? 'letra' : 'dígito' }; }), { res: '= 12.636.000' });
  slots('u3-mult', [{ v: '5', t: 'temperatura' }, { v: '2', t: 'razón' }, { v: '4', t: 'catalizador' }], { res: '"y" → se multiplica: 40', gap: 40 });
  slots('u3-suma', [{ v: '3', t: 'trenes' }, { v: '2', t: 'micros' }], { sep: '+', res: '"o" → se suma: 5', w: 52, gap: 60 });
  slots('u3-fact4', [4, 3, 2, 1].map(function (v, i) { return { v: String(v), t: (i + 1) + '.º' }; }), { res: '4! = 24', gap: 30 });
  slots('u3-ej5', [{ v: 'C¹⁰₃', t: 'ingenieros' }, { v: 'C⁸₂', t: 'abogados' }], { res: '120 · 28 = 3.360', w: 56, gap: 60 });
  slots('u3-ej6', [{ v: '3!', t: 'bloques' }, { v: '3!', t: 'mat.' }, { v: '4!', t: 'fís.' }, { v: '3!', t: 'quím.' }], { res: '6 · 6 · 24 · 6 = 5.184', gap: 24 });
  slots('u3-ej7a', [{ v: '7!', t: '6 M + bloque' }, { v: '3!', t: 'adentro' }], { res: '5.040 · 6 = 30.240', w: 56, gap: 60 });
  slots('u3-ej7c', [{ v: 'C⁹₅', t: 'elegir 5' }, { v: '5!', t: 'estante 1' }, { v: '4!', t: 'estante 2' }], { res: '126 · 120 · 24 = 362.880', w: 52, gap: 40 });

  var banderas = $('u3-ej8b');
  if (banderas) {
    var fila = fichas(banderas, [['R', 'A', '?', '?', '?', '?', '?', '?', '?']], { w: 28, gx: 5 })[0];
    fila[0].classList.add('hi'); fila[1].classList.add('hi');
  }
})();
