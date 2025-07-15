"use client";

import useDeviceTracking from 'apps/users-ui/src/hooks/useDevice';
import useLocationTracking from 'apps/users-ui/src/hooks/useLocation';
import useUser from 'apps/users-ui/src/hooks/useUser';
import { useStore } from 'apps/users-ui/src/store';
import { ChevronRight, X } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import React from 'react'

const Wishlist = () => {
    const { user } = useUser();
    const location  = useLocationTracking();
    const  deviceInfo  = useDeviceTracking();

    const wishlist = useStore((state) => state.wishlist);
    const addToCart = useStore((state) => state.addToCart);
    const removeFromWishlist = useStore((state) => state.removeFromWishlist);

    const decreaseQuantity = (id : string) => {
        useStore.setState((state : any) => ({
            wishlist: state.wishlist.map((item:any) => 
                item.id === id && item.quantity > 1 
                    ? {...item, quantity : item.quantity - 1} 
                    : item
            )
        }));
    }

    const increaseQuantity = (id : string) => {
        useStore.setState((state : any) => ({
            wishlist: state.wishlist.map((item:any) => 
                item.id === id && item.quantity < item.stock 
                    ? {...item, quantity : (item.quantity ?? 1) + 1} 
                    : item
            )
        }));
    }

    const removeItem = (id : string) => {
        removeFromWishlist(id, user, location, deviceInfo);
    }
  return (
    <div className="w-full bg-white">
        <div className="pb-[50px]">

            <div className="flex items-center text-lg py-4">
                <Link href="/" className="text-[#80deea] cursor-pointer">
                    Home
                </Link>
                <ChevronRight size={20} className="opacity-[0.98]" />
                <span className='underline text-[#55585b]'>Wishlist</span>
            </div>

            {wishlist.length === 0 ? (
                <div className="text-center text-gray-500">
                    Your wishlist is empty.
                </div>
            ) : (
                <div className="flex flex-col gap-10">
                    <table className="w-full border-collapse">
                        <thead className="bg-[#f1f3f4]">
                            <tr>
                                <th className="py-3 text-left pl-4">Product</th>
                                <th className="py-3 text-left">Price</th>
                                <th className="py-3 text-left">Quantity</th>
                                <th className="py-3 text-left">Action</th>
                                <th className="py-3 text-left"></th>
                            </tr>
                        </thead>

                        <tbody>
                            {wishlist?.map((item:any) => (
                                <tr key={item.id} className="border-b border-b-[#0000000e]">
                                    <td className="flex items-center gap-3 p-4">
                                        <Image 
                                            src={item.images[0]?.url} 
                                            alt={item.title} 
                                            width={80} 
                                            height={80} 
                                            className="rounded w-20 h-20" 
                                        />
                                        <span className='capitalize font-semibold'>{item.title}</span>
                                    </td>

                                    <td className="text-lg">
                                        ₹{item?.salePrice.toFixed(2)}
                                    </td>

                                    <td>
                                        <div className="flex items-center justify-center border border-gray-200 rounded-[20px] w-[90px] p-[2px]">
                                            <button
                                                className="text-black cursor-pointer text-xl"
                                                onClick={() => decreaseQuantity(item.id)}
                                            >
                                                -
                                            </button>
                                            <span className="px-4"> {item?.quantity} </span>
                                            <button
                                                className="text-black cursor-pointer text-xl"
                                                onClick={() => increaseQuantity(item.id)}
                                            >
                                                +
                                            </button>
                                        </div> 
                                    </td>

                                    <td>
                                        <button
                                            className="bg-[#2295FF] cursor-pointer text-white px-3 py-1 rounded-md hover:bg-[#007bff] transition-all"
                                            onClick={() => addToCart(item, user, location, deviceInfo)}
                                        >
                                            Add To Cart
                                        </button>
                                    </td>

                                    <td>
                                        <button
                                            className="flex md:flex-row-reverse flex-col items-center justify-center font-medium text-orange-400 cursor-pointer hover:text-[#ff1826] transition duration-200"
                                            onClick={() => removeItem(item.id)}
                                        >
                                            <X size={20}/>Remove
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

        </div>
    </div>
  )
}

export default Wishlist