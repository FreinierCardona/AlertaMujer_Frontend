import { router } from "expo-router";
import { useState } from "react";
import {
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
} from "react-native";
export default function Register() {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const valid = firstName && lastName && email.includes("@") && phone;
  return (
    <SafeAreaView style={s.page}>
      <Text style={s.title}>Crear cuenta</Text>
      <Text style={s.info}>
        Registro sin documento de identidad. La verificación se completará antes
        del acceso.
      </Text>
      {[
        ["Nombres", firstName, setFirstName],
        ["Apellidos", lastName, setLastName],
        ["Correo", email, setEmail],
        ["Teléfono", phone, setPhone],
      ].map(([label, value, change]) => (
        <TextInput
          key={String(label)}
          style={s.input}
          placeholder={String(label)}
          value={String(value)}
          onChangeText={change as (v: string) => void}
          autoCapitalize="none"
        />
      ))}
      <Pressable
        style={[s.button, !valid && s.disabled]}
        disabled={!valid}
        onPress={() => router.push("/auth/register-step2")}
      >
        <Text style={s.buttonText}>Continuar</Text>
      </Pressable>
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
});
