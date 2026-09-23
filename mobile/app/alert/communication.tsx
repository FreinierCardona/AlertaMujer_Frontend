import { useState } from "react";
import {
  Linking,
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
} from "react-native";
import { router } from "expo-router";
export default function Communication() {
  const [messages, setMessages] = useState<string[]>([]);
  const [value, setValue] = useState("");
  const send = () => {
    if (value.trim()) {
      setMessages((x) => [...x, value.trim()]);
      setValue("");
    }
  };
  return (
    <SafeAreaView style={s.page}>
      <Text style={s.title}>Comunicación de emergencia</Text>
      <Pressable style={s.call} onPress={() => Linking.openURL("tel:123")}>
        <Text style={s.callText}>Llamar a autoridades</Text>
      </Pressable>
      <Text style={s.note}>
        La llamada abre el marcador del dispositivo; no se inicia
        silenciosamente.
      </Text>
      <Text style={s.subtitle}>Chat de la alerta</Text>
      {messages.map((m, i) => (
        <Text key={`${m}-${i}`} style={s.message}>
          {m}
        </Text>
      ))}
      <TextInput
        style={s.input}
        value={value}
        onChangeText={setValue}
        placeholder="Escribe una actualización"
      />
      <Pressable style={s.button} onPress={send}>
        <Text style={s.buttonText}>Enviar mensaje</Text>
      </Pressable>
      <Pressable onPress={() => router.back()}>
        <Text style={s.back}>‹ Volver</Text>
      </Pressable>
    </SafeAreaView>
  );
}
const s = StyleSheet.create({
  page: { flex: 1, padding: 24, gap: 12, backgroundColor: "#fff1f2" },
  title: { fontSize: 28, fontWeight: "800", color: "#881337" },
  subtitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#334155",
    marginTop: 10,
  },
  call: { padding: 16, borderRadius: 10, backgroundColor: "#881337" },
  callText: { color: "#fff", fontWeight: "800", textAlign: "center" },
  note: { color: "#64748b", fontSize: 13 },
  input: {
    padding: 12,
    borderRadius: 9,
    borderWidth: 1,
    borderColor: "#cbd5e1",
    backgroundColor: "#fff",
  },
  button: { padding: 13, borderRadius: 10, backgroundColor: "#be123c" },
  buttonText: { color: "#fff", textAlign: "center", fontWeight: "800" },
  message: {
    padding: 10,
    borderRadius: 8,
    backgroundColor: "#fff",
    color: "#334155",
  },
  back: { color: "#9f1239", fontWeight: "700" },
});
