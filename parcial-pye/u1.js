// Unidad 1 · Estadística descriptiva: gráficos de ejercicios e interactivos.
(function () {
  var R = window.Repaso, add = R.add, fmt = R.fmt, chart = R.chart, boxplot = R.boxplot;

  // Gráficos fijos de los ejercicios
  var graficos = {
    'g-parcial-1': { min: 8, max: 28, h: 110, ticks: [10, 15, 20, 25],
      dots: [10, 12, 15, 15, 15, 17, 18, 20, 22, 24, 25, 27],
      lines: [{ v: 17.5, cls: 'mediana', label: 'Me 17,5' }, { v: 18.33, cls: 'media', label: 'x̄ 18,33' }] },
    'g-u1-ej2': { min: 0.8, max: 1.4, h: 110, ticks: [0.8, 0.9, 1, 1.1, 1.2, 1.3, 1.4],
      dots: [0.85, 0.9, 0.98, 0.99, 1.05, 1.12, 1.15, 1.3, 1.35],
      lines: [{ v: 1.05, cls: 'mediana', label: 'Me 1,05' }, { v: 1.077, cls: 'media', label: 'x̄ 1,08' }] },
    'g-u1-ej4': { min: -0.6, max: 4.6, ticks: [0, 1, 2, 3, 4], band: [0.49, 2.87],
      bars: [{ x: 0, w: 0.6, f: 5 }, { x: 1, w: 0.6, f: 6 }, { x: 2, w: 0.6, f: 8, hi: true }, { x: 3, w: 0.6, f: 4 }, { x: 4, w: 0.6, f: 2 }],
      lines: [{ v: 1.68, cls: 'media', label: 'x̄ 1,68' }, { v: 2, cls: 'mediana', label: 'Me 2' }] },
    'g-u1-ej6': { min: 0, max: 9, ticks: [1, 2, 3, 4, 5, 6, 7, 8], band: [0.53, 7.57],
      bars: [[1, 2], [2, 6], [3, 10], [4, 5], [5, 10], [6, 3], [7, 2], [8, 2]].map(function (p) {
        return { x: p[0], w: 0.6, f: p[1], hi: p[1] === 10 };
      }),
      lines: [{ v: 4, cls: 'mediana', label: 'Me 4' }, { v: 4.05, cls: 'media', label: 'x̄ 4,05' }] },
    'g-u1-ej7': { min: 0, max: 150, ticks: [0, 30, 60, 90, 120, 150],
      bars: [[15, 8], [45, 15], [75, 20], [105, 5], [135, 2]].map(function (p) {
        return { x: p[0], w: 30, f: p[1], hi: p[1] === 20, label: '[' + (p[0] - 15) + ';' + (p[0] + 15) + ')' };
      }),
      lines: [{ v: 61.8, cls: 'media', label: 'x̄ 61,8' }, { v: 63, cls: 'mediana', label: 'Me 63' }, { v: 67.5, cls: 'moda', label: 'Mo 67,5' }] }
  };
  for (var id in graficos) {
    var svg = document.getElementById(id);
    if (svg) chart(svg, graficos[id]);
  }
  var caja = document.getElementById('g-u1-ej3');
  if (caja) boxplot(caja, { min: 0, max: 16, v: [2, 4, 5.5, 8.5, 15] });

  // ===== Interactivo: sueldo del dueño =====
  (function () {
    var svg = document.getElementById('g-sueldos'), rango = document.getElementById('r-sueldos');
    if (!svg) return;
    function dibujar() {
      var d = Number(rango.value), datos = [400, 450, 500, 500, 550, d];
      var media = datos.reduce(function (a, b) { return a + b; }, 0) / datos.length;
      chart(svg, { min: 0, max: 8000, h: 120, ticks: [0, 2000, 4000, 6000, 8000], dots: datos,
        lines: [{ v: 500, cls: 'mediana', label: 'Me 500' }, { v: media, cls: 'media', label: 'x̄ ' + fmt(Math.round(media)) }] });
      document.getElementById('o-sueldos').textContent = fmt(d);
    }
    rango.addEventListener('input', dibujar);
    dibujar();
  })();

  // ===== Interactivo: dispersión =====
  (function () {
    var svg = document.getElementById('g-disp'), rango = document.getElementById('r-disp');
    if (!svg) return;
    function dibujar() {
      var k = Number(rango.value);
      var datos = [-4, -2, 0, 2, 4].map(function (o) { return Math.round((5 + k * o) * 100) / 100; });
      var s = k * Math.sqrt(8);
      chart(svg, { min: 0, max: 10, h: 130, ticks: [0, 2, 4, 6, 8, 10], dots: datos, band: [5 - s, 5 + s],
        lines: [{ v: 5, cls: 'media', label: 'x̄ = 5' }] });
      document.getElementById('o-disp').textContent = datos.map(fmt).join(' · ');
      document.getElementById('o-sigma').textContent = fmt(s);
    }
    rango.addEventListener('input', dibujar);
    dibujar();
  })();

  // ===== Animación: ordenar para encontrar la mediana =====
  (function () {
    var svg = document.getElementById('g-mediana');
    if (!svg) return;
    var base = 128, alturas = [0.9, 1.3, 0.85, 1.05, 0.98, 1.35, 1.12, 0.99, 1.15];
    var ninos = [], ordenado = false;
    var btn = document.getElementById('b-ordenar'), chk = document.getElementById('c-decimo'), txt = document.getElementById('t-mediana');
    add(svg, 'line', { class: 'eje', x1: 6, x2: 314, y1: base, y2: base });

    function crear(v) {
      var g = add(svg, 'g', { class: 'nino' });
      var h = v * 80;
      add(g, 'rect', { x: 0, y: base - h, width: 24, height: h, rx: 3 });
      add(g, 'text', { x: 12, y: base + 14, 'text-anchor': 'middle' }, fmt(v));
      ninos.push({ v: v, g: g });
    }
    alturas.forEach(crear);

    function ubicar() {
      var n = ninos.length, paso = 300 / n;
      var orden = ordenado ? ninos.slice().sort(function (a, b) { return a.v - b.v; }) : ninos;
      var centro = n % 2 ? [(n - 1) / 2] : [n / 2 - 1, n / 2];
      orden.forEach(function (o, i) {
        o.g.style.transform = 'translate(' + (10 + i * paso + (paso - 24) / 2) + 'px, 0)';
        o.g.classList.toggle('centro', ordenado && centro.indexOf(i) >= 0);
      });
      if (!ordenado) {
        txt.textContent = 'Así como vienen, el del medio no significa nada. Tocá "Ordenar".';
      } else if (n % 2) {
        txt.textContent = 'N = 9 (impar) → posición (9+1)/2 = 5 → Me = ' + fmt(orden[4].v) + ' m';
      } else {
        txt.textContent = 'N = 10 (par) → posición 5,5 → promedio de ' + fmt(orden[4].v) + ' y ' + fmt(orden[5].v) + ' → Me = ' + fmt((orden[4].v + orden[5].v) / 2) + ' m';
      }
      btn.textContent = ordenado ? 'Mezclar' : 'Ordenar';
    }
    btn.addEventListener('click', function () { ordenado = !ordenado; ubicar(); });
    setTimeout(function () { svg.classList.add('listo'); }, 50);
    chk.addEventListener('change', function () {
      if (chk.checked) { crear(0.98); } else { svg.removeChild(ninos.pop().g); }
      ubicar();
    });
    ubicar();
  })();

  // ===== Interactivo: forma de la distribución =====
  (function () {
    var svg = document.getElementById('g-forma');
    if (!svg) return;
    var formas = {
      negativa: { d: 'M300,95 C265,95 255,20 225,20 C190,20 150,82 20,94 L20,95 Z', mo: 225, me: 198, media: 174,
        txt: 'Cola a la izquierda: x̄ < Me < Mo. Ejemplo: notas de un examen fácil.' },
      simetrica: { d: 'M20,95 C100,95 115,20 160,20 C205,20 220,95 300,95 Z', mo: 160, me: 160, media: 160,
        txt: 'Simétrica: x̄ = Me = Mo, las tres en el mismo lugar. Ejemplo: alturas.' },
      positiva: { d: 'M20,95 C55,95 65,20 95,20 C130,20 170,82 300,94 L300,95 Z', mo: 95, me: 122, media: 146,
        txt: 'Cola a la derecha: Mo < Me < x̄. Ejemplo: sueldos.' }
    };
    var curva = svg.querySelector('.curva');
    var marcas = { mo: svg.querySelector('[data-m="mo"]'), me: svg.querySelector('[data-m="me"]'), media: svg.querySelector('[data-m="media"]') };
    var botones = document.querySelectorAll('[data-forma]');
    function mostrar(nombre) {
      var f = formas[nombre];
      curva.setAttribute('d', f.d);
      for (var m in marcas) marcas[m].style.transform = 'translate(' + f[m] + 'px, 0)';
      document.getElementById('t-forma').textContent = f.txt;
      botones.forEach(function (b) { b.setAttribute('aria-pressed', b.dataset.forma === nombre); });
    }
    botones.forEach(function (b) { b.addEventListener('click', function () { mostrar(b.dataset.forma); }); });
    mostrar('positiva');
    setTimeout(function () { svg.classList.add('listo'); }, 50);
  })();
  // ===== Boxplot: gráficos fijos =====
  (function () {
    var cajas = R.cajas;
    function dibujar(id, cfg) { var svg = document.getElementById(id); if (svg) cajas(svg, cfg); }
    dibujar('g-u1-box-5', { min: 0, max: 16, ticks: [0, 2, 4, 6, 8, 10, 12, 14, 16], valores: true, filas: [{ v: [2, 4, 5.5, 8.5, 15] }] });
    dibujar('g-u1-box-sim', { mini: true, min: 0, max: 10, filas: [{ v: [1, 3.5, 5, 6.5, 9] }] });
    dibujar('g-u1-box-der', { mini: true, min: 0, max: 10, filas: [{ v: [1, 2.5, 3.3, 5.5, 9.5] }] });
    dibujar('g-u1-box-izq', { mini: true, min: 0, max: 10, filas: [{ v: [0.5, 4.5, 6.7, 7.5, 9] }] });
    dibujar('g-u1-box-ejA', { min: 0, max: 70, ticks: [0, 10, 20, 30, 40, 50, 60, 70], filas: [{ v: [10, 20, 25, 40, 60] }] });
    dibujar('g-u1-box-ejB', { min: 8, max: 30, ticks: [10, 15, 20, 25, 30], valores: true, filas: [{ v: [10, 15, 17.5, 23, 27] }] });
    dibujar('g-u1-box-ejC', { min: 0, max: 10, ticks: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
      filas: [{ label: 'Comisión A', v: [3, 5, 6, 7, 9] }, { label: 'Comisión B', v: [1, 4, 7, 9, 10] }] });
  })();

  // ===== Boxplot: construcción paso a paso =====
  (function () {
    var svg = document.getElementById('g-u1-box-pasos');
    if (!svg) return;
    var datos = [2, 3, 4, 4, 5, 5, 6, 7, 8, 9, 12, 15];
    var L = 24, Rr = 296, x = function (v) { return L + v / 16 * (Rr - L); };
    var yBox = 86, base = 132;
    function capa() { return add(svg, 'g', { class: 'capa oculta' }); }

    add(svg, 'line', { class: 'eje', x1: L, x2: Rr, y1: base, y2: base });
    [0, 2, 4, 6, 8, 10, 12, 14, 16].forEach(function (t) {
      add(svg, 'text', { x: x(t), y: base + 16, 'text-anchor': 'middle' }, fmt(t));
    });
    var puntos = add(svg, 'g', { class: 'capa' }), pila = {};
    datos.forEach(function (v) {
      var k = pila[v] = (pila[v] || 0) + 1;
      add(puntos, 'circle', { class: 'punto', cx: x(v), cy: 52 - (k - 1) * 10, r: 4.5 });
    });

    var cMe = capa();
    add(cMe, 'line', { class: 'mediana', x1: x(5.5), x2: x(5.5), y1: 20, y2: 104 });
    add(cMe, 'text', { class: 't-mediana', x: x(5.5), y: 14, 'text-anchor': 'middle' }, 'Me 5,5');

    var cQ = capa();
    [[4, 'Q1 4'], [8.5, 'Q3 8,5']].forEach(function (q) {
      add(cQ, 'line', { class: 'guia', x1: x(q[0]), x2: x(q[0]), y1: 20, y2: 104 });
      add(cQ, 'text', { class: 'fuerte', x: x(q[0]), y: 14, 'text-anchor': 'middle' }, q[1]);
    });

    var cCaja = capa();
    add(cCaja, 'rect', { class: 'caja', x: x(4), y: yBox - 14, width: x(8.5) - x(4), height: 28, rx: 3 });
    add(cCaja, 'line', { class: 'mediana', x1: x(5.5), x2: x(5.5), y1: yBox - 14, y2: yBox + 14 });

    var cBig = capa();
    add(cBig, 'line', { class: 'eje', x1: x(2), x2: x(4), y1: yBox, y2: yBox });
    add(cBig, 'line', { class: 'eje', x1: x(8.5), x2: x(15), y1: yBox, y2: yBox });
    [2, 15].forEach(function (v) { add(cBig, 'line', { class: 'eje', x1: x(v), x2: x(v), y1: yBox - 7, y2: yBox + 7 }); });

    var c25 = capa();
    [[2, 4], [4, 5.5], [5.5, 8.5], [8.5, 15]].forEach(function (t) {
      add(c25, 'text', { class: 't-warn', x: (x(t[0]) + x(t[1])) / 2, y: yBox + 30, 'text-anchor': 'middle' }, '25%');
    });

    var pasos = [
      { capas: [], txt: 'Estos son los 12 tiempos de espera: cada punto es un paciente, ya ubicado en su lugar sobre la recta.' },
      { capas: [cMe], txt: 'Mediana = 5,5: deja 6 pacientes a cada lado.' },
      { capas: [cMe, cQ], txt: 'Q1 = 4 y Q3 = 8,5: la "mediana" de cada mitad. Cortan los datos en 4 grupos de ≈ 3 pacientes.' },
      { capas: [cMe, cQ, cCaja], txt: 'La caja va de Q1 a Q3: adentro está el 50% central de los pacientes.' },
      { capas: [cMe, cCaja, cBig], txt: 'Los bigotes llegan hasta el mínimo (2) y el máximo (15).' },
      { capas: [cCaja, cBig, c25], tenue: true, txt: 'Listo. Cada tramo tiene ≈ 25%. El bigote derecho es largo: pocas esperas muy altas (12 y 15) → cola a la derecha.' }
    ];
    var todas = [cMe, cQ, cCaja, cBig, c25], i = 0;
    var ant = document.getElementById('b-u1-box-ant'), sig = document.getElementById('b-u1-box-sig');
    function mostrar() {
      var p = pasos[i];
      todas.forEach(function (c) { c.classList.toggle('oculta', p.capas.indexOf(c) < 0); });
      puntos.classList.toggle('tenue', !!p.tenue);
      document.getElementById('t-u1-box-pasos').textContent = p.txt;
      document.getElementById('t-u1-box-num').textContent = 'Paso ' + (i + 1) + ' de ' + pasos.length;
      ant.disabled = i === 0;
      sig.textContent = i === pasos.length - 1 ? 'Empezar de nuevo' : 'Siguiente paso';
    }
    sig.addEventListener('click', function () { i = (i + 1) % pasos.length; mostrar(); });
    ant.addEventListener('click', function () { if (i > 0) { i--; mostrar(); } });
    mostrar();
  })();
})();
