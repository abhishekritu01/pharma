export interface SupplierData {
    id: string;
    name: string;
    purchaseAmount: number;
    color: string;
  }
  
  export interface ItemPurchase {
    id: string;
    name: string;
    supplier: string;
    date: string;
    amount: number;
    quantity: number;
  }
  
  export interface StockItem {
    id: string;
    name: string;
    currentStock: number;
    minStockLevel: number;
    price: number;
    supplier: string;
  }
  
  export interface ExpiredItem {
    id: string;
    name: string;
    expiryDate: string;
    batchNumber: string;
    quantity: number;
    supplier: string;
  }
  
  export type ExpiryTimeframe = '24h' | '7d' | '15d' | '1m';
  
  export interface DashboardSummary {
    totalStock: number;
    totalPurchases: number;
    totalSuppliers: number;
    totalLowStock: number;
    totalExpiring: number;
  }
  