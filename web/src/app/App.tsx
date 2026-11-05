// Compone los proveedores globales y el enrutador principal de la aplicación web.
import { NavigationProvider } from './navigation';
import { PreferencesProvider } from '../shared/preferences/PreferencesContext';
import { WebStateProvider } from '../shared/data/WebStateContext';
import { Router } from './Router';

export default function App() {
  return (
    <PreferencesProvider>
      <WebStateProvider>
        <NavigationProvider>
          <Router />
        </NavigationProvider>
      </WebStateProvider>
    </PreferencesProvider>
  );
}
