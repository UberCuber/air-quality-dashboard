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
  TimeScale,
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import 'chartjs-adapter-date-fns';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  TimeScale
);

const AirQualityChart = ({ data, compareData, metric, color, unit, label, theme = 'dark' }) => {
  const isLight = theme === 'light';
  const hasComparison = compareData && compareData.length > 0;

  if (!data || data.length === 0) {
    const emptyBg = isLight ? 'rgba(255, 255, 255, 0.9)' : 'rgba(0, 0, 0, 0.8)';
    const emptyText = isLight ? '#64748b' : '#999999';
    const emptyBorder = isLight ? 'rgba(0, 0, 0, 0.1)' : 'rgba(255, 255, 255, 0.1)';
    
    return (
      <div style={{ 
        background: emptyBg,
        backdropFilter: 'blur(10px)',
        borderRadius: '12px', 
        padding: '48px',
        textAlign: 'center',
        color: emptyText,
        border: `1px solid ${emptyBorder}`,
        boxShadow: isLight ? '0 8px 32px rgba(0, 0, 0, 0.1), 0 2px 8px rgba(0, 0, 0, 0.05)' : '0 8px 32px rgba(0, 0, 0, 0.5), 0 2px 8px rgba(0, 0, 0, 0.1)',
        fontSize: '14px'
      }}>
        No data available for {label}
      </div>
    );
  }

  // Helper function to normalize timestamps for comparison
  const normalizeTimestamp = (timestamp, startTimestamp) => {
    const date = new Date(timestamp);
    const start = new Date(startTimestamp);
    const elapsed = date - start; // milliseconds since start
    return elapsed;
  };

  // Create datasets array
  const datasets = [];

  if (hasComparison) {
    // For comparison mode, normalize both datasets to relative time
    const range1Start = data.length > 0 ? data[0].timestamp : null;
    const range2Start = compareData.length > 0 ? compareData[0].timestamp : null;

    // Dataset 1 - normalized time starting from 0
    datasets.push({
      label: `${label} (Range 1)`,
      data: data.map(item => ({
        x: normalizeTimestamp(item.timestamp, range1Start),
        y: item[metric],
        originalTimestamp: item.timestamp,
      })),
      borderColor: color,
      backgroundColor: color + '20',
      borderWidth: 2.5,
      tension: 0.4,
      pointRadius: 2,
      pointBackgroundColor: color,
      pointBorderColor: color,
      pointBorderWidth: 1,
      pointHoverRadius: 6,
      pointHoverBackgroundColor: color,
      pointHoverBorderColor: color,
      pointHoverBorderWidth: 2,
      fill: false,
    });

    // Generate a contrasting color for comparison
    const compareColor = getContrastingColor(color);
    
    // Dataset 2 - normalized time starting from 0
    datasets.push({
      label: `${label} (Range 2)`,
      data: compareData.map(item => ({
        x: normalizeTimestamp(item.timestamp, range2Start),
        y: item[metric],
        originalTimestamp: item.timestamp,
      })),
      borderColor: compareColor,
      backgroundColor: compareColor + '20',
      borderWidth: 2.5,
      borderDash: [5, 5],
      tension: 0.4,
      pointRadius: 2,
      pointBackgroundColor: compareColor,
      pointBorderColor: compareColor,
      pointBorderWidth: 1,
      pointHoverRadius: 6,
      pointHoverBackgroundColor: compareColor,
      pointHoverBorderColor: compareColor,
      pointHoverBorderWidth: 2,
      fill: false,
    });
  } else {
    // Normal mode - use actual timestamps
    datasets.push({
      label: label,
      data: data.map(item => ({
        x: new Date(item.timestamp),
        y: item[metric],
      })),
      borderColor: color,
      backgroundColor: color + '20',
      borderWidth: 2,
      tension: 0.4,
      pointRadius: 2,
      pointBackgroundColor: color,
      pointBorderColor: color,
      pointBorderWidth: 1,
      pointHoverRadius: 6,
      pointHoverBackgroundColor: color,
      pointHoverBorderColor: color,
      pointHoverBorderWidth: 2,
      fill: true,
    });
  }

  // Helper function to get contrasting color
  function getContrastingColor(hexColor) {
    // Map of colors to their contrasting pairs
    const colorMap = {
      '#ef4444': '#3b82f6',  // Red -> Blue
      '#3b82f6': '#ef4444',  // Blue -> Red
      '#10b981': '#f59e0b',  // Green -> Orange
      '#8b5cf6': '#10b981',  // Purple -> Green
      '#f59e0b': '#8b5cf6',  // Orange -> Purple
      '#ec4899': '#10b981',  // Pink -> Green
    };
    return colorMap[hexColor] || '#9333ea'; // Default to a distinct purple
  }

  const chartData = {
    labels: data.map(item => item.timestamp),
    datasets: datasets,
  };

  const textColor = isLight ? '#1a202c' : '#ffffff';
  const gridColor = isLight ? 'rgba(0, 0, 0, 0.12)' : 'rgba(255, 255, 255, 0.15)';
  const borderColor = isLight ? 'rgba(0, 0, 0, 0.2)' : 'rgba(255, 255, 255, 0.2)';
  const tickColor = isLight ? '#64748b' : '#999999';
  const tooltipBg = isLight ? 'rgba(255, 255, 255, 0.98)' : 'rgba(0, 0, 0, 0.98)';

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: 'top',
        labels: {
          usePointStyle: true,
          padding: 12,
          font: {
            size: 12,
            weight: '500',
          },
          color: textColor,
        },
      },
      title: {
        display: true,
        text: label,
        font: {
          size: 16,
          weight: '600',
        },
        color: textColor,
        padding: {
          bottom: 16,
        },
      },
      tooltip: {
        enabled: true,
        mode: 'point',
        intersect: true,
        backgroundColor: tooltipBg,
        titleColor: textColor,
        bodyColor: textColor,
        borderColor: color,
        borderWidth: 2,
        padding: 14,
        cornerRadius: 8,
        displayColors: true,
        titleFont: {
          size: 13,
          weight: '600',
        },
        bodyFont: {
          size: 12,
          weight: '500',
        },
        bodySpacing: 6,
        usePointStyle: true,
        callbacks: {
          title: function(context) {
            if (context.length > 0) {
              const dataPoint = context[0].raw;
              // For comparison mode, show original timestamp if available
              if (dataPoint.originalTimestamp) {
                const date = new Date(dataPoint.originalTimestamp);
                return date.toLocaleString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                  second: '2-digit',
                  hour12: true
                });
              }
              // For normal mode, use the x value
              const date = new Date(context[0].parsed.x);
              return date.toLocaleString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
                hour12: true
              });
            }
            return '';
          },
          label: function(context) {
            let label = context.dataset.label || '';
            if (label) {
              label += ': ';
            }
            if (context.parsed.y !== null) {
              label += context.parsed.y.toFixed(2) + (unit || '');
            }
            return label;
          },
        },
      },
    },
    scales: {
      x: {
        type: hasComparison ? 'linear' : 'time',
        time: !hasComparison ? {
          displayFormats: {
            millisecond: 'HH:mm:ss',
            second: 'HH:mm:ss',
            minute: 'HH:mm',
            hour: 'HH:mm',
            day: 'MMM dd',
            week: 'MMM dd',
            month: 'MMM yyyy',
          },
          tooltipFormat: 'MMM dd, yyyy HH:mm:ss',
        } : undefined,
        grid: {
          display: true,
          color: gridColor,
          borderColor: borderColor,
          borderWidth: 2,
          lineWidth: 1,
        },
        ticks: hasComparison ? {
          color: tickColor,
          font: {
            size: 11,
          },
          callback: function(value) {
            // Convert milliseconds to time format (HH:MM)
            const totalMinutes = Math.floor(value / (1000 * 60));
            const hours = Math.floor(totalMinutes / 60);
            const minutes = totalMinutes % 60;
            return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
          },
        } : {
          color: tickColor,
          font: {
            size: 11,
          },
        },
        title: {
          display: true,
          text: hasComparison ? 'Elapsed Time' : 'Time',
          color: textColor,
          font: {
            size: 12,
            weight: '500',
          },
        },
        border: {
          display: true,
          color: borderColor,
          width: 1,
        },
      },
      y: {
        grid: {
          display: true,
          color: gridColor,
          borderColor: borderColor,
          borderWidth: 2,
          lineWidth: 1,
        },
        ticks: {
          color: tickColor,
          font: {
            size: 11,
          },
        },
        title: {
          display: true,
          text: unit || '',
          color: textColor,
          font: {
            size: 12,
            weight: '500',
          },
        },
        border: {
          display: true,
          color: borderColor,
          width: 1,
        },
        beginAtZero: false,
      },
    },
  };

  const chartBg = isLight ? 'rgba(255, 255, 255, 0.9)' : 'rgba(0, 0, 0, 0.8)';
  const chartBorder = isLight ? 'rgba(0, 0, 0, 0.15)' : 'rgba(255, 255, 255, 0.15)';
  const chartShadow = isLight 
    ? '0 8px 32px rgba(0, 0, 0, 0.1), 0 2px 8px rgba(0, 0, 0, 0.05)' 
    : '0 8px 32px rgba(0, 0, 0, 0.5), 0 2px 8px rgba(0, 0, 0, 0.1)';

  return (
    <div style={{ 
      background: chartBg,
      backdropFilter: 'blur(10px)',
      borderRadius: '12px', 
      padding: '24px',
      boxShadow: chartShadow,
      border: `2px solid ${chartBorder}`,
      height: '350px',
      marginBottom: '0',
      position: 'relative',
    }}>
      <Line data={chartData} options={options} />
    </div>
  );
};

export default AirQualityChart;
