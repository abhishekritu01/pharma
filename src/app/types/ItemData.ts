
export interface ItemData {
    itemId?: string;
    itemName: string;
    purchaseUnit: number;
    unitId: string;
    variantId: string;
    unitName?: string;
    variantName?: string;
    manufacturer: string;
    purchasePrice: number;
    mrpSalePrice: number;
    purchasePricePerUnit: number;
    mrpSalePricePerUnit: number;
    cgstPercentage: number;
    sgstPercentage: number;
    gstPercentage: number;
    hsnNo: string;
    consumables: string;
  }