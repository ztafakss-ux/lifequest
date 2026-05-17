import { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { colors } from '../theme/colors';

interface Props {
  label: string;
  value: number;
  max: number;
  color: string;
}

export function StatBar({ label, value, max, color }: Props) {
  const pct = Math.min(1, value / max);
  const anim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(anim, { toValue: pct, duration: 800, useNativeDriver: false }).start();
  }, [pct, anim]);

  const width = anim.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] });

  return (
    <View style={styles.container}>
      <View style={styles.labelRow}>
        <Text style={styles.label}>{label}</Text>
        <Text style={styles.value}>{value}/{max}</Text>
      </View>
      <View style={styles.track}>
        <Animated.View style={[styles.fill, { width, backgroundColor: color }]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container:  { marginBottom: 8 },
  labelRow:   { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 3 },
  label:      { fontFamily: 'monospace', fontSize: 10, color: colors.textSecondary },
  value:      { fontFamily: 'monospace', fontSize: 12, color: colors.textPrimary },
  track:      { height: 10, backgroundColor: 'rgba(0,0,0,0.4)', borderWidth: 2, borderColor: colors.borderPixel },
  fill:       { height: '100%' },
});
