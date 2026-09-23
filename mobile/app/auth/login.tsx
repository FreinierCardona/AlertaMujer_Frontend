import { Link, router } from "expo-router";
import { useState } from "react";
import {
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
} from "react-native";
import { useAuth } from "../../src/modules/auth/AuthProvider";
export default function Login() {
  const { signIn } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const submit = async () => {
    const result = await signIn(email, password);
    if (result) setError(result);
    else router.replace("/home");
  };
  return (
    <SafeAreaView style={s.page}>
      <Text style={s.title}>Iniciar sesión</Text>
      <Text style={s.info}>
        El acceso se valida localmente en este prototipo; la integración con
        servidor permanece pendiente.
      </Text>
      <TextInput
        style={s.input}
        placeholder="Correo"
        autoCapitalize="none"
        keyboardType="email-address"
        value={email}
        onChangeText={setEmail}
      />
      <TextInput
        style={s.input}
        placeholder="Contraseña"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />
      {error ? <Text style={s.error}>{error}</Text> : null}
      <Pressable
        style={[s.button, (!email || !password) && s.disabled]}
        disabled={!email || !password}
        onPress={submit}
      >
        <Text style={s.buttonText}>Ingresar</Text>
      </Pressable>
      <Link href="/auth/register">Crear cuenta</Link>
      <Link href="/auth/forgot-password">Olvidé mi contraseña</Link>
    </SafeAreaView>
  );
}
const s = StyleSheet.create({
  page: { flex: 1, padding: 24, gap: 14, backgroundColor: "#fff1f2" },
  title: { fontSize: 30, fontWeight: "800", color: "#881337" },
  info: { backgroundColor: "#ffe4e6", padding: 12, borderRadius: 10 },
  input: {
    padding: 13,
    borderWidth: 1,
    borderRadius: 10,
    borderColor: "#94a3b8",
    backgroundColor: "#fff",
  },
  button: { padding: 14, borderRadius: 10, backgroundColor: "#be123c" },
  disabled: { opacity: 0.5 },
  buttonText: { color: "#fff", fontWeight: "800", textAlign: "center" },
  error: { color: "#b91c1c" },
});
