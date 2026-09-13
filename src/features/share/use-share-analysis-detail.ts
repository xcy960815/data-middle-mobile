import { useCallback, useEffect, useState } from 'react';

import { getDmsErrorMessage } from '@/features/auth/api-client';

import { fetchShareAnalysisData, fetchShareAnalysisDetail } from '@/features/share/share-api';
import type { AnalysisDataQueryResponse, AnalysisDetailResponse } from '@/features/analysis/types';

/**
 * 免登录分享视图的分析详情 hook：详情成功后只提交 {analysisId, configId} 查询数据，
 * 查询事实全部由服务端当前保存配置决定。匿名场景下 401 不跳转登录，仅展示错误。
 *
 * 错误不向调用方抛出：详情或数据查询失败统一归一为 error 文案，detail 与 data 保持 null。
 *
 * @param {number} analysisId - 分析 id。
 * @returns {{
 *   detail: AnalysisDetailResponse | null;
 *   data: AnalysisDataQueryResponse | null;
 *   isLoading: boolean;
 *   error: string | null;
 *   reload: () => void;
 * }} 分享详情状态：detail 为分析详情（含 currentConfigId）；data 为按详情返回的当前配置
 *   版本查询到的图表数据，详情成功前为 null；isLoading 覆盖详情与数据查询两段请求；
 *   error 为归一后的错误文案（兜底“加载分享图表失败，请稍后重试。”）；reload 重新触发
 *   详情 + 数据查询的完整链路。
 */
export function useShareAnalysisDetail(analysisId: number) {
  const [detail, setDetail] = useState<AnalysisDetailResponse | null>(null);
  const [data, setData] = useState<AnalysisDataQueryResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshVersion, setRefreshVersion] = useState(0);

  const reload = useCallback(() => setRefreshVersion((version) => version + 1), []);

  useEffect(() => {
    const controller = new AbortController();
    let active = true;

    const load = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const nextDetail = await fetchShareAnalysisDetail(analysisId, controller.signal);
        if (!active) return;
        setDetail(nextDetail);
        const nextData = await fetchShareAnalysisData(
          analysisId,
          nextDetail.currentConfigId,
          controller.signal,
        );
        if (active) setData(nextData);
      } catch (nextError) {
        if (!active || controller.signal.aborted) return;
        setError(getDmsErrorMessage(nextError, '加载分享图表失败，请稍后重试。'));
      } finally {
        if (active && !controller.signal.aborted) setIsLoading(false);
      }
    };

    void load();
    return () => {
      active = false;
      controller.abort();
    };
  }, [analysisId, refreshVersion]);

  return { detail, data, isLoading, error, reload };
}
