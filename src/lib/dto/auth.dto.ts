export interface LoginRequest {
  email: string;
  password?: string;
}

export interface RegisterRequest {
  email: string;
  password?: string;
  name: string;
  phone?: string;
}

export interface AuthResponse {
  id: string;
  email: string;
  name: string | null;
  role: string;
  token?: string;
}
