export interface PurchaseReturnItem {
    itemId: string;
    itemName: string;
    batchNo: string;
    returnQuantity: number;
    availableQuantity: number;
    purchasePrice: number;
    returnType: string;
    discrepancyIn: string;
    discrepancy: string;
    packageQuantity?: number;

    // manufacturer: string;
    // gstPercentage: number;
    // gstAmount: number;
    // amount: number;
    // unitTypeId: string;
    // variantTypeId: string;
    // variantName?: string;
    // unitName?: string;
    // purchasePrice?: number;  

  }
  
  export interface PurchaseReturnData {
    returnId?: string;
    returnId1?: string;
    pharmacyId: string;
    pharmacyName?:string;
    supplierId: string;
    supplierName?: string;
    returnDate: Date;
    returnReason?:string;
    refundType?: string;
    returnAmount: number;
    purchaseBillNo?: string;
    grnno?: string;
    returnQuantity?: number;
    purchaseReturnItemDtos: PurchaseReturnItem[]; 
  }