import Feather from '@expo/vector-icons/Feather';
import type { ComponentProps } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Button } from '@/components/button';
import { colors, radius, spacing } from '@/constants/theme';
import { formatDate } from '@/lib/format';
import type { Match } from '@/services/types';

type IconName = ComponentProps<typeof Feather>['name'];

const categoryIcons: Record<string, IconName> = {
  Vendas: 'shopping-bag',
  Agendamento: 'calendar',
  Estoque: 'package',
  Financeiro: 'bar-chart-2',
  Atendimento: 'message-circle',
};

interface Props {
  match: Match;
  onOpen: (match: Match) => void;
  onRevoke: (match: Match) => void;
}

export function SystemCard({ match, onOpen, onRevoke }: Props) {
  const { project, revocation } = match;
  const active = match.status === 'ACTIVE';
  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View style={styles.icon}>
          <Feather name={categoryIcons[project.category] ?? 'shopping-bag'} size={24} color={colors.iconInk} />
        </View>
        <View style={styles.info}>
          <Text style={styles.category}>{project.category}</Text>
          <Text style={styles.title}>{project.title}</Text>
          <Text style={styles.meta}>
            Por {project.developer.name} · Adotado em {formatDate(match.adoptedAt)}
          </Text>
        </View>
      </View>

      {active && project.status !== 'APPROVED' && (
        <StatusLine
          icon="alert-triangle"
          color={colors.warning}
          text="Sistema fora da vitrine. O endereço pode estar indisponível."
        />
      )}
      {revocation && (
        <Text style={styles.meta}>
          {revocation.notificationAcceptedAt
            ? 'Notificação aceita pelo servidor de e-mail'
            : 'Notificação aguardando envio'}
        </Text>
      )}
      {revocation &&
        (revocation.deletionDeclaredAt ? (
          <StatusLine
            icon="check-circle"
            color={colors.brand}
            text={`Exclusão declarada em ${formatDate(revocation.deletionDeclaredAt)}`}
          />
        ) : (
          <StatusLine
            icon="clock"
            color={colors.warning}
            text={`Exclusão solicitada · Prazo: ${formatDate(revocation.deletionDeadlineAt)}`}
          />
        ))}

      {active && (
        <View style={styles.actions}>
          <Button
            label="Abrir"
            onPress={() => onOpen(match)}
            icon={<Feather name="arrow-up-right" size={17} color="#fff" />}
            style={styles.open}
          />
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`Revogar acesso a ${project.title}`}
            onPress={() => onRevoke(match)}
            style={({ pressed }) => [styles.revoke, pressed && styles.revokePressed]}>
            <Feather name="shield-off" size={16} color={colors.danger} />
            <Text style={styles.revokeLabel}>Revogar acesso</Text>
          </Pressable>
        </View>
      )}
    </View>
  );
}

function StatusLine({ icon, color, text }: { icon: IconName; color: string; text: string }) {
  return (
    <View style={styles.statusLine}>
      <Feather name={icon} size={15} color={color} />
      <Text style={[styles.statusText, { color }]}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: radius.md,
    padding: spacing.lg,
    gap: spacing.sm,
  },
  header: { flexDirection: 'row', gap: spacing.md, alignItems: 'center' },
  icon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: colors.iconBackground,
    alignItems: 'center',
    justifyContent: 'center',
  },
  info: { flex: 1, gap: 2 },
  category: { fontSize: 12, color: colors.muted },
  title: { fontSize: 18, fontWeight: '600', color: colors.ink, letterSpacing: -0.3 },
  meta: { fontSize: 13, color: colors.muted, lineHeight: 19 },
  statusLine: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  statusText: { flex: 1, fontSize: 13, lineHeight: 18 },
  actions: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, marginTop: spacing.sm },
  open: { flex: 1 },
  revoke: {
    minHeight: 48,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: spacing.md,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: colors.dangerSoft,
  },
  revokePressed: { backgroundColor: colors.dangerSoft },
  revokeLabel: { color: colors.danger, fontSize: 14, fontWeight: '600' },
});
