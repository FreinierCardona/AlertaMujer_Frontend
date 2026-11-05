# AlertaMujer Mobile

Aplicación móvil de AlertaMujer construida con React Native, Expo Router y TypeScript.

## Ejecución

```bash
npm install
npm start
```

Comandos adicionales: `npm run android`, `npm run ios`, `npm run typecheck`, `npm run lint`,
`npm run test:contact-alerts`, `npm run test:evidence` y `npm run test:remove-push`.

### Aviso local de ubicación

Mobile no registra tokens ni recibe push remoto. Durante una alerta abierta,
`expo-location` conserva el aviso técnico local del servicio foreground de
Android cuando el sistema lo permita. No es una notificación FCM ni un requisito
para activar SOS.

## Estructura

```text
app/       Rutas de Expo Router
assets/    Recursos estáticos
src/
  core/    Integración futura con servicios externos
  modules/ Funcionalidad organizada por módulo y capas necesarias
  shell/   Providers y navegación auxiliar
  shared/  UI, tema, i18n, hooks y utilidades
```

La organización es N-capas + By Module. Incluye UI, navegación, formularios,
tema e idiomas español, inglés, portugués y francés. Mobile consume el Backend
mediante `EXPO_PUBLIC_API_BASE_URL`, pero no es propietario de las reglas de
autorización, persistencia ni de las migraciones de PostgreSQL.
