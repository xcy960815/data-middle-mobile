/** 知识库状态：active 已启用，disabled 已停用。 */
export type KnowledgeBaseStatus = 'active' | 'disabled';

/** 知识库条目：知识库分页列表的数据单元。 */
export type KnowledgeBaseItem = {
  id: number;
  name: string;
  code: string;
  description: string;
  /** 库状态；契约宽松，服务端可能返回 KnowledgeBaseStatus 之外的字符串。 */
  status: KnowledgeBaseStatus | string;
  createTime: string;
  updateTime: string;
};

/** 知识库分页结果：list 为当前页条目，total 为服务端总数。 */
export type KnowledgeBaseListResponse = {
  list: KnowledgeBaseItem[];
  total: number;
};

/**
 * 知识库文档处理状态：uploaded 已上传、parsing 解析中、indexing 索引中、
 * active 已生效、failed 失败、deleting 删除中。
 */
export type KnowledgeDocumentStatus =
  'uploaded' | 'parsing' | 'indexing' | 'active' | 'failed' | 'deleting';

/** 知识库文档条目：文档分页列表的数据单元。 */
export type KnowledgeDocumentItem = {
  id: number;
  knowledgeBaseId: number;
  title: string;
  sourceType: string;
  /** 文件大小（字节）。 */
  fileSize: number;
  /** 处理状态；契约宽松，服务端可能返回 KnowledgeDocumentStatus 之外的字符串。 */
  status: KnowledgeDocumentStatus | string;
  /** 当前版本标识；null 表示暂无版本。 */
  currentVersion: string | null;
  currentVersionNo: number;
  /** 可见范围内包含的条目数量。 */
  scopeCount: number;
  lastError: string | null;
  createTime: string;
  updateTime: string;
};

/** 知识库文档分页结果：list 为当前页条目，total 为服务端总数。 */
export type KnowledgeDocumentListResponse = {
  list: KnowledgeDocumentItem[];
  total: number;
};
