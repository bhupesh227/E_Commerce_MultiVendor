"use client";

import { useQuery } from '@tanstack/react-query';
import useDeviceTracking from 'apps/users-ui/src/hooks/useDevice';
import useLocationTracking from 'apps/users-ui/src/hooks/useLocation';
import useUser from 'apps/users-ui/src/hooks/useUser';
import { useStore } from 'apps/users-ui/src/store';
import axiosInstance from 'apps/users-ui/src/utils/axiosInstance';
import { ChevronRight, Loader2, X } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import React, { useEffect, useState } from 'react'

const Cart = () => {
  const [discountedProductId, ] = useState("");
  const [discountAmount, ] = useState<number>(0);
  const [discountPercent, ] = useState<number>(0);
  const [couponCode, setCouponCode] = useState("");
  const [selectedAddressId, setSelectedAddressId] = useState("");
  const [loading, ] = useState(false);

  const {user} = useUser();
  const location = useLocationTracking();
  const deviceInfo = useDeviceTracking();


  const removeFromCart = useStore((state : any) => state.removeFromCart);
  const cart = useStore((state : any) => state.cart);

  const decreaseQuantity = (id : string) => {
    useStore.setState((state : any) => ({
        cart: state.cart.map((item:any) => 
            item.id === id && item.quantity > 1 
                ? {...item, quantity : item.quantity - 1} 
                : item
        )
    }));
  }

  const increaseQuantity = (id : string) => {
    useStore.setState((state : any) => ({
        cart: state.cart.map((item:any) => 
            item.id === id && item.quantity < item.stock 
                ? {...item, quantity : (item.quantity ?? 1) + 1} 
                : item
        )
    }));
  }

  const removeItem = (id : string) => {
    removeFromCart(id, user, location, deviceInfo);
  }

  const subtotal = cart.reduce(
    (total: number, item: any) => total + item.quantity * item.salePrice,
    0
  );

  const { data: addresses = [] } = useQuery<any[], Error>({
    queryKey: ['shipping-addresses'],
    queryFn: async () => {
        const res = await axiosInstance.get('/api/shipping-addresses');
        return res.data.addresses;
    }
  });

  useEffect(() => {
    if (addresses.length > 0 && !selectedAddressId) {
        const defaultAddr = addresses.find((addr) => addr.isDefault);
        if (defaultAddr) {
            setSelectedAddressId(defaultAddr.id);
        }
    }
  }, [addresses, selectedAddressId]);

  return (
    <div className="w-full bg-white mt-4">
      <div className="md:w-[80%] w-[95%] mx-auto min-h-screen">
        <div className="pb-[50px]">
          <h1 className="md:pt-p[50px] font-medium text-[44px] leading-[1] mb-[16px] font-Jost">
              Shopping Cart
          </h1>
          <div className="flex items-center text-lg py-4">
            <Link href="/" className="text-[#80deea] cursor-pointer font-medium">
              Home
            </Link>
            <ChevronRight size={20} className="opacity-[0.98]" />
            <span className='underline text-[#55585b]'>Cart</span>
          </div>
        </div>

        {cart.length === 0 ? (

          <div className="text-center text-lg text-gray-600">
              Your cart is empty! Start adding products.
          </div>
        ):(
          <div className="lg:flex items-start gap-10">
            <table className="w-full lg:w-[70%] border-separate">
              <thead className="bg-[#f1f3f4] rounded">
                <tr>
                  <td className="py-3 text-left pl-6 align-middle">Product</td>
                  <td className="py-3 text-center align-middle">Price</td>
                  <td className="py-3 text-center align-middle">Quantity</td>
                  <td className="py-3 text-center align-middle"></td>
                </tr>
              </thead>

              <tbody>
                {cart.map((item:any) => (
                  <tr key={item.id} className="border-b-[#0000000e]">
                    <td className="flex items-center gap-4 p-4">
                      <Image 
                        src={item?.images[0]?.url}
                        alt={item.title}
                        width={80}
                        height={80}
                        className="rounded w-20 h-20" 
                      />
                      <div className="flex flex-col">
                        <span className="font-medium capitalize">{item.title}</span>
                        {item?.selectedOptions && (
                          <div className="text-sm text-gray-500">
                            {item.selectedOptions?.color && (
                              <span>Color: 
                                <span 
                                  style={{
                                    backgroundColor: item?.selectedOptions?.color, 
                                    width: "12px", 
                                    height: "12px",
                                    borderRadius: "100%",
                                    display: "inline-block"
                                  }}
                                  className="ml-2"
                                />
                              </span>
                            )}

                            {item.selectedOptions?.size && (
                              <span className="ml-2">
                                Color: {item?.selectedOptions?.size}
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    </td>

                    <td className="px-6 text-lg text-center">
                      
                        {item?.id === discountedProductId
                          ? (
                            <div className="flex flex-col items-center">
                              <span className="line-through text-gray-500 text-sm">
                                ₹{item.salePrice.toFixed(2)}
                              </span>{" "}
                              <span className="text-green-600 font-semibold">
                                ₹{( (item.salePrice * (100 - discountPercent)) / 100 ).toFixed(2)}
                              </span>
                              <span className="text-xs text-green-700 bg-white">
                                Discount Applied
                              </span>
                            </div>
                          ): (
                            <span >
                              ₹{item.salePrice.toFixed(2)}
                            </span>
                          )
                        }
                    </td>

                    <td className="text-center">
                      <div className="flex items-center justify-center border border-gray-200 rounded-[20px] w-[90px] p-[2px]">
                        <button
                            className="text-black cursor-pointer text-xl"
                            onClick={() => decreaseQuantity(item.id)}
                        >
                            -
                        </button>
                        <span className="px-4">
                            {item?.quantity}
                        </span>
                        <button
                            className="text-black cursor-pointer text-xl"
                            onClick={() => increaseQuantity(item.id)}
                        >
                            +
                        </button>
                      </div> 
                    </td>

                    <td className="text-center">
                      <button
                        className="text-[#818487] cursor-pointer hover:text-[#ff1826] transition duration-200"
                        onClick={() => removeItem(item.id)}
                      >
                        <X size={20}/>Remove
                      </button>
                    </td>

                  </tr>
                ))}
              </tbody>
            </table>

            <div className="p-6 shadow-md w-full lg:w-[30%] bg-[#f9f9f9] rounded-lg">
                {discountAmount > 0 && (
                  <div className="flex justify-between items-center text-[#010f1c] text-base font-medium pb-1">
                    <span className="font-Jost">
                      Discount ({discountPercent}%)
                    </span>
                    <span className="text-green-600">
                      - ₹{discountAmount.toFixed(2)}
                    </span>
                  </div>
                )}

                <div className="flex justify-between items-center text-[#010f1c] pb-3 font-[550] text-[20px]">
                  <span className="font-Jost">Subtotal</span>
                  <span>₹{(subtotal - discountAmount).toFixed(2)}</span>
                </div>

                <hr className="my-4 text-slate-200"/>

                <div className="mb-4">
                  <h4 className="mb-[7px] font-[500] text-[15px]">
                    Have a Coupon Code?
                  </h4>

                  <div className="flex">
                    <input 
                      type="text" 
                      value={couponCode} 
                      onChange={(e) => setCouponCode(e.target.value)} 
                      placeholder="Enter coupon code"
                      className="w-full p-2 border border-gray-200 rounded-l-md focus:outline-none focus:border-blue-500"  
                    />

                    <button
                      className="bg-blue-500 cursor-pointer px-4 text-white rounded-r-md hover:bg-blue-600 transition-all"
                    >
                      Apply
                    </button>

                  </div>
                  
                  <hr className="my-4 text-slate-200"/>

                  <div className="mb-4">
                    <h4 className="mb-[7px] font-medium text-[15px]">
                      Select Shipping Address
                    </h4>

                    {addresses?.length !== 0 && (
                      <select
                          className='w-full p-2 border border-gray-200 rounded-l-md focus:outline-none focus:border-blue-500'
                          value={selectedAddressId}
                          onChange={(e) => setSelectedAddressId(e.target.value)}
                      >
                          {addresses?.map((address: any) => (
                              <option value={address.id} key={address.id}>
                                  {address.label} - {address.city},{address.country}
                              </option>
                          ))}
                      </select>
                    )}
                    
                    {addresses?.length === 0 && (
                          <p className='text-sm text-slate-800'>
                              Please add an address from profile to create an order!
                          </p>
                      )
                    }
                  </div>

                  <hr className="my-4 text-slate-200"/>

                  <div className="mb-4">
                    <h4 className="mb-[7px] font-medium text-[15px]">
                      Select Payment Method
                    </h4>

                    <select 
                      value={selectedAddressId}
                      onChange={(e) => setSelectedAddressId(e.target.value)}
                      className="w-full p-2 border border-gray-200 rounded-md focus:outline-none focus:border-blue-600"
                    >
                      <option value="credit_card">
                        Online Payment
                      </option>
                      <option value="cashOnDelivery">
                        Cash on Delivery
                      </option>
                    </select>
                  </div>

                  <hr className="my-4 text-slate-200"/>

                  <div className="flex justify-between items-center text-[#010f1c] pb-3 font-[550] text-[20px]">
                    <span className="font-Jost">Total</span>
                    <span>₹{(subtotal - discountAmount).toFixed(2)}</span>
                  </div>

                  <button
                    disabled={loading}
                    className="w-full flex items-center justify-center gap-2 cursor-pointer mt-4 py-3 bg-[#010f1c] text-white hover:bg-[#0989FF] transition-all rounded-lg"
                  >
                    {loading && <Loader2 className="animate-spin w-5 h-5" />}
                    {loading ? "Redirecting ... " : "Proceed to Payment"}
                  </button>
                </div>
            </div>
          </div>
        )}
        
      </div>
    </div>
  )
}

export default Cart