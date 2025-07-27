"use client";
import { useQuery } from '@tanstack/react-query';
import BreadCrumbs from 'apps/admin-ui/src/shared/components/BreadCrumbs';
import axiosInstance from 'apps/admin-ui/src/utils/axiosInstance';
import Link from 'next/link';
import React from 'react';

const NotificationPage = () => {
  const {data , isLoading} = useQuery({
    queryKey: ['notifications'],
    queryFn: async () => {
      const response = await axiosInstance.get('/admin/api/get-all-notifications');
      return response.data.notifications || [];
    },
  });

  const markASRead = async (notificationId: string) => {
    await axiosInstance.post('/seller/api/mark-notification-as-read', { notificationId });
  }
  return (
    <div className='w-full min-h-screen p-8 bg-black text-white text-sm'>
        <h1 className="text-2xl font-bold mb-4">Notifications</h1>
        <p className="text-gray-500">This page will display notifications related to the admin dashboard.</p>
        <div className="mt-1">
            <BreadCrumbs title='Notifications' />
        </div>
        
        {!isLoading && data?.length === 0 && (
          <div className="mt-8">
            <p className="text-gray-400 text-center font-Poppins">No notifications yet.</p>
          </div>
        )}
        {!isLoading && data?.length > 0 && (
          <div className='w-full md:w-[80%] mx-auto mt-8 rounded-lg divide-y divide-gray-700 bg-black/40 backdrop-blur-lg shadow-sm'>
            {data.map((notifications:any) => (
              <Link
                key={notifications.id}
                href={`${notifications.redirect_link}`}
                className={`block p-4 transition-colors ${notifications.isRead !== false ? ' hover:bg-gray-700/40' : 'hover:bg-gray-800/40  '} text-white`}
                onClick={() => markASRead(notifications.id)}
              >
                <div className='flex items-center gap-3'>
                  <div className='flex flex-col'>
                    <span className='font-semibold'>{notifications.title}</span>
                    <span className='text-gray-400'>{notifications.message}</span>
                    <span className='text-gray-500 text-xs'>{new Date(notifications.createdAt).toLocaleString("en-UK", { dateStyle: "medium", timeStyle: "short" })}</span>
                  </div>
                </div>
              
              </Link>
            ))}
          </div>
        )}
    </div>
  )
}

export default NotificationPage