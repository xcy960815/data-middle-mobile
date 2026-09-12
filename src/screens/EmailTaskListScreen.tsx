import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, Text, View } from 'react-native';

import { DmsApiError } from '@/features/auth/api-client';
import { fetchEmailTasks } from '@/features/log/log-api';
import type { EmailTaskItem } from '@/features/log/types';
import { formatDateTime } from '@/utils/format-date-time';

const taskStatusLabels: Record<string, string> = {
  pending: '待执行',
  running: '执行中',
  completed: '已完成',
  failed: '失败',
  cancelled: '已取消',
};

const taskTypeLabels: Record<string, string> = {
  scheduled: '定时任务',
  recurring: '重复任务',
};

const taskStatusColors: Record<string, { color: string; backgroundColor: string }> = {
  pending: { color: '#b45309', backgroundColor: '#fef3c7' },
  running: { color: '#2563eb', backgroundColor: '#e8f1ff' },
  completed: { color: '#15803d', backgroundColor: '#dcfce7' },
  failed: { color: '#b91c1c', backgroundColor: '#fee2e2' },
  cancelled: { color: '#718198', backgroundColor: '#edf1f6' },
};

/** 管理员视角的定时邮件任务列表（/api/email/task/list 为管理员端点）。 */
export function EmailTaskListScreen({
  onBackPress,
  onUnauthorized,
}: {
  onBackPress: () => void;
  onUnauthorized: (error: DmsApiError) => void | Promise<void>;
}) {
  const [tasks, setTasks] = useState<EmailTaskItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reloadVersion, setReloadVersion] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    let active = true;
    setIsLoading(true);
    setError(null);
    void fetchEmailTasks(controller.signal)
      .then((nextTasks) => {
        if (active) setTasks(nextTasks);
      })
      .catch(async (nextError: unknown) => {
        if (!active || controller.signal.aborted) return;
        setError(nextError instanceof Error ? nextError.message : '加载邮件任务失败。');
        if (
          nextError instanceof DmsApiError &&
          (nextError.status === 401 || nextError.code === 401)
        ) {
          await onUnauthorized(nextError);
        }
      })
      .finally(() => {
        if (active && !controller.signal.aborted) setIsLoading(false);
      });
    return () => {
      active = false;
      controller.abort();
    };
  }, [onUnauthorized, reloadVersion]);

  const reload = useCallback(() => setReloadVersion((version) => version + 1), []);

  return (
    <View className="flex-1 bg-[#f5f9fe]">
      <ScrollView contentContainerClassName="gap-3 px-[18px] pb-8 pt-[52px]">
        <View className="flex-row items-center gap-3">
          <Pressable accessibilityLabel="返回" accessibilityRole="button" onPress={onBackPress}>
            <Text className="text-3xl text-[#397cf0]">‹</Text>
          </Pressable>
          <View className="flex-1">
            <Text className="text-xl font-black text-[#253750]">邮件任务</Text>
            <Text className="mt-1 text-xs text-[#718198]">查看平台内的定时邮件发送任务。</Text>
          </View>
          <Pressable
            accessibilityLabel="刷新邮件任务"
            accessibilityRole="button"
            className="rounded-full border border-[#dce7f4] bg-white px-[11px] py-2"
            onPress={reload}
          >
            <Text className="text-[11px] font-extrabold text-[#60718a]">刷新</Text>
          </Pressable>
        </View>

        {isLoading ? (
          <ActivityIndicator color="#397cf0" />
        ) : error ? (
          <View className="items-center rounded-2xl border border-[#f1d4d4] bg-white p-8">
            <Text className="text-lg font-black text-[#34445b]">邮件任务加载失败</Text>
            <Text className="mt-2 text-center text-xs leading-5 text-[#7b8aa0]">{error}</Text>
            <Pressable
              accessibilityLabel="重新加载邮件任务"
              accessibilityRole="button"
              className="mt-5 rounded-xl bg-[#397cf0] px-5 py-3"
              onPress={reload}
            >
              <Text className="text-xs font-black text-white">重新加载</Text>
            </Pressable>
          </View>
        ) : tasks.length > 0 ? (
          tasks.map((task) => {
            const statusColor = taskStatusColors[task.status] ?? taskStatusColors.cancelled;
            return (
              <View
                className="gap-2 rounded-2xl border border-[#dce7f3] bg-white p-4"
                key={task.id}
              >
                <View className="flex-row items-start justify-between gap-2.5">
                  <View className="flex-1">
                    <Text numberOfLines={1} className="text-sm font-black text-[#34445b]">
                      {task.taskName}
                    </Text>
                    <Text className="mt-1 text-[10px] text-[#8a98aa]">
                      {taskTypeLabels[task.taskType] ?? task.taskType} · 创建人{' '}
                      {task.createdBy || '未知'} · 创建于 {formatDateTime(task.createdTime)}
                    </Text>
                  </View>
                  <View className="gap-1.5">
                    <View
                      className="rounded-full px-2 py-1"
                      style={{ backgroundColor: statusColor.backgroundColor }}
                    >
                      <Text className="text-[9px] font-black" style={{ color: statusColor.color }}>
                        {taskStatusLabels[task.status] ?? task.status}
                      </Text>
                    </View>
                    {task.isDisabled === 1 ? (
                      <View className="rounded-full bg-[#edf1f6] px-2 py-1">
                        <Text className="text-[9px] font-black text-[#718198]">已停用</Text>
                      </View>
                    ) : null}
                  </View>
                </View>
                {task.status === 'pending' && task.nextExecutionTime ? (
                  <Text className="text-[10px] text-[#7c8ca2]">
                    下次执行 {formatDateTime(task.nextExecutionTime)}
                  </Text>
                ) : null}
                {task.executedTime ? (
                  <Text className="text-[10px] text-[#7c8ca2]">
                    上次执行 {formatDateTime(task.executedTime)}
                  </Text>
                ) : null}
                {task.errorMessage ? (
                  <Text className="rounded-xl bg-[#fff7f7] px-3 py-2 text-[11px] leading-4 text-[#a64b4b]">
                    {task.errorMessage}
                  </Text>
                ) : null}
              </View>
            );
          })
        ) : (
          <View className="items-center rounded-2xl border border-[#dce7f3] bg-white p-8">
            <Text className="text-lg font-black text-[#2b3d57]">暂无邮件任务</Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}
