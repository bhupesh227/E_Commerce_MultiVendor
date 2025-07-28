"use client";
import React, {useEffect,useState} from 'react'
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import axiosInstance from '../utils/axiosInstance';
import useSeller from '../hooks/useSeller';
import { ArrowLeft, Clock, MapPin, Pencil, Star, User ,Calendar,Globe} from 'lucide-react';
import ProductCard from '../shared/components/ProductCard';
import ImageEditModal from '../shared/components/ImageEditModal';
import { FaTwitter, FaYoutube } from 'react-icons/fa';

const TABS = ['Products',"Offers" ,'Reviews'];

const fetchProducts = async()=>{
  const res = await axiosInstance.get('/product/api/get-shop-products');
  const products = res.data.products?.filter((i:any) => !i.startingDate);
  return products;
};

const fetchEvents = async()=>{
  const res = await axiosInstance.get('/product/api/get-shop-products');
  const products = res.data.products?.filter((i:any) => i.startingDate);
  return products;
};
 
const page = () => {
  const {seller ,isLoading} = useSeller();

  const [activeTab, setActiveTab] = useState('Products');
  const [editType , setEditType] = useState<'cover' | 'avatar' | null>(null);
  const router = useRouter();
  const {data:products= []} = useQuery({
    queryKey: ['shop-products'],
    queryFn: fetchProducts,
    staleTime: 1000 * 60 * 5, 
  });
  
  const {data:events = []} = useQuery({
    queryKey: ['shop-events'],
    queryFn: fetchEvents,
    staleTime: 1000 * 60 * 5, 
  });

  useEffect(() => {
    if (!seller && !isLoading) {
      router.push('/login');
    }
  }, [seller, isLoading]);
  

  return (
    <>
      {isLoading ? (
        <div>Loading...</div>
      ) : (
        <div className='w-full bg-gray-900 min-h-screen text-white pb-10'>
          <div className='w-full px-3 pt-2'>
            <button
              onClick={() => router.push('/dashboard')}
              className='flex items-center gap-2 text-gray-300 hover:text-white transition-colors duration-200'
            >
              <ArrowLeft size={16} />
              <span className='font-semibold'>Back to Dashboard</span>
            </button>
          </div>
          <div className='relative w-full flex justify-center bg-gray-800 mt-2'>
            <Image
              src={(seller?.shop?.coverBanner as any)?.url || '/default-cover.jpg'}
              alt='Seller Cover'
              width={1200}
              height={400}
              className='w-full h-[400px] object-cover'
              priority
            />
            {seller?.id && (
              <button
                onClick={() => setEditType('cover')}
                className='absolute top-3 right-3 bg-black bg-opacity-50 text-white px-3 py-1 rounded-md hover:bg-opacity-70 transition-all duration-200 flex items-center gap-2 text-sm'
              >
                <Pencil size={14} />
                Edit Cover
              </button>
            )}
          </div>
          <div className='w-[85%] lg:w-[70%] mx-auto mt-[-50px] relative z-10 flex flex-col lg:flex-row gap-6'>

            <div className='bg-gray-800 p-4 rounded-md shadow-lg flex-1'>
              <div className='flex flex-col md:flex-row items-center md:items-start gap-4'>
                <div className='relative w-[100px] h-[100px] rounded-full border-4 border-gray-700 overflow-hidden flex-shrink-0'>
                  <Image
                    src={(seller?.shop?.avatar as any)?.url || '/default-avatar.jpg'}
                    alt='Seller Avatar'
                    layout='fill'
                    objectFit='cover'
                  />
                  {seller?.id && (
                    <button
                      className='absolute bottom-0 right-0 bg-gray-700 p-2 rounded-full cursor-pointer hover:bg-gray-600'
                      onClick={() => setEditType('avatar')}
                    >
                      <Pencil size={16} className='text-white' />
                    </button>
                  )}
                </div>
                <div className='flex-1 w-full text-center md:text-left'>
                  <h1 className='text-2xl font-bold text-white'>
                    {seller?.shop?.name || 'No Shop Name'}
                  </h1>
                  <p className='text-gray-400 text-sm mt-1'>
                    {seller?.shop?.bio || 'No Shop Description'}
                  </p>
                  <div className='flex items-center justify-center md:justify-start gap-4 mt-2'>
                    <div className='flex items-center text-yellow-400 gap-1'>
                      <Star fill='#facc15' size={16} />
                      <span className='font-semibold'>{seller?.shop?.ratings || "N/A"}</span>
                    </div>
                    <div className='flex items-center text-gray-400 gap-1'>
                      <User size={16} />
                      <span className='font-semibold'>{seller?.shop?._count?.followers  || 0} Followers</span>
                    </div>
                  </div>
                  <div className='flex items-center gap-2 mt-4 text-gray-400 justify-center md:justify-start'>
                    <Clock size={16} />
                    <span>{seller?.shop?.opening_hours || "Unknown"}</span>
                  </div>
                  <div className='flex items-center gap-2 mt-2 text-gray-400 justify-center md:justify-start'>
                    <MapPin size={16} />
                    <span>{seller?.shop?.address || "No address provided"}</span>
                  </div>
                </div>
                <button
                  onClick={() => router.push(`/edit-profile`)}
                  className='mt-4 md:mt-0 h-[40px] bg-gray-700 text-white px-4 py-2 rounded-md hover:bg-gray-600 transition-colors duration-200 flex items-center gap-2 flex-shrink-0'
                >
                  <Pencil size={16} />
                  Edit Profile
                </button>
              </div>
            </div>

            <div className='bg-gray-800 p-6 rounded-lg shadow-lg w-full lg:w-[350px] flex-shrink-0'>
                <h2 className='text-lg font-semibold text-white'>Shop Details</h2>
                <div className='mt-4 flex items-center gap-3 text-gray-400'>
                    <Calendar size={18} />
                    <span>Joined: {new Date(seller?.shop?.createdAt).toLocaleDateString()}</span>
                </div>
                {seller?.shop?.website && (
                    <div className='mt-3 flex items-center gap-3 text-gray-400'>
                    <Globe size={18} />
                    <Link href={seller.shop.website as string} target="_blank" rel="noopener noreferrer" className='text-blue-400 hover:underline break-all'>
                        {seller.shop.website}
                    </Link>
                    </div>
                )}
                {seller?.shop?.socialLinks && (seller.shop.socialLinks as any[]).length > 0 && (
                    <div className='mt-4'>
                    <h3 className='text-gray-300 font-medium'>Follow Us:</h3>
                    <div className='flex gap-4 mt-2'>
                        {(seller.shop.socialLinks as any[]).map((link, index) => (
                        <Link key={index} href={link.url} target="_blank" rel="noopener noreferrer" className='text-gray-400 hover:text-white'>
                            {link.type === 'youtube' && <FaYoutube size={24} />}
                            {link.type === 'x' && <FaTwitter size={24} />}
                        </Link>
                        ))}
                    </div>
                    </div>
                )}
            </div>
          </div>


          <div className='w-[85%] lg:w-[70%] mx-auto mt-8'>
            <div className='flex border-b border-gray-700'>
              {TABS.map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-4 py-2 text-sm font-medium transition-colors duration-200 ${
                    activeTab === tab
                      ? 'border-b-2 border-blue-500 text-white'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
            <div className='mt-6 bg-gray-800 p-4 rounded-lg min-h-[200px] flex justify-center items-center'>
              {activeTab === 'Products' && (
                  <div>
                      {products.length > 0 ? (
                        <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4'>
                            {products.map((product: any) => (
                            <ProductCard key={product.id} product={product} />
                            ))}
                        </div>
                      ) : (
                        <p className='text-center text-gray-400 py-4'>No products available yet!</p>
                      )}
                  </div>
              )}
              {activeTab === 'Offers' && (
                  <div>
                      {events.length > 0 ? (
                        <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4'>
                            {events.map((event: any) => (
                              <ProductCard key={event.id} product={event} isEvent={true} />
                            ))}
                        </div>
                      ) : (
                        <p className='text-center text-gray-400 py-4'>No offers available yet!</p>
                      )}
                  </div>
              )}
              {activeTab === 'Reviews' && (
                <div>
                  <p className='text-center text-gray-400 py-4'>No reviews available yet.</p>
                </div>
              )}
            </div>
          </div>

          {editType && (
            <ImageEditModal
              editType={editType}
              onClose={() => setEditType(null)}
              currentImage={
                editType === 'avatar'
                  ? (seller?.shop?.avatar as any)?.url
                  : (seller?.shop?.coverBanner as any)?.url
              }
            />
          )}
        </div>
      )}
    </>
  )
}

export default page