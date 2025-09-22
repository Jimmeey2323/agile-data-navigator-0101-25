import React from 'react';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
} from 'chart.js';
import { Doughnut } from 'react-chartjs-2';

ChartJS.register(ArcElement, Tooltip, Legend);

interface MiniDoughnutChartProps {
  data: number[];
  labels?: string[];
  colors?: string[];
  height?: number;
  animated?: boolean;
}

export function MiniDoughnutChart({ 
  data, 
  labels = [], 
  colors = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'], 
  height = 40,
  animated = true 
}: MiniDoughnutChartProps) {
  // Generate default labels if not provided
  const chartLabels = labels.length ? labels : data.map((_, index) => `Category ${index + 1}`);
  
  const chartData = {
    labels: chartLabels,
    datasets: [
      {
        data,
        backgroundColor: colors.slice(0, data.length),
        borderColor: colors.slice(0, data.length),
        borderWidth: 1,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: '60%',
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        enabled: true,
        backgroundColor: 'rgba(0,0,0,0.8)',
        titleColor: '#fff',
        bodyColor: '#fff',
        borderWidth: 1,
        cornerRadius: 8,
        displayColors: true,
        callbacks: {
          title: function(context: any) {
            return context[0].label;
          },
          label: function(context: any) {
            const total = context.dataset.data.reduce((a: number, b: number) => a + b, 0);
            const percentage = ((context.parsed / total) * 100).toFixed(1);
            return `${context.parsed} (${percentage}%)`;
          }
        }
      },
    },
    animation: animated ? {
      duration: 1000,
      easing: 'easeInOutQuart' as const,
    } : {
      duration: 0,
    },
    elements: {
      arc: {
        borderWidth: 1,
      },
    },
  };

  return (
    <div style={{ height: `${height}px`, width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
      <Doughnut data={chartData} options={options} />
    </div>
  );
}