export interface SupplierPaymentData {
    paymentId: string;
    pharmacyId?: string;
    supplierId: string;
    paymentDate?: Date;
    paymentMode: string;
    referenceNo: string;
    amountPaid: number;
    remark?: string;
    
    supplierPaymentDetailsDtos: SupplierPaymentDetails[]; 
    
  }


  export interface SupplierPaymentDetails {
    paymentDetailsId?: string;
    purchaseBillNo: string;
    clearedAmount?: number;
    invId?: string;

  }