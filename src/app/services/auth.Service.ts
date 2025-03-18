import api from '@/utils/api';
import { LoginRequest, LoginResponse, RegisterResponse } from '../types/AuthData';
import { RegisterData } from '../types/RegisterData';



export const login = async (data: LoginRequest): Promise<LoginResponse> => {
  try {
    const response = await api.post<LoginResponse>('/public/login', data);
    return response.data;
  } catch (error: any) {
    const message = error.response?.data?.message || 'An error occurred during login.';
    throw new Error(message);
  }
};


export const register = async (data: RegisterData): Promise<RegisterResponse> => {      
  try {
    const response = await api.post<RegisterResponse>('/public/register', data);
    return response.data; 
  } catch (error: any) {
    const message = error.response?.data?.message || 'An error occurred during registration.';
    throw new Error(message);
  }
}






