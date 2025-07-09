
export interface PurchaseEntryItem {
    itemId: string;
    itemName?: string;
    batchNo: string;
    packageQuantity: number;
    expiryDate: string;
    purchasePrice: number;
    mrpSalePrice: number;
    purchasePricePerUnit: number;
    mrpSalePricePerUnit: number;
    cgstPercentage?: number;
    sgstPercentage?: number;
    gstPercentage:number;
    cgstAmount?: number;
    sgstAmount?: number;
    gstAmount: number;
    discount: number;
    amount: number;
    pharmacyId?: string;
    pharmacyName?: string;
    supplierName?: string;

  }
  
  export interface PurchaseEntryData {
    invId?:string;
    orderId:string;
    orderId1?:string;
    purchaseDate: Date;
    purchaseBillNo: string;
    creditPeriod?: number;
    paymentDueDate?: Date;
    supplierId: string;
    invoiceAmount?: number;
    paymentStatus:string;
    goodStatus:string;
    totalAmount?: number;
    totalCgst: number;
    totalSgst: number;
    totalDiscount?: number;
    grandTotal: number;
    supplierName?: string;
    grnNo?:string;
    dueStatus?:string;
    pharmacyId?: string;

    stockItemDtos: PurchaseEntryItem[]; 
  }
  