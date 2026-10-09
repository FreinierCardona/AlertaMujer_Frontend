import { useCallback, useEffect, useState } from 'react';
import { Image, Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ApiError, evidenceApi, evidenceDataUri } from '@core/api';
import type { EvidenceResponse } from '@core/api';
import { useAppTheme } from '@shared/theme';
import { useI18n } from '@shared/i18n';
import StatusBanner from '@shared/ui/StatusBanner';
import AppButton from '@shared/ui/AppButton';

/** Lists only metadata confirmed by the Backend and downloads protected bytes in memory. */
export default function EvidenceGallery({ emergencyId }: { emergencyId: string }) {
  const [index, setIndex] = useState<number | null>(null);
  const [items, setItems] = useState<EvidenceResponse[]>([]);
  const [uris, setUris] = useState<Record<string, string>>({});
  const [failed, setFailed] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { colors, spacing } = useAppTheme();
  const { t } = useI18n();

  const loadImage = useCallback(async (evidenceId: string) => {
    try {
      const uri = await evidenceDataUri(evidenceId);
      setUris((current) => ({ ...current, [evidenceId]: uri }));
      setFailed((current) => current.filter((id) => id !== evidenceId));
    } catch {
      setFailed((current) => current.includes(evidenceId) ? current : [...current, evidenceId]);
    }
  }, []);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    setUris({});
    setFailed([]);
    try {
      const response = await evidenceApi.list(emergencyId);
      setItems(response);
      void Promise.all(response.map((item) => loadImage(item.evidenceId)));
    } catch (cause) {
      setError(cause instanceof ApiError ? cause.message : t('common.error'));
    } finally {
      setLoading(false);
    }
  }, [emergencyId, loadImage, t]);

  useEffect(() => {
    const timer = setTimeout(() => void load(), 0);
    return () => clearTimeout(timer);
  }, [load]);

  if (loading) return <StatusBanner title={t('common.loading')} />;
  if (error) return <><StatusBanner tone="danger" title={t('common.error')} message={error} />
    <AppButton title={t('common.retry')} onPress={() => void load()} variant="outline" style={{ marginTop: spacing.sm }} />
  </>;
  if (items.length === 0) return <StatusBanner title={t('evidence.empty')} />;
  const selected = index === null ? null : items[index];

  return (
    <>
      <View style={styles.grid}>
        {items.map((item, itemIndex) => (
          <Pressable
            key={item.evidenceId}
            accessibilityRole="imagebutton"
            accessibilityLabel={`${t('evidence.open')} ${itemIndex + 1}`}
            onPress={() => {
              if (failed.includes(item.evidenceId)) void loadImage(item.evidenceId);
              else setIndex(itemIndex);
            }}
          >
            {uris[item.evidenceId] ? (
              <Image source={{ uri: uris[item.evidenceId] }} style={styles.thumbnail} />
            ) : (
              <View style={[styles.thumbnail, styles.unavailable]}>
                <Text style={{ color: colors.textMedium }}>
                  {failed.includes(item.evidenceId) ? t('common.retry') : t('common.loading')}
                </Text>
              </View>
            )}
          </Pressable>
        ))}
      </View>
      <Modal visible={selected !== null} animationType="fade" onRequestClose={() => setIndex(null)}>
        <View style={[styles.viewer, { backgroundColor: colors.textDark }]}>
          <Pressable accessibilityRole="button" accessibilityLabel={t('common.close')} onPress={() => setIndex(null)} style={styles.close}>
            <Ionicons name="close" size={30} color={colors.textWhite} />
          </Pressable>
          {selected && uris[selected.evidenceId] ? (
            <Image source={{ uri: uris[selected.evidenceId] }} resizeMode="contain" style={styles.fullImage} />
          ) : selected ? (
            <StatusBanner tone="danger" title={t('common.error')} />
          ) : null}
          <Text style={{ color: colors.textWhite, marginBottom: spacing.md }}>
            {index === null ? 0 : index + 1} / {items.length}
          </Text>
          <View style={styles.navigation}>
            <AppButton title={t('evidence.previous')} variant="outline" disabled={index === 0}
              onPress={() => setIndex((current) => current === null ? null : Math.max(0, current - 1))} />
            <AppButton title={t('evidence.next')} variant="outline" disabled={index === items.length - 1}
              onPress={() => setIndex((current) => current === null ? null : Math.min(items.length - 1, current + 1))} />
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  thumbnail: { width: 88, height: 88, borderRadius: 11 },
  unavailable: { alignItems: 'center', justifyContent: 'center', backgroundColor: '#EDEAF0', padding: 8 },
  viewer: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  close: { position: 'absolute', top: 48, right: 20, padding: 10, zIndex: 1 },
  fullImage: { width: '100%', height: '72%' },
  navigation: { width: '88%', flexDirection: 'row', justifyContent: 'space-between', gap: 8 },
});
