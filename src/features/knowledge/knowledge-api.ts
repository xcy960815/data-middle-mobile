import { dmsRequest } from '@/features/auth/api-client';

import type { KnowledgeBaseListResponse, KnowledgeDocumentListResponse } from './types';

/**
 * 拉取知识库分页列表。
 *
 * @param {object} request - 分页与搜索参数。
 * @param {number} request.pageNum - 页码（从 1 开始）。
 * @param {number} request.pageSize - 每页条数。
 * @param {string} [request.keyword] - 可选搜索关键词，由服务端过滤。
 * @param {AbortSignal} [signal] - 中止信号，用于取消进行中的请求。
 * @returns {Promise<KnowledgeBaseListResponse>} 知识库分页结果，list 为当前页条目，total 为服务端总数。
 * @throws {DmsApiError} 网络失败或 DMS 返回非 200 业务码时抛出。
 */
export function fetchKnowledgeBaseList(
  request: { pageNum: number; pageSize: number; keyword?: string },
  signal?: AbortSignal,
) {
  return dmsRequest<KnowledgeBaseListResponse>('/api/knowledge/base/list', {
    method: 'POST',
    body: JSON.stringify(request),
    signal,
  });
}

/**
 * 拉取指定知识库下的文档分页列表。
 *
 * @param {object} request - 分页与搜索参数。
 * @param {number} request.knowledgeBaseId - 要查询的知识库 ID。
 * @param {number} request.pageNum - 页码（从 1 开始）。
 * @param {number} request.pageSize - 每页条数。
 * @param {string} [request.keyword] - 可选搜索关键词，由服务端过滤。
 * @param {AbortSignal} [signal] - 中止信号，用于取消进行中的请求。
 * @returns {Promise<KnowledgeDocumentListResponse>} 文档分页结果，list 为当前页条目，total 为服务端总数。
 * @throws {DmsApiError} 网络失败或 DMS 返回非 200 业务码时抛出。
 */
export function fetchKnowledgeDocumentList(
  request: { knowledgeBaseId: number; pageNum: number; pageSize: number; keyword?: string },
  signal?: AbortSignal,
) {
  return dmsRequest<KnowledgeDocumentListResponse>('/api/knowledge/document/list', {
    method: 'POST',
    body: JSON.stringify(request),
    signal,
  });
}
