# Guías

Apuntes para ciencia de datos. Cada guía resume lo que se usa en la práctica,
con ejemplos, tablas de referencia y alternativas.

🌐 **[fedetrus.github.io/guias](https://fedetrus.github.io/guias/)**

## Guías

| Guía | Contenido |
|---|---|
| [Python](https://fedetrus.github.io/guias/python/) | Tipos, condicionales, bucles, errores, estructuras y funciones · 10 módulos |
| [Análisis Exploratorio de Datos](https://fedetrus.github.io/guias/eda/) | pandas y seaborn: tipos, faltantes, distribuciones, outliers y correlación · 11 secciones |
| [Probabilidad y Estadística](https://fedetrus.github.io/guias/estadistica/) | Descriptiva, probabilidad y regresión lineal simple · 15 secciones |
| [pandas](https://fedetrus.github.io/guias/pandas/) | Cargar, seleccionar, transformar, agrupar y combinar datos · 14 secciones |

## Estructura

```
├── index.html          portada con las tarjetas
├── assets/
│   ├── guia.css        color, tipografía y tamaños — el único lugar donde se cambian
│   └── guia.js         índice, sección activa y tema claro/oscuro
├── python/index.html
├── eda/index.html
├── estadistica/index.html
└── pandas/index.html
```

Todo es HTML estático sobre [Bootstrap 5.3](https://getbootstrap.com/). No hay build ni dependencias:
se abre el archivo y listo.

## Agregar una guía

1. Crear la carpeta con su `index.html`, copiando el encabezado de una guía existente
   (enlaza `../assets/guia.css` y `../assets/guia.js`).
2. Escribir el contenido en `<section id="...">`; el índice se arma solo a partir de los `<h2>`.
3. Elegir el modo de lectura en el `<body>`:
   - `data-mode="scroll"` — todo seguido, el índice sigue el scroll.
   - `data-mode="panels"` — un módulo por vez.
4. Sumar la guía al array `GUIAS` en el `index.html` de la portada.

## Ver en local

```bash
python3 -m http.server 8000
```

Y abrir <http://localhost:8000>.

## Créditos

Desarrollado por Federico Suárez — 2026

## Licencia

[CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) — Federico Suárez
