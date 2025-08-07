// types/BillingSummaryData.ts
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