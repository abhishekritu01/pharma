
export interface PurchaseEntryItem {
    itemId: number;
    batchNo: string;
    packageQuantity: number;
    expiryDate: string;
    purchasePrice: number;
    mrpSalePrice: number;
    gstPercentage: number;
    gstAmount: number;
    discount: number;
    amount: number;
    store:string;
  }
  
  export interface PurchaseEntryData {
    purchaseDate: Date;
    purchaseBillNo: string;
    creditPeriod?: number;
    paymentDueDate?: Date;
    supplierId: number;
    invoiceAmount?: number;
    paymentStatus:string;
    goodStatus:string;
    totalAmount?: number;
    totalGst?: number;
    totalDiscount?: number;
    grandTotal: number;
  
    stockItemDtos: PurchaseEntryItem[]; // Array to handle the one-to-many mapping
  }
  