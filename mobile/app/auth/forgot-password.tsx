import { Link } from 'expo-router'; import { SafeAreaView, Text } from 'react-native';
export default function Forgot(){return <SafeAreaView style={{padding:24,gap:16}}><Text style={{fontSize:28,fontWeight:'800'}}>Recuperar contraseña</Text><Text>Este flujo se implementa en HU-AM-002.</Text><Link href="/auth/login">Volver al inicio de sesión</Link></SafeAreaView>}
