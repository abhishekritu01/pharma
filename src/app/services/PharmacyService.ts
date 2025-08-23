import api from '@/utils/api';
import { PharmacyData } from '../types/PharmacyData';
import { toast } from 'react-toastify';
import { AxiosError } from 'axios';


export const getPharmacyById = async (pharmacyId: number) => {
    try {
        const response = await api.get(`pharma/pharmacy-pharmacist/getPharmacyById/${pharmacyId}`);
        return response.data;
    } catch (error: unknown) {
        console.error('Error fetching Pharmacy:', error);
        if (error instanceof Error) {
            throw new Error(`Error fetching Pharmacy: ${error.message}`);
        } else {
            throw new Error('An unknown error occurred while fetching Pharmacy.');
        }
    }
};

export const getPharmacy = async () => {
    try {
        const response = await api.get('pharma/pharmacy/getAllPharmacies');
        return response.data;
    } catch (error: unknown) {
        console.error('Error fetching Pharmacy:', error);
        if (error instanceof Error) {
            throw new Error(`Error fetching Pharmacy: ${error.message}`);
        } else {
            throw new Error('An unknown error occurred while fetching Pharmacy.');
        }
    }
};


export const getUsersPharma = async (): Promise<PharmacyData[]> => {
    try {
        const response = await api.get<{ data: PharmacyData[]; message: string; status: string }>('pharma/admin/get-user-pharma');
        return response.data.data; 
    } catch (error: unknown) {
        const err = error as AxiosError<{ message: string }>;
        const message = err.response?.data?.message || 'An error occurred while fetching pharma.';
        toast.error(message);
        throw new Error(message);
    }
}


export const createPharma = async (formData: PharmacyData): Promise<PharmacyData> => {
    try {
        const response = await api.post<{ data: PharmacyData; message: string; status: string }>('pharma/pharmacy/save', formData);
        toast.success(response.data.message);
        return response.data.data;
    } catch (error: unknown) {
        const err = error as AxiosError<{ message: string }>;
        const message = err.response?.data?.message || 'An error occurred while creating the pharma.';
        toast.error(message);
        throw new Error(message);
    }
}