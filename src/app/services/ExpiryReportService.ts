import api from '@/utils/api';

export const getExpiredStockWithSupplier = async () => {
  try {
    const response = await api.get('pharma/inventory/expiredStockWithSupplier');
    return response.data;
  } catch (error: unknown) {
    console.error('Error fetching expired stock:', error);
    if (error instanceof Error) {
      throw new Error(`Error fetching expired stock: ${error.message}`);
    } else {
      throw new Error('An unknown error occurred while fetching expired stock.');
    }
  }
};