import api from '@/utils/api';
import { AxiosError } from 'axios';
import { DoctorData } from '../types/DoctorData';

export const createDoctor = async (formData: DoctorData): Promise<DoctorData> => {
    try {
      const response = await api.post<{ data: DoctorData; message: string; status: string }>(
        'pharma/doctor/save',
        formData
      );
      console.log("API Response:", response.data);
      return response.data.data;
    } catch (error: unknown) {
      if (error instanceof AxiosError) {
        const message = error.response?.data?.message || 'An error occurred while creating the Doctor.';
        throw new Error(message);
      } else {
        throw new Error('An unknown error occurred.');
      }
    }
  };


  export const getDoctor = async () => {
    try {
        const response = await api.get('pharma/doctor/getAll');
        return response.data.data;
    } catch (error: unknown) {
        console.error('Error fetching Doctor:', error);
        if (error instanceof Error) {
            throw new Error(`Error fetching Doctor: ${error.message}`);
        } else {
            throw new Error('An unknown error occurred while fetching Doctor.');
        }
    }
  };


export const getDoctorById = async (doctorId: string) => {
  try {
      const response = await api.get(`pharma/doctor/getById/${doctorId}`);
      return response.data.data;
  } catch (error: unknown) {
      console.error('Error fetching Doctor:', error);
      if (error instanceof Error) {
          throw new Error(`Error fetching Doctor: ${error.message}`);
      } else {
          throw new Error('An unknown error occurred while Doctor.');
      }
  }
};


export const checkDuplicateDoctor = async (data: {doctorName: string; doctorMobile: number;}): Promise<{ duplicate: boolean }> => {
  try {
    const response = await api.post<{ duplicate: boolean }>(
      'pharma/doctor/check-duplicate',
      data
    );
    return response.data;
  } catch (error: unknown) {
    if (error instanceof AxiosError) {
      const message = error.response?.data?.message || 'Failed to check duplicate.';
      throw new Error(message);
    } else {
      throw new Error('An unknown error occurred.');
    }
  }
};