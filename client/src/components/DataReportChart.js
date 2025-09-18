import React, { useEffect, useRef } from 'react';
import Chart from 'chart.js/auto';

const DataReportChart = ({ reportData, chartType }) => {
  const chartRef = useRef(null);
  const chartInstance = useRef(null);

  useEffect(() => {
    if (!reportData || reportData.length === 0) return;

    // Clean up any existing chart
    if (chartInstance.current) {
      chartInstance.current.destroy();
    }

    // Get the canvas context for Chart.js
    const ctx = chartRef.current.getContext('2d');

    // Configure chart based on type
    const labels = reportData.map(item => item.label);
    const values = reportData.map(item => item.value);
    const colors = generateColors(reportData);

    // Create chart configuration
    const config = {
      type: chartType || 'bar',
      data: {
        labels: labels,
        datasets: [{
          data: values,
          backgroundColor: chartType === 'pie' ? colors : '#0071e3',
          borderColor: chartType === 'pie' ? colors.map(color => color.replace('0.7', '1')) : '#0071e3',
          borderWidth: 1,
          hoverBackgroundColor: chartType === 'pie' ? colors : '#0288d1',
          hoverBorderColor: chartType === 'pie' ? colors.map(color => color.replace('0.7', '1')) : '#0288d1',
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: chartType === 'pie',
            position: 'right',
          },
          tooltip: {
            callbacks: {
              label: function(context) {
                const label = context.label || '';
                const value = context.raw || 0;
                return `${label}: ${value}`;
              }
            }
          }
        },
        scales: chartType === 'pie' ? undefined : {
          y: {
            beginAtZero: true,
            title: {
              display: true,
              text: 'Count'
            }
          },
          x: {
            title: {
              display: true,
              text: 'Event'
            },
            ticks: {
              maxRotation: 45,
              minRotation: 45
            }
          }
        }
      }
    };

    // Create the chart
    chartInstance.current = new Chart(ctx, config);

    // Clean up on component unmount
    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }
    };
  }, [reportData, chartType]);

  // Generate colors for chart segments with specific colors for Paid/Unpaid fines
  const generateColors = (reportItems) => {
    const colors = [];
    
    for (let i = 0; i < reportItems.length; i++) {
      const item = reportItems[i];
      
      // Assign specific colors to Paid/Unpaid fines
      if (item.label === 'Paid Fines') {
        colors.push('rgba(46, 125, 50, 0.7)'); // Green for Paid
      } else if (item.label === 'Unpaid Fines') {
        colors.push('rgba(211, 47, 47, 0.7)'); // Red for Unpaid
      } else {
        // Use the golden angle approximation for other items
        const hue = (i * 137.5) % 360;
        colors.push(`hsla(${hue}, 70%, 60%, 0.7)`);
      }
    }
    
    return colors;
  };

  return (
    <canvas ref={chartRef} />
  );
};

export default DataReportChart;