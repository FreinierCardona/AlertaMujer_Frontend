// Mensaje reutilizado cuando el usuario deja vacio un campo obligatorio.
export const REQUIRED_FIELD_MESSAGE = 'Este campo es obligatorio';

// Tipo simple para guardar errores por nombre de campo dentro de cada formulario.
export type FieldErrors<T extends string> = Partial<Record<T, string>>;

// Revisa si un objeto de errores tiene al menos un mensaje activo.
// Se usa en las pantallas para no repetir Object.values(...).some(Boolean).
export function hasValidationErrors<T extends string>(errors: FieldErrors<T>) {
  return Object.values(errors).some(Boolean);
}

// Expresion regular basica y segura para validar la estructura de un correo.
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

// Permite nombres y apellidos con letras, tildes, ñ y espacios entre palabras.
const PERSON_NAME_REGEX = /^[A-Za-zÁÉÍÓÚÜÑáéíóúüñ]+(?:\s[A-Za-zÁÉÍÓÚÜÑáéíóúüñ]+)*$/;

// Detecta si la contrasena tiene al menos una mayuscula, un numero y un simbolo.
const PASSWORD_REQUIREMENTS_REGEX = {
  uppercase: /[A-ZÁÉÍÓÚÜÑ]/,
  number: /\d/,
  symbol: /[^A-Za-z0-9\sÁÉÍÓÚÜÑáéíóúüñ]/,
};

// Limpia espacios al inicio/final para validar el valor real ingresado.
function cleanValue(value: string) {
  return value.trim();
}

// Valida campos obligatorios y devuelve un mensaje si el campo esta vacio.
export function validateRequired(value: string) {
  return cleanValue(value) ? '' : REQUIRED_FIELD_MESSAGE;
}

// Valida que el correo no este vacio y tenga una estructura real como usuario@gmail.com.
export function validateEmail(value: string) {
  const email = cleanValue(value);

  if (!email) return REQUIRED_FIELD_MESSAGE;
  if (!EMAIL_REGEX.test(email)) return 'Ingresa un correo electrónico válido';

  return '';
}

// Valida la contrasena siguiendo los requisitos de seguridad definidos para la app.
export function validatePassword(value: string) {
  const password = value.trim();

  if (!password) return REQUIRED_FIELD_MESSAGE;
  if (password.length < 12) return 'La contraseña debe tener mínimo 12 caracteres';

  const hasRequiredCharacters =
    PASSWORD_REQUIREMENTS_REGEX.uppercase.test(password) &&
    PASSWORD_REQUIREMENTS_REGEX.number.test(password) &&
    PASSWORD_REQUIREMENTS_REGEX.symbol.test(password);

  if (!hasRequiredCharacters) return 'Debe incluir una mayúscula, un número y un símbolo';

  return '';
}

// Valida que la confirmacion exista y coincida exactamente con la contrasena principal.
export function validatePasswordConfirmation(password: string, confirmation: string) {
  if (!confirmation.trim()) return REQUIRED_FIELD_MESSAGE;
  if (password !== confirmation) return 'Las contraseñas no coinciden';

  return '';
}

// Valida nombres y apellidos evitando numeros o simbolos extranos.
export function validatePersonName(value: string, fieldName: 'nombre' | 'apellido') {
  const personName = cleanValue(value).replace(/\s+/g, ' ');

  if (!personName) return REQUIRED_FIELD_MESSAGE;
  if (!PERSON_NAME_REGEX.test(personName)) {
    return fieldName === 'nombre' ? 'Ingresa un nombre válido' : 'Ingresa un apellido válido';
  }

  return '';
}

// Convierte un texto dd/mm/aaaa en Date, verificando que sea una fecha real.
function parseBirthDate(value: string) {
  const [dayText, monthText, yearText] = value.split('/');

  if (!dayText || !monthText || !yearText || yearText.length !== 4) return null;

  const day = Number(dayText);
  const month = Number(monthText);
  const year = Number(yearText);
  const date = new Date(year, month - 1, day);

  const isRealDate =
    date.getFullYear() === year &&
    date.getMonth() === month - 1 &&
    date.getDate() === day;

  return isRealDate ? date : null;
}

// Calcula la edad teniendo en cuenta si ya cumplio anos en el ano actual.
function getAge(birthDate: Date, today: Date) {
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDifference = today.getMonth() - birthDate.getMonth();
  const hasNotHadBirthday =
    monthDifference < 0 || (monthDifference === 0 && today.getDate() < birthDate.getDate());

  if (hasNotHadBirthday) age -= 1;

  return age;
}

// Valida fecha de nacimiento: no permite hoy, fechas futuras ni menores de 16 anos.
export function validateBirthDate(value: string) {
  const birthDate = parseBirthDate(value);

  if (!value.trim()) return REQUIRED_FIELD_MESSAGE;
  if (!birthDate) return 'Ingresa una fecha válida';

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  birthDate.setHours(0, 0, 0, 0);

  if (birthDate >= today) return 'Ingresa una fecha válida';
  if (getAge(birthDate, today) < 16) return 'Debes ser mayor de 16 años';

  return '';
}

// Deja solo numeros y limita el telefono colombiano a 10 digitos.
export function formatPhoneInput(value: string) {
  return value.replace(/\D/g, '').slice(0, 10);
}

// Formatea la fecha mientras se escribe para mantener dd/mm/aaaa.
export function formatBirthDateInput(value: string) {
  const digits = value.replace(/\D/g, '').slice(0, 8);
  const day = digits.slice(0, 2);
  const month = digits.slice(2, 4);
  const year = digits.slice(4, 8);

  if (digits.length <= 2) return day;
  if (digits.length <= 4) return `${day}/${month}`;

  return `${day}/${month}/${year}`;
}

// Valida telefono colombiano: exactamente 10 digitos y sin letras ni simbolos.
export function validatePhone(value: string) {
  const phone = cleanValue(value);

  if (!phone) return REQUIRED_FIELD_MESSAGE;
  if (!/^\d{10}$/.test(phone)) return 'Ingresa un número de teléfono válido';

  return '';
}
