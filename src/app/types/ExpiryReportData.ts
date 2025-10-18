export interface ExpiryReportData {
  itemId: string;
  itemName: string;
  batchNo: string;
  packageQuantity: number;
  expiryDate: Date;
  supplierId: string;
  supplierName: string;
  formattedExpiryDate?: string;
  daysUntilExpiry?: number;
  quantity?: number; 
}









// import { SupplierData } from "./dashboard";
// import { ItemData } from "./ItemData";
// import { InventoryData } from "./InventoryData";
// import { VariantData, UnitData } from "./VariantData";

// export interface ExpiryReportData {
//   itemId: string;
//   itemName: string;
//   batchNo: string;
//   packageQuantity: number;
//   quantity: number;
//   expiryDate: Date;
//   supplierId: string;
//   supplierName: string;
//   expiryStatus: string;
//   formattedExpiryDate?: string;
//   expiredStock?: number;
//   currentStock?: number;
//   supplier?: SupplierData;
//   item?: ItemData;
//   inventory?: InventoryData;
//   variantId?: string;
//   variantName?: string;
//   unitDtos?: UnitData[];
//   unitId?: string;
//   unitName?: string;
//   variantData?: VariantData;
//   unit?: UnitData;
// }
