import api from '@/utils/api';
import { AxiosError } from 'axios';
import { ItemData } from '../types/ItemData';

export const createItem = async (formData: ItemData): Promise<ItemData> => {
  try {
    const response = await api.post<{ data: ItemData; message: string; status: string }>(
      'pharma/item/save',
      formData
    );
    console.log("API Response:", response.data); // Debug response
    //   toast.success(response.data.message);
    return response.data.data;
  } catch (error: unknown) {
    if (error instanceof AxiosError) {
      const message = error.response?.data?.message || 'An error occurred while creating the Item.';
      // toast.error(message);
      throw new Error(message);
    } else {
      throw new Error('An unknown error occurred.');
    }
  }
};


export const getItem = async () => {
  try {
    const response = await api.get('pharma/item/getAll');
    return response.data.data;
  } catch (error: unknown) {
    console.error('Error fetching Item:', error);
    if (error instanceof Error) {
      throw new Error(`Error fetching Item: ${error.message}`);
    } else {
      throw new Error('An unknown error occurred while fetching Item.');
    }
  }
};


export const getItemById = async (itemId: string) => {
  try {
    const response = await api.get(`pharma/item/getById/${itemId}`);
    return response.data.data;
  } catch (error: unknown) {
    console.error('Error fetching Item:', error);
    if (error instanceof Error) {
      throw new Error(`Error fetching Item: ${error.message}`);
    } else {
      throw new Error('An unknown error occurred while Item.');
    }
  }
};



// export const getItemById = async (itemId: string) => {
//   try {
//       const response = await api.get(`/pharma/stock/getByItemId/${itemId}`);
//       return response.data.data;
//   } catch (error: unknown) {
//       console.error('Error fetching Item:', error);
//       if (error instanceof Error) {
//           throw new Error(`Error fetching Item: ${error.message}`);
//       } else {
//           throw new Error('An unknown error occurred while Item.');
//       }
//   }
// };



export const updateItem = async (itemId: string, itemData: ItemData) => {
  try {
    const response = await api.put(`pharma/item/update/${itemId}`, itemData);
    return response.data;
  } catch (error: unknown) {
    console.error('Error updating Item:', error);
    if (error instanceof Error) {
      throw new Error(`Error updating Item: ${error.message}`);
    } else {
      throw new Error('An unknown error occurred while updating Item.');
    }
  }
};



export const itemDelete = async (itemId: string) => {
  try {
    const response = await api.delete(`pharma/item/delete/${itemId}`);
    return response.data;
  } catch (error: unknown) {
    console.error('Error deleting Item:', error);
    if (error instanceof Error) {
      throw new Error(`Error deleting Item: ${error.message}`);
    } else {
      throw new Error('An unknown error occurred while deleting Item.');
    }
  }
}

export const checkDuplicateItem = async (data: {
  itemName: string;
  manufacturer: string;
}): Promise<{ duplicate: boolean }> => {
  try {
    const response = await api.post<{ duplicate: boolean }>(
      'pharma/item/check-duplicate',
      data
    );
    return response.data;
  } catch (error: unknown) {
    if (error instanceof AxiosError) {
      const message = error.response?.data?.message || 'Failed to check duplicate item.';
      throw new Error(message);
    } else {
      throw new Error('An unknown error occurred.');
    }
  }
};

export const uploadItemsCsv = async (file: File): Promise<{ message: string, data?: ItemData[] }> => {
  try {
    const formData = new FormData();
    formData.append('file', file);

    const token = localStorage.getItem('authToken');

    const response = await api.post('/api/items/csv/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
        'Authorization': `Bearer ${token}`
      },
    });

    return response.data;
  } catch (error: unknown) {
    console.error('Error uploading CSV:', error);

    if (error instanceof AxiosError) {
      const responseData = error.response?.data;


      if (error.response?.status === 400) {
        if (responseData.validationErrors && Array.isArray(responseData.validationErrors)) {
          const validationError = new Error(JSON.stringify({
            message: responseData.message || "CSV validation failed",
            validationErrors: responseData.validationErrors
          }));
          throw validationError;
        }

        if (responseData.message) {
          throw new Error(JSON.stringify({
            message: responseData.message,
            validationErrors: []
          }));
        }
      }

      const message = responseData?.message || 'Failed to upload CSV file. Please check the format and try again.';
      throw new Error(message);
    } else {
      throw new Error('An unknown error occurred while uploading the file.');
    }
  }
};