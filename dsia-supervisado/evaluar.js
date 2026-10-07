// Etapa 5 · Evaluar: umbral y matriz de confusión; métricas de regresión frente a un error grande.
(function () {
  var D = window.Dsia, add = D.add, fmt = D.fmt, pct = D.pct, texto = D.texto;

  // ===== Clasificación: el umbral cambia la matriz y las métricas =====
  (function () {
    var matriz = document.getElementById('m-um');
    if (!matriz) return;
    var rango = document.getElementById('r-um'), vago = document.getElementById('k-vago');
    // 100 alumnos de prueba (25 desaprobaron), con la P(desaprobar) que les da un modelo simulado.
    var rnd = D.azar(21), casos = [], RIESGO = 25;
    for (var i = 0; i < 100; i++) {
      var riesgo = i < RIESGO;
      casos.push({ riesgo: riesgo, p: 1 / (1 + Math.exp(-((riesgo ? 1.6 : -1.8) + D.normal(rnd) * 1.3))) });
    }

    function celda(n, ok, texto) { return '<div class="celda ' + (ok ? 'ok' : 'no') + '"><b>' + n + '</b>' + texto + '</div>'; }

    function dibujar() {
      var u = Number(rango.value), tp = 0, fn = 0, fp = 0, tn = 0;
      rango.disabled = vago.checked;
      casos.forEach(function (k) {
        var dice = !vago.checked && k.p >= u;
        if (k.riesgo) dice ? tp++ : fn++; else dice ? fp++ : tn++;
      });
      matriz.innerHTML = '<div></div><div class="cab">marcó en riesgo</div><div class="cab">no marcó</div>' +
        '<div class="lado">desaprobó</div>' + celda(tp, true, 'detectados a tiempo') + celda(fn, false, 'se escaparon sin ayuda') +
        '<div class="lado">aprobó</div>' + celda(fp, false, 'tutorías de más') + celda(tn, true, 'bien sin marcar');
      var acc = (tp + tn) / casos.length, prec = tp + fp ? tp / (tp + fp) : null, rec = tp / (tp + fn);
      texto('o-um', fmt(u));
      texto('v-acc', pct(acc));
      texto('v-prec', prec == null ? '—' : pct(prec));
      texto('v-rec', pct(rec));
      texto('t-um', vago.checked
        ? 'Accuracy de ' + pct(acc) + ' sin ayudar a un solo alumno en riesgo. Por eso el accuracy solo no alcanza.'
        : 'Detecta a ' + tp + ' de los ' + RIESGO + ' en riesgo, a cambio de ' + fp + (fp === 1 ? ' tutoría de más.' : ' tutorías de más.') +
          (u <= 0.3 ? ' Umbral bajo: casi no se le escapa nadie, pero marca de más.' : u >= 0.7 ? ' Umbral alto: cuando marca, casi siempre acierta, pero se le escapan varios.' : ''));
    }
    rango.addEventListener('input', dibujar);
    vago.addEventListener('change', dibujar);
    dibujar();
  })();

  // ===== Regresión: MSE, RMSE y MAE frente a un error grande =====
  (function () {
    var svg = document.getElementById('g-out');
    if (!svg) return;
    var rango = document.getElementById('r-out'), barras = document.getElementById('g-out-barras');
    var ERRORES = [0.3, -0.4, 0.2, -0.3, 0.5, -0.2, 0.4];   // los primeros 7 alumnos, fijos
    var recta = function (x) { return 1.5 + 0.6 * x; };       // la nota que predice el modelo según las horas

    function dibujar() {
      // El último alumno sacó menos de lo predicho: su error va hacia abajo.
      var errores = ERRORES.concat(-Number(rango.value));
      var e = D.plano(svg, { xmin: 0, xmax: 9, ymin: 0, ymax: 10, h: 190, xticks: [0, 2, 4, 6, 8], yticks: [0, 5, 10],
        xlabel: 'horas de estudio', ylabel: 'nota' });
      add(e.capa, 'line', { class: 'recta', x1: e.x(0), y1: e.y(recta(0)), x2: e.x(9), y2: e.y(recta(9)) });
      errores.forEach(function (err, i) {
        var x = i + 1, ultimo = i === errores.length - 1;
        add(e.capa, 'line', { class: 'residuo', x1: e.x(x), x2: e.x(x), y1: e.y(recta(x)), y2: e.y(recta(x) + err), 'stroke-width': ultimo ? 3 : 1.5 });
        add(svg, 'circle', { class: ultimo ? 'punto hueco' : 'punto', cx: e.x(x), cy: e.y(recta(x) + err), r: 4.5 });
      });

      var n = errores.length, ultimo = errores[n - 1];
      var mse = errores.reduce(function (s, t) { return s + t * t; }, 0) / n;
      var mae = errores.reduce(function (s, t) { return s + Math.abs(t); }, 0) / n;
      var rmse = Math.sqrt(mse);
      var valores = [['MSE', mse], ['RMSE', rmse], ['MAE', mae]];
      barras.textContent = '';
      barras.setAttribute('viewBox', '0 0 320 96');
      var L = 50, R = 270, TOPE = 2.2;
      valores.forEach(function (m, i) {
        var y = 6 + i * 30;
        add(barras, 'text', { class: 'fuerte', x: L - 8, y: y + 14, 'text-anchor': 'end' }, m[0]);
        add(barras, 'rect', { class: 'barra', x: L, y: y, width: Math.max(1, m[1] / TOPE * (R - L)), height: 20, rx: 2 });
        add(barras, 'text', { x: L + m[1] / TOPE * (R - L) + 6, y: y + 14 }, fmt(m[1]));
      });
      texto('o-out', fmt(-ultimo, 1));
      texto('t-out', 'Le predijo ' + fmt(recta(8), 1) + ' y sacó ' + fmt(recta(8) + ultimo, 1) + '. Ese único alumno aporta el ' + pct(ultimo * ultimo / n / mse) +
        ' del MSE y el ' + pct(-ultimo / n / mae) + ' del MAE. El RMSE dice que en promedio el modelo erra por ' + fmt(rmse, 1) + ' puntos.');
    }
    rango.addEventListener('input', dibujar);
    dibujar();
  })();
})();
