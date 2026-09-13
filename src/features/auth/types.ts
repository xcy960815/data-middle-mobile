/**
 * DMS 统一响应包装：标准接口返回该结构，业务码 200 表示成功。
 */
export type ApiResponse<T> = {
  /** 业务码：200 表示成功；401 表示会话失效；其余为业务错误码（403 无权限等）。 */
  code: 200 | 401 | 403 | 404 | 500;
  data: T;
  message: string;
};

/**
 * 登录凭据；password 在类型中保存明文，提交前经 SM2 加密。
 */
export type LoginCredentials = {
  userName: string;
  password: string;
};

/**
 * 注册凭据；password 与 confirmPassword 在类型中保存明文，提交前分别经 SM2 加密，
 * email 与 mobile 为可选联系信息。
 */
export type RegisterCredentials = {
  userName: string;
  displayName: string;
  password: string;
  confirmPassword: string;
  email?: string;
  mobile?: string;
};

/**
 * 注册接口的响应：仅回传服务端分配的用户标识与用户名，注册不建立会话。
 */
export type RegisterResponse = {
  userId: string;
  userName: string;
};

/**
 * 登录接口的响应：仅回传用户标识与用户名，会话凭据由 HttpOnly Cookie 承载，
 * 客户端不读取或持久化 token。
 */
export type LoginResponse = {
  userId: string;
  userName: string;
};

/**
 * 当前登录用户信息，由 /api/auth/user-info 返回。
 */
export type AuthUser = {
  userId: string;
  userName: string;
  displayName: string;
  avatar: string;
  isAdmin: boolean;
};
