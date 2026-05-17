import { View, StyleSheet, type ViewStyle } from 'react-native';
import { colors } from '../theme/colors';

interface Props {
  children: React.ReactNode;
  style?: ViewStyle;
  accent?: string;
}

export function PixelPanel({ children, style, accent = colors.accentGold }: Props) {
  return (
    <View style={[styles.panel, { borderColor: accent }, style]}>
      {/* Pixel corner decorations */}
      <View style={[styles.corner, styles.tl, { backgroundColor: colors.borderPixel }]} />
      <View style={[styles.corner, styles.tr, { backgroundColor: colors.borderPixel }]} />
      <View style={[styles.corner, styles.bl, { backgroundColor: colors.borderPixel }]} />
      <View style={[styles.corner, styles.br, { backgroundColor: colors.borderPixel }]} />
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  panel:  { backgroundColor: colors.bgPanel, borderWidth: 2, padding: 12, position: 'relative' },
  corner: { position: 'absolute', width: 6, height: 6 },
  tl:     { top: 0, left: 0 },
  tr:     { top: 0, right: 0 },
  bl:     { bottom: 0, left: 0 },
  br:     { bottom: 0, right: 0 },
});
