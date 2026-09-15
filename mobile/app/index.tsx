// Decide la primera ruta solo después de recuperar sesión, idioma, tema y alerta local.
import { ActivityIndicator, Image, StyleSheet, Text, View } from "react-native";
import { Redirect } from "expo-router";
import Routes from "@shell/navigation/routes";
import useAppState from "@shell/providers/useAppState";
import { useAppTheme } from "@shared/theme";
import { useI18n } from "@shared/i18n";
export default function Index() {
  const { hydrated, sessionEmail, activeEmergency } = useAppState();
  const theme = useAppTheme();
  const i18n = useI18n();
  if (!hydrated || !theme.ready || !i18n.ready)
    return (
      <View
        style={[styles.container, { backgroundColor: theme.colors.background }]}
      >
        <Image
          accessibilityLabel={i18n.t("app.name")}
          source={require("../assets/images/splash-icon.png")}
          style={styles.logo}
        />
        <Text
          style={{
            color: theme.colors.primary,
            fontSize: 28,
            fontWeight: "700",
          }}
        >
          {i18n.t("app.name")}
        </Text>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  return (
    <Redirect
      href={
        activeEmergency
          ? Routes.activeEmergency
          : sessionEmail
            ? Routes.home
            : Routes.login
      }
    />
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 24,
  },
  logo: { width: 132, height: 132, borderRadius: 30 },
});
