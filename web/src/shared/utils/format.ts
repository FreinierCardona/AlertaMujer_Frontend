// Centraliza formatos legibles de fechas, horas y coordenadas para ambos idiomas.
import type { Language } from '../types/models';

export function formatDateTime(value: string, language: Language) {
  return new Intl.DateTimeFormat(language === 'es' ? 'es-CO' : 'en-US', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value));
}

export function formatDate(value: string, language: Language) {
  return new Intl.DateTimeFormat(language === 'es' ? 'es-CO' : 'en-US', {
    dateStyle: 'medium',
  }).format(new Date(value));
}

export function coordinates(latitude: number, longitude: number) {
  return `${latitude.toFixed(5)}, ${longitude.toFixed(5)}`;
}
