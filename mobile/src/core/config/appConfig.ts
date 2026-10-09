import Constants from 'expo-constants';

export interface AppConfig {
  apiBaseUrl: string;
  wsUrl: string;
  authorityPhone: string;
  remotePushEnabled: boolean;
}

const appConfig: AppConfig = {
  apiBaseUrl: process.env.EXPO_PUBLIC_API_BASE_URL ?? '',
  wsUrl: (process.env.EXPO_PUBLIC_API_BASE_URL ?? '').replace(/^http/i, 'ws').replace(/\/$/, '') + '/ws',
  authorityPhone: process.env.EXPO_PUBLIC_AUTHORITY_PHONE ?? '',
  remotePushEnabled: process.env.EXPO_PUBLIC_ENABLE_REMOTE_PUSH === 'true',
};

/**
 * Expo Go cannot provide this application's FCM integration. A development
 * build is the only supported runtime for remote push registration.
 */
export const isRunningInExpoGo = Constants.appOwnership === 'expo';

export const canUseRemotePush =
  appConfig.remotePushEnabled && !isRunningInExpoGo;

/** Expo Go cannot validate this application's persistent Android location service. */
export const canUseBackgroundLocation = !isRunningInExpoGo;

export default appConfig;
