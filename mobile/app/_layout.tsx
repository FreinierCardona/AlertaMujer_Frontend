import { Stack } from 'expo-router';
import { AuthProvider } from '../src/modules/auth/AuthProvider';
import { ContactsProvider } from '../src/modules/contacts/ContactsProvider';
import { ProfileProvider } from '../src/modules/profile/ProfileProvider';
import { PreferencesProvider } from '../src/modules/profile/PreferencesProvider';
import { AlertProvider } from '../src/modules/alert/AlertProvider';
export default function Layout(){return <AuthProvider><ContactsProvider><ProfileProvider><PreferencesProvider><AlertProvider><Stack screenOptions={{headerShown:false}}/></AlertProvider></PreferencesProvider></ProfileProvider></ContactsProvider></AuthProvider>}
