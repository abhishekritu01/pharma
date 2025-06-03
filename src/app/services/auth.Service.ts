import api from '@/utils/api';
import { LoginRequest, LoginResponse, RegisterResponse } from '../types/AuthData';
import { RegisterData } from '../types/RegisterData';
import { AxiosError } from 'axios';



export const login = async (data: LoginRequest): Promise<LoginResponse> => {
  try {
    const response = await api.post<LoginResponse>('/public/login', data);
    return response.data;
  } catch (error: unknown) {
    // const message = error.response?.data?.message || 'An error occurred during login.';
    // throw new Error(message);
    if (error instanceof AxiosError) {
      const message = error.response?.data?.message || 'An error occurred during login.';
      throw new Error(message);
    }
    throw new Error('An unexpected error occurred.');
  
  }
};


export const register = async (data: RegisterData): Promise<RegisterResponse> => {      
  try {
    const response = await api.post<RegisterResponse>('/public/register', data);
    return response.data; 
  } catch (error: unknown) {
    // const message = error.response?.data?.message || 'An error occurred during registration.';
    // throw new Error(message);

    if (error instanceof AxiosError) {
      const message = error.response?.data?.message || 'An error occurred during login.';
      throw new Error(message);
    }
    throw new Error('An unexpected error occurred.');
  
  }
}






