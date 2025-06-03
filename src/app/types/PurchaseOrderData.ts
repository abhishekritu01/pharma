export interface PurchaseOrderItem {
    orderItemId?: number;
    itemId: string;
    itemName: string;
    quantity: number;
    manufacturer: string;
    gstPercentage: number;
    gstAmount: number;
    amount: number;
    unitTypeId: string;
    variantTypeId: string;
    variantName?: string;
    unitName?: string;
    purchasePrice?: number;

  }
  
  export interface PurchaseOrderData {
    orderId?: string;
    orderId1?: string;
    pharmacyId: string;
    pharmacistId?: number;
    supplierId: string;
    supplierName?: string;
    orderedDate: Date;
    intendedDeliveryDate:Date;
    totalAmount: number;
    totalGst: number;
    grandTotal: number;
    pharmacyName?:string;
  
    purchaseOrderItemDtos: PurchaseOrderItem[]; 
  }