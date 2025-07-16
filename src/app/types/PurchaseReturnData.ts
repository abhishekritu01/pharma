import { OptionType } from "../components/common/ItemDropdown";

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
  gstPercentage?: number;
  selectedItem?: OptionType | null;
  purchaseBillNo?: string;
  purchaseBillOptions?: OptionType[];
  supplierName?: string;
  supplierId?: string;
}

export interface PurchaseReturnData {
  returnId?: string;
  returnId1?: string;
  pharmacyId: string;
  pharmacyName?: string;
  supplierId: string;
  supplierName?: string;
  returnDate: Date;
  returnReason?: string;
  refundType?: string;
  totalAmount: number;
  totalGst: number;
  returnAmount: number;
  purchaseBillNo?: string;
  grnno?: string;
  returnQuantity?: number;
  purchaseReturnItemDtos: PurchaseReturnItem[];
}