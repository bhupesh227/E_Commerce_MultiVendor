"use client";

import React from 'react'
import Hero from '../shared/components/Hero'
import SectionTitle from '../shared/widgets/section/SectionTitle'
import axiosInstance from '../utils/axiosInstance';
import { useQuery } from '@tanstack/react-query';
import ProductCard from '../shared/components/ProductCard';
import ShopCard from '../shared/components/ShopCard';

const page = () => {

  const { data: products , isLoading, isError  } = useQuery({
    queryKey: ['products'],
    queryFn: async () => {
      const response = await axiosInstance.get(
        '/product/api/get-all-products?page=1&limit=10'
      );
      return response.data.products;
    },
    
  });

  const { data: latestProducts ,isLoading : LatestProductsLoading } = useQuery({
    queryKey: ['latest-products'],
    queryFn: async () => {
      const response = await axiosInstance.get(
        '/product/api/get-all-products?page=1&limit=10&type=latest'
      );
      return response.data.products;
    },
    staleTime: 1000 * 60 * 2,
  });

  const { data: offers, isLoading: offersLoading } = useQuery({
    queryKey: ['offers'],
    queryFn: async () => {
      const res = await axiosInstance.get("/product/api/get-all-events?page=1&limit=10");
      return res.data.events || [];
    },
    staleTime: 1000 * 60 * 2,
  });

  const { data: topShops, isLoading: topShopsLoading } = useQuery({
    queryKey: ['top-shops'],
    queryFn: async () => {
      const res = await axiosInstance.get("/product/api/top-shops");
      return res.data.shops || [];
    },
    staleTime: 1000 * 60 * 2,
  });

  return (
    <div className='bg-[#f5f5f5]'>
      <Hero />
      <div className="md:w-[80%] w-[90%] m-auto my-10">
        <div className="mb-8">
          <SectionTitle title="Suggested Products" />
        </div>
        {isLoading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 2xl:grid-cols-4 gap-5">
            {Array.from({ length: 10 }).map((_, index) => (
              <div
                key={index}
                className="h-[250px] bg-gray-400 animate-pulse rounded-xl"
              />
            ))}
          </div>
        )}
        {!isLoading && !isError && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 2xl:grid-cols-4 gap-5 pb-2">
            {products?.map((product: any) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
        {products?.length === 0 && (
          <p className='text-center'>
            No Products Available yet!
          </p>
        )}

        {isLoading && (
          <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-5'>
            {Array.from({ length: 10 }).map((_, index) => (
              <div
                key={index}
                className='h-[250px] bg-gray-300 animate-pulse rounded-xl'
              >

              </div>
            ))}
          </div>
        )}


        <div className='my-8 block'>
          <SectionTitle title='Latest Products' />
        </div>
        {!LatestProductsLoading && (
            <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-5 pb-2'>
              {latestProducts?.map((product: any) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
          {!LatestProductsLoading && latestProducts?.length === 0 && (
            <p className='text-center'>
              No Product Available yet
            </p>
          )}

          <div className='my-8 block'>
            <SectionTitle title='Top Offers' />
          </div> 
          {!offersLoading && (
            <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4'>
              {offers?.map((product: any) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
          {!offersLoading && offers?.length === 0 && (
            <p className='text-center'>
              No Offers Available yet
            </p>
          )}

           <div className='my-8 block'>
            <SectionTitle
              title='Top Shops'
            />
          </div>
          {!topShopsLoading && (
            <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4'>
              {topShops?.map((shop: any) => (
                <ShopCard key={shop.id} shop={shop} />
              ))}
            </div>
          )}
          {!topShopsLoading && topShops?.length === 0 && (
            <p className='text-center'>
              No Shops Available yet
            </p>
          )}
      </div>
    </div>
  )
}

export default page