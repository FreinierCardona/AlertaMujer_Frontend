# AlertaMujer Frontend

Monorepositorio de las experiencias Web y Mobile de AlertaMujer.

| Aplicación | Tecnología | Propósito |
| --- | --- | --- |
| `web/` | React, TypeScript y Vite | Sitio público y panel administrativo. |
| `mobile/` | React Native, Expo Router y TypeScript | Aplicación móvil para usuarias. |

## Inicio rápido

```bash
cd web
npm install
npm run dev
```

```bash
cd mobile
npm install
npm start
```

## Validación

```bash
cd web
npm run typecheck
npm run lint
npm run build
npm run test:e2e
```

```bash
cd mobile
npm run typecheck
npm run lint
```

## Alcance

Los proyectos implementan interfaz, navegación, preferencias, validaciones de
frontend y recursos visuales. No incluyen ni son propietarios del Backend o de
la base de datos; Mobile consume sus contratos mediante configuración de
entorno y la evidencia de integración se documenta en `mobile/README.md`.
