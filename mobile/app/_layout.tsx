import { Stack } from 'expo-router';
import { AuthProvider } from '../src/modules/auth/AuthProvider';
import { ContactsProvider } from '../src/modules/contacts/ContactsProvider';
export default function Layout(){return <AuthProvider><ContactsProvider><Stack screenOptions={{headerShown:false}}/></ContactsProvider></AuthProvider>}
