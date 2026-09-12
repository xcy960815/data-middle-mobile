import { Pressable, ScrollView, Text, View } from 'react-native';

import { useAuth } from '@/features/auth/auth-context';

type Props = {
  onBackPress: () => void;
  onMonitorPress: () => void;
  onKnowledgePress: () => void;
  onLoginLogsPress: () => void;
  onAlarmLogsPress: () => void;
  onEmailLogsPress: () => void;
  onEmailTasksPress: () => void;
};

const adminEntries: readonly { key: string; label: string; description: string }[] = [
  { key: 'loginLogs', label: '登录日志', description: '平台用户登录记录与失败原因。' },
  { key: 'alarmLogs', label: '报警日志', description: '报警规则的触发与通知记录。' },
  { key: 'emailLogs', label: '邮件日志', description: '分析邮件任务的发送记录。' },
  { key: 'emailTasks', label: '邮件任务', description: '平台内定时邮件任务及状态。' },
];

/** 当前账户信息与管理员运维入口，登出后由路由层回到登录页。 */
export function AccountScreen({
  onBackPress,
  onMonitorPress,
  onKnowledgePress,
  onLoginLogsPress,
  onAlarmLogsPress,
  onEmailLogsPress,
  onEmailTasksPress,
}: Props) {
  const { user, logout } = useAuth();

  const entryHandlers: Record<string, () => void> = {
    loginLogs: onLoginLogsPress,
    alarmLogs: onAlarmLogsPress,
    emailLogs: onEmailLogsPress,
    emailTasks: onEmailTasksPress,
  };

  return (
    <ScrollView contentContainerClassName="gap-4 bg-[#f5f9fe] px-[18px] pb-8 pt-[52px]">
      <View className="flex-row items-center gap-3">
        <Pressable accessibilityLabel="返回" accessibilityRole="button" onPress={onBackPress}>
          <Text className="text-3xl text-[#397cf0]">‹</Text>
        </Pressable>
        <Text className="text-xl font-black text-[#253750]">我的账户</Text>
      </View>

      <View className="gap-3 rounded-2xl border border-[#dce7f3] bg-white p-5">
        <View className="h-14 w-14 items-center justify-center rounded-full bg-[#397cf0]">
          <Text className="text-xl font-black text-white">
            {(user?.displayName || user?.userName || '?').slice(0, 1).toUpperCase()}
          </Text>
        </View>
        <View className="flex-row items-center gap-2">
          <Text className="text-lg font-black text-[#253750]">
            {user?.displayName || user?.userName || '未知用户'}
          </Text>
          {user?.isAdmin ? (
            <View className="rounded-full bg-[#f2eaff] px-2 py-1">
              <Text className="text-[9px] font-black text-[#7c3aed]">管理员</Text>
            </View>
          ) : null}
        </View>
        <Text className="text-xs text-[#718198]">用户名 {user?.userName ?? '—'}</Text>
      </View>

      <Pressable
        accessibilityLabel="宿主机监控"
        accessibilityRole="button"
        className="flex-row items-center justify-between rounded-2xl border border-[#dce7f3] bg-white p-4 active:bg-[#f0f5fb]"
        onPress={onMonitorPress}
      >
        <View className="flex-1">
          <Text className="text-sm font-black text-[#34445b]">宿主机监控</Text>
          <Text className="mt-0.5 text-[10px] text-[#8a98aa]">运行指标只读快照。</Text>
        </View>
        <Text className="text-[#8a98aa]">›</Text>
      </Pressable>

      <Pressable
        accessibilityLabel="知识库"
        accessibilityRole="button"
        className="flex-row items-center justify-between rounded-2xl border border-[#dce7f3] bg-white p-4 active:bg-[#f0f5fb]"
        onPress={onKnowledgePress}
      >
        <View className="flex-1">
          <Text className="text-sm font-black text-[#34445b]">知识库</Text>
          <Text className="mt-0.5 text-[10px] text-[#8a98aa]">浏览知识库与文档，只读视图。</Text>
        </View>
        <Text className="text-[#8a98aa]">›</Text>
      </Pressable>

      {user?.isAdmin ? (
        <View className="gap-2 rounded-2xl border border-[#dce7f3] bg-white p-2">
          <Text className="px-2 pb-1 pt-2 text-[10px] font-black text-[#8a98aa]">管理员工具</Text>
          {adminEntries.map((entry) => (
            <Pressable
              accessibilityLabel={entry.label}
              accessibilityRole="button"
              className="flex-row items-center justify-between rounded-xl px-3 py-3 active:bg-[#f0f5fb]"
              key={entry.key}
              onPress={entryHandlers[entry.key]}
            >
              <View className="flex-1">
                <Text className="text-sm font-black text-[#34445b]">{entry.label}</Text>
                <Text className="mt-0.5 text-[10px] text-[#8a98aa]">{entry.description}</Text>
              </View>
              <Text className="text-[#8a98aa]">›</Text>
            </Pressable>
          ))}
        </View>
      ) : null}

      <Pressable
        accessibilityLabel="退出登录"
        accessibilityRole="button"
        className="min-h-12 items-center justify-center rounded-2xl border border-[#f2d3d3] bg-white active:opacity-70"
        onPress={() => {
          void logout();
        }}
      >
        <Text className="text-sm font-black text-[#b91c1c]">退出登录</Text>
      </Pressable>
    </ScrollView>
  );
}
