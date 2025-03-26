import api from '@/utils/api';
import { AxiosError } from 'axios';


export const getPurchaseOrder = async () => {
    try {
        const response = await api.get('pharma/purchaseOrder/getAll');
        return response.data.data;
    } catch (error: unknown) {
        console.error('Error fetching Purchase Order:', error);
        if (error instanceof Error) {
            throw new Error(`Error fetching Purchase Order: ${error.message}`);
        } else {
            throw new Error('An unknown error occurred while fetching Purchase Order.');
        }
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