# AlertaMujer Web

Aplicación React + TypeScript para el sitio público y el panel administrativo de AlertaMujer.

## Ejecución

```bash
npm install
copy .env.example .env
npm run dev
```

## Validación

```bash
npm run typecheck
npm run lint
npm run build
npm run test:e2e
```

## Rutas

- Públicas: `/`, `/funciones`, `/seguridad` y `/descargar`.
- Acceso: `/admin/login`.
- Administración: `/admin/dashboard`, `/admin/alertas`, `/admin/usuarias` y `/admin/auditoria`.

## Alcance

El sitio público informa sobre la solución. El acceso administrativo, la lista de alertas y el detalle de evidencia/chat requieren un Backend configurado mediante `VITE_API_BASE_URL`; el access token permanece en memoria y el refresh token solo durante la pestaña.
