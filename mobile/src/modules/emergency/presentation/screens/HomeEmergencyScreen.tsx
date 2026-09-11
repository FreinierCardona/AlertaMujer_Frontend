import React, { useRef } from 'react';
import {
  Alert,
  Animated,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { prepareEmergencyAlert } from '@modules/emergency/application/use-cases/prepare-emergency-alert.usecase';
import Colors from '@shared/theme/Colors';
import Spacing from '@shared/theme/Spacing';
import Typography from '@shared/theme/Typography';

export default function HomeScreen() {
  // Valor animado usado para dar respuesta visual al presionar SOS.
  const sosScale = useRef(new Animated.Value(1)).current;

  function handleSosPress() {
    // Animacion corta para que el boton se sienta presionado.
    Animated.sequence([
      Animated.timing(sosScale, { toValue: 0.92, duration: 100, useNativeDriver: true }),
      Animated.timing(sosScale, { toValue: 1, duration: 200, useNativeDriver: true }),
    ]).start();

    const emergencyAlert = prepareEmergencyAlert();

    Alert.alert(
      emergencyAlert.title,
      emergencyAlert.message,
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Enviar alerta', onPress: () => console.log('SOS enviado') },
      ]
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* Encabezado con saludo y boton de menu visual. */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Hola, Usuaria</Text>
            <Text style={styles.status}>Estas protegida</Text>
          </View>
          <TouchableOpacity>
            <Ionicons name="menu" size={28} color={Colors.textDark} />
          </TouchableOpacity>
        </View>

        {/* Tarjetas superiores con informacion rapida. */}
        <View style={styles.cardsRow}>
          <View style={styles.card}>
            <Ionicons name="people-outline" size={28} color={Colors.iconPurple} />
            <Text style={styles.cardNumber}>0</Text>
            <Text style={styles.cardLabel}>Contactos</Text>
          </View>

          <View style={styles.card}>
            <Ionicons name="location" size={28} color={Colors.iconGreen} />
            <Text style={[styles.cardNumber, { color: Colors.iconGreen }]}>GPS Activo</Text>
            <Text style={styles.cardLabel}>Ubicacion ON</Text>
          </View>
        </View>

        {/* Texto que explica la accion principal de la pantalla. */}
        <View style={styles.sosInstructions}>
          <Text style={styles.sosInstructionTitle}>Manten presionado para activar</Text>
          <Text style={styles.sosInstructionSub}>Boton de Emergencia SOS</Text>
        </View>

        {/* Boton principal de alerta. */}
        <View style={styles.sosContainer}>
          <Animated.View style={{ transform: [{ scale: sosScale }] }}>
            <TouchableOpacity
              style={styles.sosButton}
              onPress={handleSosPress}
              onLongPress={handleSosPress}
              activeOpacity={0.85}
            >
              <Ionicons name="shield-outline" size={82} color={Colors.white} />
              <Text style={styles.sosText}>SOS</Text>
            </TouchableOpacity>
          </Animated.View>
        </View>

        <Text style={styles.sosDescription}>
          Al presionar el boton, se enviara tu ubicacion y alerta a todos tus contactos de confianza
        </Text>

      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: Colors.background },
  container: { flex: 1, paddingHorizontal: Spacing.lg, paddingTop: Spacing.md },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: Spacing.lg },
  greeting: { fontSize: Typography.xl, fontWeight: Typography.bold, color: Colors.primary },
  status: { fontSize: Typography.sm, color: Colors.textMedium, marginTop: 2 },
  cardsRow: { flexDirection: 'row', gap: Spacing.md, marginBottom: Spacing.xl },
  card: { flex: 1, backgroundColor: Colors.white, borderRadius: Spacing.radiusLg, padding: Spacing.md, alignItems: 'center', gap: 4, shadowColor: '#C0A0C0', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.12, shadowRadius: 6, elevation: 3 },
  cardNumber: { fontSize: Typography.lg, fontWeight: Typography.bold, color: Colors.textDark },
  cardLabel: { fontSize: Typography.xs, color: Colors.textMedium },
  sosInstructions: { alignItems: 'center', marginBottom: Spacing.lg },
  sosInstructionTitle: { fontSize: Typography.base, color: Colors.textDark, fontWeight: Typography.medium },
  sosInstructionSub: { fontSize: Typography.sm, color: Colors.primary, fontWeight: Typography.semiBold, marginTop: 2 },
  sosContainer: { alignItems: 'center', justifyContent: 'center', marginBottom: Spacing.md },
  sosButton: { width: 212, height: 212, borderRadius: 106, backgroundColor: Colors.sosRed, justifyContent: 'center', alignItems: 'center', shadowColor: Colors.sosRed, shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.38, shadowRadius: 18, elevation: 10, gap: Spacing.sm },
  sosText: { color: Colors.white, fontSize: Typography.xxxl, fontWeight: Typography.bold, letterSpacing: 2 },
  sosDescription: { fontSize: Typography.sm, color: Colors.textMedium, textAlign: 'center', lineHeight: 20, paddingHorizontal: Spacing.md, marginTop: 'auto', marginBottom: Spacing.xl },
});
