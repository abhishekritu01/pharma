import api from '@/utils/api';
import { AxiosError } from 'axios';
//  This has to not commented    import { SalesReturnData } from '../types/SalesReturnData';
import { PatientData } from '../types/PatientData';
import { BillingData } from '../types/BillingData';

// Fetch all sales returns
export const getSalesReturns = async () => {
  try {
    const token = localStorage.getItem("authToken");
    const response = await api.get('pharma/billReturn/getAll', {
      headers: { Authorization: `Bearer ${token}` }
    });
    if (!response.data) {
      throw new Error('No data received from server');
    }
    return {
      status: "success",
      data: Array.isArray(response.data.data)
        ? response.data.data
        : [response.data.data].filter(Boolean)
    };
  } catch (error: unknown) {
    console.error('Error fetching Bill Returns:', error);
    let errorMessage = "An unknown error occurred";
    if (error instanceof AxiosError) {
      errorMessage = error.response?.data?.message ||
                   error.message ||
                   "Failed to fetch bill returns";
    } else if (error instanceof Error) {
      errorMessage = error.message;
    }
    return {
      status: "error",
      message: errorMessage,
      data: []
    };
  }
};

// Fetch a sales return by ID
export const getSalesReturnById = async (billReturnId: string) => {
  try {
    const token = localStorage.getItem("authToken");
    const response = await api.get(`pharma/billReturn/getById/${billReturnId}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    // Ensure we have the complete data structure
    const returnData = response.data.data || response.data;
    if (!returnData.returnItems) {
      returnData.returnItems = [];
    }
    return returnData;
  } catch (error) {
    console.error('Error fetching Bill Return:', error);
    throw new Error('Failed to fetch Bill Return data');
  }
};

// Fetch patient details by ID
export const getPatientById = async (patientId: string): Promise<PatientData> => {
  try {
    const token = localStorage.getItem("authToken");
    const response = await api.get(`pharma/patient/getById/${patientId}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    if (!response.data) {
      throw new Error('No patient data received');
    }
    return response.data.data || response.data;
  } catch (error) {
    console.error('Error fetching patient:', error);
    throw new Error('Failed to fetch patient data');
  }
};

// Fetch billing details by ID along with patient details
export const getBillingWithPatient = async (billId: string): Promise<{
  bill: BillingData;
  patient: PatientData | null;
}> => {
  try {
    const token = localStorage.getItem("authToken");

    // Get bill data
    const billResponse = await api.get(`pharma/bill/getById/${billId}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    const bill = billResponse.data.data || billResponse.data;
    let patient: PatientData | null = null;

    // Get patient data if patientId exists
    if (bill.patientId) {
      try {
        patient = await getPatientById(bill.patientId);
      } catch (patientError) {
        console.warn('Could not fetch patient details', patientError);
      }
    }
    return { bill, patient };
  } catch (error) {
    console.error('Error fetching bill with patient:', error);
    throw new Error('Failed to fetch bill with patient data');
  }
};
// This has to not commented
// Create a sales return
// export const createSalesReturn = async (formData: SalesReturnData) => {
//   try {
//     const token = localStorage.getItem("authToken");
//     // Prepare the data to match backend expectations
//     const payload = {
//       ...formData,
//       returnItems: formData.returnItems?.map(item => ({
//         ...item,
//         itemId: item.itemId || '',
//         batchNo: item.batchNo || '',
//         returnedQuantity: item.returnedQuantity || 0,
//         returnReason: item.returnReason || '',
//         originalPrice: item.originalPrice || 0,
//         refundAmount: item.refundAmount || 0
//       }))
//     };
//     const response = await api.post(
//       'pharma/billReturn/save',
//       payload,
//       { headers: { Authorization: `Bearer ${token}` } }
//     );
//     return response.data;
//   } catch (error: unknown) {
//     if (error instanceof AxiosError) {
//       const message = error.response?.data?.message || 'An error occurred while creating the Bill Return.';
//       throw new Error(message);
//     } else {
//       throw new Error('An unknown error occurred.');
//     }
//   }
// };

// Delete a sales return
export const deleteSalesReturn = async (billReturnId: string) => {
  try {
    const token = localStorage.getItem("authToken");
    await api.delete(`pharma/billReturn/delete/${billReturnId}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return { success: true };
  } catch (error) {
    console.error('Error deleting Bill Return:', error);
    throw new Error('Failed to delete Bill Return');
  }
};


















// import api from '@/utils/api';
// import { AxiosError } from 'axios';
// import { SalesReturnData } from '../types/SalesReturnData';

// export const getSalesReturns = async () => {
//   try {
//     const token = localStorage.getItem("authToken");
//     const response = await api.get('pharma/billReturn/getAll', {
//       headers: { Authorization: `Bearer ${token}` }
//     });

//     if (!response.data) {
//       throw new Error('No data received from server');
//     }

//     return {
//       status: "success",
//       data: Array.isArray(response.data.data)
//         ? response.data.data
//         : [response.data.data].filter(Boolean)
//     };
//   } catch (error: unknown) {
//     console.error('Error fetching Bill Returns:', error);

//     let errorMessage = "An unknown error occurred";
//     if (error instanceof AxiosError) {
//       errorMessage = error.response?.data?.message ||
//                    error.message ||
//                    "Failed to fetch bill returns";
//     } else if (error instanceof Error) {
//       errorMessage = error.message;
//     }

//     return {
//       status: "error",
//       message: errorMessage,
//       data: []
//     };
//   }
// };

// export const getSalesReturnById = async (billReturnId: string) => {
//   try {
//     const token = localStorage.getItem("authToken");
//     const response = await api.get(`pharma/billReturn/getById/${billReturnId}`, {
//       headers: { Authorization: `Bearer ${token}` }
//     });

//     // Ensure we have the complete data structure
//     const returnData = response.data.data || response.data;
//     if (!returnData.returnItems) {
//       returnData.returnItems = [];
//     }

//     return returnData;
//   } catch (error) {
//     console.error('Error fetching Bill Return:', error);
//     throw new Error('Failed to fetch Bill Return data');
//   }
// };

// export const createSalesReturn = async (formData: SalesReturnData) => {
//   try {
//     const token = localStorage.getItem("authToken");

//     // Prepare the data to match backend expectations
//     const payload = {
//       ...formData,
//       // returnDate: formData.returnDate.toISOString(),
//       returnItems: formData.returnItems.map(item => ({
//         ...item,
//         itemId: item.itemId || '',
//         batchNo: item.batchNo || '',
//         returnedQuantity: item.returnedQuantity || 0,
//         returnReason: item.returnReason || '',
//         originalPrice: item.originalPrice || 0,
//         refundAmount: item.refundAmount || 0
//       }))
//     };

//     const response = await api.post(
//       'pharma/billReturn/save',
//       payload,
//       { headers: { Authorization: `Bearer ${token}` } }
//     );

//     return response.data;
//   } catch (error: unknown) {
//     if (error instanceof AxiosError) {
//       const message = error.response?.data?.message || 'An error occurred while creating the Bill Return.';
//       throw new Error(message);
//     } else {
//       throw new Error('An unknown error occurred.');
//     }
//   }
// };

// export const deleteSalesReturn = async (billReturnId: string) => {
//   try {
//     const token = localStorage.getItem("authToken");
//     await api.delete(`pharma/billReturn/delete/${billReturnId}`, {
//       headers: { Authorization: `Bearer ${token}` }
//     });
//     return { success: true };
//   } catch (error) {
//     console.error('Error deleting Bill Return:', error);
//     throw new Error('Failed to delete Bill Return');
//   }
// };
