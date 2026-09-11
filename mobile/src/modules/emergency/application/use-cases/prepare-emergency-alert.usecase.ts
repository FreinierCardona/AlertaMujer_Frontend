export interface PreparedEmergencyAlert {
  message: string;
  title: string;
}

export function prepareEmergencyAlert(): PreparedEmergencyAlert {
  return {
    message: 'Se enviara tu ubicacion a todos tus contactos de confianza.',
    title: 'Alerta SOS',
  };
}
