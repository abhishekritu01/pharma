import { SupplierData, ItemPurchase, StockItem, ExpiryTimeframe  } from '@/app/types/dashboard';
import { useState, useEffect } from 'react';

// Mock data for demonstration
const mockSuppliers: SupplierData[] = [
  { id: '1', name: 'PharmaCorp', purchaseAmount: 25000, color: '#8884d8' },
  { id: '2', name: 'MediSupply', purchaseAmount: 18000, color: '#83a6ed' },
  { id: '3', name: 'HealthPharm', purchaseAmount: 12000, color: '#8dd1e1' },
  { id: '4', name: 'CureAll', purchaseAmount: 15000, color: '#82ca9d' },
  { id: '5', name: 'MediTech', purchaseAmount: 8000, color: '#a4de6c' }
];

const mockPurchases: ItemPurchase[] = [
  { id: '1', name: 'Paracetamol 500mg', supplier: 'PharmaCorp', date: '2025-04-15', amount: 1200, quantity: 100 },
  { id: '2', name: 'Amoxicillin 250mg', supplier: 'MediSupply', date: '2025-04-14', amount: 2500, quantity: 50 },
  { id: '3', name: 'Ibuprofen 400mg', supplier: 'HealthPharm', date: '2025-04-13', amount: 800, quantity: 80 },
  { id: '4', name: 'Cetirizine 10mg', supplier: 'CureAll', date: '2025-04-12', amount: 1500, quantity: 150 },
  { id: '5', name: 'Omeprazole 20mg', supplier: 'MediTech', date: '2025-04-10', amount: 1800, quantity: 90 },
  { id: '6', name: 'Salbutamol Inhaler', supplier: 'PharmaCorp', date: '2025-04-09', amount: 3000, quantity: 40 },
  { id: '7', name: 'Aspirin 75mg', supplier: 'MediSupply', date: '2025-04-08', amount: 600, quantity: 200 },
  { id: '8', name: 'Metformin 500mg', supplier: 'HealthPharm', date: '2025-04-07', amount: 1100, quantity: 120 }
];

const mockLowStock: StockItem[] = [
  { id: '1', name: 'Paracetamol 500mg', currentStock: 15, minStockLevel: 20, price: 12, supplier: 'PharmaCorp' },
  { id: '2', name: 'Amoxicillin 250mg', currentStock: 8, minStockLevel: 30, price: 50, supplier: 'MediSupply' },
  { id: '3', name: 'Ibuprofen 400mg', currentStock: 5, minStockLevel: 25, price: 10, supplier: 'HealthPharm' },
  { id: '4', name: 'Metformin 500mg', currentStock: 18, minStockLevel: 20, price: 9.2, supplier: 'HealthPharm' },
  { id: '5', name: 'Amlodipine 5mg', currentStock: 12, minStockLevel: 15, price: 15.5, supplier: 'MediTech' }
];

// const mockExpired: Record<ExpiryTimeframe, ExpiredItem[]> = {
//   '24h': [
//     { id: '1', name: 'Tetracycline 250mg', expiryDate: '2025-04-20', batchNumber: 'TC1234', quantity: 25, supplier: 'PharmaCorp' },
//     { id: '2', name: 'Insulin Regular', expiryDate: '2025-04-20', batchNumber: 'IR5678', quantity: 10, supplier: 'MediTech' }
//   ],
//   '7d': [
//     { id: '3', name: 'Diazepam 5mg', expiryDate: '2025-04-25', batchNumber: 'DZ9012', quantity: 15, supplier: 'HealthPharm' },
//     { id: '4', name: 'Hydrocortisone Cream', expiryDate: '2025-04-26', batchNumber: 'HC3456', quantity: 8, supplier: 'CureAll' },
//     { id: '5', name: 'Warfarin 3mg', expiryDate: '2025-04-23', batchNumber: 'WF7890', quantity: 12, supplier: 'PharmaCorp' }
//   ],
//   '15d': [
//     { id: '6', name: 'Metronidazole 400mg', expiryDate: '2025-05-01', batchNumber: 'MZ1234', quantity: 30, supplier: 'MediSupply' },
//     { id: '7', name: 'Fluoxetine 20mg', expiryDate: '2025-05-03', batchNumber: 'FL5678', quantity: 20, supplier: 'HealthPharm' },
//     { id: '8', name: 'Atorvastatin 10mg', expiryDate: '2025-05-02', batchNumber: 'AT9012', quantity: 15, supplier: 'CureAll' }
//   ],
//   '1m': [
//     { id: '9', name: 'Losartan 50mg', expiryDate: '2025-05-15', batchNumber: 'LS3456', quantity: 25, supplier: 'PharmaCorp' },
//     { id: '10', name: 'Citalopram 20mg', expiryDate: '2025-05-18', batchNumber: 'CT7890', quantity: 18, supplier: 'MediSupply' },
//     { id: '11', name: 'Simvastatin 20mg', expiryDate: '2025-05-12', batchNumber: 'SM1234', quantity: 22, supplier: 'HealthPharm' },
//     { id: '12', name: 'Ramipril 5mg', expiryDate: '2025-05-10', batchNumber: 'RM5678', quantity: 15, supplier: 'MediTech' }
//   ]
// };

export function useDashboardData(selectedTimeframe: ExpiryTimeframe = '24h') {
  const [suppliers, setSuppliers] = useState<SupplierData[]>([]);
  const [purchases, setPurchases] = useState<ItemPurchase[]>([]);
  const [lowStock, setLowStock] = useState<StockItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        await new Promise(resolve => setTimeout(resolve, 800));

        // Filter purchases based on timeframe
        // const now = new Date();
        const filterDate = new Date();
        
        switch(selectedTimeframe) {
          case '24h':
            filterDate.setHours(filterDate.getHours() - 24);
            break;
          case '7d':
            filterDate.setDate(filterDate.getDate() - 7);
            break;
          case '15d':
            filterDate.setDate(filterDate.getDate() - 15);
            break;
          case '1m':
            filterDate.setMonth(filterDate.getMonth() - 1);
            break;
        }

        const filteredPurchases = mockPurchases.filter(
          purchase => new Date(purchase.date) >= filterDate
        );

        // Calculate supplier data based on filtered purchases
        const supplierTotals = filteredPurchases.reduce((acc, purchase) => {
          const supplier = acc.find(s => s.name === purchase.supplier);
          if (supplier) {
            supplier.purchaseAmount += purchase.amount;
          } else {
            acc.push({
              id: purchase.supplier,
              name: purchase.supplier,
              purchaseAmount: purchase.amount,
              color: mockSuppliers.find(s => s.name === purchase.supplier)?.color || '#8884d8'
            });
          }
          return acc;
        }, [] as SupplierData[]);

        setSuppliers(supplierTotals);
        setPurchases(filteredPurchases);
        setLowStock(mockLowStock); // This doesn't change with timeframe
        setLoading(false);
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        setError('Failed to fetch dashboard data. Please try again later.');
        setLoading(false);
      }
    };

    fetchData();
  }, [selectedTimeframe]);

  return {
    suppliers,
    purchases,
    lowStock,
    loading,
    error
  };
}
