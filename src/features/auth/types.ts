export type ApiResponse<T> = {
  code: 200 | 401 | 403 | 404 | 500;
  data: T;
  message: string;
};

export type LoginCredentials = {
  userName: string;
  password: string;
};

export type RegisterCredentials = {
  userName: string;
  displayName: string;
  password: string;
  confirmPassword: string;
  email?: string;
  mobile?: string;
};

export type RegisterResponse = {
  userId: string;
  userName: string;
};

export type LoginResponse = {
  userId: string;
  userName: string;
};

export type AuthUser = {
  userId: string;
  userName: string;
  displayName: string;
  avatar: string;
  isAdmin: boolean;
};
