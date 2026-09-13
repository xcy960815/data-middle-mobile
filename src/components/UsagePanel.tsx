import { useState } from 'react';
import { ActivityIndicator, Pressable, Text, View } from 'react-native';

type UsageStat = {
  key: string;
  label: string;
  count: number;
};

type UsageSectionProps = {
  title: string;
  items: { id: number; title: string; subtitle: string | null; meta: string }[];
  emptyText: string;
};

function UsageSection({ title, items, emptyText }: UsageSectionProps) {
  const [expanded, setExpanded] = useState(false);
  if (items.length === 0) {
    return <Text className="mt-2 text-xs text-[#8a98aa]">{emptyText}</Text>;
  }
  return (
    <View className="mt-2">
      <Pressable
        accessibilityLabel={`${expanded ? '收起' : '展开'}${title}引用明细`}
        accessibilityRole="button"
        onPress={() => setExpanded((value) => !value)}
        className="flex-row items-center justify-between"
      >
        <Text className="text-xs font-black text-[#425b7c]">{title}</Text>
        <Text className="text-[11px] font-bold text-[#397cf0]">
          {expanded ? '收起' : '展开明细'}
        </Text>
      </Pressable>
      {expanded ? (
        <View className="mt-2 gap-2">
          {items.map((item) => (
            <View key={item.id} className="rounded-xl bg-[#f4f8fd] p-3">
              <Text className="text-xs font-bold text-[#3d5069]">{item.title}</Text>
              {item.subtitle ? (
                <Text className="mt-1 text-[11px] text-[#687990]">{item.subtitle}</Text>
              ) : null}
              <Text className="mt-1 text-[11px] text-[#8a98aa]">{item.meta}</Text>
            </View>
          ))}
        </View>
      ) : null}
    </View>
  );
}

type Props = {
  title: string;
  stats: UsageStat[];
  sections: UsageSectionProps[];
  isLoading: boolean;
  error: string | null;
  footerNote?: string | null;
};

/**
 * 资源使用情况面板：展示下游引用统计卡、可展开的引用明细区块与页脚备注。
 *
 * 三种互斥状态：isLoading 时标题右侧显示加载指示器、正文提示正在统计；error 非空时
 * 显示“加载失败”徽标与错误文案；正常时按 stats 是否存在正数计数展示“存在/暂无下游
 * 引用”徽标，并渲染统计卡与明细区块。
 *
 * @param {Props} props - 组件属性。
 * @param {string} props.title - 面板标题。
 * @param {UsageStat[]} props.stats - 统计项列表；key 用于列表复用、label 为展示文案、count 为引用数量。
 * @param {UsageSectionProps[]} props.sections - 引用明细区块，逐个渲染为可展开或收起的列表。
 * @param {boolean} props.isLoading - 引用统计是否加载中。
 * @param {string | null} props.error - 加载失败的错误文案；非 null 时面板整体进入错误态。
 * @param {string | null} [props.footerNote] - 页脚备注文案；缺省或为空字符串时不渲染。
 * @returns {JSX.Element} 使用情况面板。
 */
export function UsagePanel({ title, stats, sections, isLoading, error, footerNote }: Props) {
  const hasAnyUsage = stats.some((stat) => stat.count > 0);
  return (
    <View className="rounded-2xl border border-[#dce7f3] bg-white p-4">
      <View className="flex-row items-center justify-between">
        <Text className="text-sm font-black text-[#425b7c]">{title}</Text>
        {isLoading ? (
          <ActivityIndicator color="#397cf0" size="small" />
        ) : error ? (
          <View className="rounded-full bg-[#fdeaea] px-2 py-0.5">
            <Text className="text-[10px] font-black text-[#a64b4b]">加载失败</Text>
          </View>
        ) : (
          <View
            className={`rounded-full px-2 py-0.5 ${hasAnyUsage ? 'bg-[#fff4e3]' : 'bg-[#e7f8ef]'}`}
          >
            <Text
              className={`text-[10px] font-black ${
                hasAnyUsage ? 'text-[#b07818]' : 'text-[#047857]'
              }`}
            >
              {hasAnyUsage ? '存在下游引用' : '暂无下游引用'}
            </Text>
          </View>
        )}
      </View>

      {error ? (
        <Text className="mt-2 text-xs text-[#a64b4b]">{error}</Text>
      ) : isLoading ? (
        <Text className="mt-2 text-xs text-[#8a98aa]">正在统计引用…</Text>
      ) : (
        <>
          <View className="mt-3 flex-row gap-2">
            {stats.map((stat) => (
              <View key={stat.key} className="flex-1 rounded-xl bg-[#f4f8fd] px-3 py-2">
                <Text className="text-lg font-black text-[#397bea]">{stat.count}</Text>
                <Text className="mt-0.5 text-[10px] font-bold text-[#718198]">{stat.label}</Text>
              </View>
            ))}
          </View>
          {sections.map((section) => (
            <UsageSection key={section.title} {...section} />
          ))}
          {footerNote ? (
            <Text className="mt-3 text-[11px] text-[#8a98aa]">{footerNote}</Text>
          ) : null}
        </>
      )}
    </View>
  );
}
