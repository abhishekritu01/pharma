import api from '@/utils/api';

export const getVariant = async () => {
    try {
        const response = await api.get('pharma/variant/getAll');
        return response.data.data; 
    } catch (error: unknown) {
        console.error('Error fetching Variant:', error);
        if (error instanceof Error) {
            throw new Error(`Error fetching Variant: ${error.message}`);
        } else {
            throw new Error('An unknown error occurred while fetching Variant.');
        }
    }
};


export const getVariantById = async (variantTypeId: string) => {
    try {
        const response = await api.get(`pharma/variant/getById/${variantTypeId}`);
        return response.data.data;
    } catch (error: unknown) {
        console.error('Error fetching Variant:', error);
        if (error instanceof Error) {
            throw new Error(`Error fetching Variant: ${error.message}`);
        } else {
            throw new Error('An unknown error occurred while Variant.');
        }
    }
  };