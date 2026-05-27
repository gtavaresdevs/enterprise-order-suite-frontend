export type Role = 'ADMIN' | 'USER';

export interface User {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  roles: Role[];
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
}

// Credentials for the login form
export interface LoginCredentials {
  email: string;
  password?: string; // Optional if using OAuth, but required for your form
}
