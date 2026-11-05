import { useContext } from 'react';
import { ThemeContext } from './ThemeProvider';

export function useAppTheme() {
  const theme = useContext(ThemeContext);

  if (!theme) {
    throw new Error('useAppTheme must be used inside ThemeProvider.');
  }

  return theme;
}
