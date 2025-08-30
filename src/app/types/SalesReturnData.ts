import { BillingData } from './BillingData';
import { PatientData } from './PatientData';

export interface SalesReturnItemData {
  billReturnItemId?: string;
  itemId: string;   
  batchNo: string; 
  expiryDate?: Date | string | null;
  packageQuantity: number; 
  returnQuantity: number;  
  mrpSalePricePerUnit: number; 
  gstPercentage?: number;     
  gstAmount?: number; 
  grossTotal: number; 
  netTotal: number; 
  returnItemId?: string;        
  billItemId?: string;       
  itemName?: string;       
  returnReason?: string; 
  maxQuantity?: number;  
  returnedQuantity?: number;    
  originalPrice?: number;       
  cgstPercentage: number;     
  sgstPercentage: number;   
  cgstAmount?: number;         
  sgstAmount?: number;         
  grossAmount?: number;            
  netAmount?: number;              
  refundAmount?: number;            
  billedAmount?: number;            
  discountPercentage?: number;      
}

export interface SalesReturnData {
  billReturnId?: string;           
  billReturnId1?: string;       
  originalBillId: string;         
  patientId: string;           
  patientName?: string;           
  billReturnDateTime: string | Date;
  pharmacyId?: string; //(pharmacy id is added for multi pharmacy)     
  subTotal: number;               
  totalGst?: number;               
  grandTotal: number;     
  billReturnItemDtos: SalesReturnItemData[]; 
  billId1?: string; 
  originalBill?: BillingData; 
  patient?: PatientData;
  returnItem?: SalesReturnItemData[]; 
  paymentStatus?: 'pending' | 'processed';
  paymentMethod?: string;
  receivedAmount?: number;
  balanceAmount?: number;
  totalRefundAmount?: number;   
  processedBy?: string;
  createdBy?: number;
  createdAt?: Date | string;
  updatedAt?: Date | string;
  BillReturnDto?: SalesReturnData[];
  returnReason?: string; 
  totalCgst?: number;
  totalSgst?: number; 
  totalDiscount?: number; 
}

export interface SalesReturnListData {
  originalBillId: string;
  billReturnId: string;
  billReturnId1: string;
  billId1: string;
  billReturnDateTime: string | Date;
  grandTotal: number;
  patientType: string;
  patientId: string;
  patientName: string;
  returnedItem: number;
}