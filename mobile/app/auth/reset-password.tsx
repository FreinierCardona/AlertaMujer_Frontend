// Establece una nueva contraseña después de validar el código de recuperación.
import { router } from "expo-router";
import { useState } from "react";
import {
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
} from "react-native";

export default function ResetPassword() {
  const [code, setCode] = useState("");
  const [password, setPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [error, setError] = useState("");
  const submit = () => {
    if (!/^\d{6}$/.test(code)) {
      setError("Ingresa un código de seis dígitos.");
      return;
    }
    if (password.length < 8) {
      setError("La contraseña debe tener al menos ocho caracteres.");
      return;
    }
    if (password !== confirmation) {
      setError("Las contraseñas no coinciden.");
      return;
    }
    router.replace("/auth/login");
  };
  const valid =
    code.length === 6 && password.length >= 8 && confirmation.length >= 8;
  return (
    <SafeAreaView style={s.page}>
      <Text style={s.title}>Nueva contraseña</Text>
      <Text>
        El código y su vigencia se validarán con el servicio de autenticación al
        integrar backend.
      </Text>
      <TextInput
        style={s.input}
        placeholder="Código de seis dígitos"
        keyboardType="number-pad"
        maxLength={6}
        value={code}
        onChangeText={setCode}
      />
      <TextInput
        style={s.input}
        placeholder="Nueva contraseña"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />
      <TextInput
        style={s.input}
        placeholder="Confirmar contraseña"
        secureTextEntry
        value={confirmation}
        onChangeText={setConfirmation}
      />
      {error ? <Text style={s.error}>{error}</Text> : null}
      <Pressable
        style={[s.button, !valid && s.disabled]}
        disabled={!valid}
        onPress={submit}
      >
        <Text style={s.buttonText}>Guardar contraseña</Text>
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
  error: { color: "#b91c1c" },
});
