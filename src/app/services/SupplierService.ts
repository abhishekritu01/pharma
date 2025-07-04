import api from '@/utils/api';
import { AxiosError } from 'axios';
import { SupplierData } from '../types/SupplierData';

export const createSupplier = async (formData: SupplierData): Promise<SupplierData> => {
    try {
        const response = await api.post<{ data: SupplierData; message: string; status: string }>(
            'pharma/supplier/save',
            formData
        );
        return response.data.data;
    } catch (error: unknown) {
        if (error instanceof AxiosError) {
            const message = error.response?.data?.message || 'An error occurred while creating the Supplier.';
            throw new Error(message);
        } else {
            throw new Error('An unknown error occurred.');
        }
    }
};


export const getSupplier = async () => {
    try {
        const response = await api.get('pharma/supplier/getAll');
        return response.data.data;
    } catch (error: unknown) {
        console.error('Error fetching Supplier:', error);
        if (error instanceof Error) {
            throw new Error(`Error fetching Supplier: ${error.message}`);
        } else {
            throw new Error('An unknown error occurred while fetching Supplier.');
        }
    }
};



export const getSupplierById = async (supplierId: string) => {
    try {
        const response = await api.get(`pharma/supplier/getById/${supplierId}`);
        return response.data.data;
    } catch (error: unknown) {
        console.error('Error fetching Supplier:', error);
        if (error instanceof Error) {
            throw new Error(`Error fetching Supplier: ${error.message}`);
        } else {
            throw new Error('An unknown error occurred while Supplier.');
        }
    }
};


export const updateSupplier = async (supplierId: string, supplierData: SupplierData) => {
    try {
        const response = await api.put(`pharma/supplier/update/${supplierId}`, supplierData);
        return response.data;
    } catch (error: unknown) {
        console.error('Error updating Supplier:', error);
        if (error instanceof Error) {
            throw new Error(`Error updating Supplier: ${error.message}`);
        } else {
            throw new Error('An unknown error occurred while updating Supplier.');
        }
    }
};



export const supplierDelete = async (supplierId: string) => {
    try {
        const response = await api.delete(`pharma/supplier/delete/${supplierId}`);
        return response.data;
    } catch (error: unknown) {
        console.error('Error deleting Supplier:', error);
        if (error instanceof Error) {
            throw new Error(`Error deleting Supplier: ${error.message}`);
        } else {
            throw new Error('An unknown error occurred while deleting Supplier.');
        }
    }

}


export const checkSupplierDuplicate = async (data: {
  supplierName: string;
  supplierMobile: string;
  supplierGstinNo: string;
}): Promise<{
  supplierName: boolean;
  supplierMobile: boolean;
  supplierGstinNo: boolean;
}> => {
  try {
    const response = await api.post<{
      supplierName: boolean;
      supplierMobile: boolean;
      supplierGstinNo: boolean;
    }>('pharma/supplier/check-duplicate', data);

    return response.data; 
  } catch (error: unknown) {
    if (error instanceof AxiosError) {
      const message =
        error.response?.data?.message ||
        'An error occurred while checking for duplicates.';
      throw new Error(message);
    } else {
      throw new Error('An unknown error occurred.');
    }
  }
};


