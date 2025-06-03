export interface BillingItemData {
    billItemId: number;
    itemId: string;
    // itemName: string;
    batchNo: string;
    expiryDate: Date;
    quantity: number;
    discount: number;
    mrp: number;
    gstPercentage: number;
    gstAmount: number;
    grossTotal: number;
    netTotal: number;

  }
  
  export interface BillingData {
    billId: string;
    billId1?: string;
    pharmacyId: string;
    billDate: Date;
    billTime: string;
    patientId: string;
    patientName?: string;
    doctorId: string;
    patientType:string;
    subTotal: number;
    totalGst: number;
    totalDiscount: number;
    grandTotal: number;
    paymentType:string;
    billStatus:string;
    pharmacyName?:string;
  
    billItemDtos: BillingItemData[]; 
  }