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

export const getInventoryDetails = async () => {
  try {
    const response = await api.get('pharma/inventoryDetails/getAll');
    return response.data;
  } catch (error: unknown) {
    console.error('Error fetching Inventory Details:', error);
    if (error instanceof Error) {
      throw new Error(`Error fetching Inventory Details: ${error.message}`);
    } else {
      throw new Error('An unknown error occurred while fetching Inventory Details');
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


export const saveInventoryDetails = async (inventoryData: string) => {
  try {
    const response = await api.post('pharma/inventoryDetails/save', inventoryData);
    return response.data;
  } catch (error: unknown) {
    console.error('Error saving Inventory Details:', error);
    if (error instanceof Error) {
      throw new Error(`Error saving Inventory Details: ${error.message}`);
    } else {
      throw new Error('An unknown error occurred while saving Inventory Details');
    }
  }
};

export const updateInventory = async (inventoryData: string) => {
  try {
    const response = await api.put('pharma/inventory/update', inventoryData);
    return response.data;
  } catch (error: unknown) {
    console.error('Error updating Inventory:', error);
    if (error instanceof Error) {
      throw new Error(`Error updating Inventory: ${error.message}`);
    } else {
      throw new Error('An unknown error occurred while updating Inventory.');
    }
  }
};



export const updateStockItem = async (
  invId: string,
  itemId: string,
  batchNo: string,
  data: { mrpSalePricePerUnit: number; purchasePricePerUnit: number; expiryDate: string; }
) => {
  try {
    const response = await api.put(`pharma/stock/updateStockItem/${invId}/${itemId}/${batchNo}`, data);
    return response.data;
  } catch (error: unknown) {
    console.error('Error updating stock item:', error);
    if (error instanceof Error) {
      throw new Error(`Error updating stock item: ${error.message}`);
    } else {
      throw new Error('An unknown error occurred while updating stock item.');
    }
  }
};