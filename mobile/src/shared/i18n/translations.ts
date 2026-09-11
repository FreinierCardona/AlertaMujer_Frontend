export type AppLanguage = 'es' | 'en';

export interface AppMessages {
  navigation: {
    contacts: string;
    history: string;
    home: string;
    profile: string;
  };
}

export const defaultLanguage: AppLanguage = 'es';

export const translations: Record<AppLanguage, AppMessages> = {
  es: {
    navigation: {
      contacts: 'Contactos',
      history: 'Historial',
      home: 'Inicio',
      profile: 'Perfil',
    },
  },
  en: {
    navigation: {
      contacts: 'Contacts',
      history: 'History',
      home: 'Home',
      profile: 'Profile',
    },
  },
} as const;
