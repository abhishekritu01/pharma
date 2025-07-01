"use client";

import {
  Chart as ChartJS,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
} from "chart.js";
import ChartDataLabels from "chartjs-plugin-datalabels";
import { Bar } from "react-chartjs-2";
import React from "react";
import type { Context } from "chartjs-plugin-datalabels";

ChartJS.register(
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  ChartDataLabels
);

interface BarChartProps {
  salesData: number[];
}

const BarChart: React.FC<BarChartProps> = ({ salesData }) => {
  const days = ["S", "M", "T", "W", "T", "F", "S"];

  const adjustedSalesData = salesData.map((value) =>
    value === 0 ? 130 : value
  );
  const backgroundColors = salesData.map((value) =>
    value === 0 ? "#D1D5DB" : "#D0A7F1"
  );
  const hoverColors = salesData.map((value) =>
    value === 0 ? "#D1D5DB" : "#9402FF"
  );

  const data = {
    labels: days,
    datasets: [
      {
        label: "Sales",
        data: adjustedSalesData,
        backgroundColor: backgroundColors,
        hoverBackgroundColor: hoverColors,
        borderRadius: 12,
        borderSkipped: false,
        barPercentage: 0.6,
        categoryPercentage: 0.9,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: {
        grid: { display: false, drawBorder: false },
        ticks: {
          color: "#726C6C",
          display: true,
          font: {
            size: 14,
          },
        },
      },
      y: {
        display: false,
        grid: { display: false },
        min: 0,
        max: Math.ceil(Math.max(...salesData, 10) * 1.3),
      },
    },
    layout: {
    padding: {
      top: 1, // adjust as needed
    },
  },
    plugins: {
      tooltip: {
        enabled: true,
        backgroundColor: "transparent",
        titleColor: "transparent",
        bodyColor: "transparent",
        borderWidth: 0,
        displayColors: false,
        callbacks: {
          label: () => "",
          title: () => "",
        },
      },
      legend: { display: false },
      datalabels: {
        display: (context: Context) => {
          const tooltip = context.chart.tooltip;
          return (
            tooltip
              ?.getActiveElements?.()
              .some(
                (el) =>
                  el.datasetIndex === context.datasetIndex &&
                  el.index === context.dataIndex
              ) ?? false
          );
        },
        color: "#442060",
        anchor: "end" as const,
        align: "end" as const,
        formatter: (_value: number, context: Context) =>
          `₹${salesData[context.dataIndex]}`,
        font: {
          weight: "bold" as const,
          size: 15,
        },
      },
    },
  };

  return (
    <div className="h-60 w-full">
      <Bar data={data} options={options} plugins={[ChartDataLabels]} />
    </div>
  );
};

export default BarChart;
