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
import type { TooltipItem } from "chart.js";

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

  const hasNoData = salesData.length === 0;
  const defaultData = [0, 0, 0, 0, 0, 0, 0];

  const effectiveSalesData = hasNoData ? defaultData : salesData;

  const maxVal = Math.max(...effectiveSalesData);
  const yAxisMax = maxVal === 0 ? 100 : Math.ceil(maxVal * 1.3);

  const backgroundColors = effectiveSalesData.map((value) =>
    value === 0 ? "#D1D5DB" : "#D0A7F1"
  );
  const hoverColors = effectiveSalesData.map((value) =>
    value === 0 ? "#D1D5DB" : "#9402FF"
  );

  const data = {
    labels: days,
    datasets: [
      {
        label: "Sales",
        data: effectiveSalesData,
        backgroundColor: backgroundColors,
        hoverBackgroundColor: hoverColors,
        borderRadius: 12,
        borderSkipped: false,
        barPercentage: 0.6,
        categoryPercentage: 0.9,
        minBarLength: 2,
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
        max: yAxisMax,
      },
    },
    layout: {
      padding: {
        top: 1,
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
          label: (context: TooltipItem<"bar">) =>
            `₹${effectiveSalesData[context.dataIndex]}`,
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
          `₹${Math.round(effectiveSalesData[context.dataIndex])}`,

        font: {
          weight: "bold" as const,
          size: 15,
        },
      },
    },
  };

  return (
    <div className="h-60 w-full flex flex-col items-center justify-center relative">
      <div className="w-full h-full">
        <Bar data={data} options={options} plugins={[ChartDataLabels]} />
      </div>
      {effectiveSalesData.every((val) => val === 0) && (
        <p className="absolute text-sm text-gray-400 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
          No sales data this week
        </p>
      )}
    </div>
  );
};

export default BarChart;
