/** 权限资源类型，与 DMS shared/resource-permission-types 精确对齐。 */
export type NotificationResourceType = 'analysis' | 'dashboard' | 'dataset' | 'data_source';

/** 通知类型，当前由权限申请流程产生。 */
export type NotificationType = 'access_apply' | 'access_apply_result';

export type NotificationItem = {
  id: number;
  actorUserId: number;
  actorName: string;
  type: string;
  title: string;
  content: string;
  resourceType: NotificationResourceType;
  resourceId: number;
  isRead: boolean;
  createTime: string;
};

export type NotificationListResponse = {
  list: NotificationItem[];
  total: number;
};

export type NotificationCountResponse = { count: number };

export type NotificationReadRequest = {
  notificationIds: number[];
};

/** 我的权限申请记录，来自 /api/permission/apply/list 的 mine 分组。 */
export type AccessApplyStatus = 'pending' | 'approved' | 'rejected';

export type AccessApplyItem = {
  id: number;
  resourceType: NotificationResourceType;
  resourceId: number;
  resourceName: string;
  applicantUserId: number;
  applicantName: string;
  applyReason: string;
  status: AccessApplyStatus;
  handleReason: string | null;
  applyTime: string;
  handleTime: string | null;
};

export type AccessApplyListResponse = {
  pending: AccessApplyItem[];
  mine: AccessApplyItem[];
};
