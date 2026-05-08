# 📱 Alerta Mujer — Frontend Mobile

> *"La tecnología también puede salvar vidas."*

Aplicación móvil desarrollada para brindar apoyo **rápido, seguro y discreto** a mujeres y ciudadanos en situaciones de riesgo, permitiendo el envío de alertas SOS, geolocalización en tiempo real y comunicación inmediata con contactos de emergencia y autoridades.

---

## 📖 ¿Qué es Alerta Mujer?

Las Tecnologías de la Información y Comunicación (TIC) permiten desarrollar soluciones innovadoras para problemáticas sociales de alto impacto. **Alerta Mujer** nace como una iniciativa tecnológica enfocada en la protección y seguridad de mujeres en situaciones de peligro, ofreciendo una herramienta móvil rápida, accesible e intuitiva para solicitar ayuda en tiempo real.

El frontend mobile es la capa visual e interactiva del sistema, responsable de la experiencia de usuario, navegación, visualización de alertas, autenticación y activación de funcionalidades críticas.

---

## 🎯 Objetivos

### General
Desarrollar una aplicación móvil Android que permita enviar alertas de emergencia, compartir ubicación en tiempo real y acceder rápidamente a herramientas de seguridad y evidencia, garantizando rapidez, accesibilidad y confiabilidad.

### Específicos
- Diseñar una interfaz intuitiva y accesible
- Permitir configuración de contactos de emergencia
- Implementar geolocalización en tiempo real
- Integrar alertas SOS rápidas y discretas
- Permitir captura de evidencia multimedia
- Garantizar almacenamiento seguro de información
- Implementar notificaciones push en tiempo real
- Mantener compatibilidad con Android 8+

---

## 🚀 Funcionalidades Principales

### 🔐 Autenticación y Seguridad
- Registro de usuarias e inicio de sesión seguro
- Recuperación de contraseña y validación de credenciales
- Manejo de sesiones con **JWT**
- Protección de información sensible

### 📍 Geolocalización en Tiempo Real
- Obtención de coordenadas GPS
- Seguimiento continuo de ubicación
- Integración con **Google Maps**
- Compartición automática de ubicación en alertas

### 🚨 Sistema de Alertas SOS
- Botón SOS principal de acceso rápido
- Envío automático con mensajes personalizados
- Adjuntar ubicación y evidencia
- Confirmación de entrega

### 🫧 Burbuja Flotante Discreta
- Activación desde cualquier pantalla
- Funcionamiento sobre pantalla bloqueada
- Menú rápido de acciones
- Envío silencioso de alertas

### 👥 Gestión de Contactos
- Registro, edición y eliminación de contactos de confianza
- Persistencia segura con cifrado de información

### 📷 Evidencia Multimedia
- Captura rápida de fotos
- Grabación de audio y video
- Envío adjunto con alertas
- Almacenamiento cifrado **AES-256**

### 📞 Llamadas de Emergencia
- Llamadas automáticas y acceso rápido a contactos
- Comunicación directa con autoridades

### 🔔 Notificaciones Push
- Integración con **Firebase Cloud Messaging (FCM)**
- Acciones rápidas desde notificaciones
- Apertura directa de ubicación en tiempo real

### 📚 Historial de Alertas
- Registro cronológico con búsqueda y filtros
- Visualización de estados y consulta de evidencia

---

## 🛠️ Tecnologías Utilizadas

| Categoría | Tecnologías |
|---|---|
| **Frontend Mobile** | React Native, Expo, TypeScript, React Navigation, Context API / Zustand, Axios |
| **Integraciones** | Google Maps API, Firebase Cloud Messaging, WebSockets, REST API, Android Native Modules |
| **Seguridad** | JWT, AES-256, HTTPS / TLS 1.3, Android Keystore |

---

## 📱 Compatibilidad

- ✅ Android 8+
- ✅ Dispositivos móviles Android
- ✅ Múltiples resoluciones y tamaños de pantalla

---

## 🎨 Principios de Diseño UX/UI

El diseño prioriza el uso bajo condiciones de estrés y emergencia:

- ⚡ **Rapidez de acceso** — Acciones críticas al alcance inmediato
- 🧭 **Navegación simple** — Flujos reducidos y directos
- 👁️ **Visibilidad** — Acciones de emergencia siempre visibles
- ♿ **Accesibilidad** — Interfaz usable por cualquier persona
- 🧠 **Intuitividad** — Sin curva de aprendizaje

---

## ⚡ Instalación y Ejecución

### Requisitos previos

- Node.js
- npm o yarn
- Android Studio
- Expo CLI
- Git
- VS Code

### Pasos

```bash
# 1. Clonar el repositorio
git clone <URL_DEL_REPOSITORIO>

# 2. Entrar al directorio del proyecto
cd mobile

# 3. Instalar dependencias
npm install

# 4. Ejecutar el proyecto
npx expo start
```

---

## 🧪 Pruebas

El frontend contempla pruebas en las siguientes áreas:

| Área | Descripción |
|---|---|
| Navegación | Flujos entre pantallas |
| Validaciones | Formularios y entradas de usuario |
| Alertas | Envío y confirmación de SOS |
| Geolocalización | Precisión y tiempo real |
| Notificaciones | Push y acciones rápidas |
| Rendimiento | Tiempos de respuesta |
| Compatibilidad | Diferentes versiones de Android |

---

## 🔒 Seguridad

La aplicación protege activamente los siguientes datos:

- 👤 Datos personales de la usuaria
- 📇 Contactos de emergencia
- 📸 Evidencia multimedia
- 📍 Ubicación en tiempo real
- 🔑 Sesiones autenticadas

---

## 🌎 Impacto Social

**Alerta Mujer** busca convertirse en una herramienta tecnológica de apoyo para la **prevención y atención de situaciones de riesgo**, proporcionando mecanismos rápidos y accesibles de comunicación y alerta para mujeres y ciudadanos en Colombia.

---

## 📂 Metodología de Desarrollo

- Desarrollo incremental
- Arquitectura en N capas
- Separación modular
- Escalabilidad progresiva

---

## 👨‍💻 Equipo de Desarrollo

Proyecto desarrollado por **aprendices ADSO del SENA**, con roles en:

- Desarrollo Full Stack
- Desarrollo Mobile
- Diseño UX/UI
- Arquitectura de Software
- Seguridad y Backend

---

## 📌 Estado del Proyecto

> 🚧 **En desarrollo activo.**

---

## 📄 Licencia

Este proyecto es desarrollado con **fines académicos y sociales**.

---

## 📚 Referencias

- [Android Developers](https://developer.android.com/)
- [Firebase Documentation](https://firebase.google.com/docs)
- [Google Maps Platform](https://developers.google.com/maps)
- ISO 9241 — Ergonomía de la interacción humano-sistema
- Ley 1257 de 2008 — Colombia (Violencia contra la mujer)
- Ley 1581 de 2012 — Protección de datos personales

---

<div align="center">

❤️ **Alerta Mujer** — Porque la tecnología también puede salvar vidas.

</div>