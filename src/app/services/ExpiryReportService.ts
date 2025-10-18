import api from '@/utils/api';

export const getExpiredStockWithSupplier = async () => {
  try {
    const response = await api.get('pharma/inventoryDetails/currentYearStockWithSupplier');
    return response.data;
  } catch (error: unknown) {
    console.error('Error fetching expiry stock:', error);
    if (error instanceof Error) {
      throw new Error(`Error fetching expiry stock: ${error.message}`);
    } else {
      throw new Error('An unknown error occurred while fetching expired stock.');
    }
  }
};

export const getNextThreeMonthsStockWithSupplier = async () => {
  try {
    const response = await api.get('pharma/inventoryDetails/nextThreeMonthsStockWithSupplier');
    return response.data;
  } catch (error: unknown) {
    console.error('Error fetching next 3 months stock:', error);
    if (error instanceof Error) {
      throw new Error(`Error fetching next 3 months stock: ${error.message}`);
    } else {
      throw new Error('An unknown error occurred while fetching next 3 months stock.');
    }
  }
};