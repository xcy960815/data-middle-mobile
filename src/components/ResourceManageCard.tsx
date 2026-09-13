import { useCallback, useState } from 'react';
import { ActivityIndicator, Alert, Pressable, Switch, Text, TextInput, View } from 'react-native';

import {
  DmsApiError,
  getDmsErrorMessage,
  isUnauthorizedDmsError,
  notifyUnauthorized,
} from '@/features/auth/api-client';

type ManageToggle = {
  key: string;
  label: string;
  enabled: boolean;
  onToggle: (enabled: boolean) => Promise<void>;
};

type ResourceManageCardProps = {
  renameValue?: string;
  onRename?: (name: string) => Promise<void>;
  descValue?: string;
  onDescSave?: (desc: string) => Promise<void>;
  toggles?: ManageToggle[];
  /** 提供后展示删除入口，点击需确认。 */
  deleteLabel?: string;
  onDelete?: () => Promise<void>;
  onUnauthorized?: (error: DmsApiError) => void | Promise<void>;
};

/**
 * 详情页通用管理卡片：重命名、描述、开关与删除，操作失败弹提示并保持现场。
 *
 * 各区块按传入的取值与回调按需渲染；名称与描述保存前去除首尾空白，保存成功后退出
 * 编辑态。所有操作经统一流程执行：进行中禁用其他入口；失败时 401 会话失效转调
 * onUnauthorized，其余错误以系统弹窗展示错误消息，已填内容与编辑状态保持不变。
 *
 * @param {ResourceManageCardProps} props - 组件属性。
 * @param {string} [props.renameValue] - 当前名称；与 onRename 同时提供时展示名称区块。
 * @param {(name: string) => Promise<void>} [props.onRename] - 保存名称的回调，入参已去除首尾空白。
 * @param {string} [props.descValue] - 当前描述；与 onDescSave 同时提供时展示描述区块。
 * @param {(desc: string) => Promise<void>} [props.onDescSave] - 保存描述的回调，入参已去除首尾空白。
 * @param {ManageToggle[]} [props.toggles] - 开关配置列表，逐项渲染为 Switch。
 * @param {string} [props.deleteLabel] - 提供后展示删除入口，点击需确认；同时用作删除按钮
 *   的无障碍标签与确认弹窗的文案前缀。
 * @param {() => Promise<void>} [props.onDelete] - 确认删除后执行的回调。
 * @param {(error: DmsApiError) => void | Promise<void>} [props.onUnauthorized] - 操作遇到
 *   401 会话失效时回调，供上层处理登录跳转。
 * @returns {JSX.Element} 管理操作卡片。
 */
export function ResourceManageCard({
  renameValue,
  onRename,
  descValue,
  onDescSave,
  toggles,
  deleteLabel,
  onDelete,
  onUnauthorized,
}: ResourceManageCardProps) {
  const [busyKey, setBusyKey] = useState<string | null>(null);
  const [editingField, setEditingField] = useState<'name' | 'desc' | null>(null);
  const [draft, setDraft] = useState('');

  const run = useCallback(
    async (key: string, action: () => Promise<void>) => {
      if (busyKey) return;
      setBusyKey(key);
      try {
        await action();
      } catch (error) {
        if (isUnauthorizedDmsError(error)) {
          await notifyUnauthorized(onUnauthorized, error);
        } else {
          Alert.alert('操作失败', getDmsErrorMessage(error, '请稍后重试。'));
        }
      } finally {
        setBusyKey(null);
      }
    },
    [busyKey, onUnauthorized],
  );

  const beginEdit = useCallback((field: 'name' | 'desc', value: string) => {
    setEditingField(field);
    setDraft(value);
  }, []);

  const saveEdit = useCallback(
    (field: 'name' | 'desc') => {
      if (field === 'name' && onRename) {
        void run('name', async () => {
          await onRename(draft.trim());
          setEditingField(null);
        });
        return;
      }
      if (field === 'desc' && onDescSave) {
        void run('desc', async () => {
          await onDescSave(draft.trim());
          setEditingField(null);
        });
      }
    },
    [draft, onDescSave, onRename, run],
  );

  const confirmDelete = useCallback(() => {
    if (!onDelete || !deleteLabel) return;
    Alert.alert('确认删除', `${deleteLabel}？删除后不可恢复。`, [
      { text: '取消', style: 'cancel' },
      {
        text: '删除',
        style: 'destructive',
        onPress: () => {
          void run('delete', onDelete);
        },
      },
    ]);
  }, [deleteLabel, onDelete, run]);

  return (
    <View className="gap-3 rounded-2xl border border-[#dce7f3] bg-white p-4">
      <Text className="text-sm font-black text-[#425b7c]">管理操作</Text>

      {renameValue != null && onRename ? (
        <View className="gap-1.5">
          <Text className="text-xs font-bold text-[#687990]">名称</Text>
          {editingField === 'name' ? (
            <View className="gap-2">
              <TextInput
                accessibilityLabel="编辑名称"
                maxLength={100}
                onChangeText={setDraft}
                value={draft}
                className="min-h-[44px] rounded-xl border border-[#d8e4f2] bg-[#fafdff] px-3.5 text-sm text-[#263850]"
              />
              <View className="flex-row justify-end gap-2">
                <Pressable
                  accessibilityLabel="取消编辑名称"
                  accessibilityRole="button"
                  className="rounded-lg bg-[#edf1f6] px-3 py-2"
                  onPress={() => setEditingField(null)}
                >
                  <Text className="text-[10px] font-black text-[#62738b]">取消</Text>
                </Pressable>
                <Pressable
                  accessibilityLabel="保存名称"
                  accessibilityRole="button"
                  accessibilityState={{ busy: busyKey === 'name' }}
                  className="flex-row items-center gap-1.5 rounded-lg bg-[#397cf0] px-3 py-2"
                  disabled={busyKey != null}
                  onPress={() => saveEdit('name')}
                >
                  {busyKey === 'name' && <ActivityIndicator color="#ffffff" size="small" />}
                  <Text className="text-[10px] font-black text-white">保存</Text>
                </Pressable>
              </View>
            </View>
          ) : (
            <View className="flex-row items-center justify-between gap-2">
              <Text numberOfLines={1} className="flex-1 text-sm text-[#263850]">
                {renameValue}
              </Text>
              <Pressable
                accessibilityLabel="修改名称"
                accessibilityRole="button"
                className="rounded-lg bg-[#edf5ff] px-3 py-2"
                disabled={busyKey != null}
                onPress={() => beginEdit('name', renameValue)}
              >
                <Text className="text-[10px] font-black text-[#397cf0]">修改</Text>
              </Pressable>
            </View>
          )}
        </View>
      ) : null}

      {descValue != null && onDescSave ? (
        <View className="gap-1.5">
          <Text className="text-xs font-bold text-[#687990]">描述</Text>
          {editingField === 'desc' ? (
            <View className="gap-2">
              <TextInput
                accessibilityLabel="编辑描述"
                multiline
                maxLength={500}
                onChangeText={setDraft}
                value={draft}
                className="min-h-[72px] rounded-xl border border-[#d8e4f2] bg-[#fafdff] px-3.5 py-2.5 text-sm text-[#263850]"
              />
              <View className="flex-row justify-end gap-2">
                <Pressable
                  accessibilityLabel="取消编辑描述"
                  accessibilityRole="button"
                  className="rounded-lg bg-[#edf1f6] px-3 py-2"
                  onPress={() => setEditingField(null)}
                >
                  <Text className="text-[10px] font-black text-[#62738b]">取消</Text>
                </Pressable>
                <Pressable
                  accessibilityLabel="保存描述"
                  accessibilityRole="button"
                  accessibilityState={{ busy: busyKey === 'desc' }}
                  className="flex-row items-center gap-1.5 rounded-lg bg-[#397cf0] px-3 py-2"
                  disabled={busyKey != null}
                  onPress={() => saveEdit('desc')}
                >
                  {busyKey === 'desc' && <ActivityIndicator color="#ffffff" size="small" />}
                  <Text className="text-[10px] font-black text-white">保存</Text>
                </Pressable>
              </View>
            </View>
          ) : (
            <View className="flex-row items-center justify-between gap-2">
              <Text numberOfLines={2} className="flex-1 text-sm text-[#263850]">
                {descValue || '暂无描述'}
              </Text>
              <Pressable
                accessibilityLabel="修改描述"
                accessibilityRole="button"
                className="rounded-lg bg-[#edf5ff] px-3 py-2"
                disabled={busyKey != null}
                onPress={() => beginEdit('desc', descValue)}
              >
                <Text className="text-[10px] font-black text-[#397cf0]">修改</Text>
              </Pressable>
            </View>
          )}
        </View>
      ) : null}

      {toggles?.map((toggle) => (
        <View className="flex-row items-center justify-between gap-2" key={toggle.key}>
          <Text className="text-sm text-[#263850]">{toggle.label}</Text>
          <Switch
            accessibilityLabel={toggle.label}
            disabled={busyKey != null}
            value={toggle.enabled}
            onValueChange={(next) => {
              void run(toggle.key, () => toggle.onToggle(next));
            }}
          />
        </View>
      ))}

      {onDelete && deleteLabel ? (
        <Pressable
          accessibilityLabel={deleteLabel}
          accessibilityRole="button"
          accessibilityState={{ busy: busyKey === 'delete' }}
          className="min-h-11 flex-row items-center justify-center gap-2 rounded-xl border border-[#f2d3d3] bg-white active:opacity-70 disabled:opacity-50"
          disabled={busyKey != null}
          onPress={confirmDelete}
        >
          {busyKey === 'delete' && <ActivityIndicator color="#b91c1c" size="small" />}
          <Text className="text-xs font-black text-[#b91c1c]">删除</Text>
        </Pressable>
      ) : null}
    </View>
  );
}
