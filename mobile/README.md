# AlertaMujer Mobile

Aplicación móvil de AlertaMujer construida con React Native, Expo Router y TypeScript.

## Ejecución

```bash
npm install
npm start
```

Comandos adicionales: `npm run android`, `npm run ios`, `npm run typecheck` y `npm run lint`.

### Expo Go (limitación temporal de push remoto)

Para iniciar con Expo Go, configura localmente `EXPO_PUBLIC_ENABLE_REMOTE_PUSH=false`
en `.env`. Así se conserva `EXPO_PUBLIC_API_BASE_URL` y todos los flujos HTTP
(autenticación, OTP por correo, perfil y contactos), pero no se carga ni se usa
`expo-notifications` para registrar un token FCM o recibir push remoto.

El registro remoto sigue deshabilitado si la app detecta Expo Go, aunque la
variable se establezca por error en `true`. Activa
`EXPO_PUBLIC_ENABLE_REMOTE_PUSH=true` solamente al generar un development build
con la configuración nativa de FCM para implementar o validar esa HU.

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
