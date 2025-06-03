import api from '@/utils/api';

export const getInventory = async () => {
    try {
        const response = await api.get('pharma/inventory/getAll');
        return response.data;
    } catch (error: unknown) {
        console.error('Error fetching Inventory:', error);
        if (error instanceof Error) {
            throw new Error(`Error fetching Inventory: ${error.message}`);
        } else {
            throw new Error('An unknown error occurred while fetching Inventory.');
        }
    }
  };

  export const getExpiredStock = async () => {
    try {
      const response = await api.get('pharma/inventory/expiredStock');
      return response.data;
    } catch (error) {
      console.error('Error fetching expired stock:', error);
      throw new Error('Failed to fetch expired stock');
    }

  }

  export const getStockByItemId = async (itemId: number) => {
    try {
        const response = await api.get(`pharma/stock/getByItemId/${itemId}`);
        return response.data;
    } catch (error: unknown) {
        console.error('Error fetching Item:', error);
        if (error instanceof Error) {
            throw new Error(`Error fetching Item: ${error.message}`);
        } else {
            throw new Error('An unknown error occurred while Item.');
        }
    }
  };

  