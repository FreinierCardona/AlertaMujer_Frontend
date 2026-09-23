// Centraliza los accesos principales y protege la navegación ante una alerta activa.
import { router } from "expo-router";
import { useEffect } from "react";
import { Pressable, SafeAreaView, StyleSheet, Text } from "react-native";
import { useAuth } from "../src/modules/auth/AuthProvider";
import { useAlert } from "../src/modules/alert/AlertProvider";
export default function Home() {
  const { signOut } = useAuth();
  const { alert } = useAlert();
  useEffect(() => {
    if (alert.active) router.replace("/alert/active");
  }, [alert.active]);
  if (alert.active) return null;
  return (
    <SafeAreaView style={s.page}>
      <Text style={s.title}>AlertaMujer</Text>
      <Text style={s.copy}>Sesión iniciada correctamente.</Text>
      <Pressable style={s.contacts} onPress={() => router.push("/contacts")}>
        <Text style={s.contactsText}>Gestionar contactos de emergencia</Text>
      </Pressable>
      <Pressable style={s.contacts} onPress={() => router.push("/profile")}>
        <Text style={s.contactsText}>Mi perfil y mensaje de alerta</Text>
      </Pressable>
      <Pressable style={s.contacts} onPress={() => router.push("/location")}>
        <Text style={s.contactsText}>Preparar ubicación para SOS</Text>
      </Pressable>
      <Pressable style={s.button} onPress={() => router.push("/alert/sos")}>
        <Text style={s.buttonText}>SOS</Text>
      </Pressable>
      <Pressable
        style={s.button}
        onPress={async () => {
          await signOut();
          router.replace("/auth/login");
        }}
      >
        <Text style={s.buttonText}>Cerrar sesión</Text>
      </Pressable>
    </SafeAreaView>
  );
}
const s = StyleSheet.create({
  page: { flex: 1, padding: 24, gap: 16, backgroundColor: "#fff1f2" },
  title: { fontSize: 30, fontWeight: "800", color: "#881337" },
  copy: { fontSize: 16, color: "#334155" },
  contacts: {
    padding: 14,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#be123c",
  },
  contactsText: { color: "#9f1239", fontWeight: "700", textAlign: "center" },
  button: {
    marginTop: 12,
    padding: 14,
    borderRadius: 10,
    backgroundColor: "#be123c",
  },
  buttonText: { color: "#fff", fontWeight: "700", textAlign: "center" },
});
