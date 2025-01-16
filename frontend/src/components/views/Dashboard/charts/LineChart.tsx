import React from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
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
      text: 'Activity Trends',
    },
  },
};

const generateData = () => {
  const labels = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - i);
    return d.toLocaleDateString('en-US', { weekday: 'short' });
  }).reverse();

  const baseData = labels.map(() => Math.floor(Math.random() * 50) + 30);
  const anomalyIndex = Math.floor(Math.random() * labels.length);
  baseData[anomalyIndex] = baseData[anomalyIndex] * 2;

  return {
    labels,
    datasets: [
      {
        label: 'Activity Level',
        data: baseData,
        borderColor: 'rgb(7, 247, 124)',
        backgroundColor: 'rgba(7, 247, 124, 0.5)',
        pointRadius: baseData.map((val, i) => i === anomalyIndex ? 8 : 4),
        pointBackgroundColor: baseData.map((val, i) => 
          i === anomalyIndex ? 'rgb(255, 99, 132)' : 'rgb(7, 247, 124)'
        ),
      },
    ],
  };
};

const LineChart = () => {
  return (
    <div className="bg-white p-4 rounded-lg shadow">
      <Line options={options} data={generateData()} />
    </div>
  );
};

export default LineChart;