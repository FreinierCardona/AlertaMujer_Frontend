import { Redirect } from 'expo-router';
import Routes from '@shell/navigation/routes';

export default function Index() {
  return <Redirect href={Routes.login} />;
}
