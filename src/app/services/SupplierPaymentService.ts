import api from '@/utils/api';
import { AxiosError } from 'axios';
import { SupplierPaymentData } from '../types/SupplierPaymentData';

export const createSypplierPayment = async (formData: SupplierPaymentData): Promise<SupplierPaymentData> => {
    try {
      const response = await api.post<{ data: SupplierPaymentData; message: string; status: string }>(
        'pharma/supplierPayment/save',
        formData
      );
      console.log("API Response:", response.data); 
      return response.data.data;
    } catch (error: unknown) {
      if (error instanceof AxiosError) {
        const message = error.response?.data?.message || 'An error occurred while creating the purchase.';
        throw new Error(message);
      } else {
        throw new Error('An unknown error occurred.');
      }
    }
  };