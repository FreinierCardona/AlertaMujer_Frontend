import { router } from "expo-router";
import { useState } from "react";
import {
  Pressable,
  SafeAreaView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
} from "react-native";
export default function RegisterStep2() {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [accepted, setAccepted] = useState(false);
  const valid = password.length >= 8 && password === confirm && accepted;
  return (
    <SafeAreaView style={s.page}>
      <Text style={s.title}>Protege tu cuenta</Text>
      <TextInput
        style={s.input}
        placeholder="Contraseña (mínimo 8 caracteres)"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />
      <TextInput
        style={s.input}
        placeholder="Confirmar contraseña"
        secureTextEntry
        value={confirm}
        onChangeText={setConfirm}
      />
      <Text>Acepto el tratamiento informado de datos</Text>
      <Switch value={accepted} onValueChange={setAccepted} />
      <Pressable
        style={[s.button, !valid && s.disabled]}
        disabled={!valid}
        onPress={() => router.push("/auth/verify-code")}
      >
        <Text style={s.buttonText}>Verificar correo</Text>
      </Pressable>
    </SafeAreaView>
  );
}
const s = StyleSheet.create({
  page: { flex: 1, padding: 24, gap: 14, backgroundColor: "#fff1f2" },
  title: { fontSize: 30, fontWeight: "800", color: "#881337" },
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
