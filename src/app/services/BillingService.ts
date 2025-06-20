import api from '@/utils/api';
import { AxiosError } from 'axios';
import { BillingData } from '../types/BillingData';

export const getBilling = async () => {
  try {
    const response = await api.get('pharma/bill/getAll');

    if (!response.data || !Array.isArray(response.data.data)) {
      throw new Error('Invalid response format: Expected an array in response.data.data');
    }

    return {
      status: "success",
      data: response.data.data,
    };
  } catch (error: unknown) {
    console.error('Error fetching Billing:', error);

    return {
      status: "error",
      message: error instanceof Error ? error.message : "An unknown error occurred",
    };
  }
};


export const getBillingById = async (billId: string) => {
  try {
    const token = localStorage.getItem("authToken");
    const response = await api.get(`pharma/bill/getById/${billId}`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    return response.data.data;
  } catch (error) {
    console.error('Error fetching Billing:', error);
    throw new Error('Failed to fetch Billing data');
  }
};


export const createBilling = async (formData: BillingData): Promise<BillingData> => {
    try {
      const response = await api.post<{ data: BillingData; message: string; status: string }>(
        'pharma/bill/save',
        formData
      );
      console.log("API Response:", response.data); 
      return response.data.data;
    } catch (error: unknown) {
      if (error instanceof AxiosError) {
        const message = error.response?.data?.message || 'An error occurred while creating the Bill.';
        throw new Error(message);
      } else {
        throw new Error('An unknown error occurred.');
      }
    }
  };