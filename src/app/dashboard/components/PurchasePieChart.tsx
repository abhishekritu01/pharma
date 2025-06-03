"use client"

import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { SupplierData } from '@/app/types/dashboard';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card';
import { TooltipProps } from 'recharts';

interface PurchasesPieChartProps {
  data: SupplierData[];
  // className?: string;
}

const PurchasesPieChart: React.FC<PurchasesPieChartProps> = ({ data}) => {
  const total = data.reduce((sum, item) => sum + item.purchaseAmount, 0);
  
  const CustomTooltip: React.FC<TooltipProps<number, string>> = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const item = payload[0].payload as SupplierData; // Safely cast
  
      return (
        <div className="bg-white p-3 rounded-md shadow-md border border-pharma-primary/30">
          <p className="font-medium text-pharma-tertiary">{item.name}</p>
          <p className="text-sm text-gray-600">
            {item.name.includes('Purchases') ? '$' : ''}{item.purchaseAmount.toLocaleString()}
          </p>
          <p className="text-xs text-gray-500">
            {((item.purchaseAmount / total) * 100).toFixed(1)}% of total
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <Card className={`bg-purple-100 text-darkPurple border-none`}>
      <CardHeader className="pb-2 ">
        <CardTitle className="text-lg font-semibold text-pharma-tertiary ">
          Dashboard Summary
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[400px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                outerRadius={150}
                dataKey="purchaseAmount"
                label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
              <Legend layout="horizontal" verticalAlign="bottom" align="center" />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};

export default PurchasesPieChart;
