import Feather from '@expo/vector-icons/Feather';
import * as WebBrowser from 'expo-web-browser';
import { useState } from 'react';
import { ActivityIndicator, FlatList, Pressable, RefreshControl, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Brand } from '@/components/brand';
import { Button } from '@/components/button';
import { RevokeDialog } from '@/components/revoke-dialog';
import { SystemCard } from '@/components/system-card';
import { colors, radius, spacing } from '@/constants/theme';
import { useMatches } from '@/hooks/use-matches';
import { safeExternalUrl } from '@/lib/format';
import { useSession } from '@/providers/session-provider';
import type { Match } from '@/services/types';

type Tab = 'active' | 'revoked';
type Feedback = { kind: 'success' | 'error'; text: string };

export default function SystemsScreen() {
  const { user, logout } = useSession();
  const { matches, loading, error, reload, revoke } = useMatches();
  const [tab, setTab] = useState<Tab>('active');
  const [refreshing, setRefreshing] = useState(false);
  const [selected, setSelected] = useState<Match | null>(null);
  const [revoking, setRevoking] = useState(false);
  const [revokeError, setRevokeError] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<Feedback | null>(null);

  const active = matches.filter((m) => m.status === 'ACTIVE');
  const revoked = matches.filter((m) => m.status === 'REVOKED');
  const visible = tab === 'active' ? active : revoked;

  async function refresh() {
    setRefreshing(true);
    await reload();
    setRefreshing(false);
  }

  async function open(match: Match) {
    const url = safeExternalUrl(match.productionUrlSnapshot);
    if (!url) {
      setFeedback({ kind: 'error', text: 'O endereço do sistema não está disponível.' });
      return;
    }
    try {
      await WebBrowser.openBrowserAsync(url, {
        toolbarColor: colors.brand,
        controlsColor: '#ffffff',
        showTitle: true,
        dismissButtonStyle: 'close',
      });
    } catch {
      setFeedback({ kind: 'error', text: 'Não foi possível abrir o sistema. Tente novamente.' });
    }
  }

  async function confirmRevocation() {
    if (!selected) return;
    setRevoking(true);
    setRevokeError(null);
    try {
      await revoke(selected.id);
      setSelected(null);
      setTab('revoked');
      setFeedback({
        kind: 'success',
        text: 'Revogação registrada. Acompanhe a notificação e o prazo nesta aba.',
      });
    } catch (e) {
      setRevokeError((e as Error).message);
    } finally {
      setRevoking(false);
    }
  }

  async function exit() {
    try {
      await logout();
    } catch (e) {
      setFeedback({ kind: 'error', text: (e as Error).message });
    }
  }

  const header = (
    <View style={styles.header}>
      <View style={styles.topBar}>
        <Brand />
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Sair"
          hitSlop={8}
          onPress={exit}
          style={({ pressed }) => [styles.logout, pressed && styles.logoutPressed]}>
          <Feather name="log-out" size={19} color={colors.muted} />
        </Pressable>
      </View>

      <View>
        <Text style={styles.eyebrow}>{(user?.merchant?.businessName ?? 'Meu negócio').toUpperCase()}</Text>
        <Text style={styles.title}>Suas ferramentas, em um só lugar.</Text>
        <Text style={styles.subtitle}>Acesse seus sistemas e gerencie suas conexões.</Text>
      </View>

      <View style={styles.metrics}>
        <Metric label="Sistemas ativos" value={active.length} />
        <Metric label="Solicitações de exclusão" value={revoked.length} />
      </View>

      <View style={styles.tabs}>
        <TabButton label="Meus sistemas" count={active.length} selected={tab === 'active'} onPress={() => setTab('active')} />
        <TabButton label="Revogações" count={revoked.length} selected={tab === 'revoked'} onPress={() => setTab('revoked')} />
      </View>

      {feedback && (
        <Pressable
          accessibilityRole="alert"
          onPress={() => setFeedback(null)}
          style={[styles.feedback, feedback.kind === 'error' && styles.feedbackError]}>
          <Feather
            name={feedback.kind === 'error' ? 'alert-circle' : 'check-circle'}
            size={17}
            color={feedback.kind === 'error' ? colors.error : colors.brand}
          />
          <Text style={[styles.feedbackText, feedback.kind === 'error' && styles.feedbackTextError]}>
            {feedback.text}
          </Text>
          <Feather name="x" size={16} color={colors.muted} />
        </Pressable>
      )}
    </View>
  );

  const empty = loading ? (
    <ActivityIndicator style={styles.loading} color={colors.brand} />
  ) : error ? (
    <View style={styles.empty}>
      <Text style={styles.emptyTitle}>Não foi possível carregar seus sistemas</Text>
      <Text style={styles.emptyText}>{error}</Text>
      <Button label="Tentar novamente" variant="secondary" onPress={refresh} />
    </View>
  ) : (
    <View style={styles.empty}>
      <Text style={styles.emptyTitle}>
        {tab === 'active' ? 'Seu próximo sistema está na vitrine' : 'Nenhuma revogação por aqui'}
      </Text>
      <Text style={styles.emptyText}>
        {tab === 'active'
          ? 'Explore as soluções no site e adote a que combina com seu negócio.'
          : 'As solicitações de exclusão aparecerão aqui.'}
      </Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.screen} edges={['top', 'left', 'right']}>
      <FlatList
        data={error ? [] : visible}
        keyExtractor={(match) => match.id}
        renderItem={({ item }) => <SystemCard match={item} onOpen={open} onRevoke={setSelected} />}
        ListHeaderComponent={header}
        ListEmptyComponent={empty}
        ListFooterComponent={
          <View style={styles.notice}>
            <Feather name="shield" size={18} color={colors.noticeText} />
            <Text style={styles.noticeText}>
              Os sistemas são mantidos pelos desenvolvedores. A revogação registra sua solicitação de exclusão,
              mas não encerra automaticamente uma sessão no site externo.
            </Text>
          </View>
        }
        ItemSeparatorComponent={Separator}
        contentContainerStyle={styles.list}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={refresh} tintColor={colors.brand} />}
      />
      <RevokeDialog
        projectTitle={selected?.project.title ?? null}
        busy={revoking}
        error={revokeError}
        onCancel={() => {
          setSelected(null);
          setRevokeError(null);
        }}
        onConfirm={confirmRevocation}
      />
    </SafeAreaView>
  );
}

function Separator() {
  return <View style={styles.separator} />;
}

function Metric({ label, value }: { label: string; value: number }) {
  return (
    <View style={styles.metric}>
      <Text style={styles.metricLabel}>{label}</Text>
      <Text style={styles.metricValue}>{value.toString().padStart(2, '0')}</Text>
    </View>
  );
}

function TabButton(props: { label: string; count: number; selected: boolean; onPress: () => void }) {
  return (
    <Pressable
      accessibilityRole="tab"
      accessibilityState={{ selected: props.selected }}
      onPress={props.onPress}
      style={[styles.tab, props.selected && styles.tabSelected]}>
      <Text style={[styles.tabLabel, props.selected && styles.tabLabelSelected]}>{props.label}</Text>
      <View style={styles.badge}>
        <Text style={styles.badgeText}>{props.count}</Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  list: { padding: spacing.xl, paddingBottom: 40 },
  header: { gap: spacing.xl, marginBottom: spacing.lg },
  topBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  logout: { width: 40, height: 40, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  logoutPressed: { backgroundColor: '#edf2eb' },
  eyebrow: { fontSize: 11, fontWeight: '700', letterSpacing: 1.6, color: '#617566', marginBottom: spacing.sm },
  title: { fontSize: 27, lineHeight: 33, fontWeight: '600', letterSpacing: -0.8, color: colors.ink },
  subtitle: { fontSize: 14, color: colors.muted, marginTop: spacing.sm },
  metrics: { flexDirection: 'row', gap: spacing.md },
  metric: {
    flex: 1,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: radius.md,
    padding: spacing.lg,
  },
  metricLabel: { fontSize: 12, color: colors.muted },
  metricValue: { fontSize: 30, fontWeight: '600', letterSpacing: -1, color: colors.ink, marginTop: 4 },
  tabs: { flexDirection: 'row', gap: spacing.xl, borderBottomWidth: 1, borderBottomColor: colors.line },
  tab: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    minHeight: 44,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabSelected: { borderBottomColor: colors.brand },
  tabLabel: { fontSize: 14, color: colors.muted },
  tabLabelSelected: { color: colors.brand, fontWeight: '600' },
  badge: { backgroundColor: colors.badgeBackground, borderRadius: 5, paddingHorizontal: 7, paddingVertical: 1 },
  badgeText: { fontSize: 12, color: colors.badgeText },
  feedback: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.noticeBackground,
    borderWidth: 1,
    borderColor: colors.noticeBorder,
    borderRadius: 9,
    padding: spacing.md,
  },
  feedbackError: { backgroundColor: colors.dangerSoft, borderColor: '#efd0ca' },
  feedbackText: { flex: 1, fontSize: 13, lineHeight: 19, color: colors.noticeText },
  feedbackTextError: { color: colors.error },
  separator: { height: spacing.md },
  loading: { paddingVertical: 48 },
  empty: {
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: 40,
    paddingHorizontal: spacing.xl,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: '#ccd8c5',
    borderRadius: radius.md,
    backgroundColor: '#f7faf3',
  },
  emptyTitle: { fontSize: 19, fontWeight: '600', color: colors.ink, textAlign: 'center' },
  emptyText: { fontSize: 14, lineHeight: 21, color: colors.muted, textAlign: 'center' },
  notice: {
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: spacing.xxl,
    backgroundColor: colors.noticeBackground,
    borderWidth: 1,
    borderColor: colors.noticeBorder,
    borderRadius: 9,
    padding: spacing.lg,
  },
  noticeText: { flex: 1, fontSize: 13, lineHeight: 20, color: colors.noticeText },
});
