// Consolida miniaturas y visor accesible con índice, navegación y salida clara.
import { useState } from 'react';
import { Image, Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { EvidenceItem } from '@shell/providers/AppStateProvider';
import { useAppTheme } from '@shared/theme';
import { useI18n } from '@shared/i18n';
import StatusBanner from '@shared/ui/StatusBanner';

export default function EvidenceGallery({ items }: { items: EvidenceItem[] }) {
  const [index, setIndex] = useState<number | null>(null);
  const { colors, spacing } = useAppTheme();
  const { t } = useI18n();
  if (items.length === 0) return <StatusBanner title={t('evidence.empty')} />;
  const selected = index === null ? null : items[index];
  return (
    <>
      <View style={styles.grid}>
        {items.map((item, itemIndex) => (
          <Pressable
            key={item.id}
            accessibilityRole="imagebutton"
            accessibilityLabel={`${t('evidence.open')} ${itemIndex + 1}`}
            onPress={() => setIndex(itemIndex)}
          >
            <Image
              source={{ uri: item.uri }}
              style={styles.thumbnail}
            />
          </Pressable>
        ))}
      </View>
      <Modal
        visible={selected !== null}
        animationType="fade"
        onRequestClose={() => setIndex(null)}
      >
        <View style={[styles.viewer, { backgroundColor: colors.textDark }]}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={t('common.close')}
            onPress={() => setIndex(null)}
            style={styles.close}
          >
            <Ionicons
              name="close"
              size={30}
              color={colors.textWhite}
            />
          </Pressable>
          {selected ? (
            <Image
              source={{ uri: selected.uri }}
              resizeMode="contain"
              style={styles.fullImage}
            />
          ) : null}
          <Text style={{ color: colors.textWhite, marginBottom: spacing.md }}>
            {index === null ? 0 : index + 1} / {items.length}
          </Text>
          <View style={styles.navigation}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={t('evidence.previous')}
              disabled={index === 0}
              onPress={() =>
                setIndex((current) =>
                  current === null ? null : Math.max(0, current - 1),
                )
              }
              style={{ opacity: index === 0 ? 0.35 : 1 }}
            >
              <Ionicons
                name="arrow-back-circle"
                size={46}
                color={colors.textWhite}
              />
            </Pressable>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={t('evidence.next')}
              disabled={index === items.length - 1}
              onPress={() =>
                setIndex((current) =>
                  current === null
                    ? null
                    : Math.min(items.length - 1, current + 1),
                )
              }
              style={{ opacity: index === items.length - 1 ? 0.35 : 1 }}
            >
              <Ionicons
                name="arrow-forward-circle"
                size={46}
                color={colors.textWhite}
              />
            </Pressable>
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  thumbnail: { width: 88, height: 88, borderRadius: 11 },
  viewer: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  close: { position: 'absolute', top: 48, right: 20, padding: 10, zIndex: 1 },
  fullImage: { width: '100%', height: '72%' },
  navigation: {
    width: '72%',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
});
