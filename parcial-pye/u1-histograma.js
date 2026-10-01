// Unidad 1 · Histograma y tabla por intervalos: animación de construcción y gráficos de los ejercicios.
(function () {
  var R = window.Repaso, add = R.add, fmt = R.fmt, chart = R.chart;

  // ===== Gráficos fijos =====
  var graficos = {
    'g-u1-hist-ej1': { min: 18, max: 58, ticks: [18, 26, 34, 42, 50, 58],
      bars: [[22, 10], [30, 8], [38, 5], [46, 4], [54, 3]].map(function (p) {
        return { x: p[0], w: 8, f: p[1], hi: p[1] === 10, label: '[' + (p[0] - 4) + ';' + (p[0] + 4) + ')' };
      }) },
    'g-u1-hist-ej2': { min: 0, max: 50, ticks: [0, 10, 20, 30, 40, 50],
      bars: [[5, 3], [15, 8], [25, 14], [35, 10], [45, 5]].map(function (p) {
        return { x: p[0], w: 10, f: p[1], label: '[' + (p[0] - 5) + ';' + (p[0] + 5) + ')' };
      }) }
  };
  for (var id in graficos) {
    var svg = document.getElementById(id);
    if (svg) chart(svg, graficos[id]);
  }

  // ===== Mini gráficos: barras separadas vs. histograma =====
  function mini(id, pegadas) {
    var svg = document.getElementById(id);
    if (!svg) return;
    svg.setAttribute('viewBox', '0 0 120 72');
    var alturas = [22, 40, 30, 14], base = 62, ancho = pegadas ? 26 : 16, paso = pegadas ? 26 : 26, x0 = pegadas ? 8 : 12;
    add(svg, 'line', { class: 'eje', x1: 4, x2: 116, y1: base, y2: base });
    alturas.forEach(function (h, i) {
      add(svg, 'rect', { class: 'barra' + (i === 1 ? ' hi' : ''), x: x0 + i * paso + (pegadas ? 1 : 0), y: base - h, width: ancho - (pegadas ? 2 : 0), height: h, rx: 2 });
    });
  }
  mini('g-u1-hist-m-barras', false);
  mini('g-u1-hist-m-hist', true);

  // ===== Construcción paso a paso =====
  (function () {
    var svg = document.getElementById('g-u1-hist-pasos');
    if (!svg) return;
    var datos = [12, 14, 15, 16, 18, 19, 19, 20, 21, 22, 22, 23, 23, 24, 25, 26, 28, 30, 33, 37];
    var cortes = [12, 17, 22, 27, 32, 37], frec = [4, 5, 7, 2, 2];
    var x = function (v) { return 20 + (v - 10) / 30 * 280; };
    var base = 150;
    function capa() { return add(svg, 'g', { class: 'capa oculta' }); }

    // Barras primero, para que queden detrás de los puntos y los rótulos.
    var cBarras = capa();
    frec.forEach(function (f, i) {
      var h = f / 7 * 80;
      add(cBarras, 'rect', { class: 'barra' + (f === 7 ? ' hi' : ''), x: x(cortes[i]) + 1, y: base - h, width: x(cortes[i + 1]) - x(cortes[i]) - 2, height: h, rx: 2 });
    });

    add(svg, 'line', { class: 'eje', x1: 20, x2: 300, y1: base, y2: base });
    [10, 15, 20, 25, 30, 35, 40].forEach(function (t) {
      add(svg, 'text', { x: x(t), y: base + 16, 'text-anchor': 'middle' }, fmt(t));
    });
    var puntos = add(svg, 'g', { class: 'capa' }), pila = {};
    datos.forEach(function (v) {
      var k = pila[v] = (pila[v] || 0) + 1;
      add(puntos, 'circle', { class: 'punto', cx: x(v), cy: base - 7 - (k - 1) * 9, r: 4 });
    });

    var cC = capa();
    add(cC, 'text', { class: 'fuerte', x: 20, y: 16 }, 'c = 5 clases');

    var cRango = capa();
    add(cRango, 'line', { class: 'guia', x1: x(12), x2: x(37), y1: 116, y2: 116 });
    add(cRango, 'polygon', { class: 'flecha', points: [x(12), 116, x(12) + 6, 112, x(12) + 6, 120].join(' ') });
    add(cRango, 'polygon', { class: 'flecha', points: [x(37), 116, x(37) - 6, 112, x(37) - 6, 120].join(' ') });
    add(cRango, 'text', { x: (x(12) + x(37)) / 2, y: 110, 'text-anchor': 'middle' }, 'rango = 37 − 12 = 25');
    add(cRango, 'text', { class: 'fuerte', x: 118, y: 16 }, 'rango = 25');

    var cCortes = capa();
    cortes.forEach(function (c) {
      add(cCortes, 'line', { class: 'guia', x1: x(c), x2: x(c), y1: 40, y2: base });
    });
    add(cCortes, 'text', { class: 'fuerte', x: 220, y: 16 }, 'a = 25/5 = 5');
    cortes.slice(0, 5).forEach(function (c, i) {
      add(cCortes, 'text', { x: (x(c) + x(cortes[i + 1])) / 2, y: 36, 'text-anchor': 'middle' }, c + '–' + cortes[i + 1]);
    });

    var cFrec = capa();
    frec.forEach(function (f, i) {
      add(cFrec, 'text', { class: 't-warn', x: (x(cortes[i]) + x(cortes[i + 1])) / 2, y: 54, 'text-anchor': 'middle' }, 'f = ' + f);
    });

    var pasos = [
      { capas: [], txt: 'Los 20 tiempos sobre la recta. Hay casi tantos valores distintos como datos: conviene agrupar.' },
      { capas: [cC], txt: 'Sturges: 1 + log₂20 = 5,32. La parte entera, 5, es impar → redondeo para abajo → 5 clases.' },
      { capas: [cC, cRango], txt: 'Rango = máximo − mínimo = 37 − 12 = 25 minutos: es la distancia que hay que cubrir.' },
      { capas: [cC, cRango, cCortes], txt: 'Amplitud = 25/5 = 5. Desde el mínimo (12) se corta cada 5: [12;17), [17;22), [22;27), [27;32) y el último cerrado, [32;37].' },
      { capas: [cC, cCortes, cFrec], txt: 'Contamos cuántos puntos caen en cada intervalo: 4, 5, 7, 2 y 2. Suman 20.' },
      { capas: [cC, cCortes, cFrec, cBarras], tenue: true, txt: 'Una barra por intervalo, con altura f, todas pegadas. Se ve la forma: el pico en [22;27) y una cola hacia los tiempos largos (asimetría positiva).' }
    ];
    var todas = [cC, cRango, cCortes, cFrec, cBarras], i = 0;
    var ant = document.getElementById('b-u1-hist-ant'), sig = document.getElementById('b-u1-hist-sig');
    function mostrar() {
      var p = pasos[i];
      todas.forEach(function (c) { c.classList.toggle('oculta', p.capas.indexOf(c) < 0); });
      puntos.classList.toggle('tenue', !!p.tenue);
      document.getElementById('t-u1-hist-pasos').textContent = p.txt;
      document.getElementById('t-u1-hist-num').textContent = 'Paso ' + (i + 1) + ' de ' + pasos.length;
      ant.disabled = i === 0;
      sig.textContent = i === pasos.length - 1 ? 'Empezar de nuevo' : 'Siguiente paso';
    }
    sig.addEventListener('click', function () { i = (i + 1) % pasos.length; mostrar(); });
    ant.addEventListener('click', function () { if (i > 0) { i--; mostrar(); } });
    mostrar();
  })();
})();
