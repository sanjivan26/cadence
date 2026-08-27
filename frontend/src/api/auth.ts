import api from "./client";

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface TokenResponse {
  access_token: string;
  token_type: string;
}

export interface User {
  id: number;
  username: string;
  email: string;
}

export async function registerUser(
  data: RegisterRequest
) {
  const response = await api.post<User>(
    "/auth/register",
    data
  );

  return response.data;
}

export async function loginUser(
  data: LoginRequest
) {
  const response = await api.post<TokenResponse>(
    "/auth/login",
    data
  );

  return response.data;
}

export async function getCurrentUser() {
  const response = await api.get<User>("/auth/me");

  return response.data;
}