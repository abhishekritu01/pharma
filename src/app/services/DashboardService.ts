import api from '@/utils/api';

export const getDashboardSummary = async () => {
    try {
        const response = await api.get('pharma/stock/summary');
        return response.data;
    } catch (error: unknown) {
        console.error('Error fetching Dashboard Data:', error);
        if (error instanceof Error) {
            throw new Error(`Error fetching Dashboard Data: ${error.message}`);
        } else {
            throw new Error('An unknown error occurred while fetching Dashboard Data.');
        }
    }
  };