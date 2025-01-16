import React from 'react';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const options = {
  responsive: true,
  plugins: {
    legend: {
      position: 'top' as const,
    },
    title: {
      display: true,
      text: 'Requests & Reports by Category',
    },
    tooltip: {
      callbacks: {
        label: function(context: any) {
          const label = context.dataset.label || '';
          const value = context.parsed.y;
          const change = Math.floor(Math.random() * 20) - 10; // Demo percentage change
          return `${label}: ${value} (${change}% vs last period)`;
        }
      }
    }
  },
};

const data = {
  labels: ['HR', 'Operations', 'IT', 'Safety', 'Training'],
  datasets: [
    {
      label: 'Requests',
      data: [65, 59, 80, 81, 56],
      backgroundColor: 'rgba(7, 247, 124, 0.5)',
    },
    {
      label: 'Reports',
      data: [45, 70, 60, 45, 89],
      backgroundColor: 'rgba(53, 162, 235, 0.5)',
    },
  ],
};

const BarChart = () => {
  return (
    <div className="bg-white p-4 rounded-lg shadow">
      <Bar options={options} data={data} />
    </div>
  );
};

export default BarChart;