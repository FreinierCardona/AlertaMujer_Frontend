// Centraliza formatos legibles de fechas, horas y coordenadas para cada idioma.
import type { Language } from '../types/models';

const locales: Record<Language, string> = {
  es: 'es-CO',
  en: 'en-US',
  pt: 'pt-BR',
  fr: 'fr-FR',
};

export function formatDateTime(value: string, language: Language) {
  return new Intl.DateTimeFormat(locales[language], {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value));
}

export function formatDate(value: string, language: Language) {
  return new Intl.DateTimeFormat(locales[language], {
    dateStyle: 'medium',
  }).format(new Date(value));
}

export function coordinates(latitude: number, longitude: number) {
  return `${latitude.toFixed(5)}, ${longitude.toFixed(5)}`;
}
