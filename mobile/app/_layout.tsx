import { Stack } from 'expo-router';
import { AuthProvider } from '../src/modules/auth/AuthProvider';
import { ContactsProvider } from '../src/modules/contacts/ContactsProvider';
import { ProfileProvider } from '../src/modules/profile/ProfileProvider';
import { PreferencesProvider } from '../src/modules/profile/PreferencesProvider';
export default function Layout(){return <AuthProvider><ContactsProvider><ProfileProvider><PreferencesProvider><Stack screenOptions={{headerShown:false}}/></PreferencesProvider></ProfileProvider></ContactsProvider></AuthProvider>}
