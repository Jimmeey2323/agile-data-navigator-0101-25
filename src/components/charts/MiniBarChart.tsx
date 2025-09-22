import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

interface MiniBarChartProps {
  data: number[];
  labels?: string[];
  color?: string;
  height?: number;
  showGrid?: boolean;
  animated?: boolean;
}

export function MiniBarChart({ 
  data, 
  labels = [], 
  color = '#10B981', 
  height = 40,
  showGrid = false,
  animated = true 
}: MiniBarChartProps) {
  // Generate default labels if not provided
  const chartLabels = labels.length ? labels : data.map((_, index) => `${index + 1}`);
  
  const chartData = {
    labels: chartLabels,
    datasets: [
      {
        data,
        backgroundColor: `${color}90`,
        borderColor: color,
        borderWidth: 1.5,
        borderRadius: 2,
        borderSkipped: false,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        enabled: true,
        mode: 'index' as const,
        intersect: false,
        backgroundColor: 'rgba(0,0,0,0.8)',
        titleColor: '#fff',
        bodyColor: '#fff',
        borderColor: color,
        borderWidth: 1,
        cornerRadius: 8,
        displayColors: false,
        callbacks: {
          title: function() {
            return '';
          },
          label: function(context: any) {
            return `Count: ${context.parsed.y}`;
          }
        }
      },
    },
    scales: {
      x: {
        display: false,
        grid: {
          display: false,
        },
      },
      y: {
        display: false,
        grid: {
          display: showGrid,
          color: 'rgba(0,0,0,0.05)',
        },
        beginAtZero: true,
      },
    },
    animation: animated ? {
      duration: 1000,
      easing: 'easeInOutQuart' as const,
    } : {
      duration: 0,
    },
    interaction: {
      mode: 'index' as const,
      intersect: false,
    },
  };

  return (
    <div style={{ height: `${height}px`, width: '100%' }}>
      <Bar data={chartData} options={options} />
    </div>
  );
}