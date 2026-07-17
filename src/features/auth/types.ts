export type ApiResponse<T> = {
  code: 200 | 401 | 403 | 404 | 500;
  data: T | null;
  message: string;
  success: boolean;
};

export type LoginCredentials = {
  userName: string;
  password: string;
};

export type LoginResponse = {
  userId: string;
  userName: string;
};

export type AuthUser = {
  userId: string;
  userName: string;
  avatar: string;
  roleCodes: string[];
};
