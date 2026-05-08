import { Redirect } from 'expo-router';
import Routes from '../constants/Routes';

export default function Index() {
  // Al abrir la app, Expo Router envia a la pantalla de login.
  return <Redirect href={Routes.login} />;
}
