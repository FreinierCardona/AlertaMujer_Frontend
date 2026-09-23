export interface AppConfig {
  apiBaseUrl: string;
  authorityPhone: string;
}

const appConfig: AppConfig = {
  apiBaseUrl: process.env.EXPO_PUBLIC_API_BASE_URL ?? '',
  authorityPhone: process.env.EXPO_PUBLIC_AUTHORITY_PHONE ?? '',
};

export default appConfig;
