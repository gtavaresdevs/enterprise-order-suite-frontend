export type Role = 'SUPER_ADMIN' | 'ADMIN' | 'USER';

export interface User {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  roles: Role[];
}

export interface AuthResponse {
  accessToken: string;
  // Still sent in the body by the backend for older clients. Ignored here: the HttpOnly
  // refreshToken cookie is the source of truth and is never readable from JS.
  refreshToken?: string;
}

// Credentials for the login form
export interface LoginCredentials {
  email: string;
  password?: string; // Optional if using OAuth, but required for your form
}

export interface RegisterFields {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  role: Role;
}

export interface ForgotPasswordFields {
  email: string;
}

export interface ResetPasswordFields {
  token: string;
  newPassword: string;
}
