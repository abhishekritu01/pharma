import api from '@/utils/api';
import { AxiosError } from 'axios';
import { PurchaseEntryData } from '../types/PurchaseEntry';


export const createPurchase = async (formData: PurchaseEntryData): Promise<PurchaseEntryData> => {
    try {
      const response = await api.post<{ data: PurchaseEntryData; message: string; status: string }>(
        'pharma/stock/save',
        formData
      );
      console.log("API Response:", response.data); // Debug response
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

export const getPurchase = async () => {
  try {
    const response = await api.get('pharma/stock/getAll');

    console.log("Full API response:", response);

    if (Array.isArray(response.data)) {
      return {
        status: "success",
        data: response.data
      };
    }
    if (Array.isArray(response.data.data)) {
      return {
        status: "success",
        data: response.data.data
      };
    }
    throw new Error("Unexpected response structure from getPurchase");
  } catch (error: unknown) {
    console.error('Error fetching Purchase:', error);
    if (error instanceof Error) {
      throw new Error(`Error fetching Purchase: ${error.message}`);
    } else {
      throw new Error('An unknown error occurred while fetching Purchase.');
    }
  }
};


export const getPurchaseById = async (invId: string) => {
  try {
      const response = await api.get(`pharma/stock/getById/${invId}`);
      return response.data;
  } catch (error: unknown) {
      console.error('Error fetching Purchase:', error);
      if (error instanceof Error) {
          throw new Error(`Error fetching Purchase: ${error.message}`);
      } else {
          throw new Error('An unknown error occurred while Purchase doctors.');
      }
  }
};
  
export const checkBillNoExists = async (supplierId: number,purchaseBillNo:string): Promise<boolean> => {
  try {
    const currentYear = new Date().getFullYear();
    const response = await api.get("pharma/stock/checkBillNo", {
      params: { supplierId, year: currentYear, purchaseBillNo },
    });
    console.log("API Response:", response.data);

    return response.data.exists;
  } catch (error) {
    console.error("Error checking bill number:", error);
    throw new Error("Unable to check bill number.");
  }
};


export const stockDelete = async (invId: number) => {
  try {
      const response = await api.delete(`pharma/stock/delete/${invId}`);
      return response.data;
  } catch (error: unknown) {
      console.error('Error deleting Stock:', error);
      if (error instanceof Error) {
          throw new Error(`Error deleting Stock: ${error.message}`);
      } else {
          throw new Error('An unknown error occurred while deleting Stock.');
      }
  }
}


export const getItemsBySupplier = async (supplierId: string) => {
  try {
    const response = await api.get(`pharma/stock/${supplierId}/items`);
    return response.data;
  } catch (error: unknown) {
    console.error('Error fetching items by supplier:', error);
    if (error instanceof Error) {
      throw new Error(`Error fetching items: ${error.message}`);
    } else {
      throw new Error('An unknown error occurred while fetching items.');
    }
  }
};


export const confirmPurchasePayment = async (invId: string) => {
  try {
    const response = await api.put(`pharma/stock/confirmPayment/${invId}`);
    return response.data;
  } catch (error: unknown) {
    console.error("Error confirming payment:", error);
    if (error instanceof Error) {
      throw new Error(`Error confirming payment: ${error.message}`);
    } else {
      throw new Error("An unknown error occurred while confirming payment.");
    }
  }
};
