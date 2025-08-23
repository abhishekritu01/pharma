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


// The code below is added for CSV upload functionality but is currently not functional................

// export const uploadItemsCsv = async (file: File): Promise<void> => {
//   try {
//     const token = localStorage.getItem('token'); // Assuming you store JWT token in localStorage
    
//     if (!token) {
//       throw new Error('Authentication token not found');
//     }

//     const formData = new FormData();
//     formData.append('file', file);

//     const response = await fetch('/api/items/csv/upload', {
//       method: 'POST',
//       headers: {
//         'Authorization': `Bearer ${token}`,
//       },
//       body: formData,
//     });

//     if (!response.ok) {
//       const errorData = await response.json();
//       throw new Error(errorData.message || 'Failed to upload CSV file');
//     }

//     const result = await response.json();
//     return result;
//   } catch (error) {
//     console.error('Error uploading CSV:', error);
//     throw error;
//   }
// };