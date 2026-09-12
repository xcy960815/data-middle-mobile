import { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Switch,
  Text,
  TextInput,
  View,
} from 'react-native';

import {
  DmsApiError,
  getDmsErrorMessage,
  isUnauthorizedDmsError,
} from '@/features/auth/api-client';
import {
  createDataSource,
  deleteDataSource,
  fetchDataSourceDetail,
  testDataSourceConnection,
  updateDataSource,
} from '@/features/data-source/data-source-api';
import type { DataSourceListItem } from '@/features/data-source/types';

type Props = {
  /** 传入即为编辑模式；密码留空表示沿用原密码。 */
  dataSourceId?: number;
  onBackPress: () => void;
  onUnauthorized: (error: DmsApiError) => void | Promise<void>;
};

type FormState = {
  sourceName: string;
  sourceDesc: string;
  sourceType: 'mysql' | 'postgresql';
  connectionMode: 'managed' | 'dedicated';
  runtimeSourceName: string;
  databaseName: string;
  host: string;
  port: string;
  username: string;
  password: string;
  isDisable: 0 | 1;
};

const INITIAL_FORM: FormState = {
  sourceName: '',
  sourceDesc: '',
  sourceType: 'mysql',
  connectionMode: 'managed',
  runtimeSourceName: '',
  databaseName: '',
  host: '',
  port: '',
  username: '',
  password: '',
  isDisable: 0,
};

const sourceTypeOptions: readonly { value: FormState['sourceType']; label: string }[] = [
  { value: 'mysql', label: 'MySQL' },
  { value: 'postgresql', label: 'PostgreSQL' },
];

const connectionModeOptions: readonly { value: FormState['connectionMode']; label: string }[] = [
  { value: 'managed', label: '平台托管' },
  { value: 'dedicated', label: '自建连接' },
];

const inputClassName =
  'min-h-[46px] rounded-xl border border-[#d8e4f2] bg-[#fafdff] px-3.5 text-sm text-[#263850]';

function validateForm(form: FormState, isEdit: boolean): string | null {
  if (!form.sourceName.trim()) return '数据源名称不能为空';
  if (!form.runtimeSourceName.trim()) return '运行时数据源名称不能为空';
  if (form.connectionMode === 'managed') {
    if (form.host.trim() || form.port.trim() || form.username.trim() || form.password.trim()) {
      return '平台托管模式不需要填写主机、端口、用户名和密码';
    }
    return null;
  }
  if (!form.host.trim() || !form.port.trim() || !form.username.trim()) {
    return '自建连接需要填写主机、端口和用户名';
  }
  const port = Number(form.port.trim());
  if (!Number.isInteger(port) || port < 1 || port > 65535) return '端口必须是 1-65535 的整数';
  if (!isEdit && !form.password.trim()) return '自建连接创建时必须填写密码';
  return null;
}

/** 数据源新建/编辑表单：连接字段与 PC 端相同的完整性约束，创建/更新/测试均为 SM2 加密请求。 */
export function DataSourceFormScreen({ dataSourceId, onBackPress, onUnauthorized }: Props) {
  const isEdit = dataSourceId != null;
  const [form, setForm] = useState<FormState>(INITIAL_FORM);
  const [isLoading, setIsLoading] = useState(isEdit);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isEdit) return;
    const controller = new AbortController();
    let active = true;
    setIsLoading(true);
    void fetchDataSourceDetail(dataSourceId, controller.signal)
      .then((detail: DataSourceListItem) => {
        if (!active) return;
        setForm({
          sourceName: detail.sourceName,
          sourceDesc: detail.sourceDesc,
          sourceType: detail.sourceType,
          connectionMode: detail.connectionMode,
          runtimeSourceName: detail.runtimeSourceName,
          databaseName: detail.databaseName || '',
          host: detail.host || '',
          port: detail.port != null ? String(detail.port) : '',
          username: detail.username || '',
          password: '',
          isDisable: detail.isDisable,
        });
      })
      .catch(async (loadError: unknown) => {
        if (!active || controller.signal.aborted) return;
        setError(getDmsErrorMessage(loadError, '加载数据源失败。'));
        if (isUnauthorizedDmsError(loadError)) {
          await onUnauthorized(loadError);
        }
      })
      .finally(() => {
        if (active && !controller.signal.aborted) setIsLoading(false);
      });
    return () => {
      active = false;
      controller.abort();
    };
  }, [dataSourceId, isEdit, onUnauthorized]);

  const updateField = useCallback(<K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm((current) => ({ ...current, [key]: value }));
  }, []);

  const buildConnectionPayload = useCallback(
    () => ({
      sourceType: form.sourceType,
      connectionMode: form.connectionMode,
      runtimeSourceName: form.runtimeSourceName.trim(),
      ...(form.databaseName.trim() ? { databaseName: form.databaseName.trim() } : {}),
      ...(form.connectionMode === 'dedicated'
        ? {
            host: form.host.trim(),
            port: Number(form.port.trim()),
            username: form.username.trim(),
            ...(form.password.trim() ? { password: form.password.trim() } : {}),
          }
        : {}),
    }),
    [form],
  );

  const runAction = useCallback(
    async (key: string, action: () => Promise<void>) => {
      const validationError = validateForm(form, isEdit);
      if (validationError) {
        setError(validationError);
        return;
      }
      setError(null);
      if (key === 'save') setIsSubmitting(true);
      else setIsTesting(true);
      try {
        await action();
      } catch (actionError) {
        if (isUnauthorizedDmsError(actionError)) {
          await onUnauthorized(actionError);
        } else {
          setError(getDmsErrorMessage(actionError, '操作失败，请稍后重试。'));
        }
      } finally {
        if (key === 'save') setIsSubmitting(false);
        else setIsTesting(false);
      }
    },
    [form, isEdit, onUnauthorized],
  );

  const handleTest = () => {
    void runAction('test', async () => {
      await testDataSourceConnection({
        ...(isEdit ? { id: dataSourceId } : {}),
        ...buildConnectionPayload(),
      });
      Alert.alert('连接成功', '数据源连接测试通过。');
    });
  };

  const handleSave = () => {
    void runAction('save', async () => {
      const commonPayload = {
        sourceName: form.sourceName.trim(),
        ...(form.sourceDesc.trim() ? { sourceDesc: form.sourceDesc.trim() } : {}),
        isDisable: form.isDisable,
      };
      if (isEdit) {
        await updateDataSource({ id: dataSourceId, ...commonPayload, ...buildConnectionPayload() });
      } else {
        await createDataSource({ ...commonPayload, ...buildConnectionPayload() });
      }
      onBackPress();
    });
  };

  const confirmDelete = useCallback(() => {
    if (!isEdit) return;
    Alert.alert('确认删除', `删除数据源「${form.sourceName}」？删除后不可恢复。`, [
      { text: '取消', style: 'cancel' },
      {
        text: '删除',
        style: 'destructive',
        onPress: () => {
          void runAction('delete', async () => {
            await deleteDataSource(dataSourceId);
            onBackPress();
          });
        },
      },
    ]);
  }, [dataSourceId, form.sourceName, isEdit, onBackPress, runAction]);

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      className="flex-1 bg-[#f5f9fe]"
    >
      <ScrollView
        contentContainerClassName="gap-4 px-[18px] pb-10 pt-[52px]"
        keyboardShouldPersistTaps="handled"
      >
        <View className="flex-row items-center gap-3">
          <Pressable
            accessibilityLabel="返回数据源列表"
            accessibilityRole="button"
            onPress={onBackPress}
          >
            <Text className="text-3xl text-[#397cf0]">‹</Text>
          </Pressable>
          <Text className="text-xl font-black text-[#253750]">
            {isEdit ? '编辑数据源' : '新建数据源'}
          </Text>
        </View>

        {isLoading ? (
          <ActivityIndicator color="#397cf0" />
        ) : (
          <>
            <View className="gap-3 rounded-2xl border border-[#dce7f3] bg-white p-4">
              <View className="gap-1.5">
                <Text className="text-xs font-black text-[#425b7c]">名称</Text>
                <TextInput
                  accessibilityLabel="数据源名称"
                  maxLength={100}
                  onChangeText={(value) => updateField('sourceName', value)}
                  placeholder="请输入数据源名称"
                  placeholderTextColor="#91a0b4"
                  value={form.sourceName}
                  className={inputClassName}
                />
              </View>
              <View className="gap-1.5">
                <Text className="text-xs font-black text-[#425b7c]">描述</Text>
                <TextInput
                  accessibilityLabel="数据源描述"
                  multiline
                  onChangeText={(value) => updateField('sourceDesc', value)}
                  placeholder="选填"
                  placeholderTextColor="#91a0b4"
                  value={form.sourceDesc}
                  className="min-h-[64px] rounded-xl border border-[#d8e4f2] bg-[#fafdff] px-3.5 py-2.5 text-sm text-[#263850]"
                />
              </View>

              <View className="gap-1.5">
                <Text className="text-xs font-black text-[#425b7c]">类型</Text>
                <View className="flex-row gap-2">
                  {sourceTypeOptions.map((option) => {
                    const isActive = form.sourceType === option.value;
                    return (
                      <Pressable
                        accessibilityLabel={`数据源类型：${option.label}`}
                        accessibilityRole="button"
                        accessibilityState={{ selected: isActive }}
                        className={`min-h-10 flex-1 items-center justify-center rounded-xl border px-3 ${
                          isActive ? 'border-[#397cf0] bg-[#397cf0]' : 'border-[#dbe6f3] bg-white'
                        }`}
                        key={option.value}
                        onPress={() => updateField('sourceType', option.value)}
                      >
                        <Text
                          className={`text-xs font-extrabold ${isActive ? 'text-white' : 'text-[#62738b]'}`}
                        >
                          {option.label}
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>
              </View>

              <View className="gap-1.5">
                <Text className="text-xs font-black text-[#425b7c]">连接模式</Text>
                <View className="flex-row gap-2">
                  {connectionModeOptions.map((option) => {
                    const isActive = form.connectionMode === option.value;
                    return (
                      <Pressable
                        accessibilityLabel={`连接模式：${option.label}`}
                        accessibilityRole="button"
                        accessibilityState={{ selected: isActive }}
                        className={`min-h-10 flex-1 items-center justify-center rounded-xl border px-3 ${
                          isActive ? 'border-[#397cf0] bg-[#397cf0]' : 'border-[#dbe6f3] bg-white'
                        }`}
                        key={option.value}
                        onPress={() => updateField('connectionMode', option.value)}
                      >
                        <Text
                          className={`text-xs font-extrabold ${isActive ? 'text-white' : 'text-[#62738b]'}`}
                        >
                          {option.label}
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>
              </View>

              <View className="gap-1.5">
                <Text className="text-xs font-black text-[#425b7c]">运行时名称</Text>
                <TextInput
                  accessibilityLabel="运行时数据源名称"
                  maxLength={100}
                  onChangeText={(value) => updateField('runtimeSourceName', value)}
                  placeholder="请输入运行时数据源名称"
                  placeholderTextColor="#91a0b4"
                  value={form.runtimeSourceName}
                  className={inputClassName}
                />
              </View>
              <View className="gap-1.5">
                <Text className="text-xs font-black text-[#425b7c]">数据库名</Text>
                <TextInput
                  accessibilityLabel="数据库名"
                  autoCapitalize="none"
                  onChangeText={(value) => updateField('databaseName', value)}
                  placeholder="选填"
                  placeholderTextColor="#91a0b4"
                  value={form.databaseName}
                  className={inputClassName}
                />
              </View>
            </View>

            {form.connectionMode === 'dedicated' ? (
              <View className="gap-3 rounded-2xl border border-[#dce7f3] bg-white p-4">
                <Text className="text-xs font-black text-[#425b7c]">自建连接</Text>
                <View className="gap-1.5">
                  <Text className="text-xs font-bold text-[#687990]">主机地址</Text>
                  <TextInput
                    accessibilityLabel="主机地址"
                    autoCapitalize="none"
                    onChangeText={(value) => updateField('host', value)}
                    placeholder="例如 192.168.1.10"
                    placeholderTextColor="#91a0b4"
                    value={form.host}
                    className={inputClassName}
                  />
                </View>
                <View className="gap-1.5">
                  <Text className="text-xs font-bold text-[#687990]">端口</Text>
                  <TextInput
                    accessibilityLabel="端口"
                    keyboardType="number-pad"
                    onChangeText={(value) => updateField('port', value)}
                    placeholder="例如 3306"
                    placeholderTextColor="#91a0b4"
                    value={form.port}
                    className={inputClassName}
                  />
                </View>
                <View className="gap-1.5">
                  <Text className="text-xs font-bold text-[#687990]">用户名</Text>
                  <TextInput
                    accessibilityLabel="连接用户名"
                    autoCapitalize="none"
                    onChangeText={(value) => updateField('username', value)}
                    placeholder="连接用户名"
                    placeholderTextColor="#91a0b4"
                    value={form.username}
                    className={inputClassName}
                  />
                </View>
                <View className="gap-1.5">
                  <Text className="text-xs font-bold text-[#687990]">
                    密码{isEdit ? '（留空表示沿用原密码）' : ''}
                  </Text>
                  <TextInput
                    accessibilityLabel="连接密码"
                    autoCapitalize="none"
                    onChangeText={(value) => updateField('password', value)}
                    placeholder={isEdit ? '留空沿用原密码' : '连接密码'}
                    placeholderTextColor="#91a0b4"
                    secureTextEntry
                    value={form.password}
                    className={inputClassName}
                  />
                </View>
              </View>
            ) : null}

            <View className="flex-row items-center justify-between rounded-2xl border border-[#dce7f3] bg-white p-4">
              <Text className="text-sm font-black text-[#34445b]">启用数据源</Text>
              <Switch
                accessibilityLabel="启用数据源"
                value={form.isDisable === 0}
                onValueChange={(next) => updateField('isDisable', next ? 0 : 1)}
              />
            </View>

            {error ? (
              <Text accessibilityLiveRegion="assertive" className="text-xs text-[#a64b4b]">
                {error}
              </Text>
            ) : null}

            <View className="gap-2.5">
              <Pressable
                accessibilityLabel="保存数据源"
                accessibilityRole="button"
                accessibilityState={{ busy: isSubmitting }}
                className="min-h-[52px] flex-row items-center justify-center gap-2 rounded-xl bg-[#397cf0] active:opacity-80 disabled:opacity-60"
                disabled={isSubmitting || isTesting}
                onPress={handleSave}
              >
                {isSubmitting && <ActivityIndicator color="#ffffff" size="small" />}
                <Text className="text-sm font-black text-white">
                  {isSubmitting ? '正在保存...' : isEdit ? '保存修改' : '创建数据源'}
                </Text>
              </Pressable>
              <Pressable
                accessibilityLabel="测试连接"
                accessibilityRole="button"
                accessibilityState={{ busy: isTesting }}
                className="min-h-[52px] flex-row items-center justify-center gap-2 rounded-xl border border-[#d8e4f2] bg-white active:opacity-70 disabled:opacity-60"
                disabled={isSubmitting || isTesting}
                onPress={handleTest}
              >
                {isTesting && <ActivityIndicator color="#397cf0" size="small" />}
                <Text className="text-sm font-black text-[#397cf0]">
                  {isTesting ? '正在测试...' : '测试连接'}
                </Text>
              </Pressable>
              {isEdit ? (
                <Pressable
                  accessibilityLabel="删除数据源"
                  accessibilityRole="button"
                  className="min-h-[48px] items-center justify-center rounded-xl border border-[#f2d3d3] bg-white active:opacity-70"
                  onPress={confirmDelete}
                >
                  <Text className="text-xs font-black text-[#b91c1c]">删除数据源</Text>
                </Pressable>
              ) : null}
            </View>
          </>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
