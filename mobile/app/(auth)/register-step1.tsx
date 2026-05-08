import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import Colors from '../../constants/Colors';
import Typography from '../../constants/Typography';
import Spacing from '../../constants/Spacing';
import Routes from '../../constants/Routes';
import AppButton from '../../components/AppButton';
import AppBackButton from '../../components/AppBackButton';
import AppInput from '../../components/AppInput';
import type { FieldErrors } from '../../utils/validations';
import {
  formatBirthDateInput,
  formatPhoneInput,
  hasValidationErrors,
  validateBirthDate,
  validatePersonName,
  validatePhone,
} from '../../utils/validations';

type RegisterStep1Field = 'nombre' | 'apellido' | 'fechaNacimiento' | 'telefono';

export default function RegisterStep1Screen() {
  const router = useRouter();

  // Estados principales del primer paso de registro.
  const [nombre, setNombre] = useState('');
  const [apellido, setApellido] = useState('');
  const [fechaNacimiento, setFechaNacimiento] = useState('');
  const [telefono, setTelefono] = useState('');

  // Errores por campo para mostrar mensajes y remarcar inputs.
  const [errors, setErrors] = useState<FieldErrors<RegisterStep1Field>>({});

  function handleBack() {
    // Regresa a la pantalla anterior; si no existe historial, vuelve al login.
    if (router.canGoBack()) {
      router.back();
      return;
    }

    router.replace(Routes.login);
  }

  function updateField(field: RegisterStep1Field, value: string) {
    // La fecha y el telefono se formatean mientras se escriben para evitar caracteres invalidos.
    const formattedValue =
      field === 'fechaNacimiento'
        ? formatBirthDateInput(value)
        : field === 'telefono'
          ? formatPhoneInput(value)
          : value;

    if (field === 'nombre') setNombre(formattedValue);
    if (field === 'apellido') setApellido(formattedValue);
    if (field === 'fechaNacimiento') setFechaNacimiento(formattedValue);
    if (field === 'telefono') setTelefono(formattedValue);

    // Revalida en vivo solo cuando el error ya esta visible.
    if (errors[field]) {
      const validationMap = {
        nombre: validatePersonName(formattedValue, 'nombre'),
        apellido: validatePersonName(formattedValue, 'apellido'),
        fechaNacimiento: validateBirthDate(formattedValue),
        telefono: validatePhone(formattedValue),
      };

      setErrors((currentErrors) => ({
        ...currentErrors,
        [field]: validationMap[field],
      }));
    }
  }

  function handleNext() {
    // Valida datos personales antes de avanzar al paso de cuenta.
    const validationErrors: FieldErrors<RegisterStep1Field> = {
      nombre: validatePersonName(nombre, 'nombre'),
      apellido: validatePersonName(apellido, 'apellido'),
      fechaNacimiento: validateBirthDate(fechaNacimiento),
      telefono: validatePhone(telefono),
    };

    if (hasValidationErrors(validationErrors)) {
      setErrors(validationErrors);
      return;
    }

    router.push(Routes.registerStep2);
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.flex}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <AppBackButton onPress={handleBack} style={styles.backButton} />

          <View style={styles.titleContainer}>
            <Text style={styles.title}>Crear Cuenta</Text>
            <Text style={styles.subtitle}>Completa tus datos</Text>
          </View>

          <View style={styles.form}>
            <AppInput
              label="Nombre"
              placeholder="María"
              value={nombre}
              onChangeText={(value) => updateField('nombre', value)}
              error={errors.nombre}
              autoCapitalize="words"
            />
            <AppInput
              label="Apellido"
              placeholder="García"
              value={apellido}
              onChangeText={(value) => updateField('apellido', value)}
              error={errors.apellido}
              autoCapitalize="words"
            />
            <AppInput
              label="Fecha de nacimiento"
              placeholder="dd/mm/aaaa"
              value={fechaNacimiento}
              onChangeText={(value) => updateField('fechaNacimiento', value)}
              error={errors.fechaNacimiento}
              icon="calendar-outline"
              keyboardType="numeric"
              maxLength={10}
            />
            <AppInput
              label="Número de teléfono"
              placeholder="3124567890"
              value={telefono}
              onChangeText={(value) => updateField('telefono', value)}
              error={errors.telefono}
              icon="call-outline"
              keyboardType="phone-pad"
              maxLength={10}
            />
          </View>

          <AppButton
            title="Siguiente"
            onPress={handleNext}
            style={styles.nextButton}
          />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: Colors.background },
  flex: { flex: 1 },
  scrollContent: { flexGrow: 1, paddingHorizontal: Spacing.lg, paddingBottom: Spacing.xl },
  backButton: { marginTop: Spacing.sm, marginBottom: Spacing.sm },
  titleContainer: { alignItems: 'center', marginBottom: Spacing.xl },
  title: { fontSize: Typography.xl, fontWeight: Typography.bold, color: Colors.primary },
  subtitle: { fontSize: Typography.base, color: Colors.textMedium, marginTop: 4 },
  form: { gap: 4 },
  nextButton: { marginTop: Spacing.lg },
});
