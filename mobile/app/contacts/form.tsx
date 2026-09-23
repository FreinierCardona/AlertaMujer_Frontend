// Crea o actualiza un contacto de emergencia con las validaciones del formulario.
import { useLocalSearchParams, router } from "expo-router";
import {
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useMemo, useState } from "react";
import {
  localDirectory,
  useContacts,
} from "../../src/modules/contacts/ContactsProvider";

export default function ContactFormScreen() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const { contacts, addContact, updateContact } = useContacts();
  const existing = useMemo(
    () => contacts.find((contact) => contact.id === id),
    [contacts, id],
  );
  const [relationship, setRelationship] = useState(
    existing?.relationship ?? "",
  );
  const [notice, setNotice] = useState("");
  const valid = relationship.trim().length >= 2;
  const saveEdit = () => {
    if (!valid || !existing) return;
    updateContact(existing.id, relationship.trim());
    router.back();
  };
  const selectPerson = (person: (typeof localDirectory)[number]) => {
    if (!valid) {
      setNotice("Indica una relación de al menos 2 caracteres.");
      return;
    }
    const result = addContact(person, relationship.trim());
    setNotice(
      result === "saved"
        ? `${person.name} fue agregado.`
        : `${person.name} ya está registrado.`,
    );
  };
  return (
    <SafeAreaView style={s.page}>
      <ScrollView contentContainerStyle={s.content}>
        <Pressable accessibilityRole="button" onPress={() => router.back()}>
          <Text style={s.back}>‹ Volver</Text>
        </Pressable>
        <Text style={s.title}>
          {existing ? "Editar relación" : "Agregar contacto"}
        </Text>
        <Text style={s.copy}>
          {existing
            ? existing.name
            : "Selecciona una persona registrada en el directorio local del prototipo."}
        </Text>
        <Text style={s.label}>Relación</Text>
        <TextInput
          value={relationship}
          onChangeText={setRelationship}
          placeholder="Ej. Hermana"
          style={s.input}
          autoCapitalize="words"
        />
        {notice ? <Text style={s.notice}>{notice}</Text> : null}
        {existing ? (
          <Pressable
            style={[s.button, !valid && s.disabled]}
            disabled={!valid}
            onPress={saveEdit}
          >
            <Text style={s.buttonText}>Guardar cambios</Text>
          </Pressable>
        ) : (
          <View style={s.list}>
            {localDirectory.map((person) => (
              <View key={person.id} style={s.card}>
                <View style={s.body}>
                  <Text style={s.name}>{person.name}</Text>
                  <Text style={s.copy}>
                    ••• {person.phone.slice(-4)} · Registrada en el prototipo
                  </Text>
                </View>
                <Pressable
                  accessibilityLabel={`Agregar a ${person.name}`}
                  onPress={() => selectPerson(person)}
                >
                  <Text style={s.add}>Agregar</Text>
                </Pressable>
              </View>
            ))}
          </View>
        )}
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
  label: { color: "#334155", fontWeight: "800" },
  input: {
    backgroundColor: "#fff",
    borderColor: "#cbd5e1",
    borderWidth: 1,
    padding: 14,
    borderRadius: 10,
    color: "#0f172a",
  },
  list: { gap: 10 },
  card: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 16,
    borderRadius: 12,
    backgroundColor: "#fff",
  },
  body: { flex: 1 },
  name: { color: "#1e293b", fontWeight: "800", fontSize: 16 },
  add: { color: "#9f1239", fontWeight: "800" },
  notice: { color: "#9f1239", fontWeight: "700" },
  button: { padding: 15, borderRadius: 10, backgroundColor: "#be123c" },
  disabled: { opacity: 0.45 },
  buttonText: { color: "#fff", textAlign: "center", fontWeight: "800" },
});
