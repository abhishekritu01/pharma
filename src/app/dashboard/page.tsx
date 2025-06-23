"use client";

import React, { useState } from "react";

import { Package, Truck, DollarSign, Box, AlertCircle } from "lucide-react";
import { useDashboardData } from "./hooks/useDashboardData";
import StatCard from "./components/StatCard";
import PurchasesPieChart from "./components/PurchasePieChart";
import { ExpiryTimeframe } from "../types/dashboard";
import { ToggleGroup, ToggleGroupItem } from "./ui/toggle-group";

const Index = () => {
  const [selectedTimeframe, setSelectedTimeframe] =
    useState<ExpiryTimeframe>("24h");
  const { suppliers, purchases, lowStock, loading, error } =
    useDashboardData(selectedTimeframe);

  // Calculate total values for stat cards based on filtered data
  const totalPurchases = purchases.reduce((sum, item) => sum + item.amount, 0);
  const totalSuppliers = suppliers.length;
  const totalLowStock = lowStock.length;
  const totalStock = purchases.reduce((sum, item) => sum + item.quantity, 0);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-purple-300 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <h2 className="text-lg font-semibold text-Purple">
            Loading dashboard data...
          </h2>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center max-w-md p-6 bg-white rounded-lg shadow-md">
          <AlertCircle className="w-12 h-12 text-pharma-red-alert mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-pharma-tertiary mb-2">
            Error Loading Dashboard
          </h2>
          <p className="text-muted-foreground">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <main className="flex-1">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="bg-purple-100 rounded-lg p-6">
          <h1 className="text-2xl font-bold text-darkPurple mb-2">
            Welcome to Pharmacy Dashboard
          </h1>
          <p className="text-[var(--PRIMARY-GRAY)]">
            Monitor your pharmacy inventory and purchases in real-time
          </p>
        </div>

        <div className="flex justify-center mb-6">
          <ToggleGroup
            type="single"
            value={selectedTimeframe}
            onValueChange={(value) =>
              value && setSelectedTimeframe(value as ExpiryTimeframe)
            }
            className="bg-purple-100 rounded-lg shadow-sm p-1 text-darkPurple"
          >
            <ToggleGroupItem
              value="24h"
              className="px-6 py-2 data-[state=on]:bg-primaryPurple cursor-pointer rounded-md"
            >
              Last 24 Hours
            </ToggleGroupItem>

            <ToggleGroupItem
              value="7d"
              className="px-6 py-2 data-[state=on]:bg-primaryPurple cursor-pointer rounded-md"
            >
              Last 7 Days
            </ToggleGroupItem>
            <ToggleGroupItem
              value="15d"
              className="px-6 py-2 data-[state=on]:bg-primaryPurple cursor-pointer rounded-md"
            >
              Last 15 Days
            </ToggleGroupItem>
            <ToggleGroupItem
              value="1m"
              className="px-6 py-2 data-[state=on]:bg-primaryPurple cursor-pointer rounded-md"
            >
              Last Month
            </ToggleGroupItem>
          </ToggleGroup>
        </div>

        {/* Stat Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Total Stock"
            value={totalStock}
            icon={<Box className="h-5 w-5" />}
            description="Total items in inventory"
          />
          <StatCard
            title="Total Purchases"
            value={`₹${totalPurchases.toLocaleString("en-IN")}`}
            icon={<DollarSign className="h-5 w-5" />}
            description="Total purchases value"
          />
          <StatCard
            title="Active Suppliers"
            value={totalSuppliers}
            icon={<Truck className="h-5 w-5" />}
            description="Total number of Suppliers"
          />
          <StatCard
            title="Low Stock Items"
            value={totalLowStock}
            icon={<Package className="h-5 w-5" />}
            description="Items below minimum stock level"
          />
        </div>

        {/* Full-width Pie Chart */}
        <div className="w-full rounded-lg shadow-sm ">
          <PurchasesPieChart
            data={[
              {
                id: "1",
                name: "Total Stock",
                purchaseAmount: totalStock,
                color: "#5a55a6",
              },
              {
                id: "2",
                name: "Total Purchases",
                purchaseAmount: totalPurchases,
                color: "#4e9567",
              },
              {
                id: "3",
                name: "Active Suppliers",
                purchaseAmount: totalSuppliers * 1000,
                color: "#cc9d33",
              },
              {
                id: "4",
                name: "Low Stock Items",
                purchaseAmount: totalLowStock * 1000,
                color: "#cc5b1f",
              },
            ]}
          />
        </div>

        {/* Lists */}
        {/* <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <ScrollableCard title="All Purchases">
            <PurchasesList items={purchases} />
          </ScrollableCard>

          <ScrollableCard title="Low Stock Items">
            <LowStockList items={lowStock} compact />
          </ScrollableCard>
        </div> */}
      </div>
    </main>
  );
};

export default Index;
