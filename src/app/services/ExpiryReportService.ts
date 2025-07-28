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
    // console.log("Inventory Details response:", response.data);
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

export const getExpiryReport = async () => {
  try {
    const response = await api.get('pharma/expiryReport/getAll');
    return response.data;
  } catch (error: unknown) {
    console.error('Error fetching Expiry Report:', error);
    if (error instanceof Error) {
      throw new Error(`Error fetching Expiry Report: ${error.message}`);
    } else {
      throw new Error('An unknown error occurred while fetching Expiry Report.');
    }
  }
};

export const getExpiryReportByItemId = async (itemId: string) => {
  try {
    const response = await api.get(`pharma/expiryReport/getByItemId/${itemId}`);
    return response.data;
  } catch (error: unknown) {
    console.error('Error fetching Expiry Report by Item ID:', error);
    if (error instanceof Error) {
      throw new Error(`Error fetching Expiry Report by Item ID: ${error.message}`);
    } else {
      throw new Error('An unknown error occurred while fetching Expiry Report by Item ID.');
    }
  }
};
export const getExpiryReportBySupplierId = async (supplierId: string) => {
  try {
    const response = await api.get(`pharma/expiryReport/getBySupplierId/${supplierId}`);
    return response.data;
  } catch (error: unknown) {
    console.error('Error fetching Expiry Report by Supplier ID:', error);
    if (error instanceof Error) {
      throw new Error(`Error fetching Expiry Report by Supplier ID: ${error.message}`);
    } else {
      throw new Error('An unknown error occurred while fetching Expiry Report by Supplier ID.');
    }
  }
};

export const getExpiryReportByVariantId = async (variantId: string) => {
  try {
    const response = await api.get(`pharma/expiryReport/getByVariantId/${variantId}`);
    return response.data;
  } catch (error: unknown) {
    console.error('Error fetching Expiry Report by Variant ID:', error);
    if (error instanceof Error) {
      throw new Error(`Error fetching Expiry Report by Variant ID: ${error.message}`);
    } else {
      throw new Error('An unknown error occurred while fetching Expiry Report by Variant ID.');
    }
  }
};

export const getExpiryReportByUnitId = async (unitId: string) => {
  try {
    const response = await api.get(`pharma/expiryReport/getByUnitId/${unitId}`);
    return response.data;
  } catch (error: unknown) {
    console.error('Error fetching Expiry Report by Unit ID:', error);
    if (error instanceof Error) {
      throw new Error(`Error fetching Expiry Report by Unit ID: ${error.message}`);
    } else {
      throw new Error('An unknown error occurred while fetching Expiry Report by Unit ID.');
    }
  }
};
