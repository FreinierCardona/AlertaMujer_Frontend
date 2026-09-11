# AlertaMujer Frontend Mobile

Repositorio exclusivo para la aplicacion mobile de AlertaMujer, construida con React Native, Expo Router y TypeScript.

Este proyecto contiene solo UI/UX, navegacion, componentes, estado de interfaz, validaciones frontend y puntos de integracion para consumir una API externa en el futuro. El backend y la base de datos deben mantenerse como proyectos independientes.

## Estructura

```text
mobile/
  app/          Rutas declarativas de Expo Router
  assets/       Recursos estaticos mobile
  src/
    core/       Infraestructura transversal para consumir servicios externos
    modules/    Modulos funcionales organizados por N-capas
    shell/      Providers y navegacion auxiliar de la app mobile
    shared/     UI, tema, i18n, hooks y utilidades reutilizables
  test/         Configuracion compartida para pruebas
```

## Arquitectura

La organizacion vigente es N-capas + By Module, sin DDD.

Cada modulo mantiene solo las capas necesarias:

```text
src/modules/{module}/
  presentation/     Pantallas, componentes y hooks de UI
  application/      Casos de uso y coordinacion frontend
  index.ts          Exportaciones publicas del modulo
```

No se crean carpetas internas por plantilla. Si un modulo solo necesita una pantalla, conserva `presentation/screens`; si necesita coordinar una accion de frontend, agrega `application`; si aun no tiene implementacion, puede mantener solo su `index.ts`.

`src/core/api` queda preparado para conectarse a un backend mediante `EXPO_PUBLIC_API_BASE_URL`, pero no implementa backend ni persistencia propia.

`src/shared/theme` centraliza los tokens visuales y el provider para modo claro, oscuro o sistema. `src/shared/i18n` centraliza el idioma actual y los textos compartidos en Espanol e Ingles.

## Comandos

```bash
cd mobile
npm install
npm run typecheck
npm run lint
npm start
```

## Alcance

Incluido en este repositorio:

- Frontend mobile con React Native + Expo.
- Expo Router para navegacion.
- UI reutilizable, tema y validaciones de formularios.
- Modulos frontend de identidad, emergencia, contactos, historial, evidencia, chat y perfil.
- Preparacion minima para consumo futuro de API externa.

Fuera de este repositorio:

- Backend.
- Base de datos.
- Servicios administrativos web.
- Implementaciones de API, modelos de datos persistentes o reglas server-side.
