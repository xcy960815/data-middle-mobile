/** 系统广播级别：info 提示、warning 警告、critical 严重。 */
export type BroadcastLevel = 'info' | 'warning' | 'critical';

/** 系统广播条目。 */
export type BroadcastItem = {
  id: number;
  title: string;
  content: string;
  level: BroadcastLevel;
  /** 投放状态：draft 草稿、active 投放中、ended 已结束。 */
  status: 'draft' | 'active' | 'ended';
  startTime: string | null;
  endTime: string | null;
  createTime: string;
  updateTime: string;
  createdBy: string | null;
  updatedBy: string | null;
};

/** 当前可见系统广播列表的响应。 */
export type ActiveBroadcastResponse = { list: BroadcastItem[] };
