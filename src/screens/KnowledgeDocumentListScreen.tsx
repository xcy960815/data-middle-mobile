import { useMemo } from 'react';
import { ActivityIndicator, Pressable, RefreshControl, ScrollView, Text, View } from 'react-native';

import type { DmsApiError } from '@/features/auth/api-client';
import { usePagedList, type PagedListRequest } from '@/features/common/use-paged-list';
import { fetchKnowledgeDocumentList } from '@/features/knowledge/knowledge-api';
import type { KnowledgeDocumentItem } from '@/features/knowledge/types';
import { formatDateTime } from '@/utils/format-date-time';

const documentStatusLabels: Record<
  string,
  { label: string; color: string; backgroundColor: string }
> = {
  active: { label: '已生效', color: '#047857', backgroundColor: '#e7f8ef' },
  uploaded: { label: '已上传', color: '#2563eb', backgroundColor: '#e8f1ff' },
  parsing: { label: '解析中', color: '#b45309', backgroundColor: '#fef3c7' },
  indexing: { label: '索引中', color: '#b45309', backgroundColor: '#fef3c7' },
  failed: { label: '失败', color: '#b91c1c', backgroundColor: '#fee2e2' },
  deleting: { label: '删除中', color: '#718198', backgroundColor: '#edf1f6' },
};

function formatFileSize(bytes: number): string {
  if (bytes >= 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  if (bytes >= 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${bytes} B`;
}

/**
 * 知识库只读浏览第二层：指定知识库的文档列表。
 *
 * 数据来自服务端分页接口，支持下拉刷新、加载更多与初始加载失败重试；文档卡片展示
 * 标题、处理状态、文件大小、版本、可见范围与最近一次处理错误信息。
 *
 * @param {object} props - 页面属性。
 * @param {number} props.baseId - 所属知识库 id，用于请求该库的文档列表。
 * @param {string} props.baseName - 知识库名称，展示在页头。
 * @param {() => void} props.onBackPress - 点击页头返回按钮的回调，用于返回知识库列表。
 * @param {(error: DmsApiError) => void | Promise<void>} props.onUnauthorized - 会话失效
 *   回调；文档请求遇到 401 时触发，用于跳转登录。
 * @returns {JSX.Element} 知识库文档列表页。
 */
export function KnowledgeDocumentListScreen({
  baseId,
  baseName,
  onBackPress,
  onUnauthorized,
}: {
  baseId: number;
  baseName: string;
  onBackPress: () => void;
  onUnauthorized: (error: DmsApiError) => void | Promise<void>;
}) {
  const fetcher = useMemo(
    () => (request: PagedListRequest, signal?: AbortSignal) =>
      fetchKnowledgeDocumentList({ ...request, knowledgeBaseId: baseId }, signal),
    [baseId],
  );
  const {
    items,
    total,
    isInitialLoading,
    isRefreshing,
    isLoadingMore,
    initialError,
    loadMoreError,
    hasMore,
    refresh,
    loadMore,
    retryInitialLoad,
  } = usePagedList<KnowledgeDocumentItem>(fetcher, {
    onUnauthorized,
    errorLabel: '知识库文档',
  });

  return (
    <View className="flex-1 bg-[#f5f9fe]">
      <ScrollView
        contentContainerClassName="gap-3 px-[18px] pb-8 pt-[52px]"
        refreshControl={
          <RefreshControl
            accessibilityLabel="刷新文档列表"
            onRefresh={() => void refresh()}
            refreshing={isRefreshing}
            tintColor="#397cf0"
          />
        }
      >
        <View className="flex-row items-center gap-3">
          <Pressable
            accessibilityLabel="返回知识库列表"
            accessibilityRole="button"
            onPress={onBackPress}
          >
            <Text className="text-3xl text-[#397cf0]">‹</Text>
          </Pressable>
          <View className="flex-1">
            <Text numberOfLines={1} className="text-xl font-black text-[#253750]">
              {baseName}
            </Text>
            <Text className="mt-1 text-xs text-[#718198]">文档只读列表</Text>
          </View>
        </View>

        <Text accessibilityLiveRegion="polite" className="text-[11px] font-bold text-[#7a899d]">
          {isInitialLoading ? '正在加载文档…' : `共 ${total} 个文档，已加载 ${items.length} 个`}
        </Text>

        {isInitialLoading ? (
          <ActivityIndicator color="#397cf0" />
        ) : initialError ? (
          <View className="items-center rounded-2xl border border-[#f1d4d4] bg-white p-8">
            <Text className="text-lg font-black text-[#34445b]">文档加载失败</Text>
            <Text className="mt-2 text-center text-xs leading-5 text-[#7b8aa0]">
              {initialError}
            </Text>
            <Pressable
              accessibilityLabel="重新加载文档"
              accessibilityRole="button"
              className="mt-5 rounded-xl bg-[#397cf0] px-5 py-3"
              onPress={retryInitialLoad}
            >
              <Text className="text-xs font-black text-white">重新加载</Text>
            </Pressable>
          </View>
        ) : items.length > 0 ? (
          <>
            {items.map((document) => {
              const status = documentStatusLabels[document.status] ?? documentStatusLabels.uploaded;
              return (
                <View
                  className="gap-2 rounded-2xl border border-[#dce7f3] bg-white p-4"
                  key={document.id}
                >
                  <View className="flex-row items-start justify-between gap-2.5">
                    <Text numberOfLines={1} className="flex-1 text-sm font-black text-[#34445b]">
                      {document.title}
                    </Text>
                    <View
                      className="rounded-full px-2 py-1"
                      style={{ backgroundColor: status.backgroundColor }}
                    >
                      <Text className="text-[9px] font-black" style={{ color: status.color }}>
                        {status.label}
                      </Text>
                    </View>
                  </View>
                  <Text className="text-[10px] text-[#8a98aa]">
                    {formatFileSize(document.fileSize)} · 版本 v{document.currentVersionNo}
                    {document.currentVersion ? ` (${document.currentVersion})` : ''} · 可见范围{' '}
                    {document.scopeCount} 项 · 更新于 {formatDateTime(document.updateTime)}
                  </Text>
                  {document.lastError ? (
                    <Text className="rounded-xl bg-[#fff7f7] px-3 py-2 text-[11px] leading-4 text-[#a64b4b]">
                      {document.lastError}
                    </Text>
                  ) : null}
                </View>
              );
            })}
            <View className="mt-2 items-center">
              {loadMoreError ? (
                <Text
                  accessibilityLiveRegion="assertive"
                  className="mb-2 text-[11px] text-[#a64b4b]"
                >
                  {`加载更多失败：${loadMoreError}`}
                </Text>
              ) : null}
              {hasMore ? (
                <Pressable
                  accessibilityLabel="加载更多文档"
                  accessibilityRole="button"
                  accessibilityState={{ busy: isLoadingMore, disabled: isLoadingMore }}
                  className="min-h-11 min-w-[132px] flex-row items-center justify-center gap-2 rounded-xl bg-[#397cf0] px-5 py-3 disabled:opacity-60"
                  disabled={isLoadingMore}
                  onPress={() => void loadMore()}
                >
                  {isLoadingMore && <ActivityIndicator color="#ffffff" size="small" />}
                  <Text className="text-xs font-black text-white">
                    {isLoadingMore ? '正在加载…' : '加载更多'}
                  </Text>
                </Pressable>
              ) : (
                <Text className="text-[11px] font-bold text-[#8997aa]">已加载全部文档</Text>
              )}
            </View>
          </>
        ) : (
          <View className="items-center rounded-2xl border border-[#dce7f3] bg-white p-8">
            <Text className="text-lg font-black text-[#2b3d57]">暂无文档</Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}
