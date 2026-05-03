export type UserRole = 'ADMIN' | 'CORPORATE' | 'INDIVIDUAL';

export interface User {
  id?: number;
  email: string;
  name?: string;
  role: UserRole;
}

export interface AuthResponse {
  token: string;
  type?: string;
  email?: string;
  name?: string;
  role?: string;
}
