import { Pressable, StyleSheet, Text, View } from 'react-native';

type BrandMarkProps = {
  onPress?: () => void;
  compact?: boolean;
};

/**
 * “数据中台”品牌标识：柱状图形符号加中英文产品名，用于欢迎页与登录页。
 *
 * 传入 onPress 时整体可点击（无障碍角色为按钮，用于返回欢迎页），否则渲染纯静态标识。
 *
 * @param {BrandMarkProps} props - 组件属性。
 * @param {() => void} [props.onPress] - 点击标识时的回调；缺省时渲染为不可点击的静态标识。
 * @param {boolean} [props.compact=false] - 紧凑模式：隐藏英文副标题并缩小主标题字号。
 * @returns {JSX.Element} 品牌标识。
 */
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
