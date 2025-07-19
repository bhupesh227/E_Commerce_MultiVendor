"use client";

import React, { useState } from 'react';
import { useQuery , useQueryClient, useMutation } from '@tanstack/react-query';
import { flexRender, getCoreRowModel, useReactTable } from '@tanstack/react-table';
import axiosInstance from 'apps/admin-ui/src/utils/axiosInstance';
import BreadCrumbs from 'apps/admin-ui/src/shared/components/BreadCrumbs';
import { X } from 'lucide-react';


const columns = [
    {accessorKey: 'name', header: 'Name'},
    {accessorKey: 'email', header: 'Email'},
    {accessorKey: 'role', header: 'Role'},
];

const ManagementPage = () => {
    const [open , setOpen] = useState(false);
    const [search , setSearch] = useState('');
    const [ selectedRole, setSelectedRole ] = useState('user');

    const queryClient = useQueryClient();

    const { data, isLoading ,isError } = useQuery({
        queryKey: ['admins'],
        queryFn: async () => {
            const res = await axiosInstance.get(`/admin/api/get-all-admins`);
            return res.data.admins || [];
        },
    });

    const { mutate: updateRole, isPending: updating } = useMutation({
        mutationFn: async () => {
            return await axiosInstance.put('/admin/api/add-new-admin', {
                email: search,
                role: selectedRole,
            });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({queryKey: ['admins']});
            setOpen(false);
            setSearch('');
            setSelectedRole('user');
        },
        onError: (error) => {
            console.error("Error updating role:", error);
        }
    });

    const table = useReactTable({
        data: data || [],
        columns,
        getCoreRowModel: getCoreRowModel(),
    });

    const handleSubmit =(e:any) => {
        e.preventDefault();
        updateRole();
    };

  return (
    <div className="w-full min-h-screen p-8 bg-black text-white text-sm">
        <div className="flex justify-between items-center mb-1">
            <h2 className="text-2xl text-white font-semibold tracking-wide">Team Management</h2>
            <div className='flex items-center gap-2'>
                <button
                    className='bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center gap-2'
                    onClick={() => setOpen(true)}
                >
                    Add Admin
                </button>
            </div>
        </div>
        <div className='mb-4'>
            <BreadCrumbs title="Team Management" />
        </div>

        <div className="overflow-hidden rounded-lg shadow-lg border border-gray-700">
            <table className="min-w-full text-left">
                <thead className="bg-gray-800 text-slate-300">
                    {table.getHeaderGroups().map(headerGroup => (
                        <tr key={headerGroup.id}>
                            {headerGroup.headers.map((header)=> (
                                <th key={header.id} className="p-3">
                                    {flexRender(
                                        header.column.columnDef.header,
                                        header.getContext()
                                    )}
                                </th>
                            ))}
                        </tr>
                    ))}
                </thead>
                <tbody>
                    {isLoading ? (
                        <tr>
                            <td colSpan={3} className="text-center p-4 text-slate-500">
                                Loading...
                            </td>   
                        </tr>
                    ) : isError ? (
                        <tr>
                            <td colSpan ={3} className="text-center p-4 text-red-500">
                                Error loading data
                            </td>
                        </tr>
                    ) : (
                        table.getRowModel().rows.map(row => (
                            <tr key={row.id} className="border-b border-gray-700 hover:bg-gray-800 transition">
                                {row.getVisibleCells().map(cell => (
                                    <td key={cell.id} className="p-3">
                                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                    </td>
                                ))}
                            </tr>
                        ))
                    )}     
                </tbody>
            </table> 
        </div>

        {open && (
            <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
                <div className="bg-gray-800 p-6 rounded-lg shadow-lg w-full max-w-md relative">
                    <button
                        className="absolute top-2 right-2 text-gray-400 hover:text-white"
                        onClick={() => setOpen(false)}
                    >
                        <X size={24} className='text-red-500' />
                    </button>
                    <h3 className="text-xl font-semibold mb-4">Add New Admin</h3>
                    <form onSubmit={handleSubmit}>
                        <div className="mb-4">
                            <label className="block text-sm mb-2">Email</label>
                            <input
                                type="email"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="w-full bg-gray-700 text-white px-4 py-2 rounded-lg outline-none border border-gray-600"
                                required
                                placeholder="Enter admin email"
                            />
                        </div>
                        <div className="mb-4">
                            <label className="block text-sm mb-2">Role</label>
                            <select
                                value={selectedRole}
                                onChange={(e) => setSelectedRole(e.target.value)}
                                className="w-full bg-gray-700 text-white px-4 py-2 rounded-lg outline-none border border-gray-600"
                            >
                                <option value="user">User</option>
                                <option value="admin">Admin</option>
                            </select>
                        </div>
                        <div className='flex gap-8 pt-2'>
                            <button
                                type="button"
                                onClick={() => setOpen(false)}
                                className="w-full px-4 py-2 rounded-md bg-gray-800 hover:bg-gray-700 text-white border border-gray-600"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={updating}
                                className={`w-full bg-green-600 hover:bg-green-700 font-semibold text-white px-4 py-2 rounded-lg ${updating ? 'opacity-50 cursor-not-allowed' : ''}`}
                            >
                                {updating ? 'Updating...' : 'Add Admin'}  
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        )}
    </div>
  )
}

export default ManagementPage