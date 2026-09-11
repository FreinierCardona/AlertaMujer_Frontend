export interface AppConfig {
  apiBaseUrl: string;
}

const appConfig: AppConfig = {
  apiBaseUrl: process.env.EXPO_PUBLIC_API_BASE_URL ?? '',
};

export default appConfig;
