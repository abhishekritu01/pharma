import { SupplierData } from "./dashboard";
import { ItemData } from "./ItemData";
import { InventoryData } from "./InventoryData";
import { VariantData, UnitData } from "./VariantData";





export interface ExpiryReportData {
  packageQuantity: number;
    expiredStock: number;
    currentStock: number;
  itemId?: string;
    itemName: string;
    supplier: SupplierData;
    supplierId: string;
    supplierName: string;
    item: ItemData;
    inventory: InventoryData;
    expiryDate: string;
    quantity: number;
    batchNo: string;
    expiryStatus: string;
     variantId: string;
    variantName: string;
    unitDtos: UnitData[];
    unitId: string;
    unitName: string; 
    variantData: VariantData;
    unit: UnitData;
  }