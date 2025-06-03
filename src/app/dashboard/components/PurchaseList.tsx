"use client"


import React from 'react';
import { Package } from 'lucide-react';
import { ItemPurchase } from '@/app/types/dashboard';

interface PurchasesListProps {
  items: ItemPurchase[];
}

const PurchasesList: React.FC<PurchasesListProps> = ({ items }) => {
  return (
    <div className="space-y-3 border-Gray text-gray">
      {items.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-32 text-muted-foreground">
          <Package className="h-10 w-10 mb-2 opacity-30" />
          <p>No purchase data available</p>
        </div>
      ) : (
        items.map((item) => (
          <div 
            key={item.id} 
            className="p-3 rounded-md border border-border bg-card hover:bg-accent/50 cursor-pointer transition-colors"
          >
            <div className="flex justify-between items-center">
              <h4 className="font-medium text-sm">{item.name}</h4>
              <p className="text-sm text-muted-foreground">Qty: {item.quantity}</p>
            </div>
          </div>
        ))
      )}
    </div>
  );
};

export default PurchasesList;
