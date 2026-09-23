import { router } from "expo-router";
import {
  Alert,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useContacts } from "../../src/modules/contacts/ContactsProvider";

export default function ContactsScreen() {
  const { contacts, ready, removeContact } = useContacts();
  const confirmRemoval = (id: string, name: string) =>
    Alert.alert(
      "Eliminar contacto",
      `¿Deseas eliminar a ${name}? Esta acción no modifica el historial de alertas.`,
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Eliminar",
          style: "destructive",
          onPress: () => removeContact(id),
        },
      ],
    );
  return (
    <SafeAreaView style={s.page}>
      <ScrollView contentContainerStyle={s.content}>
        <Pressable accessibilityRole="button" onPress={() => router.back()}>
          <Text style={s.back}>‹ Volver</Text>
        </Pressable>
        <Text style={s.title}>Contactos de emergencia</Text>
        <Text style={s.copy}>
          Agrega personas del directorio local del prototipo. El SOS requerirá
          al menos un contacto registrado.
        </Text>
        {!ready ? (
          <Text style={s.copy}>Cargando contactos…</Text>
        ) : contacts.length === 0 ? (
          <View style={s.empty}>
            <Text style={s.emptyTitle}>Aún no tienes contactos</Text>
            <Text style={s.copy}>
              Registra un contacto para preparar el envío de una alerta SOS.
            </Text>
          </View>
        ) : (
          contacts.map((contact) => (
            <View key={contact.id} style={s.card}>
              <View style={s.body}>
                <Text style={s.name}>{contact.name}</Text>
                <Text style={s.detail}>
                  ••• {contact.phone.slice(-4)} · {contact.relationship}
                </Text>
              </View>
              <Pressable
                accessibilityLabel={`Editar a ${contact.name}`}
                onPress={() =>
                  router.push({
                    pathname: "/contacts/form",
                    params: { id: contact.id },
                  })
                }
              >
                <Text style={s.edit}>Editar</Text>
              </Pressable>
              <Pressable
                accessibilityLabel={`Eliminar a ${contact.name}`}
                onPress={() => confirmRemoval(contact.id, contact.name)}
              >
                <Text style={s.delete}>Eliminar</Text>
              </Pressable>
            </View>
          ))
        )}
        <Pressable
          style={s.button}
          accessibilityRole="button"
          onPress={() => router.push("/contacts/form")}
        >
          <Text style={s.buttonText}>Agregar contacto</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}
const s = StyleSheet.create({
  page: { flex: 1, backgroundColor: "#fff1f2" },
  content: { padding: 24, gap: 16 },
  back: { color: "#9f1239", fontWeight: "700", fontSize: 16 },
  title: { color: "#881337", fontSize: 28, fontWeight: "800" },
  copy: { color: "#475569", fontSize: 15, lineHeight: 21 },
  empty: { padding: 18, borderRadius: 12, backgroundColor: "#fff", gap: 8 },
  emptyTitle: { color: "#881337", fontSize: 18, fontWeight: "800" },
  card: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 16,
    borderRadius: 12,
    backgroundColor: "#fff",
  },
  body: { flex: 1 },
  name: { color: "#1e293b", fontSize: 16, fontWeight: "800" },
  detail: { color: "#64748b", marginTop: 4 },
  edit: { color: "#9f1239", fontWeight: "700" },
  delete: { color: "#be123c", fontWeight: "700" },
  button: {
    marginTop: 4,
    padding: 15,
    borderRadius: 10,
    backgroundColor: "#be123c",
  },
  buttonText: { color: "#fff", textAlign: "center", fontWeight: "800" },
});
