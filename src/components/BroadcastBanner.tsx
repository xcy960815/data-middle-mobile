import { Pressable, Text, View } from 'react-native';

import { useActiveBroadcasts } from '@/features/broadcast/use-active-broadcasts';

const levelStyles: Record<
  string,
  { border: string; background: string; title: string; dot: string }
> = {
  info: {
    border: 'border-[#dce7f3]',
    background: 'bg-white',
    title: 'text-[#34445b]',
    dot: 'bg-[#397cf0]',
  },
  warning: {
    border: 'border-[#f2dfc4]',
    background: 'bg-[#fffbeb]',
    title: 'text-[#92400e]',
    dot: 'bg-[#f59e0b]',
  },
  critical: {
    border: 'border-[#f2d3d3]',
    background: 'bg-[#fff7f7]',
    title: 'text-[#b91c1c]',
    dot: 'bg-[#dc2626]',
  },
};

/** 欢迎页系统广播横幅：展示当前可见广播，逐条关闭（dismiss 记录到服务端）。 */
export function BroadcastBanner() {
  const { items, dismiss } = useActiveBroadcasts();
  if (items.length === 0) return null;

  return (
    <View className="gap-2">
      {items.map((broadcast) => {
        const style = levelStyles[broadcast.level] ?? levelStyles.info;
        return (
          <View
            className={`flex-row items-start gap-3 rounded-2xl border p-4 ${style.border} ${style.background}`}
            key={broadcast.id}
          >
            <View className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${style.dot}`} />
            <View className="flex-1 gap-1">
              <Text className={`text-sm font-black ${style.title}`}>
                {broadcast.level === 'critical' ? '【重要】' : ''}
                {broadcast.title}
              </Text>
              <Text className="text-xs leading-[19px] text-[#6d7d94]">{broadcast.content}</Text>
            </View>
            <Pressable
              accessibilityLabel={`关闭广播：${broadcast.title}`}
              accessibilityRole="button"
              hitSlop={8}
              className="h-[26px] w-[26px] items-center justify-center rounded-full bg-black/5"
              onPress={() => {
                void dismiss(broadcast.id).catch(() => undefined);
              }}
            >
              <Text className="text-xl leading-[21px] text-[#64758b]">×</Text>
            </Pressable>
          </View>
        );
      })}
    </View>
  );
}
