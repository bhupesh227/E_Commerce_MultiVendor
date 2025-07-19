"use client";

import React ,{ useDeferredValue, useMemo, useState } from 'react';
import { flexRender, getCoreRowModel, getFilteredRowModel, getSortedRowModel, useReactTable } from '@tanstack/react-table';
import { Download, Ban, Search, Loader2 } from 'lucide-react';
import { useQuery, UseQueryResult ,useQueryClient, useMutation } from '@tanstack/react-query';
import { saveAs } from 'file-saver';
import axiosInstance from 'apps/admin-ui/src/utils/axiosInstance';
import BreadCrumbs from 'apps/admin-ui/src/shared/components/BreadCrumbs';




type User = {
    id: string,
    name: string,
    email: string,
    role: string,
    createdAt: string,
};

type UsersResponse = {
    data: User[];
    meta: {
        totalUsers: number;
    };
};


const UserPage = () => {
    const [globalFilter, setGlobalFilter] = useState('');
    const [page, setPage] = useState(1);
    const [roleFilter, setRoleFilter] = useState('');
    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const deferredGlobalFilter = useDeferredValue(globalFilter);
    const limit = 10;

    const queryClient = useQueryClient();

    const { data, isLoading }: UseQueryResult<UsersResponse, Error> = useQuery<UsersResponse , Error, UsersResponse , [string, number] >({
        queryKey: ['users-list', page],
        queryFn: async () => {
            const res = await axiosInstance.get(`/admin/api/get-all-users?page=${page}&limit=${limit}`);
            return res.data;
        },
        placeholderData: (previousData) => previousData,
        staleTime: 1000 * 60 * 5,
    });
    
    const banUserMutation = useMutation({
        mutationFn: async (userId: string) => {
            await axiosInstance.put(`/admin/api/ban-user/${userId}`);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({queryKey: ['users-list']});
            setIsModalOpen(false);
            setSelectedUser(null);
        },
    });

    const allUsers = data?.data || [];
    const filteredUsers = useMemo(() => {
        return allUsers.filter((user) => {
            const matchesRole = roleFilter 
                ? user.role.toLowerCase() === roleFilter.toLowerCase() 
                : true;
            const matchesGlobal = deferredGlobalFilter
                ? Object.values(user).join(" ").toLowerCase().includes(deferredGlobalFilter.toLowerCase())
                : true;
            return matchesRole && matchesGlobal;
        });
    }, [allUsers, deferredGlobalFilter, roleFilter]);

    const totalPages = Math.ceil((data?.meta?.totalUsers ?? 0) / limit);

    const columns = useMemo(() => [
        {
            accessorKey: "name",
            header: "Name",
        },
        {
            accessorKey: 'email',
            header: "Email",
        },
        {
            accessorKey: 'role',
            header: "Role",
            cell: ({ row }: any) => (
                <span className="uppercase font-semibold text-blue-400">
                    {row.original.role}
                </span>
            )
        },
        {
            accessorKey: 'createdAt',
            header: "Joined",
            cell: ({ row }: any) => (
                <span className='text-gray-500'>
                    {new Date(row.original.createdAt).toLocaleDateString()}
                </span>
            ),
        },
        {
            id: 'actions',
            header: "Actions",
            cell: ({ row }: any) => (
                <div className='flex items-center gap-2'>
                    <button
                        className='text-red-500 hover:text-red-700'
                        onClick={() => {
                            setSelectedUser(row.original);
                            setIsModalOpen(true);
                        }}
                    >
                        <Ban size={16} />
                    </button>
                </div>
            )
        }
        
    ],[] );

    const table = useReactTable({
        data: filteredUsers,
        columns,
        getCoreRowModel: getCoreRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        state: { globalFilter },
        onGlobalFilterChange: setGlobalFilter,
    });

    const exportCSV = () => {
        const csvData = filteredUsers.map((user: any) =>
            `${user.name},${user.email},${user.role},${user.createdAt}`
        );
        const blob = new Blob(
            [`Name,Email,Role,Joined\n${csvData.join('\n')}`],
            { type: 'text/csv;charset=utf-8;' }
        );
        saveAs(blob, `users-page-${page}.csv`)
    };

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
                <select
                    className="bg-gray-800 text-white px-4 py-2 rounded-lg border border-gray-700 outline-none"
                    value={roleFilter}
                    onChange={(e) => setRoleFilter(e.target.value)}
                >
                    <option value="">All Roles</option>
                    <option value="admin">Admin</option>
                    <option value="user">User</option>
                </select>
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

        {isModalOpen && selectedUser && (
            <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
                <div className="bg-gray-800 p-6 rounded-lg shadow-lg w-[90%] max-w-md relative">
                    <div className='flex pag-4 items-center mb-4'>
                        <h3 className="text-lg font-semibold text-white">Ban User</h3>
                    </div>
                    <div className='mb-6'>
                        <p className="text-gray-300 leading-6">
                            <span className='font-semibold text-yellow-400'>
                                Important {" "}
                            </span>
                            Are you sure you want to ban  
                            <span className='text-red-500 font-bold capitalize ml-1'>
                                {selectedUser.name} ?
                            </span><br />
                            This action can be reverted later.
                        </p>
                    </div>

                    <div className='flex justify-end gap-3'>
                        <button
                            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md"
                            onClick={() => {
                                setIsModalOpen(false);
                            }}
                        >
                            Cancel
                        </button>
                        <button
                            className="px-4 py-2  bg-red-600 hover:bg-red-700 text-white rounded-md flex items-center gap-2"
                            onClick={() => banUserMutation.mutate(selectedUser.id)}
                        >
                            <Ban size={16} /> Confirm
                        </button>
                    </div>
                </div>
            </div>
        )}
    </div>      
  );
}

export default UserPage;