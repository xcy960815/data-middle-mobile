import { Text, View } from 'react-native';
import { useLocalSearchParams } from 'expo-router';

import { ShareAnalysisScreen } from '@/screens/ShareAnalysisScreen';

/**
 * 免登录分享视图：匿名可访问，不做登录重定向。读取路径参数 id 并校验为正整数，非法时
 * 展示“分享链接无效”提示，合法时渲染 ShareAnalysisScreen。
 *
 * @returns {JSX.Element} 分享分析详情页或无效链接提示。
 */
export default function ShareAnalysisRoute() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const analysisId = Number(id);

  if (!Number.isInteger(analysisId) || analysisId <= 0) {
    return (
      <View className="flex-1 items-center justify-center bg-[#f5f9fe] px-8">
        <Text className="text-lg font-black text-[#34445b]">分享链接无效</Text>
        <Text className="mt-2 text-center text-xs leading-5 text-[#7b8aa0]">
          链接中的图表标识缺失或格式不正确，请向分享人确认最新链接。
        </Text>
      </View>
    );
  }

  return <ShareAnalysisScreen analysisId={analysisId} />;
}
