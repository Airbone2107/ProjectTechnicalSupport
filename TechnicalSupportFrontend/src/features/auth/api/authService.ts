import axiosClient from 'lib/axiosClient';
import { LoginModel, RegisterModel } from 'types/models';

interface AuthResponse {
  token: string;
}

interface ApiResponse<T> {
  succeeded: boolean;
  message: string;
  data: T;
  errors?: string[];
}

export const login = (credentials: LoginModel): Promise<ApiResponse<AuthResponse>> => {
  return axiosClient.post('/Auth/login', credentials);
};

export const register = (userData: RegisterModel): Promise<ApiResponse<object>> => {
  return axiosClient.post('/Auth/register', { ...userData, role: 'Client' });
}; 