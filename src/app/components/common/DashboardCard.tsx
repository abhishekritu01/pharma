import React from "react";

interface DashboardCardProps {
  title: string;
  value: number | string;
  subtitle: string;
}

const DashboardCard: React.FC<DashboardCardProps> = ({ title, value, subtitle }) => {
  return (
    <div className="border rounded-xl w-full h-36 border-gray-100 shadow-[0_8px_30px_rgba(0,0,0,0.15)]">
      <div className="p-6 space-y-1.5">
        <div className="text-sm font-semibold text-darkPurple">{title}</div>
        <div className="text-2xl font-bold text-gray">{value}</div>
      </div>
      <div>
        <div className="border-t border-Gray mt-1"></div>
        <div className="px-6 py-2 text-xs text-darkPurple">{subtitle}</div>
      </div>
    </div>
  );
};

export default DashboardCard;
