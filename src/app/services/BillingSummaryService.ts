import api from '@/utils/api';
import { AxiosError } from 'axios';
import { 
  BillingSummaryData, 
  BillingSummaryResponse,
  PaymentSummaryData,
  PaymentSummaryResponse 
} from '../types/BillingSummaryData'; 

export const getBillingSummaryByDate = async (date: Date): Promise<BillingSummaryData> => {
  try {
    const token = localStorage.getItem("authToken");
    const formattedDate = date.toISOString().split('T')[0];
    
    const response = await api.get<BillingSummaryResponse>(
      `pharma/bill/billingSummary?date=${formattedDate}`, 
      {
        headers: { Authorization: `Bearer ${token}` }
      }
    );

    if (!response.data.data) {
      throw new Error(response.data.message || 'No summary data available');
    }

    return response.data.data;
  } catch (error) {
    console.error('Billing summary error:', error);
    throw error instanceof AxiosError
      ? new Error(error.response?.data?.message || 'Network error')
      : new Error('Failed to fetch summary');
  }
};

export const getPaymentSummaryByDate = async (date: Date): Promise<PaymentSummaryData> => {
  try {
    const token = localStorage.getItem("authToken");
    const formattedDate = date.toISOString().split('T')[0];
    
    const response = await api.get<PaymentSummaryResponse>(
      `pharma/bill/paymentSummary?date=${formattedDate}`, 
      {
        headers: { Authorization: `Bearer ${token}` }
      }
    );

    if (!response.data.data) {
      throw new Error(response.data.message || 'No payment summary data available');
    }

    return response.data.data;
  } catch (error) {
    console.error('Payment summary error:', error);
    throw error instanceof AxiosError
      ? new Error(error.response?.data?.message || 'Network error')
      : new Error('Failed to fetch payment summary');
  }
};