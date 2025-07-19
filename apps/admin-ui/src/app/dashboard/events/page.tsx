"use client";

import { useQuery } from '@tanstack/react-query';
import { flexRender, getCoreRowModel, getFilteredRowModel, getSortedRowModel, useReactTable } from '@tanstack/react-table'
import axiosInstance from 'apps/admin-ui/src/utils/axiosInstance';
import Image from 'next/image';
import Link from 'next/link';
import React, { useDeferredValue, useMemo, useState } from 'react';
import { saveAs } from 'file-saver';
import BreadCrumbs from 'apps/admin-ui/src/shared/components/BreadCrumbs';
import { Download, Loader2, Search } from 'lucide-react';


const EventPage = () => {
    const [globalFilter, setGlobalFilter] = useState('');
    const [page, setPage] = useState(1);
    const deferredFilter = useDeferredValue(globalFilter);
    const limit = 10

    const { data, isLoading } = useQuery({
        queryKey: ['events-list', page],
        queryFn: async () => {
            const res = await axiosInstance.get(`/admin/api/get-all-events?page=${page}&limit=${limit}`);
            return res.data;
        },
        placeholderData: (prev) => prev,
        staleTime: 1000 * 60 * 5,
    });

    const allEvents = data?.data || []

    const filteredEvents = useMemo(() => {
        return allEvents.filter((event: any) => {
            const values = Object.values(event).join(" ").toLowerCase();
            return values.includes(deferredFilter.toLowerCase())
        });
    }, [allEvents, deferredFilter]);

    const totalPages = Math.ceil((data?.meta?.totalProducts ?? 0) / limit)

    const columns = useMemo(() => [
        {
            accessorKey: "images",
            header: "Image",
            cell: ({ row }: any) => (
                <Image
                    src={row.original.images[0]?.url}
                    alt={row.original.title}
                    width={40}
                    height={40}
                    className='w-12 h-12 rounded-md object-cover'
                />
            )
        },
        {
            accessorKey: 'title',
            header: "Title",
            cell: ({ row }: any) => {
                const truncatedTitle =
                    row.original.title.length > 25
                        ? `${row.original.title.substring(0, 25)}...`
                        : row.original.title

                return (
                    <Link
                        href={`${process.env.NEXT_PUBLIC_USER_UI_LINK}/product/${row.original.slug}`}
                        className='text-blue-400 hover:underline'
                        title={row.original.title}
                    >
                        {truncatedTitle}
                    </Link>
                );
            }
        },
        {
            accessorKey: 'salePrice',
            header: "Price",
            cell: ({ row }: any) => <span>₹{row.original.salePrice}</span>
        },
        {
            accessorKey: 'stock',
            header: "Stock",
            cell: ({ row }: any) =>
                <span className={row.original.stock < 10 ? 'text-red-500' : 'text-white'}>
                    {row.original.stock} left
                </span>
        }, 
        {
            accessorKey: 'startingDate',
            header: "Start",
            cell: ({ row }) =>
                new Date(row.original.startingDate).toLocaleDateString(),
        }, 
        {
            accessorKey: 'endingDate',
            header: 'End',
            cell: ({ row }) =>
                new Date(row.original.endingDate).toLocaleDateString(),
        }, 
        {
            accessorKey: "shop.name",
            header: "Shop Name",
            cell: ({ row }) => row.original.shop?.name || '-',
        }
    ],[] );

    const table = useReactTable({
        data: filteredEvents,
        columns,
        getCoreRowModel: getCoreRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        state: { globalFilter },
        onGlobalFilterChange: setGlobalFilter,
    });

    const exportCSV = () => {
        const csvData = filteredEvents.map((event: any) =>
            `${event.title},${event.salePrice},${event.stock},${event.startingDate},${event.endingDate},${event.shop.name }`
        );
        const blob = new Blob(
            [`Title,Price,Stock,Starting Date, Ending Date,Shop\n${csvData.join('\n')}`],
            { type: 'text/csv;charset=utf-8;' }
        );
        saveAs(blob, `events-page-${page}.csv`)
    };
  return (
        <div className="w-full min-h-screen p-8 bg-black text-white text-sm">
            <div className="flex justify-between items-center mb-1">
                <h2 className="text-2xl text-white font-semibold tracking-wide">All Events</h2>
                <button
                    className='bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center gap-2'
                    onClick={exportCSV}
                >
                    <Download size={18} /> Export CSV
                </button>
            </div>
            <BreadCrumbs title='All Events' />
            <div className="mb-4 flex items-center bg-gray-900 p-2 rounded-md flex-1">
                <Search size={18} className="text-gray-400 mr-2" />
                <input
                    type="text"
                    placeholder="Search events..."
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
                    Page <strong>{page}</strong> of <strong>{totalPages || 1}</strong>
                </div>

                <button
                    onClick={() => {
                        if (page < totalPages) {
                        setPage((prev) => prev + 1);
                        }
                    }}
                    disabled={page === totalPages}
                    className='px-4 py-2 rounded-md bg-gray-800 hover:bg-gray-700 disabled:opacity-50'
                >
                    Next
                </button>
            </div>
        </div>
  );
}

export default EventPage;