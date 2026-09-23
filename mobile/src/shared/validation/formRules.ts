// Reúne reglas locales de formato sin incluir reglas de negocio que corresponden al backend.
export const isEmail = (value: string) =>
  /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value.trim());
export const isPersonName = (value: string) =>
  /^[A-Za-zÁÉÍÓÚÜÑáéíóúüñ]+(?:\s[A-Za-zÁÉÍÓÚÜÑáéíóúüñ]+)*$/.test(value.trim());
export const isPhone = (value: string) => /^\d{10}$/.test(value.trim());
export const isPassword = (value: string) =>
  value.length >= 12 &&
  /[A-ZÁÉÍÓÚÜÑ]/.test(value) &&
  /\d/.test(value) &&
  /[^A-Za-z0-9\sÁÉÍÓÚÜÑáéíóúüñ]/.test(value);
export const onlyDigits = (value: string, limit: number) =>
  value.replace(/\D/g, '').slice(0, limit);
export const maskEmail = (value: string) => {
  const [name, domain] = value.split('@');
  if (!domain) return value;
  return `${name.slice(0, 2)}${'*'.repeat(Math.max(2, name.length - 2))}@${domain}`;
};
export const maskDestination = (value: string) =>
  value.includes('@')
    ? maskEmail(value)
    : `${'*'.repeat(Math.max(4, value.length - 4))}${value.slice(-4)}`;
