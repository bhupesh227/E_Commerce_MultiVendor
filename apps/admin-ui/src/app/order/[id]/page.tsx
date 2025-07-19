'use client';

import axiosInstance from 'apps/admin-ui/src/utils/axiosInstance';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { useParams, useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react';

const statuses = [
    "Ordered",
    "Packed",
    "Shipped",
    "Out for Delivery",
    "Delivered",
];

const Page = () => {
    const params = useParams();
    const orderId = params.id as string;

    const [order, setOrder] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    const router = useRouter();

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

    useEffect(() => {
        if (orderId) fetchOrder();
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
        <div className="max-w-5xl px-4 py-10">
            <div className="my-4">
                <span
                    className="text-white flex items-center gap-2 font-semibold cursor-pointer hover:text-blue-500 transition-colors"
                    onClick={() => router.push("/dashboard/orders")}
                >
                    <ArrowLeft/>
                    Go Back to Dashboard
                </span>
            </div>
            <div className="flex items-center justify-center w-full mt-10">
                <div className="bg-gray-900 text-gray-200 p-6 rounded-lg shadow-md w-full max-w-4xl">
                    <h1 className="text-2xl font-bold text-gray-200 mb-4">
                        Order  #{order.id.slice(-6)}
                    </h1>

                    <div className="mb-6">
                        <div className="flex items-center justify-between text-xs font-medium text-gray-400">
                            {statuses.map((step, idx) => {
                                const current = step === order.deliveryStatus
                                const passed = statuses.indexOf(order.deliveryStatus) >= idx

                                return (
                                    <div
                                        key={step}
                                        className={`flex-1 text-left ${
                                        current
                                            ? "text-blue-600"
                                            : passed
                                            ? "text-green-600"
                                            : "text-gray-400"
                                        }`}
                                    >
                                        {step}
                                    </div>
                                );
                            })}
                        </div>

                        <div className="flex items-center">
                            {statuses.map((step, idx) => {
                                const reached = idx <= statuses.indexOf(order.deliveryStatus)

                                return (
                                    <div key={step} className="flex-1 flex items-center">
                                        <div
                                            className={`w-4 h-4 rounded-full ${
                                            reached ? "bg-blue-600" : "bg-gray-300"
                                            }`}
                                        />
                                        {idx !== statuses.length - 1 && (
                                            <div
                                                className={`flex-1 h-1 ${
                                                    reached ? "bg-blue-500" : "bg-gray-200"
                                                }`}
                                            />
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    <div className='bg-gray-800 p-6 rounded-lg shadow-md mb-6 space-y-1 text-sm'>
                        <p>
                            <span className='font-semibold mr-5'>Payment Status :</span>{" "}
                            <span className='text-green-600 font-medium'>{order.status}</span>
                        </p>
                    
                        <p>
                            <span className='font-semibold mr-12'>Total Paid :</span>{" "}
                            <span className='text-blue-200 font-medium'>₹{order.total.toFixed(2)}</span>      
                        </p>
                        {order.discountAmount > 0 && (
                            <p>
                                <span className='font-semibold mr-6'>Discount Applied :</span>{" "}
                                <span className='text-red-500 font-medium'>
                                    -₹{order.discountAmount.toFixed(2)}(
                                        {order.couponCode?.discountType == 'percentage'
                                            ? `${order.couponCode?.discountValue}%`
                                            : `₹${order.couponCode?.discountValue}`
                                        }{" "}
                                        off)
                                </span>
                            </p>
                        )}
                        
                        {order.couponCode && (
                            <p>
                                <span className='font-semibold mr-6'>Coupon Code Used :</span>{" "}
                                <span className='text-gray-200 font-medium'>
                                    {order.couponCode.publicName }
                                </span>
                            </p>
                        )}
                    
                        <p>
                            <span className='font-semibold mr-11'>Order Date :</span>{" "}
                            <span className='text-gray-200 font-medium'>
                                {new Date(order.createdAt).toLocaleDateString("en-IN", {
                                    day: "numeric",
                                    month: "long",
                                    year: "numeric",
                                })}
                            </span>
                        </p>

                        {order.shippingAddress && (
                            <div className='mt-4 text-sm text-gray-400'>
                                <p className='font-semibold text-white'>Shipping Address:</p>
                                <div className='ml-2'>
                                    <p>{order.shippingAddress.name}</p>
                                    <p>
                                        {order.shippingAddress.street}, {order.shippingAddress.city},{" "}
                                        {order.shippingAddress.country}<br />
                                        {order.shippingAddress.zip}
                                    </p>
                                </div>
                            </div>
                        )}

                        <div className='mt-8 pt-8'>
                            <h2 className='text-lg font-semibold text-gray-200 mb-2'>Order Items</h2>
                            <div className='space-y-2'>
                                {order.items.map((item: any) => (
                                    <div 
                                        key={item.productId}
                                        className='flex items-center justify-between gap-2 bg-gray-700 border border-gray-200 p-4 rounded-lg shadow-sm'
                                    >
                                        <img
                                            src={item.product?.images[0].url || '/placeholder.png'}
                                            alt={item.product.title || 'Product Image'}
                                            className='w-16 h-16 object-cover rounded-md border border-gray-300'
                                        />
                                        <div className='flex-1'>
                                            <p className='text-gray-300 font-medium'>{item.product.title}</p>
                                            <p className='text-gray-400 text-sm'>Quantity: {item.quantity}</p>
                                            {item.selectedOptions && Object.keys(item.selectedOptions).length > 0 && (
                                                <div className='text-gray-400 text-xs mt-1'>
                                                    {Object.entries(item.selectedOptions).map(([key, value]:[string,any]) => value &&(
                                                        <span key={key} className='mr-3 flex gap-2 items-center'>
                                                            <span className='font-semibold capitalize'>
                                                                {key}:
                                                            </span>{" "}
                                                            <span className='w-3 h-3 rounded-full block' style={{backgroundColor:value}}></span>
                                                        </span>
                                                    ))}
                                                </div>    
                                            )}     
                                        </div>
                                        <p className='text-sm font-semibold text-gray-300'>
                                            ₹{item.price.toFixed(2)}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Page