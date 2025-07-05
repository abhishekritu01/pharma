// salesReturnData.ts
import { BillingData } from './BillingData';
import { PatientData } from './PatientData'; 

export interface SalesReturnItemData {
  returnItemId: string;
  billItemId: string;
  itemId: string;
  itemName: string;
  batchNo: string;
  returnedQuantity: number;
  returnReason: string;
  originalPrice: number;
  refundAmount: number;
}

export interface SalesReturnData {
  returnId: string;
  returnId1?: string;
  originalBillId: string;
  originalBill?: BillingData;
  patientId: string;
  patientName?: string;
  patient?: PatientData;
  returnDate: Date | string;
  returnReason?: string;
  subTotal?: number;          
  totalGst?: number;          
  totalDiscount?: number;     
  grandTotal?: number;        
  totalRefundAmount: number;
  paymentStatus: 'pending' | 'processed';
  paymentMethod?: string;
  receivedAmount?: string;   
  balanceAmount?: string;   
  processedBy?: string;
  createdBy?: number;
  createdAt?: Date | string;
  updatedAt?: Date | string;
}

































































// import { BillingData, BillingItemData} from './BillingData';

// export interface SalesReturnItemData {
//   returnItemId: string;
//   billItemId: string;
//   itemId: string;
//   itemName: string;
//   batchNo: string;
//   returnedQuantity: number;
//   returnReason: string;
//   originalPrice: number;
//   refundAmount: number;
// }

// export interface SalesReturnData {
//   returnId: string;
//   returnId1?: string;
//   originalBillId: string;
//   originalBill?: BillingData;
//   returnDate: Date | string;
//   patientId: string;
//   patientName?: string;
//   returnReason?: string;
//   totalRefundAmount: number;
//   paymentStatus: 'pending' | 'processed';
//   paymentMethod?: string;
//   processedBy?: string;
//   returnItems: SalesReturnItemData[];
//   createdAt?: Date | string;
//   updatedAt?: Date | string;
// }