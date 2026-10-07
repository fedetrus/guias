// Etapas 1 a 3 · Preparar: X e y, split y escalado. Todo con el ejemplo de los alumnos.
(function () {
  var D = window.Dsia, add = D.add, fmt = D.fmt, texto = D.texto;

  // ===== X e y: elegir la columna objetivo =====
  (function () {
    var tabla = document.getElementById('t-xy');
    if (!tabla) return;
    var botones = document.querySelectorAll('[data-y]');
    var cols = [].map.call(tabla.querySelectorAll('th'), function (th) { return th.dataset.col; });
    var X = ['horas', 'asistencia', 'sueno'];
    var CASOS = {
      aprueba: { fuga: 'nota',
        texto: 'y = si aprueba (sí o no): es una categoría → clasificación. X = horas, asistencia y sueño. La nota queda afuera (tachada): ' +
               'si el modelo la viera, adivinar si aprueba sería trivial, porque aprueba quien saca 4 o más. Eso es hacer trampa.',
        codigo: "X = df[['horas_estudio', 'asistencia', 'horas_sueno']]\ny = df['aprueba']" },
      nota: { fuga: 'aprueba',
        texto: 'y = la nota: es un número → regresión. Mismo X. Ahora la tachada es "¿aprueba?": se calcula a partir de la nota, así que también delataría la respuesta.',
        codigo: "X = df[['horas_estudio', 'asistencia', 'horas_sueno']]\ny = df['nota']" },
      '': { fuga: null,
        texto: 'Sin y no hay respuesta que aprender: el modelo solo puede buscar grupos de alumnos parecidos. Eso es aprendizaje no supervisado.',
        codigo: "X = df[['horas_estudio', 'asistencia', 'horas_sueno']]\n<span class=\"cm\"># sin y: solo busca grupos parecidos</span>\nKMeans(n_clusters=3).fit(X)" }
    };
    function elegir(y) {
      var caso = CASOS[y];
      botones.forEach(function (b) { b.setAttribute('aria-pressed', b.dataset.y === y); });
      tabla.querySelectorAll('tr').forEach(function (tr) {
        [].forEach.call(tr.children, function (celda, i) {
          var c = cols[i];
          celda.className = c === y ? 'es-y' : X.indexOf(c) >= 0 ? 'es-x' : c === caso.fuga ? 'fuga' : 'fuera';
        });
      });
      texto('t-xy-texto', caso.texto);
      document.getElementById('c-xy').innerHTML = caso.codigo;
    }
    botones.forEach(function (b) { b.addEventListener('click', function () { elegir(b.dataset.y); }); });
    elegir('aprueba');
  })();

  // ===== Split paso a paso: separar y tomar el examen =====
  (function () {
    var caja = document.getElementById('split-tablas');
    if (!caja) return;
    var bSep = document.getElementById('b-sep'), bExa = document.getElementById('b-exa'), bRei = document.getElementById('b-rei');
    // [horas de estudio, asistencia, ¿aprueba?]
    var ALUMNOS = [[8, 90, 'sí'], [2, 60, 'no'], [6, 85, 'sí'], [3, 75, 'no'], [10, 95, 'sí'],
                   [4, 80, 'sí'], [7, 70, 'sí'], [1, 50, 'no'], [5, 65, 'no'], [9, 88, 'sí']];
    var N_TEST = 3, semilla = 42, test = [];
    // Lo que "aprendió" el modelo con los alumnos de entrenamiento: con 5 horas o más, aprueba.
    function predecir(a) { return a[0] >= 5 ? 'sí' : 'no'; }

    function tabla(titulo, filas, modo, nuevo) {
      var cab = '<th>horas de estudio</th><th>asistencia</th><th>¿aprueba?</th>' + (modo ? '<th>el modelo dice</th>' : '');
      return '<div class="' + (nuevo ? 'nuevo' : '') + '"><h5>' + titulo + '</h5><div class="table-responsive"><table class="table table-sm">' +
        '<thead><tr>' + cab + '</tr></thead><tbody>' + filas.map(function (a) {
          var celdas = '<td>' + a[0] + '</td><td>' + a[1] + '%</td>';
          if (modo === 'oculta') return '<tr>' + celdas + '<td class="oculto">?</td><td class="oculto">—</td></tr>';
          if (modo === 'examen') {
            var ok = predecir(a) === a[2];
            return '<tr>' + celdas + '<td>' + a[2] + '</td><td class="' + (ok ? 'bien' : 'mal-t') + '">' + predecir(a) + (ok ? ' ✓' : ' ✕') + '</td></tr>';
          }
          return '<tr>' + celdas + '<td>' + a[2] + '</td></tr>';
        }).join('') + '</tbody></table></div></div>';
    }

    function estado(paso) {
      bSep.disabled = paso !== 0; bExa.disabled = paso !== 1; bRei.disabled = paso === 0;
      if (paso === 0) {
        caja.className = 'split-tablas';
        caja.innerHTML = tabla('Los 10 alumnos (X y su y)', ALUMNOS);
        texto('t-sep', 'Diez alumnos, cada uno con su resultado. Tocá "Separar".');
        return;
      }
      var train = ALUMNOS.filter(function (a) { return test.indexOf(a) < 0; });
      caja.className = 'split-tablas dos';
      caja.innerHTML = tabla('Aprende · entrenamiento (' + train.length + ')', train, null, paso === 1) +
        tabla('Se evalúa · prueba (' + N_TEST + ')', test, paso === 1 ? 'oculta' : 'examen', true);
      if (paso === 1) {
        texto('t-sep', 'El modelo aprende con ' + train.length + ' alumnos y sus resultados. Los otros ' + N_TEST +
          ' quedan guardados con el resultado tapado: es lo que va a tener que adivinar.');
      } else {
        var bien = test.filter(function (a) { return predecir(a) === a[2]; }).length;
        texto('t-sep', 'Con lo que aprendió ("con 5 horas o más, aprueba") acertó ' + bien + ' de ' + N_TEST + ' → accuracy = ' + fmt(bien / N_TEST) +
          '. Es una nota honesta porque se evaluó con alumnos que nunca vio. "Empezar de nuevo" hace otra mezcla y puede dar otra nota.');
      }
    }

    bSep.addEventListener('click', function () { test = D.mezclar(ALUMNOS, D.azar(semilla)).slice(0, N_TEST); estado(1); });
    bExa.addEventListener('click', function () { estado(2); });
    bRei.addEventListener('click', function () { semilla++; estado(0); });
    estado(0);
  })();

  // ===== Stratify: 30 alumnos, 6 desaprobados =====
  (function () {
    var svg = document.getElementById('g-split');
    if (!svg) return;
    var rango = document.getElementById('r-split'), estrat = document.getElementById('k-split');
    var N = 30, DESAPROBADOS = 6, CELDA = 18, LADO = 14;
    var semilla = 42;
    var desaprobo = function (i) { return i < DESAPROBADOS; };

    svg.setAttribute('viewBox', '0 0 320 96');
    add(svg, 'text', { class: 'fuerte', x: 0, y: 12 }, 'Entrenamiento');
    add(svg, 'text', { class: 'fuerte', x: 214, y: 12 }, 'Prueba');
    add(svg, 'line', { class: 'guia', x1: 204, x2: 204, y1: 0, y2: 96 });
    var cuadros = [];
    for (var i = 0; i < N; i++) {
      var r = add(svg, 'rect', { class: desaprobo(i) ? 'pB' : 'pA', width: LADO, height: LADO, rx: 3 });
      add(r, 'title', {}, desaprobo(i) ? 'desaprobó' : 'aprobó');
      cuadros.push(r);
    }

    function partir(nTest) {
      var rnd = D.azar(semilla), indices = [];
      for (var i = 0; i < N; i++) indices.push(i);
      if (!estrat.checked) return D.mezclar(indices, rnd).slice(0, nTest);
      // Estratificado: cada clase aporta a la prueba la misma proporción que tiene en el total.
      var desTest = Math.round(nTest * DESAPROBADOS / N);
      var des = D.mezclar(indices.filter(desaprobo), rnd).slice(0, desTest);
      var apr = D.mezclar(indices.filter(function (i) { return !desaprobo(i); }), rnd).slice(0, nTest - desTest);
      return des.concat(apr);
    }

    function dibujar() {
      var ts = Number(rango.value), nTest = Math.ceil(ts * N - 1e-9);
      var test = partir(nTest), enPrueba = {};
      test.forEach(function (i) { enPrueba[i] = true; });
      // Los desaprobados son los primeros índices: quedan primeros en cada lado y se cuentan de un vistazo.
      var ti = 0, pi = 0;
      cuadros.forEach(function (c, i) {
        var esTest = enPrueba[i], k = esTest ? pi++ : ti++, cols = esTest ? 5 : 10;
        var x = (esTest ? 214 : 0) + (k % cols) * CELDA, y = 22 + Math.floor(k / cols) * CELDA;
        c.style.transform = 'translate(' + x + 'px,' + y + 'px)';
      });
      var desPrueba = test.filter(desaprobo).length;
      texto('o-split', fmt(ts, 1));
      texto('t-split', 'random_state = ' + semilla + ' · Entrenamiento: ' + (N - nTest) + ' alumnos (' + (DESAPROBADOS - desPrueba) +
        ' desaprobados) · Prueba: ' + nTest + ' alumnos (' + desPrueba + (desPrueba === 1 ? ' desaprobado)' : ' desaprobados)') +
        (desPrueba === 0 ? '. Sin desaprobados en la prueba no hay forma de medir si el modelo los detecta.' : '.'));
    }

    rango.addEventListener('input', dibujar);
    estrat.addEventListener('change', dibujar);
    document.getElementById('b-split').addEventListener('click', function () { semilla++; dibujar(); });
    dibujar();
    // La transición se activa después de la primera ubicación, para que no arranque animada.
    requestAnimationFrame(function () { cuadros.forEach(function (c) { c.classList.add('mov'); }); });
  })();

  // ===== Escalar: el alumno más parecido =====
  (function () {
    var tabla = document.getElementById('t-knn');
    if (!tabla) return;
    var check = document.getElementById('k-knn');
    var NUEVO = { horas: 6, asistencia: 70 };
    var ALUMNOS = [
      { nombre: 'Ana', horas: 6.5, asistencia: 80 },
      { nombre: 'Beto', horas: 14, asistencia: 72 },
      { nombre: 'Carla', horas: 5, asistencia: 95 }
    ];
    var SD = { horas: 3, asistencia: 15 };   // desvíos de cada columna en los datos de entrenamiento

    function dibujar() {
      var esc = check.checked, dec = esc ? 2 : 1;
      var filas = ALUMNOS.map(function (a) {
        var dh = (a.horas - NUEVO.horas) / (esc ? SD.horas : 1);
        var da = (a.asistencia - NUEVO.asistencia) / (esc ? SD.asistencia : 1);
        return { a: a, dh: dh, da: da, d: Math.sqrt(dh * dh + da * da) };
      });
      var min = Math.min.apply(null, filas.map(function (f) { return f.d; }));
      var html = '<tr class="text-body-secondary"><td>Nuevo</td><td>' + NUEVO.horas + '</td><td>' + NUEVO.asistencia + '%</td><td>—</td></tr>';
      filas.forEach(function (f) {
        var gana = f.d === min;
        html += '<tr' + (gana ? ' class="fw-semibold text-primary"' : '') + '><td>' + f.a.nombre + '</td><td>' + fmt(f.a.horas, 1) +
          '</td><td>' + f.a.asistencia + '%</td><td>√(' + fmt(Math.abs(f.dh), dec) + '² + ' + fmt(Math.abs(f.da), dec) + '²) = ' +
          fmt(f.d, dec) + (gana ? ' ← más parecido' : '') + '</td></tr>';
      });
      tabla.querySelector('tbody').innerHTML = html;
      texto('t-knn-texto', esc
        ? 'Escalado, cada diferencia se mide en desvíos (horas ÷ 3, asistencia ÷ 15). Las 8 horas de diferencia con Beto son 2,7 desvíos y queda lejos. Gana Ana, parecida en las dos columnas.'
        : 'Sin escalar gana Beto, que estudia más del doble. 8 horas de diferencia pesan menos que 10 puntos de asistencia solo porque la asistencia usa números más grandes.');
    }
    check.addEventListener('change', dibujar);
    dibujar();
  })();

  // ===== Escalar: tres escaladores frente a un dato extremo =====
  (function () {
    var svg = document.getElementById('g-esc');
    if (!svg) return;
    var rango = document.getElementById('r-esc');
    var NORMALES = [2, 3, 4, 5, 6, 6, 7, 8, 10];

    function cuantil(orden, q) {   // interpolación lineal, igual que numpy
      var pos = (orden.length - 1) * q, b = Math.floor(pos);
      return orden[b] + (orden[Math.min(b + 1, orden.length - 1)] - orden[b]) * (pos - b);
    }
    var ESCALADORES = [
      { nombre: 'StandardScaler', min: -1.5, max: 3, ticks: [-1, 0, 1, 2, 3], f: function (v) {
        var m = v.reduce(function (s, t) { return s + t; }, 0) / v.length;
        var sd = Math.sqrt(v.reduce(function (s, t) { return s + (t - m) * (t - m); }, 0) / v.length);
        return function (t) { return (t - m) / sd; };
      } },
      { nombre: 'MinMaxScaler', min: 0, max: 1, ticks: [0, 0.5, 1], f: function (v) {
        var a = Math.min.apply(null, v), b = Math.max.apply(null, v);
        return function (t) { return (t - a) / (b - a); };
      } },
      { nombre: 'RobustScaler', min: -1.5, max: 3, ticks: [-1, 0, 1, 2, 3], f: function (v) {
        var o = v.slice().sort(function (a, b) { return a - b; });
        var med = cuantil(o, 0.5), iqr = cuantil(o, 0.75) - cuantil(o, 0.25);
        return function (t) { return (t - med) / iqr; };
      } }
    ];

    function dibujar() {
      var extremo = Number(rango.value), datos = NORMALES.concat(extremo);
      var L = 20, R = 300, FILA = 58, resumen = [];
      svg.textContent = '';
      svg.setAttribute('viewBox', '0 0 320 ' + (ESCALADORES.length * FILA + 4));
      ESCALADORES.forEach(function (e, k) {
        var tr = e.f(datos), top = k * FILA, yEje = top + 34;
        var x = function (v) { return L + (v - e.min) / (e.max - e.min) * (R - L); };
        var n = NORMALES.map(tr), a = n[0], b = n[n.length - 1];
        add(svg, 'text', { class: 'fuerte', x: 0, y: top + 12 }, e.nombre);
        add(svg, 'rect', { class: 'banda', x: x(a) - 5, y: yEje - 12, width: x(b) - x(a) + 10, height: 24, rx: 4 });
        add(svg, 'line', { class: 'eje', x1: L, x2: R, y1: yEje, y2: yEje });
        e.ticks.forEach(function (t) { add(svg, 'text', { x: x(t), y: yEje + 20, 'text-anchor': 'middle' }, fmt(t)); });
        n.forEach(function (v) { add(svg, 'circle', { class: 'punto', cx: x(v), cy: yEje, r: 4 }); });
        var vx = tr(extremo);
        if (vx > e.max) {
          add(svg, 'circle', { class: 'punto hueco', cx: R, cy: yEje, r: 4.5 });
          add(svg, 'text', { class: 'fuerte', x: R, y: yEje - 10, 'text-anchor': 'end' }, '→ ' + fmt(vx, 1));
        } else {
          add(svg, 'circle', { class: 'punto hueco', cx: x(vx), cy: yEje, r: 4.5 });
        }
        resumen.push(e.nombre.replace('Scaler', '') + ' de ' + fmt(a) + ' a ' + fmt(b));
      });
      texto('o-esc', extremo);
      texto('t-esc', 'Los 9 normales quedan en: ' + resumen.join(' · ') + '. ' +
        (extremo > 30 ? 'MinMax los aplasta contra el 0 y Standard los junta; Robust los deja igual y solo manda lejos al extremo.'
                      : 'Estirá el extremo y mirá cuál de los tres no se inmuta.'));
    }
    rango.addEventListener('input', dibujar);
    dibujar();
  })();
})();
