// Edita los datos visibles del perfil y persiste los cambios en el estado local.
import { router } from "expo-router";
import { useState } from "react";
import {
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
} from "react-native";
import { useProfile } from "../../src/modules/profile/ProfileProvider";
export default function EditProfile() {
  const { profile, save } = useProfile();
  const [name, setName] = useState(profile.name);
  const [lastName, setLastName] = useState(profile.lastName);
  const [email, setEmail] = useState(profile.email);
  const [phone, setPhone] = useState(profile.phone);
  const [error, setError] = useState("");
  const submit = () => {
    if (
      name.trim().length < 2 ||
      !email.includes("@") ||
      phone.replace(/\D/g, "").length < 7
    ) {
      setError("Completa nombre, correo válido y teléfono.");
      return;
    }
    save({
      ...profile,
      name: name.trim(),
      lastName: lastName.trim(),
      email: email.trim(),
      phone: phone.trim(),
    });
    router.back();
  };
  return (
    <SafeAreaView style={s.page}>
      <Text style={s.title}>Editar perfil</Text>
      {[
        ["Nombre", name, setName],
        ["Apellido", lastName, setLastName],
        ["Correo", email, setEmail],
        ["Teléfono", phone, setPhone],
      ].map(([l, v, set]) => (
        <>
          <Text style={s.label}>{l as string}</Text>
          <TextInput
            style={s.input}
            value={v as string}
            onChangeText={set as (x: string) => void}
          />
        </>
      ))}
      {error ? <Text style={s.error}>{error}</Text> : null}
      <Pressable style={s.button} onPress={submit}>
        <Text style={s.buttonText}>Guardar</Text>
      </Pressable>
    </SafeAreaView>
  );
}
const s = StyleSheet.create({
  page: { flex: 1, padding: 24, gap: 9, backgroundColor: "#fff1f2" },
  title: { fontSize: 28, fontWeight: "800", color: "#881337" },
  label: { fontWeight: "700", color: "#334155" },
  input: {
    padding: 12,
    borderRadius: 9,
    borderWidth: 1,
    borderColor: "#cbd5e1",
    backgroundColor: "#fff",
  },
  button: {
    marginTop: 10,
    padding: 14,
    borderRadius: 10,
    backgroundColor: "#be123c",
  },
  buttonText: { color: "#fff", fontWeight: "800", textAlign: "center" },
  error: { color: "#be123c", fontWeight: "700" },
});
