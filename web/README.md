<!-- Explica cómo ejecutar y recorrer el frontend web de AlertaMujer. -->
# Frontend web de AlertaMujer

Aplicación React + TypeScript para el sitio público y el panel administrativo.

## Ejecución

```bash
npm install
npm run dev
```

Validaciones disponibles:

```bash
npm run typecheck
npm run lint
npm run build
```

## Acceso administrativo

- Correo: `admin@alertamujer.org`
- Contraseña: `Alerta2026!`

Los formularios también contemplan credenciales inválidas, cuenta inhabilitada, rol no autorizado, error de servicio y sesión expirada. Las preferencias, filtros y cambios confirmados se conservan en el almacenamiento del navegador.

## Rutas principales

- Públicas: `/`, `/funciones`, `/seguridad`, `/descargar`.
- Acceso: `/admin/login`.
- Panel: `/admin/dashboard`, `/admin/alertas`, `/admin/usuarias`, `/admin/auditoria`.

Los estados alternos de consulta se verifican con `?view=loading`, `?view=empty`, `?view=error`, `?view=partial` o `?view=denied`, según la pantalla. La disponibilidad Android usa `?state=preparing`, `?state=unavailable`, `?state=error` y la variante estructural `?state=available`; el archivo de descarga permanece deshabilitado mientras no exista un artefacto publicado.
