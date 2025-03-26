export interface PurchaseOrderItem {
    orderItemId?: number;
    itemId: number;
    quantity: number;
    manufacturer: string;
    gstPercentage: number;
    gstAmount: number;
    amount: number;
    unitTypeId: number;
    variantTypeId: number;
  }
  
  export interface PurchaseOrderData {
    orderId?: string;
    orderId1: string;
    pharmacyId: string;
    pharmacistId: number;
    supplierId: number;
    orderedDate: Date;
    intendedDeliveryDate:Date;
    totalAmount: number;
    totalGst: number;
    grandTotal: number;
  
    purchaseOrderItemDtos: PurchaseOrderItem[]; 
  }