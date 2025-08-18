export interface BillingSummaryData {
  totalReturnAmount: number | null;
  totalReturnBills: number;
  unpaidTotalAmount: number | null;
  unpaidTotalBills: number;
  paidTotalAmount: number | null;
  paidTotalBills: number;
}

export interface BillingSummaryResponse {
  status: 'success' | 'error';
  data?: BillingSummaryData;
  message?: string;
}

export interface PaymentSummaryData {
  cardTotal: number;
  upiNetTotal: number;
  cashTotal: number;
  upiCashTotal: number;
  cardCount: number;
  upiNetCount: number;
  cashCount: number;
  upiCashCount: number;
}

export interface PaymentSummaryResponse {
  status: 'success' | 'error';
  data?: PaymentSummaryData;
  message?: string;
}



export interface BillingGstSummaryItem {
  formattedBillDate?: string;
  billId1: string;
  billDate: string;
  subTotal: number;
  totalGst: number;
  grandTotal: number;
}

export interface BillingGstSummaryResponse {
  status: 'success' | 'error';
  data?: BillingGstSummaryItem[];
  message?: string;
}