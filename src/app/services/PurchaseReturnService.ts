import api from '@/utils/api';
import { AxiosError } from 'axios';
import { PurchaseReturnData } from '../types/PurchaseReturnData';


export const createPurchaseReturn = async (formData: PurchaseReturnData): Promise<PurchaseReturnData> => {
    try {
      const response = await api.post<{ data: PurchaseReturnData; message: string; status: string }>(
        'pharma/purchaseReturn/save',
        formData
      );
      console.log("API Response:", response.data); // Debug response
      return response.data.data;
    } catch (error: unknown) {
      if (error instanceof AxiosError) {
        const message = error.response?.data?.message || 'An error occurred while creating the purchase return.';
        throw new Error(message);
      } else {
        throw new Error('An unknown error occurred.');
      }
    }
  };

  export const getReturnAll = async () => {
    try {
        const response = await api.get('pharma/purchaseReturn/getAll');
        return response.data;
    } catch (error: unknown) {
        console.error('Error fetching Purchase:', error);
        if (error instanceof Error) {
            throw new Error(`Error fetching Purchase: ${error.message}`);
        } else {
            throw new Error('An unknown error occurred while fetching Purchase.');
        }
    }
  };

  export const getPurchaseReturnById = async (returnId: string) => {
    try {
        const token = localStorage.getItem("authToken");
        const response = await api.get(`pharma/purchaseReturn/getById/${returnId}`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        
        return response.data.data;
    } catch (error) {
        console.error('Error fetching Purchase Return:', error);
        throw new Error('Failed to fetch Purchase Return data');
    }
};