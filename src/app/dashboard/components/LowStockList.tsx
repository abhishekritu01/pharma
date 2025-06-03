"use client"


import React from 'react';
import { AlertTriangle } from 'lucide-react';
import { StockItem } from '@/app/types/dashboard';

interface LowStockListProps {
  items: StockItem[];
  // compact?: boolean;
}

const LowStockList: React.FC<LowStockListProps> = ({ items }) => {
  return (
    <div className="space-y-3">
      {items.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-32 text-muted-foreground">
          <AlertTriangle className="h-10 w-10 mb-2 opacity-30" />
          <p>No low stock items</p>
        </div>
      ) : (
        items.map((item) => {
          const isUrgent = item.currentStock < item.minStockLevel / 2;
          
          return (
            <div 
              key={item.id} 
              className={`p-3 rounded-md border hover:bg-accent/50 cursor-pointer transition-colors ${
                isUrgent 
                  ? 'border-pharma-red-alert/50 bg-pharma-red-alert/5' 
                  : 'border-pharma-yellow-alert/50 bg-pharma-yellow-alert/5'
              }`}
            >
              <div className="flex justify-between items-center">
                <h4 className={`font-medium text-sm ${isUrgent ? 'text-pharma-red-alert' : ''}`}>
                  {item.name}
                </h4>
                <p className={`font-semibold text-sm ${isUrgent ? 'text-pharma-red-alert' : ''}`}>
                  {item.currentStock} units
                </p>
              </div>
            </div>
          );
        })
      )}
    </div>
  );
};

export default LowStockList;
