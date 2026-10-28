// Adaptación editorial de privacyPolicy.json para la interfaz de usuario, versión 0.2 de Obsidian.
// Conserva la copia completa de la fuente para trazabilidad; no muestra tablas internas,
// listas de comprobación de publicación ni campos institucionales sin resolver en la interfaz de registro.
// La REVISIÓN LEGAL sigue pendiente en la fuente: responsable y contacto, conservación, proveedores,
// jurisdicción, verificación de edad y autorización separada y versionada. Este texto
// no resuelve esos puntos ni certifica que esté listo para publicación.
export const privacyPolicyVersion = '0.2';

export const privacyPolicySections = [
  {
    id: 'use', icon: 'heart-outline', title: 'Cómo usar AlertaMujer', source: '1, 9, 10',
    paragraphs: [
      'AlertaMujer es una herramienta de apoyo para usuarias que se sienten vulnerables ante una amenaza que pone en riesgo su integridad física. Su uso es exclusivo para personas mayores de edad, de 18 años en adelante.',
    ],
    items: [
      'Crea tu cuenta con información propia y actualizada, verifica tus datos y protege tu contraseña.',
      'Invita a tus contactos de emergencia. La relación se activa cuando la otra persona acepta la invitación.',
      'Para activar un SOS, mantén tu sesión iniciada, tu cuenta habilitada, al menos un contacto aceptado y habilitado, conexión, GPS y los permisos requeridos.',
      'Durante la alerta puedes compartir información pertinente mediante ubicación, fotografías y chat, según las funciones habilitadas.',
      'Finaliza la alerta desde tu cuenta y espera la confirmación de la aplicación.',
    ],
  },
  {
    id: 'location', icon: 'location-outline', title: 'Tu ubicación, durante las alertas', source: '3, 4.2, 5.1, 6',
    paragraphs: [
      'La ubicación en tiempo real se recopila únicamente al activar y seguir una alerta, para crear el SOS, mostrar la última ubicación confirmada y acompañar el seguimiento de la emergencia.',
      'La primera coordenada se obtiene al solicitar el SOS. Las actualizaciones continúan mientras la alerta está abierta y deben detenerse cuando se confirma su finalización. Este uso no autoriza el rastreo cotidiano fuera de las alertas.',
      'Las actualizaciones dependen de la conexión, el GPS, los permisos, la batería y las condiciones del dispositivo. La ubicación mostrada corresponde al último punto recibido y puede diferir de tu posición actual.',
      'Los puntos ya registrados forman parte del historial de la emergencia. Detener las actualizaciones no elimina automáticamente ese historial.',
    ],
  },
  {
    id: 'data', icon: 'document-text-outline', title: 'Qué información se utiliza', source: '3',
    items: [
      'Cuenta y perfil: usuario, nombres, apellidos, correo, teléfono, estado de cuenta y registros de aceptación y actividad, para identificarte y administrar tu acceso.',
      'Verificación y sesiones: solicitudes de registro, códigos de verificación protegidos, credenciales y datos de sesión, para verificar tus medios de contacto y proteger tu cuenta.',
      'Contactos y mensaje de ayuda: invitaciones, respuestas y mensaje personalizado, para organizar tu red de apoyo y componer la alerta.',
      'Emergencias: estado, fechas, ubicación, fotografías y mensajes, para dar seguimiento a la alerta y conservar su historial.',
      'Notificaciones y actividad administrativa: datos técnicos del dispositivo, intentos de envío y acciones autorizadas, para comunicar el SOS y mantener trazabilidad.',
      'Idioma y apariencia: preferencias guardadas en tu dispositivo para personalizar la interfaz.',
    ],
    paragraphs: [
      'Los datos se utilizan para las funciones habilitadas de AlertaMujer. No se destinan a publicidad comportamental, venta de información, perfilamiento comercial ni reconocimiento facial.',
    ],
  },
  {
    id: 'permissions', icon: 'options-outline', title: 'Permisos bajo tu control', source: '4.2, 4.3',
    items: [
      'Ubicación precisa, en primer y segundo plano: permite crear y seguir la alerta.',
      'Notificaciones: permite mostrar el aviso persistente durante la alerta.',
      'Cámara: se solicita al capturar una fotografía. Aportar evidencia es opcional y no es requisito para activar el SOS.',
    ],
    paragraphs: [
      'Puedes administrar los permisos desde los ajustes de Android. Al revocar uno, las funciones que dependen de él dejan de estar disponibles. Los permisos del dispositivo complementan la autorización de tratamiento de datos.',
      'Las fotografías y los mensajes pueden revelar información sensible. Comparte únicamente lo pertinente para la emergencia; no tienes que aportar información sensible opcional.',
    ],
  },
  {
    id: 'contacts', icon: 'people-outline', title: 'Tu red de apoyo y quién puede acceder', source: '5.2, 11',
    paragraphs: [
      'Los contactos son otras usuarias registradas que aceptan una invitación. Una relación aceptada permite que ambas personas actúen como contacto de emergencia.',
      'Al activar un SOS, tus contactos elegibles pueden recibir tu nombre, mensaje de ayuda, fecha y un enlace con coordenadas. Elige personas de confianza: quienes reciben esa información pueden compartirla fuera de la aplicación.',
      'Ser contacto no concede acceso al chat, las fotografías, el historial ni el panel de la otra persona. El personal administrador autorizado accede a la información necesaria para atender y seguir la alerta, según su función.',
      'El administrador puede consultar la alerta y marcarla en proceso; la finalización corresponde a la usuaria propietaria. Las acciones administrativas autorizadas mantienen trazabilidad.',
    ],
  },
  {
    id: 'evidence', icon: 'camera-outline', title: 'Fotografías y mensajes', source: '3, 5.3, 8.2, 9',
    paragraphs: [
      'Durante una emergencia abierta puedes aportar hasta 10 fotografías y comunicarte por chat con el administrador autorizado. Cada mensaje admite hasta 500 caracteres.',
      'Las fotografías y los mensajes se asocian a la emergencia. Las fotografías quedan disponibles para ti y el administrador autorizado según su función; al finalizar la alerta no se admiten nuevas evidencias.',
      'Comparte solo información relevante y respeta la privacidad de otras personas. Evita incluir datos de terceros que no sean necesarios para explicar la situación.',
      'Utiliza las funciones de buena fe: cuida tus credenciales, respeta las decisiones de tus contactos y conserva la integridad de la información compartida.',
    ],
  },
  {
    id: 'sos', icon: 'call-outline', title: 'Apoyo durante una emergencia', source: '9, 10',
    paragraphs: [
      'AlertaMujer complementa tu red de apoyo. No es una línea oficial de emergencias ni garantiza que un contacto o una autoridad responda. Ante peligro inmediato, utiliza también los canales oficiales de tu ubicación cuando puedas hacerlo de forma segura.',
      'La opción de llamada abre el marcador del teléfono: tú introduces el número y confirmas la llamada.',
      'Comprueba las confirmaciones de la aplicación. Un intento de notificación no confirma que tu contacto haya leído el aviso; una alerta sin conexión sigue abierta hasta que se confirme su finalización.',
      'La ubicación, el chat, las fotografías y la finalización requieren conexión y confirmación del servicio. Una acción sin confirmar no debe darse por enviada.',
    ],
  },
  {
    id: 'storage', icon: 'lock-closed-outline', title: 'Protección y conservación', source: '6, 7',
    paragraphs: [
      'La información de tu cuenta y tus alertas se almacena en la base de datos del servicio; las fotografías se guardan en archivos controlados por el servidor, con acceso según permisos.',
      'AlertaMujer utiliza controles de autenticación, permisos y trazabilidad. Las contraseñas, los códigos de verificación y los tokens de renovación se almacenan mediante representaciones protegidas, no como texto legible.',
      'Los datos de las emergencias se conservan para historial y trazabilidad mientras exista la cuenta, salvo eliminación válida. Las solicitudes temporales de registro y los códigos de verificación tienen su propio ciclo de vencimiento y limpieza.',
      'Protege tu contraseña y cierra la sesión en dispositivos que no controles.',
    ],
  },
  {
    id: 'rights', icon: 'hand-left-outline', title: 'Tus derechos sobre tus datos', source: '8.1, 12',
    items: [
      'Conocer, consultar, actualizar y corregir tus datos, y acceder gratuitamente a ellos.',
      'Solicitar información sobre el uso de tus datos y prueba de tu autorización cuando corresponda.',
      'Solicitar la revocación de la autorización o la supresión de datos cuando proceda.',
      'Decidir sobre el aporte de información sensible que no sea indispensable.',
      'Presentar una queja ante la Superintendencia de Industria y Comercio después de agotar la consulta o el reclamo ante el responsable o encargado.',
    ],
    paragraphs: [
      'Al formular una solicitud, identifica tu cuenta, indica cómo recibir respuesta y explica el derecho que deseas ejercer. Aporta solo la información necesaria para verificar tu identidad y comprender tu solicitud.',
      'Las consultas tienen un plazo de respuesta de diez días hábiles, con ampliación informada de hasta cinco más. Los reclamos completos se resuelven en quince días hábiles, con ampliación informada de hasta ocho más.',
    ],
  },
  {
    id: 'deletion', icon: 'trash-outline', title: 'Eliminación de la cuenta', source: '6.3, 12',
    paragraphs: [
      'La eliminación técnica de la cuenta es definitiva y comprende sus datos asociados, como credenciales, contactos, emergencias, ubicaciones, fotografías y mensajes.',
      'Para eliminar la cuenta, primero debe finalizar cualquier alerta abierta con confirmación del servicio. La supresión o revocación se evalúa también conforme a las obligaciones legales o contractuales aplicables.',
      'En una solicitud, aclara si deseas cerrar la cuenta, solicitar la supresión de datos personales o ambas cosas.',
    ],
  },
  {
    id: 'terms', icon: 'checkmark-circle-outline', title: 'Uso y aceptación', source: '4.1, 9, 13',
    paragraphs: [
      'La cuenta es personal. Utiliza las funciones disponibles para su finalidad de apoyo ante emergencias. No generes alertas deliberadamente falsas, suplantes personas, alteres evidencias ni accedas a información ajena.',
      'El acceso puede restringirse por incumplimiento, riesgos de seguridad, mantenimiento o exigencias legales, con información a la titular cuando corresponda.',
      'Leer o cerrar esta pantalla no acepta las condiciones por ti. Al volver al registro, marca la casilla si estás de acuerdo; la aceptación es necesaria para continuar.',
      'Los cambios materiales en el tratamiento de datos deben comunicarse antes de entrar en vigor y requerir una nueva autorización cuando corresponda. El uso continuado de la aplicación no sustituye por sí solo esa autorización.',
    ],
  },
] as const;
