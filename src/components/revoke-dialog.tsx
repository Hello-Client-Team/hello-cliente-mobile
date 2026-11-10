import { Modal, StyleSheet, Text, View } from 'react-native';

import { Button } from '@/components/button';
import { colors, radius, spacing } from '@/constants/theme';

interface Props {
  projectTitle: string | null;
  busy: boolean;
  error: string | null;
  onCancel: () => void;
  onConfirm: () => void;
}

export function RevokeDialog({ projectTitle, busy, error, onCancel, onConfirm }: Props) {
  return (
    <Modal visible={projectTitle !== null} transparent animationType="fade" onRequestClose={onCancel}>
      <View style={styles.overlay}>
        <View style={styles.content} accessibilityViewIsModal>
          <Text style={styles.title}>Revogar acesso ao sistema?</Text>
          <Text style={styles.description}>
            {projectTitle} sairá da sua lista de adoções ativas. O desenvolvedor será notificado para excluir
            seus dados externos em até 48 horas.
          </Text>
          <View style={styles.notice}>
            <Text style={styles.noticeText}>
              Você poderá acompanhar o prazo e a declaração de exclusão na aba Revogações.
            </Text>
          </View>
          {error && (
            <Text accessibilityRole="alert" style={styles.error}>
              {error}
            </Text>
          )}
          <View style={styles.actions}>
            <Button label="Confirmar revogação" variant="danger" busy={busy} onPress={onConfirm} />
            <Button label="Manter sistema" variant="secondary" disabled={busy} onPress={onCancel} />
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: colors.overlay, justifyContent: 'center', padding: spacing.lg },
  content: {
    width: '100%',
    maxWidth: 480,
    alignSelf: 'center',
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: 24,
    gap: spacing.md,
  },
  title: { fontSize: 21, fontWeight: '600', color: colors.ink, letterSpacing: -0.4 },
  description: { fontSize: 15, lineHeight: 23, color: colors.muted },
  notice: {
    backgroundColor: colors.noticeBackground,
    borderWidth: 1,
    borderColor: colors.noticeBorder,
    borderRadius: 9,
    padding: spacing.md,
  },
  noticeText: { fontSize: 14, lineHeight: 21, color: colors.noticeText },
  error: { fontSize: 13, color: colors.error },
  actions: { gap: spacing.sm, marginTop: spacing.xs },
});
