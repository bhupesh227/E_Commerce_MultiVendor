'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Heart, MapPin, MessageCircle, ShoppingBasket, X } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Ratings from './Ratings';
import useUser from '../../hooks/useUser';
import useLocationTracking from '../../hooks/useLocation';
import useDeviceTracking from '../../hooks/useDevice';
import { useStore } from '../../store';
import axiosInstance from '../../utils/axiosInstance';
import { isProtected } from '../../utils/isProtected';


interface Props {
  data: any;
  setOpen: (open: boolean) => void;
}

const ProductDetailsCard = ({  setOpen, data }: Props) => {
    const [activeImage, setActiveImage] = useState<number>(0);
    const [isSelectedColor, setIsSelectedColor] = useState<string>('');
    const [selectedSize, setSelectedSize] = useState<string>('');
    const [quantity, setQuantity] = useState<number>(1);
    const [isLoading, setIsLoading] = useState(false);


    const router = useRouter();
    const {user} = useUser();
    const location = useLocationTracking();
    const deviceInfo = useDeviceTracking();

    const cart = useStore((state) => state.cart);
    const wishlist = useStore((state : any) => state.wishlist);
    const addToCart = useStore((state : any) => state.addToCart);
    const addToWishlist = useStore((state : any) => state.addToWishlist);
    const removeFromWishlist = useStore((state : any) => state.removeFromWishlist);
    const isWishlisted = wishlist.some((item :any) => item.id === data?.id);
    const isInCart = cart.some((item) => item.id === data?.id);
    

    const estimatedDelivery = new Date();
    estimatedDelivery.setDate(estimatedDelivery.getDate() + 5);

    const handleChat = async() => {
        if(isLoading) return;

        setIsLoading(true);
        try {
            const response = await axiosInstance.post('/chatting/api/create-user-conversationGroup', 
                {sellerId: data?.shop?.sellerId},
                isProtected
            );
            router.push(`/inbox?conversationId=${response.data.conversation.id}`);
        } catch (error) {
            console.error('Error creating conversation:', error);
        } finally{
            setIsLoading(false);
        }
    }

  return (
    <div
      className="fixed flex items-center justify-center top-0 left-0 h-screen w-full bg-[#0000001d] z-50"
      onClick={() => setOpen(false)}
    >
        <div
            className="relative w-[90%] md:w-[70%] md:mt-4 2xl:mt-0 h-max overflow-scroll scrollbar-hide max-h-[70vh] p-2 md:p-4 bg-white shadow-md rounded-lg"
            onClick={(e) => e.stopPropagation()}
        >
            <div className="w-full flex flex-col md:flex-row">
                <div className="w-full h-full md:w-1/2">
                    <button
                            className="absolute top-2 right-2 z-10 bg-white hover:bg-gray-200 transition rounded-full p-1 shadow-md "
                            onClick={() => setOpen(false)}
                        >
                            <X size={25} />
                    </button>
                    <Image
                        src={data?.images?.[activeImage].url}
                        alt={data.title}
                        width={300}
                        height={300}
                        className="w-full rounded-lg object-contain max-h-[500px]"
                    />
                    <div className="flex gap-2 mt-4">
                        {data?.images.map((image: any, index: number) => (
                            <div
                                key={index}
                                className={`cursor-pointer border rounded-md ${
                                    activeImage === index
                                    ? 'border-gray-500 pt-1'
                                    : 'border-transparent'
                                }`}
                                onClick={() => setActiveImage(index)}
                            >
                                <Image
                                    src={image.url}
                                    alt={`Thumbnail ${index + 1}`}
                                    width={80}
                                    height={80}
                                    className="rounded-md"
                                />
                            </div>
                        ))}
                    </div>
                </div>
                <div className="w-full md:w-1/2 md:pl-8 mt-6 md:mt-0">
                    <div className="border-b relative pb-3 border-gray-200 flex items-center justify-between">
                        <div className="flex items-start gap-3">
                            <Image
                                src={data?.shop?.avatar?.url || '/images/shop-logo.png'}
                                alt="Shop Logo"
                                width={60}
                                height={60}
                                className="rounded-full w-[60px] h-[60px] object-cover"
                            />
                            <div>
                                <Link
                                    href={`/shop/${data?.shop?.id}`}
                                    className="text-lg font-medium"
                                >
                                    {data?.shop?.name}
                                </Link>
                                <span className="block mt-1">
                                    <Ratings rating={data?.shop?.rating || 0} />
                                </span>
                                <p className="text-gray-600 mt-1 flex items-center line-clamp-1">
                                    <MapPin size={20} />{' '}
                                    {data?.shop?.address || 'Location not available'}
                                </p>
                            </div>
                        </div>
                        <button
                            className="flex cursor-pointer items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 font-medium transition text-white mt-2"
                            onClick={() => handleChat()}
                        >
                            Seller<MessageCircle size={20} />
                        </button>
                        
                    </div>
                    <h3 className="text-xl font-semibold mt-3 capitalize">{data?.title}</h3>
                    <p className="mt-2 text-gray-700 whitespace-pre-wrap w-full">
                        {data?.shortDescription}
                    </p>
                    {data?.brand && (
                        <p className="mt-2">
                            <strong>Brand:</strong> {data.brand}
                        </p>
                    )}
                    <div className="flex flex-col items-start gap-5 mt-4">
                        {data?.colors?.length > 0 && (
                            <div>
                                <strong>Colors:</strong>
                                <div className="flex gap-2 mt-1">
                                    {data?.colors?.map((color: string, index: number) => (
                                        <button
                                            key={index}
                                            className={`w-8 h-8 cursor-pointer rounded-full border-2 ${
                                            isSelectedColor === color
                                                ? 'border-gray-400 scale-110 shadow-md'
                                                : 'border-transparent'
                                            }`}
                                            onClick={() => setIsSelectedColor(color)}
                                            style={{ backgroundColor: color }}
                                        />
                                    ))}
                                </div>
                            </div>
                        )}
                        {data?.sizes?.length > 0 && (
                            <div>
                                <strong>Sizes:</strong>
                                <div className="flex gap-2 mt-1">
                                    {data?.sizes?.map((size: string, index: number) => (
                                        <button
                                            key={index}
                                            className={`px-4 py-1 cursor-pointer rounded-md transition ${
                                            selectedSize === size
                                                ? 'bg-gray-800 text-white'
                                                : 'bg-gray-300 text-gray-900'
                                            }`}
                                            onClick={() => setSelectedSize(size)}
                                            onDoubleClick={() => setSelectedSize('')}
                                        >
                                            {size}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                    <div className="mt-5 flex items-center gap-4">
                        <h2 className="text-2xl font-semibold text-gray-900">
                            ₹{data?.salePrice}
                        </h2>
                        {data?.regularPrice && (
                            <h3 className="text-lg text-red-600 line-through">
                                ₹{data?.regularPrice}
                            </h3>
                        )}
                    </div>
                    <div className="mt-5 flex items-center gap-5">
                        <div className="flex items-center rounded-md">
                            <button
                                className="px-3 cursor-pointer py-1 bg-gray-300 hover:bg-gray-400 text-black font-semibold rounded-l-md"
                                onClick={() => setQuantity((prev) => Math.max(1, prev - 1))}
                            >
                                -
                            </button>
                            <span className="px-4 py-1 bg-gray-300">{quantity}</span>
                            <button
                                className="px-3 cursor-pointer py-1 bg-gray-300 hover:bg-gray-400 text-black font-semibold rounded-r-md"
                                onClick={() => setQuantity((prev) => prev + 1)}
                            >
                                +
                            </button>
                        </div>
                        <button
                            className={`flex items-center gap-2 px-4 py-2 bg-[#ff5722] text-white font-medium rounded-lg transition ${
                                isInCart ? 'opacity-70 cursor-not-allowed' : 'opacity-100'
                                }`}
                            onClick={() => {
                                !isInCart &&
                                    addToCart(
                                        { ...data, quantity: 1 },
                                        user,
                                        location,
                                        deviceInfo
                                    );
                                }
                            }
                            disabled={isInCart}
                            
                        >
                            <ShoppingBasket size={18} />{isInCart ?('Already added'):('Add to cart')}
                        </button>
                        <button
                            className={`cursor-pointer`}
                            onClick={() => {
                                isWishlisted
                                    ? removeFromWishlist(data?.id, user, location, deviceInfo)
                                    : addToWishlist(
                                        { ...data, quantity: 1 },
                                        user,
                                        location,
                                        deviceInfo
                                    );
                                }
                            }
                        >
                            <Heart
                                size={30}
                                fill={isWishlisted ? 'red' : 'transparent'}
                                stroke={isWishlisted ? 'red' : 'gray'}
                            />
                        </button>
                    </div>
                    <div className="mt-3 font-semibold">
                        {data?.stock > 0 ? (
                            <p className="text-green-600">In Stock</p>
                        ) : (
                            <p className="text-red-600">Out of Stock</p>
                        )}
                    </div>
                    <div className="mt-3 text-sm text-gray-600">
                        Estimated Delivery:{' '}
                        <strong>{estimatedDelivery.toDateString()}</strong>
                    </div>
                </div>
            </div>
        </div>
    </div>
  );
};

export default ProductDetailsCard;