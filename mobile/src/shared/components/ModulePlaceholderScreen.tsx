import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Colors from '@shared/theme/Colors';
import Spacing from '@shared/theme/Spacing';
import Typography from '@shared/theme/Typography';

interface ModulePlaceholderScreenProps {
  title: string;
  status?: string;
}

export default function ModulePlaceholderScreen({
  title,
  status = 'Pendiente de diseno e integracion.',
}: ModulePlaceholderScreenProps) {
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.status}>{status}</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: Colors.background },
  container: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: Spacing.lg,
  },
  title: {
    color: Colors.primary,
    fontSize: Typography.xl,
    fontWeight: Typography.bold,
    textAlign: 'center',
  },
  status: {
    color: Colors.textMedium,
    fontSize: Typography.base,
    lineHeight: 22,
    marginTop: Spacing.sm,
    textAlign: 'center',
  },
});
