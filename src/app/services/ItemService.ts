import api from '@/utils/api';
import { AxiosError } from 'axios';
import { ItemData } from '../types/ItemData';

export const createItem = async (formData: ItemData): Promise<ItemData> => {
    try {
      const response = await api.post<{ data: ItemData; message: string; status: string }>(
        'pharma/item/save',
        formData
      );
      console.log("API Response:", response.data); // Debug response
    //   toast.success(response.data.message);
      return response.data.data;
    } catch (error: unknown) {
      if (error instanceof AxiosError) {
        const message = error.response?.data?.message || 'An error occurred while creating the Item.';
        // toast.error(message);
        throw new Error(message);
      } else {
        throw new Error('An unknown error occurred.');
      }
    }
  };


  export const getItem = async () => {
    try {
        const response = await api.get('pharma/item/getAll');
        return response.data.data;
    } catch (error: unknown) {
        console.error('Error fetching Item:', error);
        if (error instanceof Error) {
            throw new Error(`Error fetching Item: ${error.message}`);
        } else {
            throw new Error('An unknown error occurred while fetching Item.');
        }
    }
  };


  export const getItemById = async (itemId: string) => {
    try {
        const token = localStorage.getItem("authToken");
        const response = await api.get(`pharma/item/getById/${itemId}`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        
        return response.data.data; // Access 'data' inside the response
    } catch (error) {
        console.error('Error fetching Item:', error);
        throw new Error('Failed to fetch item data');
    }
};



  export const updateItem = async (itemId: number, itemData: ItemData) => {
    try {
        const response = await api.put(`pharma/item/update/${itemId}`, itemData);
        return response.data;
    } catch (error: unknown) {
        console.error('Error updating Item:', error);
        if (error instanceof Error) {
            throw new Error(`Error updating Item: ${error.message}`);
        } else {
            throw new Error('An unknown error occurred while updating Item.');
        }
    }
};



export const itemDelete = async (itemId: number) => {
    try {
        const response = await api.delete(`pharma/item/delete/${itemId}`);
        return response.data;
    } catch (error: unknown) {
        console.error('Error deleting Item:', error);
        if (error instanceof Error) {
            throw new Error(`Error deleting Item: ${error.message}`);
        } else {
            throw new Error('An unknown error occurred while deleting Item.');
        }
    }
}