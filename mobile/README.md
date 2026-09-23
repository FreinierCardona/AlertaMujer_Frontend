# AlertaMujer Mobile

Aplicación móvil de AlertaMujer construida con React Native, Expo Router y TypeScript.

## Ejecución

```bash
npm install
npm start
```

Comandos adicionales: `npm run android`, `npm run ios`, `npm run typecheck` y `npm run lint`.

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

La organización es N-capas + By Module. Incluye UI, navegación, formularios, preferencias locales, tema e idiomas español, inglés, portugués y francés. La conexión a API mediante `EXPO_PUBLIC_API_BASE_URL` queda preparada, pero este repositorio no implementa backend, persistencia remota ni reglas server-side.
