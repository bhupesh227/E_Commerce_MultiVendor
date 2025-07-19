"use client";

import React ,{ useDeferredValue, useMemo, useState } from 'react';
import { flexRender, getCoreRowModel, getFilteredRowModel, getSortedRowModel, useReactTable } from '@tanstack/react-table';
import { Download, Search, Loader2 } from 'lucide-react';
import { useQuery, UseQueryResult } from '@tanstack/react-query';
import { saveAs } from 'file-saver';
import axiosInstance from 'apps/admin-ui/src/utils/axiosInstance';
import BreadCrumbs from 'apps/admin-ui/src/shared/components/BreadCrumbs';



interface Seller {
    id: string;
    name: string;
    email: string;
    role: string;
    createdAt: string;
    shop:{
        name:string;
        avatar:string;
        address:string;
    }
};

interface SellerResponse {
    data: Seller[];
    meta: {
        totalSellers: number;
        currentPage: number;
        totalPages: number;
    };
}

const SellerPage = () => {
    const [globalFilter, setGlobalFilter] = useState('');
    const [page, setPage] = useState(1);
    const deferredGlobalFilter = useDeferredValue(globalFilter);
    const limit = 10;

    const { data, isLoading }: UseQueryResult<SellerResponse, Error> = useQuery({
        queryKey: ['sellers-list', page],
        queryFn: async () => {
            const res = await axiosInstance.get(`/admin/api/get-all-sellers?page=${page}&limit=${limit}`);
            return res.data;
        },
        placeholderData: (previousData) => previousData,
        staleTime: 1000 * 60 * 5,
    });

    const allSellers = data?.data || [];
    const filteredSellers = useMemo(() => {
        return allSellers.filter((seller) => 
            deferredGlobalFilter 
            ? Object.values(seller)
                .map(value => typeof value === 'string' ? value : JSON.stringify(value))
                .join(" ").toLowerCase().includes(deferredGlobalFilter.toLowerCase())
            : true
        );
    }, [allSellers, deferredGlobalFilter]);

    const totalPages = Math.ceil((data?.meta?.totalSellers ?? 0) / limit);

    const columns = useMemo(() => [
        {
            accessorKey: "shop.avatar",
            header: "Avatar",
            cell: ({ row }: any) => (
                <img
                    src={row.original.shop.avatar || '/default-seller-avatar.jpg'}
                    alt={row.original.name}
                    width={40}
                    height={40}
                    className='w-12 h-12 rounded-md object-cover'
                />
            )
        },
        {
            accessorKey: 'name',
            header: "Name",
        },
        {
            accessorKey: 'email',
            header: "Email",
        },
        {
            accessorKey: 'shop.name',
            header: "Shop Name",
            cell: ({ row }: any) => {
                const shopName = row.original.shop.name ;
                return shopName ? (
                    <a 
                        href={`${process.env.NEXT_PUBLIC_USER_UI_LINK}/shop/${row.original.id}`}
                        className='text-blue-400 hover:underline'
                        rel='noopener noreferrer'
                        target='_blank'
                    >
                        {shopName}
                    </a>
                ) : (
                    <span className='text-gray-500'>No Shop</span>
                );
            }
        },
        {
            accessorKey:"shop.address",
            header:"Address",
        },
        {
            accessorKey: 'createdAt',
            header: "Joined At",
            cell: ({ row }: any) => new Date(row.original.createdAt).toLocaleDateString()
        },  
    ], []);

    const table = useReactTable({
        data: filteredSellers,
        columns,
        getCoreRowModel: getCoreRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        state: { globalFilter },
        onGlobalFilterChange: setGlobalFilter,
    });

    const exportCSV = () => {
        const csvContent = [
            ["ID", "Name", "Email", "Shop Name", "Address", "Joined At"],
            ...filteredSellers.map(seller => [
                seller.id,
                seller.name,
                seller.email,
                seller.shop.name || 'No Shop',
                seller.shop.address || 'No Address',
                new Date(seller.createdAt).toLocaleDateString()
            ])
        ].map(e => e.join(",")).join("\n");

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        saveAs(blob, 'sellers.csv');
    }

  return (
    <div className="w-full min-h-screen p-8 bg-black text-white text-sm">
        <div className="flex justify-between items-center mb-1">
            <h2 className="text-2xl text-white font-semibold tracking-wide">All Users</h2>
            <div className='flex items-center gap-2'>
                <button
                    className='bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center gap-2'
                    onClick={exportCSV}
                >
                    <Download size={18} /> Export CSV
                </button>
            </div>
        </div>
        <div className='mb-4'>
            <BreadCrumbs title='All Users' />
        </div>
        
        <div className="mb-4 flex items-center bg-gray-900 p-2 rounded-md flex-1">
            <Search size={18} className="text-gray-400 mr-2" />
            <input
                type="text"
                placeholder="Search users..."
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

            <div className='flex justify-between items-center mt-4 text-white'>
                <button
                    onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
                    disabled={page === 1}
                    className='px-4 py-2 rounded bg-blue-600 hover:bg-blue-700 disabled:opacity-50'
                >
                    Previous
                </button>

                <div className="text-gray-300">
                    Page <strong>{page}</strong> of <strong>{totalPages || 1}</strong>
                </div>

                <button
                    onClick={() => setPage((prev) => prev + 1)}
                    disabled={page === totalPages}
                    className='px-4 py-2 rounded bg-blue-600 hover:bg-blue-700 disabled:opacity-50'
                >
                    Next
                </button>
            </div>
        </div>
    </div>
  )
}

export default SellerPage