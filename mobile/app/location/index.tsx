// Gestiona permisos y muestra la última coordenada GPS disponible en el dispositivo.
import { useState } from "react";
import { Pressable, SafeAreaView, StyleSheet, Text } from "react-native";
import { router } from "expo-router";
import {
  requestAndReadLocation,
  type LocationResult,
} from "../../src/modules/location/locationService";
export default function LocationScreen() {
  const [point, setPoint] = useState<LocationResult>();
  const [message, setMessage] = useState(
    "Solicita el permiso cuando estés lista.",
  );
  const [loading, setLoading] = useState(false);
  const read = async () => {
    setLoading(true);
    const next = await requestAndReadLocation();
    setLoading(false);
    if (next.error) {
      setMessage(next.error);
      return;
    }
    setPoint(next.result);
    setMessage("Coordenadas obtenidas. Aún no se envía ninguna alerta.");
  };
  return (
    <SafeAreaView style={s.page}>
      <Text style={s.title}>Ubicación para SOS</Text>
      <Text style={s.copy}>
        La ubicación solo se consulta en este momento; no se guarda como un
        permiso permanente.
      </Text>
      <Pressable
        style={[s.button, loading && s.disabled]}
        disabled={loading}
        onPress={read}
      >
        <Text style={s.buttonText}>
          {loading ? "Obteniendo ubicación…" : "Permitir y obtener GPS"}
        </Text>
      </Pressable>
      <Text style={s.message}>{message}</Text>
      {point ? (
        <Text style={s.coords}>
          Latitud: {point.latitude.toFixed(6)}
          {`\n`}Longitud: {point.longitude.toFixed(6)}
        </Text>
      ) : null}
      <Pressable onPress={() => router.back()}>
        <Text style={s.back}>‹ Volver</Text>
      </Pressable>
    </SafeAreaView>
  );
}
const s = StyleSheet.create({
  page: { flex: 1, padding: 24, gap: 16, backgroundColor: "#fff1f2" },
  title: { fontSize: 28, fontWeight: "800", color: "#881337" },
  copy: { color: "#475569", lineHeight: 21 },
  button: { padding: 15, borderRadius: 10, backgroundColor: "#be123c" },
  disabled: { opacity: 0.5 },
  buttonText: { color: "#fff", fontWeight: "800", textAlign: "center" },
  message: { color: "#9f1239", fontWeight: "700" },
  coords: {
    padding: 16,
    backgroundColor: "#fff",
    borderRadius: 10,
    color: "#334155",
  },
  back: { color: "#9f1239", fontWeight: "700" },
});
