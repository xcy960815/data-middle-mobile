import { Pressable, StyleSheet, Text, View } from 'react-native';

type BrandMarkProps = {
  onPress?: () => void;
  compact?: boolean;
};

export function BrandMark({ onPress, compact = false }: BrandMarkProps) {
  const mark = (
    <View style={styles.content}>
      <View style={styles.symbol}>
        <View style={[styles.symbolBar, styles.symbolBarShort]} />
        <View style={[styles.symbolBar, styles.symbolBarMiddle]} />
        <View style={[styles.symbolBar, styles.symbolBarTall]} />
      </View>
      <View>
        <Text style={[styles.name, compact && styles.nameCompact]}>数据中台</Text>
        {!compact && <Text style={styles.subName}>DATA MIDDLE STATION</Text>}
      </View>
    </View>
  );

  if (!onPress) {
    return mark;
  }

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel="返回欢迎页"
      onPress={onPress}
      style={styles.pressable}
    >
      {mark}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  pressable: {
    borderRadius: 12,
  },
  content: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 10,
  },
  symbol: {
    alignItems: 'flex-end',
    backgroundColor: '#172033',
    borderRadius: 10,
    flexDirection: 'row',
    gap: 3,
    height: 34,
    justifyContent: 'center',
    paddingBottom: 8,
    width: 34,
  },
  symbolBar: {
    backgroundColor: '#75d7ff',
    borderRadius: 4,
    width: 4,
  },
  symbolBarShort: {
    height: 8,
  },
  symbolBarMiddle: {
    backgroundColor: '#6f94ff',
    height: 14,
  },
  symbolBarTall: {
    backgroundColor: '#a86cff',
    height: 20,
  },
  name: {
    color: '#172033',
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  nameCompact: {
    fontSize: 15,
  },
  subName: {
    color: '#8a97aa',
    fontSize: 8,
    fontWeight: '700',
    letterSpacing: 1.2,
    marginTop: 2,
  },
});
