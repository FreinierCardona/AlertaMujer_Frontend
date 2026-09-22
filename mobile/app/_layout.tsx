import { Stack } from 'expo-router';
import { AuthProvider } from '../src/modules/auth/AuthProvider';
import { ContactsProvider } from '../src/modules/contacts/ContactsProvider';
import { ProfileProvider } from '../src/modules/profile/ProfileProvider';
export default function Layout(){return <AuthProvider><ContactsProvider><ProfileProvider><Stack screenOptions={{headerShown:false}}/></ProfileProvider></ContactsProvider></AuthProvider>}
