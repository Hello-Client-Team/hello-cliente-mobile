import Feather from '@expo/vector-icons/Feather';
import * as WebBrowser from 'expo-web-browser';
import { useRef, useState, type ComponentRef } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Brand } from '@/components/brand';
import { Button } from '@/components/button';
import { colors, radius, spacing } from '@/constants/theme';
import { useSession } from '@/providers/session-provider';
import { normalizePhone, WEB_URL } from '@/services/api';

export default function LoginScreen() {
  const { login } = useSession();
  const [whatsapp, setWhatsapp] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const passwordInput = useRef<ComponentRef<typeof TextInput>>(null);

  async function enter() {
    const phone = normalizePhone(whatsapp);
    if (!/^\+[1-9]\d{7,14}$/.test(phone)) {
      setError('Informe o WhatsApp com DDD ou código internacional.');
      return;
    }
    if (!password) {
      setError('Informe sua senha.');
      return;
    }
    setBusy(true);
    setError('');
    try {
      await login(phone, password);
    } catch (e) {
      setError((e as Error).message);
      setBusy(false);
    }
  }

  return (
    <SafeAreaView style={styles.screen}>
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <View style={styles.hero}>
            <Brand inverted />
            <Text style={styles.eyebrow}>POCKET HUB · LOJISTA</Text>
            <Text style={styles.heroTitle}>
              Seus sistemas,{'\n'}
              <Text style={styles.heroAccent}>no seu bolso.</Text>
            </Text>
          </View>

          <View style={styles.form}>
            <Text style={styles.title}>Que bom ter você aqui.</Text>
            <Text style={styles.description}>Entre para gerenciar suas conexões.</Text>

            <View style={styles.field}>
              <Text style={styles.label}>WhatsApp</Text>
              <TextInput
                style={styles.input}
                value={whatsapp}
                onChangeText={setWhatsapp}
                placeholder="(11) 99999-9999"
                placeholderTextColor={colors.placeholder}
                keyboardType="phone-pad"
                autoComplete="tel"
                textContentType="telephoneNumber"
                returnKeyType="next"
                onSubmitEditing={() => passwordInput.current?.focus()}
                accessibilityLabel="WhatsApp"
              />
            </View>
            <View style={styles.field}>
              <Text style={styles.label}>Senha</Text>
              <TextInput
                ref={passwordInput}
                style={styles.input}
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                autoCapitalize="none"
                autoComplete="current-password"
                textContentType="password"
                returnKeyType="go"
                onSubmitEditing={enter}
                accessibilityLabel="Senha"
              />
            </View>

            {!!error && (
              <Text accessibilityRole="alert" style={styles.error}>
                {error}
              </Text>
            )}

            <Button
              label={busy ? 'Entrando…' : 'Entrar'}
              busy={busy}
              onPress={enter}
              icon={<Feather name="arrow-right" size={17} color="#fff" />}
            />

            <Text style={styles.signup}>
              Ainda não tem conta?{' '}
              <Text
                accessibilityRole="link"
                style={styles.link}
                onPress={() => WebBrowser.openBrowserAsync(`${WEB_URL}/cadastro/`)}>
                Cadastre seu negócio
              </Text>
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  flex: { flex: 1 },
  content: { flexGrow: 1, padding: spacing.xl, gap: spacing.xxl },
  hero: { backgroundColor: '#234e3c', borderRadius: 16, padding: 24, gap: spacing.lg },
  eyebrow: { color: '#a5bf91', fontSize: 10, fontWeight: '700', letterSpacing: 1.6, marginTop: spacing.sm },
  heroTitle: { color: '#fff', fontSize: 30, fontWeight: '500', letterSpacing: -1, lineHeight: 37 },
  heroAccent: { color: '#cbe2a6' },
  form: { gap: spacing.lg },
  title: { fontSize: 27, fontWeight: '600', letterSpacing: -0.8, color: colors.ink },
  description: { fontSize: 15, color: colors.muted, marginTop: -spacing.sm },
  field: { gap: 7 },
  label: { fontSize: 14, fontWeight: '500', color: '#4b5c44' },
  input: {
    minHeight: 48,
    borderWidth: 1,
    borderColor: colors.field,
    borderRadius: radius.sm,
    backgroundColor: colors.surface,
    paddingHorizontal: 13,
    fontSize: 16,
    color: colors.ink,
  },
  error: { fontSize: 13, lineHeight: 19, color: colors.error },
  signup: { fontSize: 14, color: colors.ink },
  link: { color: colors.brand, fontWeight: '600' },
});
