"use client";

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import axiosInstance from 'apps/sellers-ui/src/utils/axiosInstance';
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  useReactTable,
} from '@tanstack/react-table';
import { BarChart, ChevronRight, Loader2, Pencil, Plus, Search, Trash } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import React, { useMemo, useState } from 'react';
import DeleteConfirmationModal from 'apps/sellers-ui/src/shared/components/DeleteConfirmationModal';
import { toast } from 'sonner';
import { AxiosError } from 'axios';

const AllEvents = () => {
    const [globalFilter, setGlobalFilter] = useState('');
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [selectedEvent, setSelectedEvent] = useState<any>(null);

    const queryClient = useQueryClient();

    const fetchEvents = async () => {
        const response = await axiosInstance.get('/product/api/get-shop-events');
        return response.data.events;
    };
    const { data: events = [], isLoading } = useQuery({
        queryKey: ['shop-events'],
        queryFn: fetchEvents,
        staleTime: 1000 * 60 * 5,
    });

    const deleteMutation = useMutation({
        mutationFn: async (eventId: string) => {
            return axiosInstance.delete(`/product/api/delete-product/${eventId}`);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['shop-events'] });
            toast.success('Event scheduled for deletion.');
            setShowDeleteModal(false);
        },
        onError: (error: AxiosError) => {
            const errorMessage = (error.response?.data as { message?: string })?.message || 'Something went wrong';
            toast.error(errorMessage);
        },
    });

    const restoreMutation = useMutation({
        mutationFn: async (eventId: string) => {
            return axiosInstance.put(`/product/api/restore-product/${eventId}`);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['shop-events'] });
            toast.success('Event restored successfully');
        },
        onError: (error: AxiosError) => {
            const errorMessage = (error.response?.data as { message?: string })?.message || 'Something went wrong';
            toast.error(errorMessage);
        },
    });

    const openDeleteModal = (event: any) => {
        setSelectedEvent(event);
        setShowDeleteModal(true);
    };

    const columns = useMemo(() => [
        {
            accessorKey: 'image',
            header: 'Image',
            cell: ({ row }: any) => (
                <Image
                    src={row.original.images[0]?.url || ''}
                    alt={row.original.title}
                    width={100}
                    height={100}
                    className="rounded-md object-cover w-12 h-12"
                />
            )
        },
        {
            accessorKey: 'title',
            header: 'Event Name',
            cell: ({ row }: any) => (
                <Link
                    href={`${process.env.NEXT_PUBLIC_USER_UI_LINK}/product/${row.original.slug}`}
                    className="text-blue-400 hover:underline"
                    title={row.original.title}
                >
                    {row.original.title.length > 25 ? `${row.original.title.substring(0, 25)}...` : row.original.title}
                </Link>
            ),
        },
        {
            accessorKey: 'status',
            header: 'Status',
            cell: ({ row }: any) => {
                const now = new Date();
                const startDate = new Date(row.original.startingDate);
                const endDate = new Date(row.original.endingDate);
                let status = { text: 'Active', color: 'bg-green-500' };
                if (now < startDate) {
                    status = { text: 'Upcoming', color: 'bg-yellow-500' };
                } else if (now > endDate) {
                    status = { text: 'Expired', color: 'bg-red-500' };
                }
                return <span className={`px-2 py-1 text-xs rounded-full text-white ${status.color}`}>{status.text}</span>;
            },
        },
        {
            accessorKey: 'stock',
            header: 'Stock',
            cell: ({ row }: any) => <span className={row.original.stock < 10 ? 'text-red-500' : 'text-white'}>{row.original.stock} left</span>,
        },
        {
            accessorKey: 'startingDate',
            header: 'Start Date',
            cell: ({ row }: any) => new Date(row.original.startingDate).toLocaleDateString(),
        },
        {
            accessorKey: 'endingDate',
            header: 'End Date',
            cell: ({ row }: any) => new Date(row.original.endingDate).toLocaleDateString(),
        },
        {
            header: 'Actions',
            cell: ({ row }: any) => (
                <div className="flex gap-3">
                    <Link href={`/product/edit/${row.original.id}`} className="text-yellow-400 hover:text-yellow-300 transition"><Pencil size={18} /></Link>
                    <button className="text-green-400 hover:text-green-300 transition"><BarChart size={18} /></button>
                    <button onClick={() => openDeleteModal(row.original)} className="text-red-400 hover:text-red-300 transition"><Trash size={18} /></button>
                </div>
            ),
        },
    ], []);

    const table = useReactTable({
        data: events,
        columns,
        getCoreRowModel: getCoreRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        state: { globalFilter },
        onGlobalFilterChange: setGlobalFilter,
    });

    return (
        <div className="w-full min-h-screen p-8">
            <div className="flex justify-between items-center mb-1">
                <h2 className="text-2xl text-white font-semibold">All Events</h2>
                <Link
                    href="/dashboard/create-event"
                    className="bg-blue-800 hover:bg-blue-700 transition text-white px-4 py-2 rounded-lg flex items-center gap-2"
                >
                    <Plus size={18} /> Add Event
                </Link>
            </div>
            <div className="flex items-center">
                <span className="text-[#80deea] cursor-pointer">Dashboard</span>
                <ChevronRight size={20} className="opacity-[0.98] text-white" />
                <span className="text-white">All Events</span>
            </div>
            <div className="my-4 flex items-center bg-gray-900 p-2 rounded-md flex-1">
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
                    <div className="flex items-center justify-center p-8">
                        <Loader2 size={24} className="animate-spin text-white" />
                    </div>
                ) : (
                    <table className="w-full text-white">
                        <thead>
                            {table.getHeaderGroups().map((headerGroup) => (
                                <tr key={headerGroup.id} className="border-b border-gray-800">
                                    {headerGroup.headers.map((header) => (
                                        <th key={header.id} className="text-left p-3">{flexRender(header.column.columnDef.header, header.getContext())}</th>
                                    ))}
                                </tr>
                            ))}
                        </thead>
                        <tbody>
                            {table.getRowModel().rows.map((row) => (
                                <tr key={row.id} className="border-b border-gray-800 hover:bg-gray-800 transition">
                                    {row.getVisibleCells().map((cell) => (
                                        <td key={cell.id} className="p-3">{flexRender(cell.column.columnDef.cell, cell.getContext())}</td>
                                    ))}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
            {showDeleteModal && (
                <DeleteConfirmationModal
                    product={selectedEvent}
                    onRestore={() => restoreMutation.mutate(selectedEvent?.id)}
                    onConfirm={() => deleteMutation.mutate(selectedEvent?.id)}
                    onClose={() => setShowDeleteModal(false)}
                    isDeleting={deleteMutation.isPending}
                    isRestoring={restoreMutation.isPending}
                />
            )}
        </div>
    )
};

export default AllEvents;