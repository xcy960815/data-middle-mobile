import { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  useWindowDimensions,
  View,
} from 'react-native';

import { BrandMark } from '../components/BrandMark';
import { WorkspacePreview } from '../components/WorkspacePreview';

type LoginScreenProps = {
  onBackPress: () => void;
  onLogin: (credentials: { userName: string; password: string }) => Promise<void>;
};

export function LoginScreen({ onBackPress, onLogin }: LoginScreenProps) {
  const [userName, setUserName] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { width } = useWindowDimensions();
  const isWide = width >= 840;

  const handleLogin = async () => {
    if (isSubmitting) {
      return;
    }

    if (!userName.trim() || !password) {
      setError('请输入账号和密码');
      return;
    }

    setIsSubmitting(true);
    setError('');
    try {
      await onLogin({ userName: userName.trim(), password });
    } catch (loginError) {
      setError(loginError instanceof Error ? loginError.message : '登录失败，请稍后重试。');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      className="flex-1 bg-[#f8fbff]"
    >
      <View
        pointerEvents="none"
        className="absolute left-0 right-0 top-0 h-[400px] border border-[#dce8f7] opacity-65"
      />
      <View
        pointerEvents="none"
        className="absolute -right-[180px] -top-[140px] h-[430px] w-[430px] rounded-[350px] bg-[#d7efff] opacity-[0.73]"
      />
      <View
        pointerEvents="none"
        className="absolute -left-[140px] bottom-[90px] h-[240px] w-[240px] rounded-[220px] bg-[#d9f6f7] opacity-65"
      />
      <ScrollView
        contentContainerClassName="grow pb-[30px]"
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View
          className={`flex-row items-center justify-between px-5 pt-[58px] ${
            isWide ? 'w-full max-w-[1120px] self-center px-7' : ''
          }`}
        >
          <BrandMark onPress={onBackPress} />
          <Pressable
            accessibilityRole="button"
            className="flex-row items-center gap-1.5 p-1.5 active:opacity-70"
            onPress={onBackPress}
          >
            <Text className="text-lg text-[#4a7fe8]">←</Text>
            <Text className="text-xs font-extrabold text-[#526781]">返回产品首页</Text>
          </Pressable>
        </View>

        <View
          className={`gap-[35px] px-5 pt-[54px] ${
            isWide ? 'w-full max-w-[1120px] flex-row self-center px-7 pt-[74px]' : ''
          }`}
        >
          <View className={`gap-[18px] ${isWide ? 'flex-[1.15] pt-[15px]' : ''}`}>
            <Text className="text-[10px] font-extrabold tracking-[1.1px] text-[#52647f]">
              <Text className="text-[#4d9df7]">●</Text> SECURE ANALYTICS WORKSPACE
            </Text>
            <Text className="mt-px text-[39px] font-black leading-[49px] tracking-[-1.6px] text-[#172033]">
              欢迎回到{`\n`}
              <Text className="text-[#4c80ed]">数据工作台</Text>
            </Text>
            <Text className="max-w-[510px] text-sm leading-[23px] text-[#697990]">
              在统一的数据语义和权限体系中，继续你的分析探索、看板构建与业务决策。
            </Text>
            <WorkspacePreview compact={!isWide} />
            <View className="flex-row flex-wrap gap-[13px]">
              <Signal label="统一数据集" />
              <Signal label="可视化分析" />
              <Signal label="协作式看板" />
            </View>
          </View>

          <View className="flex-[0.85] items-center">
            <View className="w-full max-w-[430px] rounded-[20px] border border-[#dbe6f3] bg-white p-[25px] shadow-2xl shadow-slate-500/20">
              <Text className="text-[10px] font-black tracking-[1.1px] text-[#4c86f0]">
                WELCOME BACK
              </Text>
              <Text className="mt-2 text-[25px] font-black text-[#1f2d43]">登录数据中台</Text>
              <Text className="mt-1.5 text-[13px] text-[#7b899e]">使用你的平台账号继续工作</Text>

              <View className="mt-[27px] gap-4">
                <View className="gap-[7px]">
                  <Text className="text-[13px] font-extrabold text-[#40516a]">用户名</Text>
                  <View className="min-h-[49px] flex-row items-center gap-[9px] rounded-[11px] border border-[#dbe6f3] bg-[#f8fbff] px-[13px]">
                    <Text className="text-[15px] text-[#6e9de7]">◉</Text>
                    <TextInput
                      accessibilityLabel="用户名"
                      autoCapitalize="none"
                      autoComplete="username"
                      editable={!isSubmitting}
                      onChangeText={(value) => {
                        setUserName(value);
                        setError('');
                      }}
                      placeholder="请输入用户名"
                      placeholderTextColor="#a4b1c2"
                      className="flex-1 py-[11px] text-sm text-[#263850]"
                      textContentType="username"
                      value={userName}
                    />
                  </View>
                </View>

                <View className="gap-[7px]">
                  <Text className="text-[13px] font-extrabold text-[#40516a]">密码</Text>
                  <View className="min-h-[49px] flex-row items-center gap-[9px] rounded-[11px] border border-[#dbe6f3] bg-[#f8fbff] px-[13px]">
                    <Text className="text-[15px] text-[#6e9de7]">⌑</Text>
                    <TextInput
                      accessibilityLabel="密码"
                      autoComplete="current-password"
                      onChangeText={(value) => {
                        setPassword(value);
                        setError('');
                      }}
                      editable={!isSubmitting}
                      onSubmitEditing={() => void handleLogin()}
                      placeholder="请输入密码"
                      placeholderTextColor="#a4b1c2"
                      returnKeyType="go"
                      secureTextEntry={!showPassword}
                      className="flex-1 py-[11px] text-sm text-[#263850]"
                      textContentType="password"
                      value={password}
                    />
                    <Pressable
                      accessibilityLabel={showPassword ? '隐藏密码' : '显示密码'}
                      onPress={() => setShowPassword((value) => !value)}
                      hitSlop={10}
                    >
                      <Text className="text-[17px] text-[#7a8da8]">{showPassword ? '◉' : '○'}</Text>
                    </Pressable>
                  </View>
                </View>

                <Text
                  accessibilityLiveRegion="polite"
                  className={`min-h-4 text-xs ${error ? 'text-[#dd5555]' : 'text-transparent'}`}
                >
                  {error || '占位'}
                </Text>
                <Pressable
                  accessibilityRole="button"
                  accessibilityState={{ busy: isSubmitting, disabled: isSubmitting }}
                  className={`flex-row items-center justify-between rounded-xl bg-[#3f7ff2] px-[17px] py-[15px] shadow-lg shadow-blue-500/30 active:opacity-85 ${
                    isSubmitting ? 'opacity-60' : ''
                  }`}
                  disabled={isSubmitting}
                  onPress={() => void handleLogin()}
                >
                  <Text className="text-sm font-black text-white">
                    {isSubmitting ? '正在验证登录环境…' : '登录并进入平台'}
                  </Text>
                  <Text className="text-xl text-[#dceaff]">→</Text>
                </Pressable>
              </View>

              <View className="mt-[23px] flex-row items-center gap-2.5 rounded-[11px] bg-[#f4f9ff] p-[11px]">
                <View className="h-[30px] w-[30px] items-center justify-center rounded-lg bg-[#dceeff]">
                  <Text className="text-[15px] text-[#3f7ce2]">⌑</Text>
                </View>
                <View>
                  <Text className="text-[11px] font-black text-[#3a4b64]">安全登录保护</Text>
                  <Text className="mt-[3px] text-[9px] text-[#7b8ba1]">
                    SM2 密码加密 · 设备环境校验 · 安全会话
                  </Text>
                </View>
              </View>
              <Text className="mt-5 text-center text-xs text-[#7c8ba0]">
                没有账号？<Text className="font-black text-[#397ceb]">去注册</Text>
              </Text>
            </View>
            <Text className="mt-4 text-center text-[10px] text-[#8a98ab]">
              登录即代表你正在访问受保护的数据分析工作区
            </Text>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

function Signal({ label }: { label: string }) {
  return (
    <View className="flex-row items-center gap-[5px]">
      <View className="h-[5px] w-[5px] rounded-full bg-[#36ba85]" />
      <Text className="text-[10px] font-bold text-[#72829a]">{label}</Text>
    </View>
  );
}
