# AlertaMujer Frontend

Prototipo móvil en React Native + Expo Router, organizado con rutas en `mobile/app/` y módulos funcionales en `mobile/src/`.

## Estado de migración

- HU-AM-001: acceso, registro y verificación visual local.
- HU-AM-002: recuperación y restablecimiento visual de contraseña.
- HU-AM-003: gestión local de contactos de emergencia: alta desde un directorio controlado, edición de relación y eliminación confirmada.

Los datos de sesión y contactos se conservan solo en AsyncStorage para fines demostrativos. No existe integración con backend, validación remota de usuarias ni envío real de alertas en este estado.

## Ejecución y validación

Desde `mobile/`:

```powershell
npm.cmd install --legacy-peer-deps
npm.cmd run typecheck
npm.cmd run lint
npm.cmd run start
```

La disponibilidad de Expo Go y las funciones de dispositivo se validan aparte; una comprobación estática no las sustituye.
