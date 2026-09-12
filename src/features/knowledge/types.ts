export type KnowledgeBaseStatus = 'active' | 'disabled';

export type KnowledgeBaseItem = {
  id: number;
  name: string;
  code: string;
  description: string;
  status: KnowledgeBaseStatus | string;
  createTime: string;
  updateTime: string;
};

export type KnowledgeBaseListResponse = {
  list: KnowledgeBaseItem[];
  total: number;
};

export type KnowledgeDocumentStatus =
  'uploaded' | 'parsing' | 'indexing' | 'active' | 'failed' | 'deleting';

export type KnowledgeDocumentItem = {
  id: number;
  knowledgeBaseId: number;
  title: string;
  sourceType: string;
  fileSize: number;
  status: KnowledgeDocumentStatus | string;
  currentVersion: string | null;
  currentVersionNo: number;
  scopeCount: number;
  lastError: string | null;
  createTime: string;
  updateTime: string;
};

export type KnowledgeDocumentListResponse = {
  list: KnowledgeDocumentItem[];
  total: number;
};
