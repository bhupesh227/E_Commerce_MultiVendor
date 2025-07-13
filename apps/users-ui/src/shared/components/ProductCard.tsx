import Link from 'next/link';
import React, { useEffect, useState } from 'react'
import Ratings from './Ratings';
import { Eye, Heart, ShoppingBag } from 'lucide-react';
import ProductDetailsCard from './ProductDetailsCard';


interface Props {
  product: any;
  isEvent?: boolean;
}

const ProductCard = ({ product, isEvent = false }: Props) => {
  const [timeLeft, setTimeLeft] = useState('');
  const [open, setOpen] = useState(false);

   useEffect(() => {
    if (isEvent && product?.endingDate) {
      const interval = setInterval(() => {
        const now = Date.now();
        const eventDate = new Date(product.endingDate).getTime();
        const difference = eventDate - now;

        if (difference <= 0) {
          setTimeLeft('Expired');
          clearInterval(interval);
          return;
        }

        const days = Math.floor(difference / (1000 * 60 * 60 * 24));
        const hours = Math.floor(
          (difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
        );
        const minutes = Math.floor(
          (difference % (1000 * 60 * 60)) / (1000 * 60)
        );

        setTimeLeft(`${days}d ${hours}h ${minutes}m left with this price`);
      }, 60000);
      return () => clearInterval(interval);
    }
    return;
  }, [isEvent, product?.endingDate]);


  return (
    <div className="w-full h-max min-h-[350px] bg-white relative rounded-lg">
        {isEvent && (
          <div className="absolute top-2 left-2 bg-red-600 text-white text-[10px] font-semibold px-2 py-1 rounded-sm shadow-md">
              OFFER
          </div>
        )}

        {product?.stock <= 5 && (
          <div className="absolute top-2 left-2 bg-yellow-400 text-slate-700 text-[10px] font-semibold px-2 py-1 rounded-sm shadow-md">
            Limited Stock
          </div>
        )}

        <div className='relative pr-10'>
          <Link href={`/product/${product?.slug}`}>
            <img 
              src={product?.images[0]?.url || "https://images.unsplash.com/photo-1635405074683-96d6921a2a"} 
              alt={product.title} 
              width={300}
              height={300}
              className="w-full h-[200px] object-cover mx-auto rounded-t-lg rounded-br-md cursor-pointer"
            />
          </Link>

      
          <div className="absolute flex flex-col gap-2 right-1 top-2 z-10 opacity-50 hover:opacity-100 transition-opacity duration-300">
            <div className="bg-white rounded-full p-[6px] shadow-md">
              <Heart  
                className="cursor-pointer hover:scale-110 transition"
                size={20}
                fill={`red`}
                stroke={`red`}
              />
            </div>
            <div className="bg-white rounded-full p-[6px] shadow-md">
              <Eye
                className="cursor-pointer hover:scale-110 transition text-[#4b5563]"
                size={20}
                onClick={()=> setOpen(true)}
              />
            </div>
            <div className="bg-white rounded-full p-[6px] shadow-md">
              <ShoppingBag  
                className="cursor-pointer text-[#4b5563] hover:scale-110 transition"
                size={20}
              />
            </div>
          </div>
        </div>

        <Link 
            href={`/shop/${product?.shop?.id}`}
            className="block text-blue-500 text-sm font-medium my-2 px-2"
        >
            {product?.shop?.name}
        </Link>

        <Link 
            href={`/product/${product?.slug}`}
        >
            <h3 className="text-base font-semibold px-2 text-gray-800 line-clamp-1">
                {product?.title}
            </h3>
        </Link>

        <div className="mt-2 px-2">
            <Ratings rating={product?.ratings} />
        </div>

        <div className="mt-3 flex justify-between items-center px-2">
          <div className="flex items-center gap-2">
            <span className="text-lg font-bold text-gray-900">
              Rs.{product.salePrice}
            </span>
            <span className="text-sm line-through text-red-500">
              ₹{product.regularPrice}
            </span>
          </div>
          <span className="text-green-500 text-sm font-medium">
            {product.totalSales} sold
          </span>
        </div>
        {isEvent && timeLeft && (
          <div className="mt-2">
            <span className="inline-block text-xs bg-orange-100 text-orange-600 px-2 py-1 rounded-md">
              {timeLeft}
            </span>
          </div>
        )}
        
        {open && (
          <ProductDetailsCard data={product} setOpen={setOpen} />
        )}
        
    </div>
  )
}

export default ProductCard