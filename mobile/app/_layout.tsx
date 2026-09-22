import { Stack } from 'expo-router';
import { AuthProvider } from '../src/modules/auth/AuthProvider';
export default function Layout(){return <AuthProvider><Stack screenOptions={{headerShown:false}}/></AuthProvider>}
