import { Stack } from 'expo-router';
import { AuthProvider } from '../src/modules/auth/AuthProvider';
import { ContactsProvider } from '../src/modules/contacts/ContactsProvider';
import { ProfileProvider } from '../src/modules/profile/ProfileProvider';
import { PreferencesProvider } from '../src/modules/profile/PreferencesProvider';
import { AlertProvider } from '../src/modules/alert/AlertProvider';
import { HistoryProvider } from '../src/modules/history/HistoryProvider';
export default function Layout(){return <AuthProvider><ContactsProvider><ProfileProvider><PreferencesProvider><AlertProvider><HistoryProvider><Stack screenOptions={{headerShown:false}}/></HistoryProvider></AlertProvider></PreferencesProvider></ProfileProvider></ContactsProvider></AuthProvider>}
