"use client";
import React, { useEffect, useState } from 'react'
import useUser from '../../hooks/useUser';
import useLocationTracking from '../../hooks/useLocation';
import useDeviceTracking from '../../hooks/useDevice';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import axiosInstance from '../../utils/axiosInstance';
import { sendKafkaEvent } from '../../actions/trackUser';
import Image from 'next/image';
import { Calendar, Clock, Globe, Heart, MapPin, Star, Users } from 'lucide-react';
import Link from 'next/link';
import { FaTwitter, FaYoutube } from 'react-icons/fa';
import ProductCard from '../components/ProductCard';

const TABS = ['Products', 'Offers', 'Reviews'];

const SellerProfile = ({ shop, followerCount }:{ shop: any, followerCount: number }) => {
  const [activeTab, setActiveTab] = useState('Products');
  const [isFollowing, setIsFollowing] = useState(false);
  const [followers , setFollowers] = useState(followerCount);

  const {user} = useUser();
  const location = useLocationTracking();
  const deviceInfo = useDeviceTracking();
  const queryClient = useQueryClient();
  const {data:products , isLoading} = useQuery({
    queryKey: ['seller-products'],
    queryFn: async ()=>{
      const res = await axiosInstance.get(`/seller/api/get-seller-products/${shop?.id}?page=1&limit=10`);
      return res.data.products;
    },
    staleTime: 1000 * 60 * 5, 
  });
  
  useEffect(() => {
    const fetchFollowStatus = async () => {
      if (!shop?.id) return;
      try {
        const res = await axiosInstance.get(`/seller/api/is-following/${shop.id}`);
        setIsFollowing(res.data.isFollowing !== null);
      } catch (error) {
        console.error('Error fetching follow status:', error);
      }
    }
    fetchFollowStatus();
  },[shop?.id]);

  const {data:events, isLoading: isEventsLoading} = useQuery({
    queryKey: ['seller-events'],
    queryFn: async ()=>{
      const res = await axiosInstance.get(`/seller/api/get-seller-events/${shop?.id}?page=1&limit=10`);
      return res.data.products;
    },
    staleTime: 1000 * 60 * 5,
  });

  const toggleFollowMutation = useMutation({
    mutationFn: async () => {
      if(isFollowing) {
        await axiosInstance.post("/seller/api/unfollow-shop",{shopId : shop?.id});
      }else {
        await axiosInstance.post("/seller/api/follow-shop",{shopId : shop?.id});
      }
    },
    onSuccess: () => {
      if (isFollowing) {
        setFollowers(followers- 1);
      } else {
        setFollowers(followers + 1);
      }
      setIsFollowing((prev) => !prev);
      queryClient.invalidateQueries({
        queryKey: ['is-following', shop?.id]
      });
    },
    onError: (error) => {
      console.error('Error toggling follow status:', error);
    }
  });

  useEffect(() => {
    if (!isLoading){
      if(!location || !deviceInfo || !user?.id) return;
      sendKafkaEvent({
        userId : user?.id,
        shopId : shop?.id,
        action: "shop_visit",
        country: location?.country || "Unknown",
        city: location?.city || "Unknown",
        device: deviceInfo || "Unknown device",
      });
    }
  },[isLoading, location, deviceInfo]);

  return (
    <div>
      <div className='relative w-full flex justify-center'>
        <Image
          src={shop?.coverBanner || "/default-banner.jpg"}
          alt="Shop Banner"
          width={1200}
          height={400}
          className='w-full h-[400px] object-cover'
        />
      </div>
      <div className='w-[85%] lg:w-[70%] mx-auto mt-[-50px] relative z-20 flex flex-col lg:flex-row gap-4'>
        <div className='bg-gray-200 p-6 rounded-lg shadow-lg flex-1'>
          <div className='flex flex-col md:flex-row items-center md:items-start gap-4'>
            <div className='relative w-[100px] h-[100px] rounded-full border-4 border-slate-300 overflow-hidden'>
              <Image
                src={shop?.avatar[0] || "/default-profile.jpg"}
                alt="Seller Avatar"
                layout='fill'
                objectFit='cover'
              />
            </div>
            <div className='flex-1 w-full'>
              <h1 className='text-2xl font-semibold text-gray-800'>{shop?.name}</h1>
              <p className='text-gray-600 text-sm mt-1'>{shop?.bio || "No bio available"}</p>
              <div className='flex items-center gap-2 mt-2'>
                <div className='flex items-center gap-1 text-blue-600'>
                  <Star size={16} fill='#60a5fa'/>{" "}
                  <span>{shop?.rating || "N/A"}</span>
                </div>
                <div className='flex items-center gap-1 text-gray-600 cursor-pointer'>
                  <Users size={16} className='text-gray-600'/>{" "}
                  <span>{followers} Followers</span>
                </div>
              </div>
              <div className='flex items-center gap-4 mt-4 text-slate-700'>
                <Clock size={16} />{" "}
                <span >{shop?.opening_hours || "Unknown"}</span>
              </div>
              <div className='flex items-center gap-4 mt-2 text-slate-700'>
                <MapPin size={16} />{" "}
                <span>{shop?.address || "Unknown"}</span>
              </div>
            </div>
            <button
              onClick={() => toggleFollowMutation.mutate()}
              disabled={toggleFollowMutation.isPending}
              className={`mt-4 px-4 py-2 h-[40px] font-semibold flex items-center justify-center rounded-lg ${isFollowing ? 'bg-red-500 hover:bg-red-600' : 'bg-blue-500 hover:bg-blue-600'} text-white transition-colors duration-200`}
            >
              <Heart size={16} />
              {isFollowing ? 'Unfollow' : 'Follow'}
            </button>
          </div>
        </div>
        <div className='bg-gray-200 p-6 rounded-lg shadow-lg w-full lg:w-[30%]'>
          <h2 className='text-lg font-semibold text-slate-900'>Shop Details</h2>
          <div className='mt-4 flex items-center gap-4 text-slate-700'>
            <Calendar size={16} />
            <span>
              Joined At : {new Date(shop?.createdAt).toLocaleDateString()}
            </span>
          </div>
          {shop?.website && (
            <div className='mt-4 flex items-center gap-4 text-slate-700'>
              <Globe size={16} className='mt-4' />
              <Link
                href={shop?.website}
                className='text-blue-600 hover:underline'
              >
                {shop?.website}
              </Link>
            </div>
          )}
          { shop?.socialLinks && shop?.socialLinks.length > 0 && (
            <div className='mt-4'>
              <h3 className='text-slate-700 text-lg font-medium'>Follow Us:</h3>
              <div className='flex gap-4 mt-2'>
                {shop?.socialLinks.map((link:any, index:number) => (
                  <Link
                    key={index}
                    href={link.url}
                    className='text-blue-600 hover:underline'
                  >
                    {link.type === "youtube" && <FaYoutube size={24} />}
                    {link.type === "x" && <FaTwitter size={24} />}
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
      <div className='w-[85%] lg:w-[70%] mx-auto mt-6'>
        <div className='flex border-b border-gray-300 pb-2 mb-4'>
          {TABS.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 text-sm font-medium ${activeTab === tab ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-600 hover:text-blue-600'} transition`}
            >
              {tab}
            </button>
          ))}
        </div>
        <div className='bg-gray-200 rounded-lg my-4 text-slate-700'>
          {activeTab === 'Products' && (
            <div className='m-auto grid grid-cols-1 p-4 sm:grid-cols-3 md:grid-cols-4'>
              {isLoading && (
                <>
                  {Array.from({ length: 10 }).map((_, index) => (
                    <div key={index} className='bg-gray-300 animate-pulse h-[200px] rounded-lg m-2'></div>
                  ))}
                </>
              )}
              {products?.map((product:any) => (
                <ProductCard key={product.id} product={product} />
              ))}
              { products.length === 0 && (
                <p className='py-2'>No products found Yet.</p>
              )}
            </div>
          )}
          {activeTab === 'Offers' && (
            <div className='m-auto grid grid-cols-1 p-4 sm:grid-cols-3 md:grid-cols-4'>
              {isEventsLoading && (
                <>
                  {Array.from({ length: 10 }).map((_, index) => (
                    <div key={index} className='bg-gray-300 animate-pulse h-[200px] rounded-lg m-2'></div>
                  ))}
                </>
              )}
              {events?.map((product:any)=> (
                <ProductCard key={product.id} product={product} isEvent={true} />
              ))}
              { events.length === 0 && (
                <p className='py-2'>No offers found Yet.</p>
              )}
            </div>
          )}
          {activeTab === 'Reviews' && (
            <div>
              <p className='py-2 text-center'> No reviews found Yet.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default SellerProfile