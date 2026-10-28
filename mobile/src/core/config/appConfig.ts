import Constants from 'expo-constants';

export interface AppConfig {
  apiBaseUrl: string;
  wsUrl: string;
  authorityPhone: string;
}

const appConfig: AppConfig = {
  apiBaseUrl: process.env.EXPO_PUBLIC_API_BASE_URL ?? '',
  wsUrl: (process.env.EXPO_PUBLIC_API_BASE_URL ?? '').replace(/^http/i, 'ws').replace(/\/$/, '') + '/ws',
  authorityPhone: process.env.EXPO_PUBLIC_AUTHORITY_PHONE ?? '',
};

export const isRunningInExpoGo = Constants.appOwnership === 'expo';

/** Expo Go no permite validar el servicio persistente de ubicación Android de esta aplicación. */
export const canUseBackgroundLocation = !isRunningInExpoGo;

export default appConfig;
