"use client";

import { useQuery, UseQueryResult } from '@tanstack/react-query';
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table';
import {  Download, Eye, Loader2, Search, Star } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import React, { useDeferredValue, useMemo, useState } from 'react'
import axiosInstance from 'apps/admin-ui/src/utils/axiosInstance';
import BreadCrumbs from 'apps/admin-ui/src/shared/components/BreadCrumbs';




const AllProducts = () => {
    const [globalFilter, setGlobalFilter] = useState('');
    const deferredFilter = useDeferredValue(globalFilter);
    const [page, setPage] = useState(1)
    const limit = 10

    const { data, isLoading }: UseQueryResult<any> = useQuery({
        queryKey: ['all-products', page],
        queryFn: async () => {
            const res = await axiosInstance.get(`/admin/api/get-all-products?page=${page}&limit=${limit}`);
            console.log("Fetched Products: ", res.data);
            return res.data;
        },
        placeholderData: (prev) => prev,
        staleTime: 1000 * 60 * 5,
    });

    const allProducts = data?.data || [];

    const filterProducts = useMemo(() => {
        return allProducts.filter((product: any) =>
            Object.values(product)
                .join(' ')
                .toLowerCase()
                .includes(deferredFilter.toLowerCase())
        );
    }, [allProducts, deferredFilter]);

    const totalPages = Math.ceil((data?.meta?.totalProducts ?? 0) / limit);


    const columns = useMemo(() => [
      {
        accessorKey: 'image',
        header: 'Image',
        cell:({row}:any)=>{
            console.log(row.original)
            return(
                <Image
                    src={row.original.images[0]?.url || ''}
                    alt={row.original.images[0]?.url || ''}
                    width={100}
                    height={100}
                    className="rounded-md object-cover w-12 h-12"
                />
            );  
        }
      },
      {
        accessorKey: 'title',
        header: 'Title',
        cell: ({ row }:any) => {
            const truncatedTitle =
                row.original.title.length > 25
                ? `${row.original.title.substring(0, 25)}...`
                : row.original.title;

            return (
                <Link
                    href={`${process.env.NEXT_PUBLIC_USER_UI_LINK}/product/${row.original.slug}`}
                    className="text-blue-400 hover:underline"
                    title={row.original.title}
                >
                    {truncatedTitle}
                </Link>
            );
        },
      },
      {
        accessorKey: 'salePrice',
        header: 'Price',
        cell: ({ row }) => <span>₹{row.original.salePrice}</span>,
      },
      {
        accessorKey: 'stock',
        header: 'Stock',
        cell: ({ row }: any) => (
          <span
            className={row.original.stock < 10 ? 'text-red-500' : 'text-white'}
          >
            {row.original.stock} left
          </span>
        ),
      },
      {
        accessorKey: 'category',
        header: 'Category',
        cell: ({ row }: any) => <span>{row.original.category || '-'}</span>
      },
      {
        accessorKey: 'rating',
        header: 'Rating',
        cell: ({ row }: any) => (
          <div className="flex items-center gap-1 text-yellow-400">
            <Star fill="#fde047" size={18} />
            <span className="text-white">{row.original.ratings || 0}</span>
          </div>
        ),
      },
      {
        accessorKey: 'shop.name',
        header: "Shop",
        cell: ({ row }: any) => (
            <span className='text-white text-sm capitalize'>
                {row.original.shop?.name ?? "Unknown Shop"}
            </span>
        ),
    },
    {
        accessorKey: 'createdAt',
        header: "Date",
        cell: ({ row }: any) => {
            const date = new Date(row.original.createdAt).toLocaleDateString();
            return <span className='text-white text-sm'>{date}</span>
        }
    },
    {
        header: 'Actions',
        cell: ({ row }: any) => (
          <div className="flex gap-3">
            <Link
              href={`${process.env.NEXT_PUBLIC_USER_UI_LINK}/product/${row.original.slug}`}
              className="text-blue-400 hover:text-blue-300 transition"
            >
              <Eye size={18} />
            </Link>
          </div>
        ),
    },
    ], []);

    const table = useReactTable({
      data: filterProducts,
      columns,
      getCoreRowModel: getCoreRowModel(),
      getSortedRowModel: getSortedRowModel(),
      getFilteredRowModel: getFilteredRowModel(),
      state: { globalFilter },
      onGlobalFilterChange: setGlobalFilter,
    });

    const exportCSV = () => {
        const csvRows = filterProducts.map((p: any) =>
            `${p.title},${p.salePrice},${p.stock},${p.category},${p.ratings},${p.shop.name }`
        );
        const blob = new Blob(
            [`Title,Price,Stock,Category,Rating,Shop\n${csvRows.join('\n')}`],
            { type: 'text/csv;charset=utf-8;' }
        );
        saveAs(blob, `products-page-${page}.csv`)
    };

    const saveAs = (blob: Blob, filename: string) => {
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = filename
        a.style.display = 'none'
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        window.URL.revokeObjectURL(url)
    };


  return (
    <div className="w-full min-h-screen p-8 bg-black text-white text-sm">
        <div className="flex justify-between items-center mb-1">
            <h2 className="text-2xl text-white font-semibold tracking-wide">All Products</h2>
            <button
                className='bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center gap-2'
                onClick={exportCSV}
            >
                <Download size={18} /> Export CSV
            </button>
        </div>
        <BreadCrumbs title='All Products' />
        <div className="mb-4 flex items-center bg-gray-900 p-2 rounded-md flex-1">
            <Search size={18} className="text-gray-400 mr-2" />
            <input
                type="text"
                placeholder="Search products..."
                className="w-full bg-transparent text-white outline-none"
                value={globalFilter}
                onChange={(e) => setGlobalFilter(e.target.value)}
            />
        </div>

        <div className="overflow-x-auto bg-gray-900 rounded-lg p-4">
            {isLoading ? (
                <div className="flex items-center justify-center">
                    <Loader2 size={24} className="animate-spin text-white" />
                </div>
            ) : (
                <table className="w-full text-white">
                    <thead>
                        {table.getHeaderGroups().map((headerGroup) => (
                            <tr key={headerGroup.id} className="border-b border-gray-800">
                                {headerGroup.headers.map((header) => (
                                    <th key={header.id} className="text-left p-3">
                                        {header.isPlaceholder
                                            ? null
                                            : flexRender(
                                                header.column.columnDef.header,
                                                header.getContext()
                                            )
                                        }
                                    </th>
                                ))}
                            </tr>
                        ))}
                    </thead>
                    <tbody>
                        {table.getRowModel().rows.map((row) => (
                            <tr
                                key={row.id}
                                className="border-b border-gray-800 hover:bg-gray-900 transition"
                            >
                                {row.getVisibleCells().map((cell) => (
                                    <td key={cell.id} className="p-3">
                                        {flexRender(
                                            cell.column.columnDef.cell,
                                            cell.getContext()
                                        )}
                                    </td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </div>
        <div className='flex justify-between items-center mt-4 text-white'>
            <button
                onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
                disabled={page === 1}
                className='px-4 py-2 rounded-md bg-gray-800 hover:bg-gray-700 disabled:opacity-50'
            >
                Previous
            </button>

            <div className="text-sm">
                Page <strong>{page}</strong> of <strong>{totalPages}</strong>
            </div>

            <button
                onClick={() => setPage((prev) => Math.min(prev + 1, totalPages))}
                disabled={page === totalPages}
                className='px-4 py-2 rounded-md bg-gray-800 hover:bg-gray-700 disabled:opacity-50'
            >
                Next
            </button>
        </div>
    </div>
  )
}

export default AllProducts