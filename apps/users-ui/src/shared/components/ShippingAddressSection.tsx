"use client";

import { MapPin, Plus, Trash2, X } from 'lucide-react';
import React, { useState } from 'react'
import { useForm } from 'react-hook-form';
import { countries } from '../../app/config/countries';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import axiosInstance from '../../utils/axiosInstance';
import { toast } from 'sonner';

const ShippingAddressSection = () => {
    const [showModal, setShowModal] = useState(false);
    const queryClient = useQueryClient();

    const { register, handleSubmit, reset, formState: { errors } } = useForm({
        defaultValues: {
            label: "Home",
            name: "",
            street: "",
            city: "",
            zip: "",
            country: "IN",
            isDefault: "false",
        }
    });

    const { mutate: addAddress } = useMutation({
        mutationFn: async (payload: any) => {
            const res = await axiosInstance.post('/api/add-address', payload);
            return res.data.address;
        }, 
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['shipping-addresses'] });
            reset();
            setShowModal(false);
            toast.success("Address added successfully");
        },
    });

    const { data: addresses, isLoading } = useQuery({
        queryKey: ["shipping-addresses"],
        queryFn: async () => {
            const res = await axiosInstance.get("/api/shipping-addresses");
            return res.data.addresses;
        },
    });

    const { mutate: deleteAddress } = useMutation({
        mutationFn: async (id: any) => {
            await axiosInstance.post(`/api/delete-address/${id}`);
        }, 
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['shipping-addresses'] });
            toast.success("Address deleted successfully");
        }
    })


    const onSubmit = async (data: any) => {
        addAddress({
            ...data, 
            isDefault: data?.isDefault === 'true',
        });
    }
  return (
    <div className='space-y-4'>
        <div className="flex flex-col gap-5 ">
            <div className='flex justify-between items-center gap-2'>
                <h2 className='text-lg font-semibold text-gray-800'>
                    Saved Address
                </h2>
                <button 
                    className='flex items-center gap-1 text-sm text-blue-600 font-medium hover:underline'
                    onClick={() => setShowModal(true)}
                >
                    <Plus className='w-4 h-4' /> Add New Address
                </button>
            </div>

            <div>
                {isLoading ? (
                    <p className="text-sm text-gray-500">
                        Loading Addresses...
                    </p>
                ) : (
                    !addresses || addresses.length === 0 ? (
                        <p className="text-sm text-gray-500">
                            No Saved Addresses found.
                        </p>
                    ) : (
                        <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
                            {addresses.map((address: any) => (
                                <div key={address.id}
                                    className='border border-gray-200 rounded-md p-4 relative'
                                >
                                    {address.isDefault && (
                                        <span className='absolute top-2 right-2 bg-blue-100 text-blue-600 text-xs px-2 py-0.5 rounded-full'>
                                            Default
                                        </span>
                                    )}
                                    <div className='flex items-start gap-2 text-sm text-gray-700'>
                                        <MapPin className='w-5 h-5 mt-0.5 text-gray-500' />
                                        <div>
                                            <p className='font-medium capitalize'>
                                                <span className='font-bold'> {address.label} </span>- {address.name}
                                            </p>
                                            <p className='text-sm capitalize'>
                                                {address.street}, {address.zip}
                                            </p>
                                            <p className='text-xs capitalize'>
                                                {address.city},{" "}
                                                {address.country}
                                            </p>
                                        </div>
                                    </div>
                                    <div className='flex gap-3 mt-4'>
                                        <button className='flex items-center gap-1 !cursor-pointer text-xs text-red-600'
                                            onClick={() => deleteAddress(address.id)}
                                        >
                                            <Trash2 className='w-4 h-4' /> Delete
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )
                )}
            </div>

            {showModal && (
                <div className="fixed inset-0 bg-black bg-opacity-30 flex justify-center items-center z-50">
                    <div className="bg-white w-full max-w-md p-6 rounded-md shadow-md relative">
                        <button 
                            className='top-3 absolute right-3 text-gray-500 hover:text-gray-800'
                            onClick={() => setShowModal(false)}
                        >
                            <X className='w-5 h-5' />
                        </button>
                        <h3 className='text-lg font-semibold mb-4 text-gray-800'>
                            Add new Address
                        </h3>
                        <form onSubmit={handleSubmit(onSubmit)} className='space-y-3'>
                            <select 
                                {...register("label",
                                    { required: "Label is required" })
                                } 
                                className='form-input' >
                                    <option value="Home">Home</option>
                                    <option value="Work">Work</option>
                                    <option value="Other">Other</option>
                            </select>

                            <input
                                placeholder="Name"
                                {...register("name", { required: "Name is required" })}
                                className="form-input"
                            />
                            {errors.name && (
                                <p className='text-errors'>
                                    {errors.name.message}
                                </p>
                            )}
                            <input
                                placeholder="Street"
                                {...register("street", { required: "Street is required" })}
                                className="form-input"
                            />
                            {errors.street && (
                                <p className='text-errors'>
                                    {errors.street.message}
                                </p>
                            )}
                            <input
                                placeholder="City"
                                {...register("city", { required: "City is required" })}
                                className="form-input"
                            />
                            {errors.city && (
                                <p className='text-errors'>
                                    {errors.city.message}
                                </p>
                            )}
                            <input
                                placeholder="ZIP CODE"
                                {...register("zip", { required: "ZIP CODE is required" , pattern: {
                                    value: /^\d{5}(-\d{4})?$/,
                                    message: "Invalid ZIP CODE format"
                                }})}
                                className="form-input"
                            />
                            {errors.zip && (
                                <p className='text-errors'>
                                    {errors.zip.message}
                                </p>
                            )}
                            <select
                                {...register('country',{ required: "Country is required" })}
                                className="form-input"
                            >
                                {countries.map((country) => (
                                    <option value={country.code} key={country.name}>
                                        {country.name}
                                    </option>
                                ))}
                            </select>
                            {errors.country && (
                                <p className='text-errors'>{errors.country.message}</p>
                            )}
                            <select {...register("isDefault")} className='form-input'>
                                <option value="true">Set as Default</option>
                                <option value="false">Not Default</option>
                            </select>

                            <button
                                type='submit'
                                className='w-full bg-blue-600 text-white text-sm py-2 rounded-md hover:text-blue-700 transition'
                            >
                                Save Address
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    </div>
  )
}

export default ShippingAddressSection