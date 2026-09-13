/**
 * 权限资源类型，与 DMS shared/resource-permission-types 精确对齐：
 * analysis 分析、dashboard 看板、dataset 数据集、data_source 数据源。
 */
export type NotificationResourceType = 'analysis' | 'dashboard' | 'dataset' | 'data_source';

/**
 * 通知类型，当前由权限申请流程产生：access_apply 权限申请、access_apply_result 审批结果。
 */
export type NotificationType = 'access_apply' | 'access_apply_result';

/** 通知条目：由权限申请、审批等事件产生并按当前用户投递。 */
export type NotificationItem = {
  id: number;
  actorUserId: number;
  actorName: string;
  /** 通知类型字符串，取值见 NotificationType；服务端以 string 返回。 */
  type: string;
  title: string;
  content: string;
  resourceType: NotificationResourceType;
  resourceId: number;
  isRead: boolean;
  createTime: string;
};

/** 通知列表分页结果。 */
export type NotificationListResponse = {
  list: NotificationItem[];
  total: number;
};

/** 未读通知数查询结果。 */
export type NotificationCountResponse = { count: number };

/** 批量标记已读的请求。 */
export type NotificationReadRequest = {
  notificationIds: number[];
};

/** 权限申请审批状态：pending 审批中、approved 已通过、rejected 已拒绝。 */
export type AccessApplyStatus = 'pending' | 'approved' | 'rejected';

/** 权限申请记录；/api/permission/apply/list 的 mine 分组返回当前用户发起的申请。 */
export type AccessApplyItem = {
  id: number;
  resourceType: NotificationResourceType;
  resourceId: number;
  resourceName: string;
  applicantUserId: number;
  applicantName: string;
  applyReason: string;
  status: AccessApplyStatus;
  /** 审批意见；尚未审批时为 null。 */
  handleReason: string | null;
  applyTime: string;
  /** 审批时间；尚未审批时为 null。 */
  handleTime: string | null;
};

/** 权限申请列表，按服务端分组：pending 待当前用户审批、mine 当前用户发起的申请。 */
export type AccessApplyListResponse = {
  pending: AccessApplyItem[];
  mine: AccessApplyItem[];
};

/** 审批权限申请的请求。 */
export type HandleAccessApplyRequest = {
  applyId: number;
  /** 审批结论：true 通过、false 拒绝。 */
  approved: boolean;
  /** 审批意见，可选。 */
  handleReason?: string;
};

/** 提交资源访问权限申请的请求。 */
export type CreateAccessApplyRequest = {
  resourceType: NotificationResourceType;
  resourceId: number;
  applyReason: string;
};

/**
 * 资源当前的申请状态；status 额外包含 'none'（从未申请过），其余取值见 AccessApplyStatus。
 */
export type AccessApplyStatusResponse = {
  status: 'none' | AccessApplyStatus;
  resourceName: string;
  /** 最近一次申请填写的理由；未申请过时为 null。 */
  applyReason: string | null;
  /** 驳回时的审批意见，其余状态为 null。 */
  rejectReason: string | null;
  /** 最近一次申请时间；未申请过时为 null。 */
  applyTime: string | null;
};
