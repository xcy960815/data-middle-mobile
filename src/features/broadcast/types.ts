export type BroadcastLevel = 'info' | 'warning' | 'critical';

export type BroadcastItem = {
  id: number;
  title: string;
  content: string;
  level: BroadcastLevel;
  status: 'draft' | 'active' | 'ended';
  startTime: string | null;
  endTime: string | null;
  createTime: string;
  updateTime: string;
  createdBy: string | null;
  updatedBy: string | null;
};

export type ActiveBroadcastResponse = { list: BroadcastItem[] };
