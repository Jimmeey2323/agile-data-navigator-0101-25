import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { Line } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface MiniAreaChartProps {
  data: number[];
  labels?: string[];
  color?: string;
  height?: number;
  showGrid?: boolean;
  animated?: boolean;
}

export function MiniAreaChart({ 
  data, 
  labels = [], 
  color = '#8B5CF6', 
  height = 40,
  showGrid = false,
  animated = true 
}: MiniAreaChartProps) {
  // Generate default labels if not provided
  const chartLabels = labels.length ? labels : data.map((_, index) => `${index + 1}`);
  
  const chartData = {
    labels: chartLabels,
    datasets: [
      {
        data,
        borderColor: color,
        backgroundColor: `${color}50`,
        borderWidth: 2.5,
        pointRadius: 0,
        pointHoverRadius: 4,
        pointBackgroundColor: color,
        pointBorderColor: color,
        fill: true,
        tension: 0.3,
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
            return `Amount: ${context.parsed.y}`;
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
    elements: {
      line: {
        borderWidth: 2,
      },
      point: {
        radius: 0,
        hoverRadius: 4,
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
      <Line data={chartData} options={options} />
    </div>
  );
}