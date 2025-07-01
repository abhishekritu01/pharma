"use client";

import { Doughnut } from "react-chartjs-2";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  ChartOptions,
} from "chart.js";
import ChartDataLabels, { Context } from "chartjs-plugin-datalabels";
import React from "react";

ChartJS.register(ArcElement, Tooltip, Legend, ChartDataLabels);

interface DoughnutChartProps {
  labels: string[];
  data: number[];
  backgroundColors?: string[];
}

const DoughnutChart: React.FC<DoughnutChartProps> = ({
  labels,
  data,
  backgroundColors = ["#F7BA49", "#D67BA9", "#D0A7F1"],
}) => {
  const chartData = {
    labels,
    datasets: [
      {
        label: "My Dataset",
        data,
        backgroundColor: backgroundColors,
        borderWidth: 1,
        hoverOffset: 0,
        hoverBackgroundColor: backgroundColors,
      },
    ],
  };

  const options: ChartOptions<"doughnut"> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      tooltip: {
        enabled: false,
      },
      legend: {
        display: false,
      },
      datalabels: {
        color: "#311745",
        formatter: (value: number, context: Context) => {
          if (value === 0) return null;
          const data = context.chart.data.datasets[0].data as number[];
          const total = data.reduce((acc, val) => acc + val, 0);
          const percentage = Math.round((value / total) * 100);
          return `${percentage}%`;
        },
      },
    },
  };

  return (
    <div className="flex items-center gap-16">
      <div className="w-40 h-40">
        <Doughnut data={chartData} options={options} />
      </div>
      <ul className="text-sm space-y-3">
        {labels.map((label, i) => (
          <li key={i} className="flex flex-col items-start gap-1">
            <div className="flex items-center gap-3">
              <span
                className="inline-block w-2 h-2 rounded-full"
                style={{ backgroundColor: backgroundColors[i] }}
              />
              <span className="text-xs font-normal text-[#433E3F]">
                {label}
              </span>
            </div>
            <span className="text-sm font-medium ml-5">{data[i]}</span>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default DoughnutChart;
