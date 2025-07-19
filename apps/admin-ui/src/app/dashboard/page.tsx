"use client";

import React from 'react'
import {useReactTable, getCoreRowModel, flexRender} from "@tanstack/react-table";
import {PieChart, Pie , Cell, ResponsiveContainer , Legend, Tooltip} from "recharts";
import GeographicalMap from '../../shared/components/GeographicalMap';
import SalesChart from '../../shared/components/SalesChart';



const deviceData = [
  {name: 'Desktop', value: 4000},
  {name: 'Tablet', value: 2400},
  {name: 'Mobile', value: 2400},
];

const Colors = ["#4ade80", "#facc15", "#60a5fa"];

const orders = [
  {id: "ORD-001", customer:"Jofn Doe", amount:"100", status:"Paid"},
  {id: "ORD-002", customer:"cvefv vv", amount:"1040", status:"Pending"},
  {id: "ORD-003", customer:"Jvevv vv", amount:"1004", status:"Paid"},
  {id: "ORD-004", customer:"bhduie vj", amount:"220", status:"Failed"},
  {id: "ORD-005", customer:"Jofn Doe", amount:"100", status:"Failed"},
  {id: "ORD-006", customer:"Jofn Doe", amount:"100", status:"Paid"},
];

const columns = [
  {
    accessorKey : "id",
    header: "Order ID"
  },
  {
    accessorKey : "customer",
    header: "Customer"
  },
  {
    accessorKey : "amount",
    header: "Amount"
  },
  {
    accessorKey : "status",
    header: "Status",
    cell: ({getValue}:any)=>{
      const value = getValue();
      const color = value === 'Paid'
        ? "text-green-400"
        : value === "Pending"
        ? "text-yellow-400" 
        : "text-red-400";
      
        return <span className={`font-medium ${color}`}>{value}</span>
    },
  },
];

const OrdersTable = ()=>{
  const table = useReactTable({
    data:orders,
    columns,
    getCoreRowModel: getCoreRowModel()
  });

  return(
    <div className='mt-6'>
      <h2 className='text-white text--xl font-semibold mb-4'>
        Recents Order
        <span className='block text-sm text-slate-400 font-normal'>
          A guick snapshot
        </span>
      </h2>
      <div className='rounded shadow-xl overflow-hidden border border-slate-500'>
        <table className='min-w-full text-sm text-white'>
          <thead className='bg-slate-900 text-slate-400' >
            {table.getHeaderGroups().map((headerGroup)=>(
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) =>(
                  <th
                    key={header.id}
                    className='p-3 text-left'
                  >
                    {flexRender(
                      header.column.columnDef.header,
                      header.getContext()
                    )}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody className='bg-transparent'>
            {table.getRowModel().rows.map((row)=>(
              <tr
                key={row.id}
                className='border-t border-slate-600 hover:border-slate-800 transition-all'
              >
                {row.getVisibleCells().map((Cell)=>(
                  <td
                    key={Cell.id}
                    className='p-3'
                  >
                    {flexRender(Cell.column.columnDef.cell, Cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const DashboardPage = () => {

  return (
    <div className='p-4'>
      <div className='w-full flex max-md:flex-col gap-8'>
        <div className='md:w-[65%] w-full'>
          <div className='rounded-2xl shadow-xl'>
            <h2 className='text-white text-xl font-semibold'>
              Revenue
              <span className='block text-sm text-slate-600 font-normal'>
                Last 6 months prformance
              </span>
            </h2>
            <SalesChart/>
          </div>
        </div>

        <div className='md:w-[35%] w-full rounded-2xl shadow-xl'>
          <h2 className='text-white text-xl font-semibold mb-2'>
            Device Usage
            <span className='block text-sm text-slate-600 font-normal'>
              How users acces your platform
            </span>
          </h2>
          <div className='mt-14'>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <defs>
                  <filter
                    id='shadow'
                    x="-10%"
                    y="-10%"
                    width="120%"
                    height="120%"
                  >
                    <feDropShadow
                      dx={0}
                      dy={0}
                      stdDeviation='4'
                      floodColor="#000"
                      floodOpacity={0.2}
                    />
                  </filter>
                </defs>
                <Pie
                  data={deviceData}
                  dataKey="value"
                  nameKey ="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={3}
                  stroke="#0f172a"
                  isAnimationActive
                  filter="url(#shadow)"
                >
                  {deviceData.map((entry,index)=>(
                    <Cell
                      key={`cell-${index}`}
                      fill={Colors[index % Colors.length]}
                    />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle= {{
                    backgroundColor : "#1e293b",
                    border : "none",
                    borderRadius : "8px"
                  }}
                  labelStyle= {{color: '#fff'}}
                  itemStyle = {{color: '#fff'}}
                />
                <Legend
                  layout ="horizontal"
                  verticalAlign= "bottom"
                  align = "center"
                  iconType = "circle"
                  formatter= {(value) => (
                    <span className='text-white text-sm ml-1'>{value}</span>
                  )}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className='w-full flex flex-wrap max-md:flex-col gap-8'>
        <div className='w-full'>
          <h2 className='text-white text-xl font-semibold mt-6'>
            User and Seller Distribution
            <span className='block text-sm text-slate-600 font-normal'>
              Visual breakdown of activity
            </span>
          </h2>
          <GeographicalMap/>
        </div>
        <div className='md:w-[40%] w-full'>
          <OrdersTable/>
        </div>
      </div>
    </div>
  );
}

export default DashboardPage;