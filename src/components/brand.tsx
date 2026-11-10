import { StyleSheet, Text, View } from 'react-native';

import { colors } from '@/constants/theme';

export function Brand({ inverted }: { inverted?: boolean }) {
  return (
    <View style={styles.row} accessibilityRole="header" accessibilityLabel="Hello Cliente">
      <View style={[styles.symbol, inverted && styles.symbolInverted]}>
        <Text style={[styles.symbolText, inverted && styles.symbolTextInverted]}>
          h<Text style={styles.symbolDot}>.</Text>
        </Text>
      </View>
      <Text style={[styles.name, inverted && styles.nameInverted]}>
        hello cliente<Text style={inverted ? styles.symbolDot : styles.period}>.</Text>
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 9 },
  symbol: {
    width: 34,
    height: 34,
    borderRadius: 9,
    backgroundColor: colors.brand,
    alignItems: 'center',
    justifyContent: 'center',
  },
  symbolInverted: { backgroundColor: '#fff' },
  symbolText: { color: '#fff', fontSize: 22, fontWeight: '700', lineHeight: 26 },
  symbolTextInverted: { color: colors.brand },
  symbolDot: { color: colors.brandSoft },
  name: { fontSize: 21, fontWeight: '700', letterSpacing: -0.8, color: colors.ink },
  nameInverted: { color: '#fff' },
  period: { color: colors.brand },
});
