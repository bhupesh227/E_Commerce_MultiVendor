"use client";
import React, { useEffect } from 'react'
import useSidebar from '../../hooks/useSidebar';
import { usePathname } from 'next/navigation';
import useAdmin from '../../hooks/useAdmin';
import Box from '../components/Box';
import { SidebarStyle } from './SidebarStyle';
import Link from 'next/link';
import Logo from '../../assets/Logo';
import { BellPlus, BellRing, FileClock, Home, ListOrdered, LogOut, PackageSearch, PencilRuler, Settings, Store, Users, WalletCards } from 'lucide-react';
import SidebarItem from './SidebarItem';
import SidebarMenu from './SidebarMenu';


const SideBarWrapper = () => {
    const { activeSidebar, setActiveSidebar } = useSidebar();
    const pathName = usePathname();
    const {admin} = useAdmin();

    const getIconColor = (route: string) => {
        return activeSidebar === route ? "#0085ff" : "#969696";
    };

    useEffect(() => {
        setActiveSidebar(pathName);
    }, [pathName, setActiveSidebar]);

  return (
    <Box
        css={{
            height: '100vh',
            zIndex: 202,
            position: 'sticky',
            padding: '8px',
            top: '0',
            overflowY: 'scroll',
            scrollbarWidth: 'none'
        }}
        className='sidebar-wrapper'
    >
        <SidebarStyle.Header>
            <Box>
                <Link href={'/'} className='flex flex-col justify-center text-center gap-2'>
                    <Logo />
                    <Box>
                        <div className='flex flex-col text-white font-poppins'>
                            <h3 className='text-[#ecedee] text-xl font-medium capitalize'>
                                {admin?.name}
                            </h3>
                            <h5 className='text-xs font-medium text-[#ecedeecf] whitespace-nowrap overflow-hidden text-ellipsis max-w-[170px] pl-2'>
                                {admin?.email}
                            </h5>
                        </div>
                        
                    </Box>
                </Link>
            </Box>
        </SidebarStyle.Header>

        <div className='block my-3 h-full'>
            <SidebarStyle.Body className='body sidebar'>
                <SidebarItem
                    title='Dashboard'
                    href='/dashboard'
                    icon={<Home fill={getIconColor("/dashboard")} />}
                    isActive={activeSidebar === '/dashboard'}
                />
                <div className='mt-2 block'>
                    <SidebarMenu
                        title='Main Menu'
                    >
                        <SidebarItem
                            isActive={activeSidebar === '/dashboard/orders'}
                            title='Orders'
                            href='/dashboard/orders'
                            icon={<ListOrdered size={26} color={getIconColor("/dashboard/orders")} />}
                        />
                        <SidebarItem
                            isActive={activeSidebar === '/dashboard/payments'}
                            title='Payments'
                            href='/dashboard/payments'
                            icon={<WalletCards size={26} color={getIconColor("/dashboard/payments")} />}
                        />
                        <SidebarItem
                            isActive={activeSidebar === '/dashboard/products'}
                            title='All Products'
                            href='/dashboard/products'
                            icon={<PackageSearch size={26} color={getIconColor("/dashboard/products")} />}
                        />

                        <SidebarItem
                            isActive={activeSidebar === '/dashboard/events'}
                            title='All Events'
                            href='/dashboard/events'
                            icon={<BellPlus size={26} color={getIconColor("/dashboard/events")} />}
                        />
                        <SidebarItem
                            isActive={activeSidebar === '/dashboard/users'}
                            title='Users'
                            href='/dashboard/users'
                            icon={<Users size={26} color={getIconColor("/dashboard/users")} />}
                        />
                        <SidebarItem
                            isActive={activeSidebar === '/dashboard/sellers'}
                            title='Sellers'
                            href='/dashboard/sellers'
                            icon={<Store size={26} color={getIconColor("/dashboard/sellers")} />}
                        />
                    </SidebarMenu>
                    <SidebarMenu
                        title='Controllers'
                    >
                        <SidebarItem
                            isActive={activeSidebar === '/dashboard/loggers'}
                            title='Loggers'
                            href='/dashboard/Loggers'
                            icon={<FileClock size={26} color={getIconColor("/dashboard/Inbox")} />}
                        />
                        <SidebarItem
                            isActive={activeSidebar === '/dashboard/management'}
                            title='Management'
                            href='/dashboard/management'
                            icon={<Settings size={26} color={getIconColor("/dashboard/management")} />}
                        />
                        <SidebarItem
                            isActive={activeSidebar === '/dashboard/notifications'}
                            title='Notifications'
                            href='/dashboard/notifications'
                            icon={<BellRing size={26} color={getIconColor("/dashboard/notifications")} />}
                        />
                    </SidebarMenu>
                    <SidebarMenu
                        title='Customization'
                    >
                        <SidebarItem
                            isActive={activeSidebar === '/dashboard/customization'}
                            title='All Customization'
                            href='/dashboard/customization'
                            icon={<PencilRuler size={26} color={getIconColor("/dashboard/customization")} />}
                        />
                    </SidebarMenu><SidebarMenu
                        title='Extras'
                    >
                        <SidebarItem
                            isActive={activeSidebar === '/logout'}
                            title='Logout'
                            href='/logout'
                            icon={<LogOut size={26} color={getIconColor("/logout")} />}
                        />
                    </SidebarMenu>
                </div>
            </SidebarStyle.Body>
        </div>
    </Box>
  )
}

export default SideBarWrapper