import { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from 'react-native';

import { DmsApiError } from '@/features/auth/api-client';
import { registerWithDms } from '@/features/auth/auth-api';
import type { RegisterCredentials } from '@/features/auth/types';

/** 注册页属性。 */
type Props = {
  onBackPress: () => void;
  onRegistered: () => void;
};

function validateCredentials(credentials: RegisterCredentials): string | null {
  if (!/^\w{4,20}$/.test(credentials.userName)) {
    return '用户名必须是 4-20 位字母、数字或下划线';
  }
  if (!credentials.displayName.trim()) {
    return '展示名称不能为空';
  }
  if (credentials.password.length < 8) {
    return '密码至少 8 位';
  }
  if (credentials.password !== credentials.confirmPassword) {
    return '两次输入的密码不一致';
  }
  return null;
}

/**
 * 自助注册：成功后不建立会话，引导用户回登录页。
 *
 * 提交前在本地校验用户名格式、展示名称、密码长度与两次密码一致性，邮箱与手机号选填；
 * 注册成功弹窗提示后回调 onRegistered，失败时在表单内展示错误信息。
 *
 * @param {Props} props - 页面属性。
 * @param {() => void} props.onBackPress - 点击“已有账号？返回登录”的回调，用于返回登录页。
 * @param {() => void} props.onRegistered - 注册成功后的回调，用于跳转登录页。
 * @returns {JSX.Element} 注册页。
 */
export function RegisterScreen({ onBackPress, onRegistered }: Props) {
  const [userName, setUserName] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [email, setEmail] = useState('');
  const [mobile, setMobile] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = () => {
    if (isSubmitting) return;
    const credentials: RegisterCredentials = {
      userName: userName.trim(),
      displayName: displayName.trim(),
      password,
      confirmPassword,
      email: email.trim(),
      mobile: mobile.trim(),
    };
    const validationError = validateCredentials(credentials);
    if (validationError) {
      setError(validationError);
      return;
    }
    setError(null);
    setIsSubmitting(true);
    void registerWithDms(credentials)
      .then(() => {
        Alert.alert('注册成功', '请使用新账号登录。');
        onRegistered();
      })
      .catch((registerError: unknown) => {
        setError(
          registerError instanceof DmsApiError && registerError.message
            ? registerError.message
            : '注册失败，请稍后重试。',
        );
      })
      .finally(() => setIsSubmitting(false));
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      className="flex-1 bg-[#f5f9fe]"
    >
      <ScrollView
        contentContainerClassName="justify-center gap-4 px-[22px] pb-10 pt-[64px]"
        keyboardShouldPersistTaps="handled"
      >
        <View className="gap-1.5">
          <Text className="text-3xl font-black tracking-[-1px] text-[#172033]">创建账号</Text>
          <Text className="text-sm text-[#687990]">注册后使用新账号登录数据中台。</Text>
        </View>

        <View className="gap-3 rounded-2xl border border-[#dce7f4] bg-white p-5">
          <View className="gap-1.5">
            <Text className="text-xs font-black text-[#425b7c]">用户名</Text>
            <TextInput
              accessibilityLabel="用户名"
              autoCapitalize="none"
              onChangeText={setUserName}
              placeholder="4-20 位字母、数字或下划线"
              placeholderTextColor="#91a0b4"
              value={userName}
              className="min-h-[46px] rounded-xl border border-[#d8e4f2] bg-[#fafdff] px-3.5 text-sm text-[#263850]"
            />
          </View>
          <View className="gap-1.5">
            <Text className="text-xs font-black text-[#425b7c]">展示名称</Text>
            <TextInput
              accessibilityLabel="展示名称"
              onChangeText={setDisplayName}
              placeholder="请输入展示名称"
              placeholderTextColor="#91a0b4"
              value={displayName}
              className="min-h-[46px] rounded-xl border border-[#d8e4f2] bg-[#fafdff] px-3.5 text-sm text-[#263850]"
            />
          </View>
          <View className="gap-1.5">
            <Text className="text-xs font-black text-[#425b7c]">密码</Text>
            <TextInput
              accessibilityLabel="密码"
              autoCapitalize="none"
              onChangeText={setPassword}
              placeholder="至少 8 位"
              placeholderTextColor="#91a0b4"
              secureTextEntry
              value={password}
              className="min-h-[46px] rounded-xl border border-[#d8e4f2] bg-[#fafdff] px-3.5 text-sm text-[#263850]"
            />
          </View>
          <View className="gap-1.5">
            <Text className="text-xs font-black text-[#425b7c]">确认密码</Text>
            <TextInput
              accessibilityLabel="确认密码"
              autoCapitalize="none"
              onChangeText={setConfirmPassword}
              placeholder="请再次输入密码"
              placeholderTextColor="#91a0b4"
              secureTextEntry
              value={confirmPassword}
              className="min-h-[46px] rounded-xl border border-[#d8e4f2] bg-[#fafdff] px-3.5 text-sm text-[#263850]"
            />
          </View>
          <View className="gap-1.5">
            <Text className="text-xs font-black text-[#425b7c]">邮箱（选填）</Text>
            <TextInput
              accessibilityLabel="邮箱"
              autoCapitalize="none"
              keyboardType="email-address"
              onChangeText={setEmail}
              placeholder="选填"
              placeholderTextColor="#91a0b4"
              value={email}
              className="min-h-[46px] rounded-xl border border-[#d8e4f2] bg-[#fafdff] px-3.5 text-sm text-[#263850]"
            />
          </View>
          <View className="gap-1.5">
            <Text className="text-xs font-black text-[#425b7c]">手机号（选填）</Text>
            <TextInput
              accessibilityLabel="手机号"
              keyboardType="phone-pad"
              onChangeText={setMobile}
              placeholder="选填"
              placeholderTextColor="#91a0b4"
              value={mobile}
              className="min-h-[46px] rounded-xl border border-[#d8e4f2] bg-[#fafdff] px-3.5 text-sm text-[#263850]"
            />
          </View>

          {error ? (
            <Text accessibilityLiveRegion="assertive" className="text-xs text-[#a64b4b]">
              {error}
            </Text>
          ) : null}

          <Pressable
            accessibilityLabel="提交注册"
            accessibilityRole="button"
            accessibilityState={{ busy: isSubmitting, disabled: isSubmitting }}
            className="min-h-[52px] flex-row items-center justify-center gap-2 rounded-xl bg-[#397cf0] active:opacity-80 disabled:opacity-60"
            disabled={isSubmitting}
            onPress={submit}
          >
            {isSubmitting && <ActivityIndicator color="#ffffff" size="small" />}
            <Text className="text-sm font-black text-white">
              {isSubmitting ? '正在提交注册...' : '注册'}
            </Text>
          </Pressable>
          <Pressable
            accessibilityLabel="返回登录"
            accessibilityRole="button"
            className="min-h-[44px] items-center justify-center"
            onPress={onBackPress}
          >
            <Text className="text-xs font-extrabold text-[#60718a]">已有账号？返回登录</Text>
          </Pressable>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
