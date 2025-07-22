"use client";

import axiosInstance from 'apps/users-ui/src/utils/axiosInstance';
import { Loader2 } from 'lucide-react';
import { useParams } from 'next/navigation';
import React, { useEffect, useState } from 'react'


const OrderPageDetail = () => {
    const params = useParams();
    const orderId = params.id as string;

    const [order, setOrder] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchOrder = async () => {
            try {
                const res = await axiosInstance.get(`/order/api/get-order-details/${orderId}`);
                setOrder(res.data.order);
            } catch (error) {
                setLoading(false);
                console.error("Failed to fetch order details", error);
            } finally {
                setLoading(false);
            }
        };

        if (orderId) {
            fetchOrder();
        }
    }, [orderId]);

    if (loading) {
        return (
            <div className='flex justify-center items-center h-[40vh]'>
                <Loader2 className='animate-spin w-6 h-6 text-gray-600' />
            </div>
        );
    };

    if (!order) {
        return <p className='text-center text-sm text-red-500'>Order not found.</p>
    };
  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
        <h1 className="text-2xl font-bold text-gray-800 mb-4">
            Order #{order.id.slice(-6)}
        </h1>

        <div className='my-4'>
            <div className="flex items-center justify-between text-xs font-medium text-gray-500 mb-2">
                {[
                    "Ordered",
                    "Packed",
                    "Shipped",
                    "Out for Delivery",
                    "Delivered",
                ].map((status, index) => {
                    const current = status.toLowerCase() === (order.deliveryStatus || "processing").toLowerCase();
                    const passed = index <= ["Ordered", "Packed", "Shipped", "Out for Delivery", "Delivered"].findIndex((s) => s.toLowerCase() === (order.deliveryStatus || "processing").toLowerCase());
                    return (
                        <div key={index} className={`flex-1 text-left ${current ? 'text-blue-600' : passed ? 'text-green-600' : 'text-gray-400'}`}>
                            {status}
                        </div>
                    );
                })}
            </div>

            <div className='flex items-center'>
                {["Ordered", "Packed", "Shipped", "Out for Delivery", "Delivered"].map((status, index) => {
                    const isReached = index <= ["Ordered", "Packed", "Shipped", "Out for Delivery", "Delivered"].findIndex((s) => s.toLowerCase() === (order.deliveryStatus || "processing").toLowerCase());
                    return (
                        <div className='flex-1 flex items-center' key={status}>
                            <div className={`w-4 h-4 rounded-full ${isReached ? 'bg-blue-600' : 'bg-gray-300'} `}/>
                                {index !== 4 && (
                                    <div className={`flex-1 h-1  ${isReached ? 'bg-blue-500' : 'bg-gray-200'}`}/>
                                )}
                        </div>
                    );
                })}
            </div>
        </div>

        <div className='mb-6 space-y-1 text-sm text-gray-700'>
            <p>
                <span className='font-semibold'>Payment Status:</span>
                <span className='text-green-600 font-medium'>{order.status}</span>
            </p>
            <p>
                <span className='font-semibold'>Total Paid:</span>
                <span className='font-medium'>₹{order.total.toFixed(2)}</span>
            </p>
            {order.discountAmount > 0 && (
                <p>
                    <span className='font-semibold'>Discount Applied:</span>
                    <span className='text-green-600 font-medium'>
                        -{order.discountAmount.toFixed(2)}(
                            {order.couponCode?.discountType === 'percentage'
                                ? `${order.couponCode?.discountValue}%`
                                : `₹${order.couponCode?.discountValue}`
                            }{" "}
                        off)                        
                    </span>
                </p>
            )}
            {order.couponCode && (
                <p>
                    <span className='font-semibold'>Coupon Code:</span>
                    <span className='text-blue-600 font-medium'>{order.couponCode.publicName}</span>
                </p>
            )}
            <p>
                <span className='font-semibold'>Order Date:</span>
                <span className='font-medium'>{new Date(order.createdAt).toLocaleDateString()}</span>
            </p>
        </div>
        {order.shippingAddress && (
            <div className='mb-6 text-sm text-gray-700'>
                <p>
                    <span className='font-semibold'>Shipping Address:</span>
                    <span className='font-medium'>{order.shippingAddress.name}</span>
                </p>
                <p className='ml-4'>
                    {order.shippingAddress.street}, {order.shippingAddress.city},{" "}
                    {order.shippingAddress.zip}
                </p>
                <p className='ml-4'>
                    {order.shippingAddress.country}
                </p>
            </div>
        )}
        <div>
            <h2 className='text-lg font-semibold text-gray-700 mb-4'>Order Items</h2>
            <div className='space-y-4'>
                {order.items.map((item:any) => (
                    <div key={item.productId} className='flex items-center border-gray-400 border p-3 mb-4 gap-4'>
                        <img 
                            src={item.product?.images[0]?.url || '/placeholder.png'}    
                            alt={item.product?.title || 'Product Image'} 
                            className='w-16 h-16 object-cover rounded-md mr-4 border border-gray-200' 
                        />
                        <div className='flex-1'>
                            <h3 className='text-sm font-semibold text-gray-800'>{item.product?.title || 'Product Title'}</h3>
                            <p className='text-sm text-gray-600'>Quantity: {item.quantity}</p>
                            {item.selectedOptions && 
                                Object.keys(item.selectedOptions).length > 0 && (
                                    <div className='text-sm text-gray-600 mt-1'>
                                        {Object.entries(item.selectedOptions).map(([option, value]:[string, any]) => value && (
                                            <span key={option} className='flex gap-2 items-center mr-2'>
                                                <span className='font-medium capitalize'>
                                                    {option}:
                                                </span>{" "}
                                                <span 
                                                    className='w-3 h-3 rounded-full block'
                                                    style={{ backgroundColor: value }}
                                                >
                                                </span>
                                            </span>
                                        ))}
                                    </div>
                                )
                            }
                        </div>
                        <p className='text-sm text-gray-800 font-medium'>
                            Price: ₹{item.price.toFixed(2)}
                        </p>
                    </div>
                ))}
            </div>
        </div>
    </div>
  )
}

export default OrderPageDetail