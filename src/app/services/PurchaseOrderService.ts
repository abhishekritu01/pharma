import api from '@/utils/api';
import { AxiosError } from 'axios';
import { PurchaseOrderData } from '../types/PurchaseOrderData';


export const getPurchaseOrder = async () => {
    try {
      const response = await api.get('pharma/purchaseOrder/getAll');
  
      if (!response.data || !Array.isArray(response.data.data)) {
        throw new Error('Invalid response format: Expected an array in response.data.data');
      }
  
      return {
        status: "success",
        data: response.data.data, // Ensure the data is always in `data`
      };
    } catch (error: unknown) {
      console.error('Error fetching Purchase Order:', error);
  
      return {
        status: "error",
        message: error instanceof Error ? error.message : "An unknown error occurred",
      };
    }
  };
  

  export const getPurchaseOrderById = async (orderId: string) => {
    try {
        const token = localStorage.getItem("authToken");
        const response = await api.get(`pharma/purchaseOrder/getById/${orderId}`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        
        return response.data.data;
    } catch (error) {
        console.error('Error fetching Purchase Order:', error);
        throw new Error('Failed to fetch Purchase Order data');
    }
};


export const createPurchaseOrder = async (formData: PurchaseOrderData): Promise<PurchaseOrderData> => {
    try {
      const response = await api.post<{ data: PurchaseOrderData; message: string; status: string }>(
        'pharma/purchaseOrder/save',
        formData
      );
      console.log("API Response:", response.data); 
      return response.data.data;
    } catch (error: unknown) {
      if (error instanceof AxiosError) {
        const message = error.response?.data?.message || 'An error occurred while creating the Purchase Order.';
        throw new Error(message);
      } else {
        throw new Error('An unknown error occurred.');
      }
    }
  };


  export const purchaseOrderDelete = async (orderId: string) => {
    try {
        const response = await api.delete(`pharma/purchaseOrder/delete/${orderId}`);
        return response.data;
    } catch (error: unknown) {
        console.error('Error deleting Purchase Order:', error);
        if (error instanceof Error) {
            throw new Error(`Error deleting Purchase Order: ${error.message}`);
        } else {
            throw new Error('An unknown error occurred while deleting Purchase Order.');
        }
    }
}