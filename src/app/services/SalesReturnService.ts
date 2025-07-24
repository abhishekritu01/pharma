import api from '@/utils/api';
import { AxiosError } from 'axios';
import { SalesReturnData, SalesReturnListData } from '../types/SalesReturnData';


type ApiResponse<T> = {
  status: string;
  message: string;
  data: T;
};

export const getSalesReturns = async () => {
  try {
    const token = localStorage.getItem("authToken");
    const response = await api.get('pharma/billReturn/getAll', {
      headers: { Authorization: `Bearer ${token}` }
    });

    if (!response.data || response.data.status !== "success") {
      throw new Error(response.data?.message || 'Failed to fetch sales returns');
    }

    return {
      status: "success",
      data: response.data.data,
      message: response.data.message
    };
  } catch (error: unknown) {
    console.error('Error fetching sales returns:', error);
    
    return {
      status: "error",
      message: error instanceof Error ? error.message : "An unknown error occurred",
      data: []
    };
  }
};

export const getSalesReturnById = async (billReturnId: string) => {
  try {
    const token = localStorage.getItem("authToken");
    const response = await api.get(`pharma/billReturn/getById/${billReturnId}`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    if (response.data.status !== "success") {
      throw new Error(response.data.message || 'Failed to fetch sales return');
    }

    return {
      status: "success",
      data: response.data.data,
      message: response.data.message
    };
  } catch (error: unknown) {
    console.error('Error fetching sales return:', error);
    
    if (error instanceof AxiosError) {
      throw new Error(error.response?.data?.message || 'Failed to fetch sales return');
    }
    throw new Error('An unknown error occurred');
  }
};

export const createSalesReturn = async (formData: SalesReturnData) => {
  try {
    const token = localStorage.getItem("authToken");
    const response = await api.post('pharma/billReturn/save', formData, {
      headers: { Authorization: `Bearer ${token}` }
    });

    if (response.data.status !== "success") {
      throw new Error(response.data.message || 'Failed to create sales return');
    }

    return {
      status: "success",
      data: response.data.data,
      message: response.data.message
    };
  } catch (error: unknown) {
    console.error('Error creating sales return:', error);
    
    if (error instanceof AxiosError) {
      throw new Error(error.response?.data?.message || 'Failed to create sales return');
    }
    throw new Error('An unknown error occurred');
  }
};

export const deleteSalesReturn = async (billReturnId: string) => {
  try {
    const token = localStorage.getItem("authToken");
    const response = await api.delete(`pharma/billReturn/delete/${billReturnId}`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    if (response.data.status !== "success") {
      throw new Error(response.data.message || 'Failed to delete sales return');
    }

    return {
      status: "success",
      message: response.data.message
    };
  } catch (error: unknown) {
    console.error('Error deleting sales return:', error);
    
    if (error instanceof AxiosError) {
      throw new Error(error.response?.data?.message || 'Failed to delete sales return');
    }
    throw new Error('An unknown error occurred');
  }
};


export const getSalesReturnList = async (): Promise<ApiResponse<SalesReturnListData[]>> => {
  try {
    const token = localStorage.getItem("authToken");
    const response = await api.get<ApiResponse<SalesReturnListData[]>>(
      'pharma/billReturn/list',
      { headers: { Authorization: `Bearer ${token}` } }
    );
    console.log("API Response:", response.data); 

    if (response.data.status !== "success") {
      throw new Error(response.data.message);
    }

    return response.data;
  } catch (error) {
    console.error('Error fetching sales return list:', error);
    return {
      status: "error",
      message: error instanceof Error ? error.message : "An unknown error occurred",
      data: []
    };
  }
};
