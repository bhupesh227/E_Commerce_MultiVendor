'use client';

import React from 'react';
import Box from './Box';
import type { ApexOptions } from 'apexcharts';
import dynamic from 'next/dynamic';


const Chart = dynamic(() => import('react-apexcharts'), { ssr: false });

interface SalesChartProps {
    ordersData?: {
        month: string;
        count: number;
    }[];
}

const SalesChart = ({ ordersData }: SalesChartProps) => {
    const chartSeries = [
        {
        name: 'Sales',
        data: ordersData?.map((data) => data.count) || [31, 40, 28, 51, 42, 109, 100],
        },
    ];

    const chartOptions: ApexOptions = {
        chart: {
            type: 'area',
            toolbar: {
                show: false,
            },
            zoom: {
                enabled: false,
            },
        },
        dataLabels: {
            enabled: false,
        },
        stroke: {
            curve: 'smooth',
            width: 2,
            colors: ['#60a5fa'], 
        },
        fill: {
            type: 'gradient',
            gradient: {
            shadeIntensity: 1,
            opacityFrom: 0.4,
            opacityTo: 0.1,
            stops: [0, 90, 100],
            colorStops: [
                {
                    offset: 0,
                    color: "#3b82f6", 
                    opacity: 0.4
                },
                {
                    offset: 100,
                    color: "#3b82f6",
                    opacity: 0.1
                }
                ]
            }
        },
        grid: {
            yaxis: {
                lines: {
                    show: false,
                },
            },
            xaxis: {
                lines: {
                    show: false,
                },
            },
            row: {
                colors: undefined, 
            },
        },
        xaxis: {
            categories: ordersData?.map((data) => data.month) || [
                'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul',
            ],
            labels: {
                style: {
                colors: '#cbd5e1',
                },
            },
        },
        yaxis: {
            labels: {
                show:false
            },
        },
        tooltip: {
            theme: 'dark',
        },
    };

  return (
    <Box css={{ padding: '2px' }}>
        <Chart 
            options={chartOptions} 
            series={chartSeries} 
            type="area" 
            height={300} />
    </Box>
  );
};

export default SalesChart;