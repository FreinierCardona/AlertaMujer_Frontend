export const lightColors = {
  background: '#FFE4F0',
  backgroundLight: '#FFF0F6',
  primary: '#E91E8C',
  primaryLight: '#F06292',
  primaryDark: '#C2185B',
  textDark: '#1A1A2E',
  textMedium: '#555577',
  textLight: '#888899',
  textWhite: '#FFFFFF',
  white: '#FFFFFF',
  inputBorder: '#E8D5E8',
  inputBackground: '#FFFFFF',
  divider: '#D4B0D0',
  success: '#4CAF50',
  successLight: '#E8F5E9',
  danger: '#FF3D71',
  dangerDark: '#CC1A4A',
  warning: '#FFA726',
  warningLight: '#FFF4DF',
  info: '#3366CC',
  infoLight: '#EAF1FF',
  overlay: 'rgba(26, 26, 46, 0.55)',
  sosRed: '#E8194A',
  sosRedDark: '#CC1A4A',
  cardPurple: '#F3E8FF',
  cardGreen: '#E8F5E9',
  iconPurple: '#9C27B0',
  iconGreen: '#4CAF50',
};

export type AppColors = typeof lightColors;
export type ThemeMode = 'light' | 'dark';
export type ResolvedThemeMode = 'light' | 'dark';

export const darkColors: AppColors = {
  ...lightColors,
  background: '#18111A',
  backgroundLight: '#251927',
  primary: '#FF6CB5',
  primaryLight: '#FF99CB',
  primaryDark: '#D93686',
  textDark: '#FFF7FB',
  textMedium: '#D7C1D0',
  textLight: '#A98FA0',
  white: '#211720',
  inputBorder: '#4A3345',
  inputBackground: '#241823',
  divider: '#4A3345',
  successLight: '#14361D',
  warningLight: '#3B2C12',
  infoLight: '#182B4E',
  overlay: 'rgba(0, 0, 0, 0.72)',
  cardPurple: '#2C1E35',
  cardGreen: '#193322',
};

const Colors = lightColors;

export default Colors;
