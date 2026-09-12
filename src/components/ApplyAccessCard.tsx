import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, Text, TextInput, View } from 'react-native';

import {
  DmsApiError,
  getDmsErrorMessage,
  isUnauthorizedDmsError,
} from '@/features/auth/api-client';
import {
  createAccessApply,
  fetchAccessApplyStatus,
} from '@/features/notification/notification-api';
import type {
  AccessApplyStatusResponse,
  NotificationResourceType,
} from '@/features/notification/types';

type Props = {
  resourceType: NotificationResourceType;
  resourceId: number;
  onUnauthorized?: (error: DmsApiError) => void | Promise<void>;
};

const statusMeta: Record<
  AccessApplyStatusResponse['status'],
  { label: string; color: string; backgroundColor: string }
> = {
  none: { label: '未申请', color: '#718198', backgroundColor: '#edf1f6' },
  pending: { label: '审批中', color: '#b45309', backgroundColor: '#fef3c7' },
  approved: { label: '已通过', color: '#15803d', backgroundColor: '#dcfce7' },
  rejected: { label: '已拒绝', color: '#b91c1c', backgroundColor: '#fee2e2' },
};

/** 403 详情页的权限申请卡片：展示当前申请状态，未申请时可直接提交申请。 */
export function ApplyAccessCard({ resourceType, resourceId, onUnauthorized }: Props) {
  const [status, setStatus] = useState<AccessApplyStatusResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [applyReason, setApplyReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [reloadVersion, setReloadVersion] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    let active = true;
    setIsLoading(true);
    setLoadError(null);
    void fetchAccessApplyStatus(resourceType, resourceId, controller.signal)
      .then((nextStatus) => {
        if (active) setStatus(nextStatus);
      })
      .catch((error: unknown) => {
        if (!active || controller.signal.aborted) return;
        setLoadError(getDmsErrorMessage(error, '查询申请状态失败。'));
        if (isUnauthorizedDmsError(error)) {
          void onUnauthorized?.(error);
        }
      })
      .finally(() => {
        if (active && !controller.signal.aborted) setIsLoading(false);
      });
    return () => {
      active = false;
      controller.abort();
    };
  }, [onUnauthorized, resourceId, resourceType, reloadVersion]);

  const submitApply = useCallback(() => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    setSubmitError(null);
    void createAccessApply({ resourceType, resourceId, applyReason: applyReason.trim() })
      .then((nextStatus) => {
        setStatus(nextStatus);
        setApplyReason('');
      })
      .catch((error: unknown) => {
        setSubmitError(getDmsErrorMessage(error, '提交申请失败。'));
        if (isUnauthorizedDmsError(error)) {
          void onUnauthorized?.(error);
        }
      })
      .finally(() => setIsSubmitting(false));
  }, [applyReason, isSubmitting, resourceId, resourceType, onUnauthorized]);

  const canSubmit = applyReason.trim().length > 0 && !isSubmitting;
  const statusInfo = status ? statusMeta[status.status] : null;

  return (
    <View className="gap-3 rounded-2xl border border-[#dce7f3] bg-white p-4">
      <View className="flex-row items-center justify-between gap-2.5">
        <Text className="text-sm font-black text-[#34445b]">没有查看权限？</Text>
        {statusInfo && status ? (
          <View
            className="rounded-full px-2 py-1"
            style={{ backgroundColor: statusInfo.backgroundColor }}
          >
            <Text className="text-[9px] font-black" style={{ color: statusInfo.color }}>
              {statusInfo.label}
            </Text>
          </View>
        ) : null}
      </View>

      {isLoading ? (
        <ActivityIndicator color="#397cf0" />
      ) : loadError ? (
        <Text className="text-xs text-[#a64b4b]">{loadError}</Text>
      ) : status && status.status !== 'none' ? (
        <View className="gap-1.5">
          {status.applyReason ? (
            <Text className="text-xs leading-[19px] text-[#6d7d94]">
              申请理由：{status.applyReason}
            </Text>
          ) : null}
          {status.status === 'rejected' && status.rejectReason ? (
            <Text className="text-xs leading-[19px] text-[#a64b4b]">
              审批意见：{status.rejectReason}
            </Text>
          ) : null}
          {status.status !== 'approved' ? (
            <Pressable
              accessibilityLabel="重新查看申请状态"
              accessibilityRole="button"
              className="self-start rounded-lg bg-[#edf5ff] px-3 py-2"
              onPress={() => setReloadVersion((version) => version + 1)}
            >
              <Text className="text-[10px] font-black text-[#397cf0]">刷新状态</Text>
            </Pressable>
          ) : null}
        </View>
      ) : (
        <View className="gap-2.5">
          <TextInput
            accessibilityLabel="申请理由"
            multiline
            maxLength={200}
            onChangeText={setApplyReason}
            placeholder="填写申请理由（必填，最多 200 字）"
            placeholderTextColor="#91a0b4"
            value={applyReason}
            className="min-h-[64px] rounded-xl border border-[#d8e4f2] bg-[#fafdff] px-3 py-2.5 text-xs text-[#263850]"
          />
          {submitError ? <Text className="text-xs text-[#a64b4b]">{submitError}</Text> : null}
          <Pressable
            accessibilityLabel="提交权限申请"
            accessibilityRole="button"
            accessibilityState={{ busy: isSubmitting, disabled: !canSubmit }}
            className="min-h-11 min-w-[120px] flex-row items-center justify-center gap-2 self-start rounded-xl bg-[#397cf0] px-5 py-3 active:opacity-80 disabled:opacity-50"
            disabled={!canSubmit}
            onPress={submitApply}
          >
            {isSubmitting && <ActivityIndicator color="#ffffff" size="small" />}
            <Text className="text-xs font-black text-white">提交申请</Text>
          </Pressable>
        </View>
      )}
    </View>
  );
}
