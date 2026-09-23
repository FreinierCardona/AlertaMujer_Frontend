// Solicita el correo para iniciar el flujo local de recuperación de contraseña.
import { Link, router } from "expo-router";
import { useState } from "react";
import {
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
} from "react-native";

export default function Forgot() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");
  const submit = () => {
    if (!email.includes("@")) {
      setError("Ingresa un correo válido.");
      return;
    }
    setError("");
    setSubmitted(true);
  };
  return (
    <SafeAreaView style={s.page}>
      <Text style={s.title}>Recuperar contraseña</Text>
      <Text style={s.info}>
        Por seguridad, la respuesta no confirma si el correo está registrado.
      </Text>
      {submitted ? (
        <>
          <Text>
            Si existe una cuenta para este correo, se enviará un código de seis
            dígitos con vigencia de una hora.
          </Text>
          <Pressable
            style={s.button}
            onPress={() => router.push("/auth/reset-password")}
          >
            <Text style={s.buttonText}>Ingresar código</Text>
          </Pressable>
        </>
      ) : (
        <>
          <TextInput
            style={s.input}
            placeholder="Correo"
            autoCapitalize="none"
            keyboardType="email-address"
            value={email}
            onChangeText={setEmail}
          />
          {error ? <Text style={s.error}>{error}</Text> : null}
          <Pressable
            style={[s.button, !email && s.disabled]}
            disabled={!email}
            onPress={submit}
          >
            <Text style={s.buttonText}>Solicitar código</Text>
          </Pressable>
        </>
      )}
      <Link href="/auth/login">Volver al inicio de sesión</Link>
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
