
export interface ItemData {
    itemId: string;
    itemName: string;
    purchaseUnit: number;
    variantId?: string;
    unitId?: string;
    variantName: string;
    unitName: string;
    manufacturer: string;
    purchasePrice: number;
    mrpSalePrice: number;
    purchasePricePerUnit: number;
    mrpSalePricePerUnit: number;
    gstPercentage: number;
    genericName?: string;
    hsnNo: string;
    consumables: string;
  } 