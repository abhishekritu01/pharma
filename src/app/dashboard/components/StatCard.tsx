"use client"

import React from 'react';
import { TrendingDown, TrendingUp } from 'lucide-react';
import { Card, CardContent, CardFooter } from '../ui/card';

interface StatCardProps {
  title: string;
  value: string | number;
  description?: string;
  icon: React.ReactNode;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  // className?: string;
}

const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  description,
  trend,
}) => {
  return (
    <Card className={`bg-purple-100  border-none `}>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-darkPurple">{title}</p>
            <h3 className="text-2xl font-bold mt-1 text-gray">{value}</h3>
          </div>
         
        </div>
      </CardContent>
      {(description || trend) && (
        <CardFooter className="border-t border-Gray p-2 px-4">
          {description && <p className="text-xs text-darkPurple">{description}</p>}
          {trend && (
            <div className={`flex items-center gap-1 text-xs ml-auto ${
              trend.isPositive ? 'text-green-500' : 'text-red-500'
            }`}>
              {trend.isPositive ? (
                <TrendingUp className="h-3 w-3" />
              ) : (
                <TrendingDown className="h-3 w-3" />
              )}
              <span>{trend.value}%</span>
            </div>
          )}
        </CardFooter>
      )}
    </Card>
  );
};

export default StatCard;
