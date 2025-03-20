
export interface PurchaseEntryItem {
    itemId: number;
    itemName?: string;
    batchNo: string;
    packageQuantity: number;
    expiryDate: string;
    purchasePrice: number;
    mrpSalePrice: number;
    cgstPercentage: number;
    sgstPercentage: number;
    cgstAmount: number;
    sgstAmount: number;
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
  
    stockItemDtos: PurchaseEntryItem[]; 
  }
  