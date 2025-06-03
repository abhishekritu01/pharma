"use client"

import React from 'react';
import { Bell, Search, User } from 'lucide-react';

const DashboardHeader: React.FC = () => {
  return (
    <header className="bg-white border-b border-border px-6 py-3 flex items-center justify-between">
      <div className="flex items-center space-x-3">
        <div className="flex items-center justify-center w-10 h-10 rounded-md bg-pharma-primary text-pharma-tertiary font-bold">
          Px
        </div>
        <h1 className="text-xl font-bold text-pharma-tertiary">PharmaTrack</h1>
      </div>
      
      <div className="flex-1 max-w-md mx-10">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input 
            type="text" 
            placeholder="Search inventory..." 
            className="w-full rounded-full bg-muted pl-10 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-pharma-primary focus:bg-white transition-colors"
          />
        </div>
      </div>

      <div className="flex items-center space-x-4">
        <button className="relative p-2 rounded-full hover:bg-muted transition-colors">
          <Bell className="h-5 w-5 text-muted-foreground" />
          <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full bg-pharma-red-alert text-white text-xs flex items-center justify-center">
            3
          </span>
        </button>
        <div className="w-px h-6 bg-border"></div>
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 rounded-full bg-pharma-primary/30 flex items-center justify-center">
            <User className="h-4 w-4 text-pharma-tertiary" />
          </div>
          <span className="text-sm font-medium text-pharma-tertiary">Admin</span>
        </div>
      </div>
    </header>
  );
};

export default DashboardHeader;
