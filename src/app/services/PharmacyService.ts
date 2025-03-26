import api from '@/utils/api';
import { AxiosError } from 'axios';


export const getPharmacyById = async (pharmacyId: string) => {
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