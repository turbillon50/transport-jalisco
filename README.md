# MT Empresarial · PWA

Plataforma de operaciones de transporte empresarial (export de Google Stitch)
convertida en una **PWA instalable** con navegación tipo app nativa en móvil y
layout adaptado a escritorio.

## Qué incluye

- **App de una sola página (SPA)** servida desde `index.html`, que carga cada
  pantalla del export de Stitch como fragmento y las conecta con navegación real
  (sin recargas), transiciones suaves y barra inferior en móvil / barra lateral
  en escritorio según el rol activo (Usuario · Chofer · Operaciones).
- **PWA instalable y offline**: `manifest.webmanifest`, `sw.js`
  (precache del shell + pantallas, *stale-while-revalidate*), íconos y banner de
  instalación ("Agregar a pantalla de inicio").
- **Sistema de diseño** *Aero-Corporate Precision* (tokens de color, tipografía
  Inter y Material Symbols) preservado del export original.

## Estructura

| Ruta | Descripción |
|------|-------------|
| `index.html` | Shell de la app (config de diseño + chrome de navegación). |
| `app.js` | Router por hash, carga de pantallas, roles e instalación. |
| `screens/*.html` | Fragmentos de cada pantalla (generados desde el export). |
| `manifest.webmanifest`, `sw.js`, `icons/` | Capa PWA. |
| `vercel.json` | Headers del service worker y fallback de SPA. |
| `build-fragments.mjs` / `build-icons.mjs` | Scripts de generación. |
| `transport-jalisco/…` | Export original de Google Stitch (fuente). |

## Regenerar

```bash
node build-fragments.mjs   # reconstruye screens/*.html desde el export
node build-icons.mjs       # regenera los íconos PNG de marca
```

## Despliegue (Vercel)

Sitio estático servido desde la raíz del repositorio — sin paso de build.
Rutas (hash): `#/home`, `#/services`, `#/request`, `#/driver`, `#/dispatch`, etc.
