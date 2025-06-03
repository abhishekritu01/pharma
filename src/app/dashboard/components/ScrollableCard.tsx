"use client"


import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card';
import { ScrollArea } from '../ui/scroll-area';

interface ScrollableCardProps {
  title: string;
  children: React.ReactNode;
  className?: string;
}

const ScrollableCard: React.FC<ScrollableCardProps> = ({ title, children, className }) => {
  return (
    <Card className={`h-full animate-fade-in ${className}`}>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-semibold text-pharma-tertiary">{title}</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <ScrollArea className="h-[280px] px-4 pb-4">
          {children}
        </ScrollArea>
      </CardContent>
    </Card>
  );
};

export default ScrollableCard;