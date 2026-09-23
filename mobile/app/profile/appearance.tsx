// Permite elegir y guardar el modo visual de la aplicación móvil.
import { router } from "expo-router";
import { Pressable, SafeAreaView, StyleSheet, Text } from "react-native";
import {
  usePreferences,
  type Theme,
} from "../../src/modules/profile/PreferencesProvider";
export default function Appearance() {
  const { theme, setTheme } = usePreferences();
  const choices: [Theme, string][] = [
    ["light", "Tema claro"],
    ["dark", "Tema oscuro"],
  ];
  return (
    <SafeAreaView style={[s.page, theme === "dark" && s.dark]}>
      <Text style={[s.title, theme === "dark" && s.lightText]}>Apariencia</Text>
      {choices.map(([value, label]) => (
        <Pressable
          key={value}
          accessibilityRole="radio"
          accessibilityState={{ checked: theme === value }}
          style={[s.option, theme === "dark" && s.darkCard]}
          onPress={() => setTheme(value)}
        >
          <Text style={[s.text, theme === "dark" && s.lightText]}>{label}</Text>
          <Text style={theme === "dark" && s.lightText}>
            {theme === value ? "●" : "○"}
          </Text>
        </Pressable>
      ))}
      <Pressable onPress={() => router.back()}>
        <Text style={s.back}>‹ Volver</Text>
      </Pressable>
    </SafeAreaView>
  );
}
const s = StyleSheet.create({
  page: { flex: 1, padding: 24, gap: 14, backgroundColor: "#fff1f2" },
  dark: { backgroundColor: "#0f172a" },
  title: { fontSize: 28, fontWeight: "800", color: "#881337" },
  option: {
    padding: 16,
    borderRadius: 10,
    backgroundColor: "#fff",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  darkCard: { backgroundColor: "#1e293b" },
  text: { fontWeight: "700", color: "#334155" },
  lightText: { color: "#f8fafc" },
  back: { color: "#fb7185", fontWeight: "700" },
});
