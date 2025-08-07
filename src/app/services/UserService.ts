import api from '@/utils/api';
import { AxiosError } from 'axios';


export const createUser = async (pharmacyId: number, data: unknown) => {
  try {
    const response = await api.post(`/user-management/create-user/${pharmacyId}`, data);
    return response.data;
  } catch (error) {
    return (error as AxiosError).response?.data;
  }
};


export const getUserOfPharmacy = async (pharmacyId: number) => {
  try {
    const response = await api.get(`/user-management/get-members/${pharmacyId}`);
    return response.data;
  } catch (error) {
    return (error as AxiosError).response?.data;
  }
};


export const updateUser= async (pharmacyId: number, id: number, data: unknown) => {
  try {
    const response = await api.put(`/user-management/update-user/${pharmacyId}/${id}`, data);
    return response.data;
  } catch (error) {
    return (error as AxiosError).response?.data;
  }
}

// export const getUserById = async (id: number, pharmacyId: number) => {
//   try {
//     const response = await api.get(`/user-management/getUserById/${id}/${pharmacyId}`);
//     return response.data;
//   } catch (error) {
//     return (error as AxiosError).response?.data;
//   }
// };

export const getUserById = async (id: number, pharmacyId: number) => {
  const token = localStorage.getItem("token"); // or wherever you store the JWT

  try {
    const response = await api.get(`/user-management/getUserById`, {
      params: { userId: id, pharmacyId },
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    return (error as AxiosError).response?.data;
  }
};
