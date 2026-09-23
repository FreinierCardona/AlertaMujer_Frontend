import { router } from "expo-router";
import { useState } from "react";
import {
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
} from "react-native";
export default function Verify() {
  const [code, setCode] = useState("");
  return (
    <SafeAreaView style={s.page}>
      <Text style={s.title}>Verifica tu correo</Text>
      <Text>
        Ingresa el código de seis dígitos. Su envío y vigencia se confirman
        mediante backend al integrar RF1.
      </Text>
      <TextInput
        style={s.input}
        keyboardType="number-pad"
        maxLength={6}
        value={code}
        onChangeText={setCode}
        placeholder="Código"
      />
      <Pressable
        style={[s.button, code.length !== 6 && s.disabled]}
        disabled={code.length !== 6}
        onPress={() => router.replace("/auth/login")}
      >
        <Text style={s.buttonText}>Verificar</Text>
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
