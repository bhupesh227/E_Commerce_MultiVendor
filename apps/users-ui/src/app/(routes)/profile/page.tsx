"use client";

import { useQuery, useQueryClient } from '@tanstack/react-query';
import useUserRequiredAuth from 'apps/users-ui/src/hooks/useUserRequiredAuth';
import ChangePassword from 'apps/users-ui/src/shared/components/ChangePassword';
import NavItem from 'apps/users-ui/src/shared/components/NavItem';
import OrdersTable from 'apps/users-ui/src/shared/components/OrdersTable';
import QuickActionCard from 'apps/users-ui/src/shared/components/QuickActionCard';
import ShippingAddressSection from 'apps/users-ui/src/shared/components/ShippingAddressSection';
import StatCard from 'apps/users-ui/src/shared/components/StatCard';
import { useAuthStore } from 'apps/users-ui/src/store/useAuthStore';
import axiosInstance from 'apps/users-ui/src/utils/axiosInstance';
import { BadgeCheck, Bell, CheckCircle, Clock, Gift, Inbox, Loader2, Lock, LogOut, MapPin, Pencil, PhoneCall, Receipt, Settings, ShoppingBag, Truck, User } from 'lucide-react'
import Image from 'next/image';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import React, { Suspense, useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';



const ProfilePageContent = () => {
    const searchParams = useSearchParams();
    const queryTab = searchParams.get('active') || "Profile";
    const [activeTab, setActiveTab] = useState(queryTab);
    const [isUploading, setIsUploading] = useState(false);
    const avatarInputRef = useRef<HTMLInputElement>(null);

    const router = useRouter();
    const queryClient = useQueryClient();
     const { setLoggedIn } = useAuthStore();
    
    const {user, isLoading} = useUserRequiredAuth();

    useEffect(() => {
        if (activeTab !== queryTab) {
            const newParams = new URLSearchParams(searchParams);
            newParams.set("active", activeTab);
            router.replace(`/profile?${newParams.toString()}`)
        }
    }, [activeTab]);

    const logOutHandler = async () => {
        try {
            await axiosInstance.get("/api/logout-user");
            setLoggedIn(false);
            queryClient.removeQueries({ queryKey: ['user'] });
            router.push("/login");
            toast.success("Logged out Successfully");
        } catch (error) {
            toast.error("Failed to log out");
        }
    };

    const { data: orders = [] } = useQuery({
        queryKey: ['user-orders'],
        queryFn: async () => {
            const res = await axiosInstance.get(`/order/api/get-user-orders`);
            return res.data.orders;
        }
    });

    const totalOrders = orders.length;

    const processingOrders = orders.filter(
        (o: any) => o?.deliveryStatus !== "Delivered" && o?.deliveryStatus !== 'Cancelled'
    ).length;

    const completeOrders = orders.filter(
        (o: any) => o?.deliveryStatus === "Delivered"
    ).length;

    const {data: notifications , isLoading: isLoadingNotifications} = useQuery({
        queryKey: ['notifications'],
        queryFn: async () => {
            const response = await axiosInstance.get('/admin/api/get-user-notifications');
            return response.data.notifications || [];
        }
    });

    const markAsRead = async (notificationId: string) => {
        await axiosInstance.post('/seller/api/mark-notification-as-read', { notificationId });
    };

    const handleAvatarChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        setIsUploading(true);
        const formData = new FormData();
        formData.append('avatar', file);

        const toastId = toast.loading('Uploading your new avatar...');

        try {
            await axiosInstance.post('/api/update-avatar', formData);
            // Invalidate user query to refetch data and update the UI
            queryClient.invalidateQueries({ queryKey: ['user'] });
            
            toast.success('Avatar updated successfully!', { id: toastId });
        } catch (error) {
            toast.error('Failed to update avatar.', { id: toastId });
            console.error(error);
        } finally {
            setIsUploading(false);
        }
    };

  return (
    <div className='bg-gray-50 p-6 pb-14'>
        <div className='md:max-w-7xl mx-auto'>
            <div className='text-center mb-10'>
                <h1 className='text-3xl font-bold text-gray-800'>
                    Welcome Back, {" "}
                    <span className='text-blue-600 capitalize'>
                    {isLoading ? (
                        <Loader2 className='inline animate-spin w-5 h-5' />
                    ) : (
                        `${user?.name || "User"}`
                    )}
                    </span>{" "}
                </h1>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                <StatCard title="Total Orders" count={totalOrders} Icon={Clock} />
                <StatCard title="Processing Orders" count={processingOrders} Icon={Truck} />
                <StatCard title="Completed Orders" count={completeOrders} Icon={CheckCircle} />
            </div>

            <div className='mt-10 flex flex-col md:flex-row gap-6'>
                <div className="bg-white p-4 rounded-md shadow-sm border border-gray-100 w-full md:w-1/5">
                    <nav className="space-y-2">
                        <NavItem
                            label='Profile'
                            Icon={User}
                            active={activeTab === 'Profile'}
                            onClick={() => setActiveTab("Profile")}
                        />
                        <NavItem
                            label='My Orders'
                            Icon={ShoppingBag}
                            active={activeTab === 'My Orders'}
                            onClick={() => setActiveTab("My Orders")}
                        />
                        <NavItem
                            label='Inbox'
                            Icon={Inbox}
                            active={activeTab === 'Inbox'}
                            onClick={() => router.push('/inbox')}
                        />
                        <NavItem
                            label='Notifications'
                            Icon={Bell}
                            active={activeTab === 'Notifications'}
                            onClick={() => setActiveTab("Notifications")}
                        />
                        <NavItem
                            label='Shipping Address'
                            Icon={MapPin}
                            active={activeTab === 'Shipping Address'}
                            onClick={() => setActiveTab("Shipping Address")}
                        />
                        <NavItem
                            label='Change Password'
                            Icon={Lock}
                            active={activeTab === 'Change Password'}
                            onClick={() => setActiveTab("Change Password")}
                        />
                        <NavItem
                            label='Logout'
                            Icon={LogOut}
                            danger
                            onClick={() => logOutHandler()}
                        />
                    </nav>
                </div>

                <div className="bg-white p-6 rounded-md shadow-sm border border-gray-100 w-full md:w-[55%]">
                    <h2 className="text-xl font-semibold text-gray-800 mb-4">
                        {activeTab}
                    </h2>
                    {activeTab === 'Profile' && !isLoading && user 
                        ?(
                            <div className='space-y-4 text-sm text-gray-700'>
                                <div className='flex items-center gap-3'>
                                    <Image
                                        src={(user.avatar as any)?.url || "/defaultprofile.jpg"}
                                        alt='Profile'
                                        width={60}
                                        height={60}
                                        className='w-16 h-16 rounded-full border border-gray-200'
                                    />
                                    <input
                                        type="file"
                                        ref={avatarInputRef}
                                        onChange={handleAvatarChange}
                                        accept="image/png, image/jpeg, image/webp"
                                        style={{ display: 'none' }}
                                    />
                                    <button 
                                        className='flex items-center gap-1 text-blue-500 text-xs font-medium disabled:opacity-50'
                                        onClick={() => avatarInputRef.current?.click()}
                                        disabled={isUploading}
                                    >
                                        {isUploading ? (
                                            <>
                                                <Loader2 className='w-4 h-4 animate-spin' /> Uploading...
                                            </>
                                        ) : (
                                            <>
                                                <Pencil className='w-4 h-4' /> Change Photo
                                            </>
                                        )}
                                    </button>
                                </div>
                                <p>
                                    <span className='font-semibold capitalize'>Name:</span> {user.name}
                                </p>
                                <p>
                                    <span className='font-semibold'>Joined:</span>{" "}
                                    {new Date(user.createdAt).toLocaleDateString()}
                                </p>
                                <p>
                                    <span className='font-semibold'>Earned Points</span>{" "}
                                    {user.points || 0}
                                </p>
                            </div>
                        ) : ( activeTab === 'Shipping Address' ?(

                                <ShippingAddressSection />
                            ) : activeTab === 'My Orders' ? (
                                <OrdersTable/>
                            ) : activeTab === "Change Password" ? (
                                <ChangePassword />
                            ) : activeTab === "Notifications" ? (
                                <div className='space-y-4 text-sm text-gray-700'>
                                    {!isLoadingNotifications && notifications?.length === 0 && (
                                        <p className='text-gray-500'>No notifications found.</p>
                                    )}

                                    {!isLoadingNotifications && notifications?.length > 0 && (
                                        <div className='w-full md:w-[80%] mx-auto mt-8 rounded-lg divide-y divide-gray-700 bg-black/40 backdrop-blur-lg shadow-sm'>
                                            {notifications.map((notification:any) => (
                                                <Link
                                                    key={notification.id}
                                                    href={`${notification.redirect_link}`}
                                                    className={`block p-4 transition-colors ${notification.isRead !== false ? ' hover:bg-gray-700/40' : 'hover:bg-gray-800/40  '} text-white`}
                                                    onClick={() => markAsRead(notification.id)}
                                                >
                                                    <div className='flex items-center gap-3'>
                                                        <div className='flex flex-col'>
                                                            <span className='font-semibold'>{notification.title}</span>
                                                            <span className='text-gray-400'>{notification.message}</span>
                                                            <span className='text-gray-500 text-xs'>{new Date(notification.createdAt).toLocaleString("en-UK", { dateStyle: "medium", timeStyle: "short" })}</span>
                                                        </div>
                                                    </div>
                                                
                                                </Link>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <p>Not Found</p>
                            )
                        )
                    }
                </div>
                <div className='w-full md:w-1/4 space-y-4'>
                    <QuickActionCard
                        Icon={Gift}
                        title="Referral Program"
                        description="Invite friends and earn rewards"
                    />
                    <QuickActionCard
                        Icon={BadgeCheck}
                        title="Your Badges"
                        description="View your earned achievements."
                    />
                    <QuickActionCard
                        Icon={Settings}
                        title="Account Settings"
                        description="Manage preferences and security"
                    />
                    <QuickActionCard
                        Icon={Receipt}
                        title="Billing History"
                        description="Check your recent payments."
                    />
                    <QuickActionCard
                        Icon={PhoneCall}
                        title="Support Center"
                        description="Need help? Contact support."
                    />
                </div>
            </div>
        </div>
    </div>
  );
};


const Page = () => {
  return (
    <Suspense fallback={
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="animate-spin h-12 w-12 text-blue-600" />
      </div>
    }>
      <ProfilePageContent />
    </Suspense>
  )
}

export default Page