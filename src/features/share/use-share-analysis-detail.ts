import { useCallback, useEffect, useState } from 'react';

import { fetchShareAnalysisData, fetchShareAnalysisDetail } from '@/features/share/share-api';
import type { AnalysisDataQueryResponse, AnalysisDetailResponse } from '@/features/analysis/types';

/**
 * 免登录分享视图的分析详情 hook：详情成功后只提交 {analysisId, configId} 查询数据，
 * 查询事实全部由服务端当前保存配置决定。匿名场景下 401 不跳转登录，仅展示错误。
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
        setError(nextError instanceof Error ? nextError.message : '加载分享图表失败，请稍后重试。');
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
