"use client";

import React, { useEffect } from 'react'
import { useSidebar } from '../../hooks/useSidebar';
import useSeller from '../../hooks/useSeller';
import { usePathname } from 'next/navigation';
import Box from '../components/Box';
import { SidebarStyle } from './Sidebar.styles';
import Link from 'next/link';
import {  BellPlus, BellRing, CalendarPlus, Home, LayoutDashboard, List, LogOut, Mail, PackageSearch, PlusSquare, Settings, TicketPercent, Wallet } from 'lucide-react';
import SidebarItem from './Sidebar.item';
import SidebarMenu from './Sidebar.Menu';
// import Image from 'next/image';

const Sidebar = () => {
  const { activeSidebar, setActiveSidebar } = useSidebar();
  const { seller } = useSeller();
  const pathname = usePathname();

  useEffect(() => {
    setActiveSidebar(pathname);
  }, [pathname, setActiveSidebar]);
  
  const getIconColor = (route: string) =>
    activeSidebar === route ? '#0085ff' : '#969696';


  return (
    <Box
      css={{
        height: '100vh',
        zIndex: 202,
        position: 'sticky',
        paddingLeft: "8px",
        marginTop: "8px",
        paddingBottom: "30px",
        top: 0,
        overflowY: 'scroll',
        scrollbarWidth: 'none',
      }}
      className="sidebar-wrapper"
    >
      <SidebarStyle.Header>
        <Box className='border-b border-[#4bb1f9] pb-1'>
          <Link href="/" className="flex justify-center text-center gap-2">
            <Home className='mt-2 text-[#4bb1f9]' size={33} />
            <Box css={{ width: '100%' }} className="flex flex-col items-start capitalize">
              <h3 className="text-xl font-medium text-[#e5bb33]">
                {seller?.shop?.name }
              </h3>
              <h5 className="font-medium text-xs text-[#99a6b2cf] whitespace-nowrap overflow-hidden text-ellipsis max-w-[170px]">
                {seller?.shop?.address}
              </h5>
            </Box>
          </Link>
        </Box>
      </SidebarStyle.Header>

      <div>
          <SidebarStyle.Body className='body sidebar'>
            <SidebarItem
              title="Dashboard"
              icon={
                <LayoutDashboard fill={getIconColor('/dashboard')} size={22} />
              }
              isActive={activeSidebar === 'dashboard'}
              href="/dashboard"
            />
            <div className="mt-2 block">
                <SidebarMenu title="Main Menu">
                  <SidebarItem
                    isActive={activeSidebar === '/dashboard/orders'}
                    title="Orders"
                    href="/dashboard/orders"
                    icon={
                      <List fill={getIconColor('/dashboard/orders')} size={22} />
                    }
                  />
                  <SidebarItem
                    isActive={activeSidebar === '/dashboard/payments'}
                    title="Payments"
                    href="/dashboard/payments"
                    icon={
                      <Wallet fill={getIconColor('/dashboard/payments')} size={22} />
                    }
                  />
                </SidebarMenu>
                <SidebarMenu title="Products">
                  <SidebarItem
                    isActive={activeSidebar === '/dashboard/create-product'}
                    title="Create Product"
                    href="/dashboard/create-product"
                    icon={
                      <PlusSquare fill={getIconColor('/dashboard/create-product')} size={22} />
                    }
                  />
                  <SidebarItem
                    isActive={activeSidebar === '/dashboard/all-products'}
                    title="All Products"
                    href="/dashboard/all-products"
                    icon={
                      <PackageSearch fill={getIconColor('/dashboard/all-products')} size={22} />
                    }
                  />
                </SidebarMenu>
                <SidebarMenu title="Events">
                  <SidebarItem
                    isActive={activeSidebar === '/dashboard/create-event'}
                    title="Create Event"
                    href="/dashboard/create-event"
                    icon={
                      <CalendarPlus fill={getIconColor('/dashboard/create-event')} size={22} />
                    }
                  />
                  <SidebarItem
                    isActive={activeSidebar === '/dashboard/all-events'}
                    title="All Events"
                    href="/dashboard/all-events"
                    icon={
                      <BellPlus fill={getIconColor('/dashboard/all-events')} size={22} />
                    }
                  />
                </SidebarMenu>
                <SidebarMenu title="Controllers">
                  <SidebarItem
                    isActive={activeSidebar === '/dashboard/inbox'}
                    title="Inbox"
                    href="/dashboard/inbox"
                    icon={
                      <Mail fill={getIconColor('/dashboard/inbox')} size={22} />
                    }
                  />
                  <SidebarItem
                    isActive={activeSidebar === '/dashboard/settings'}
                    title="Settings"
                    href="/dashboard/settings"
                    icon={
                      <Settings fill={getIconColor('/dashboard/settings')} size={22} />
                    }
                  />
                  <SidebarItem
                    isActive={activeSidebar === '/dashboard/notifications'}
                    title="Notifications"
                    href="/dashboard/notifications"
                    icon={
                      <BellRing fill={getIconColor('/dashboard/notifications')} size={26} />
                    }
                  />
                </SidebarMenu>
                <SidebarMenu title="Extras">
                  <SidebarItem
                    isActive={activeSidebar === '/dashboard/discount-codes'}
                    title="Discount Codes"
                    href="/dashboard/discount-codes"
                    icon={
                      <TicketPercent fill={getIconColor('/dashboard/discount-codes')} size={26} />
                    }
                  />
                  <SidebarItem
                    isActive={activeSidebar === '/dashboard/logout'}
                    title="Logout"
                    href="/"
                    icon={
                      <LogOut fill={getIconColor('/dashboard/logout')} size={26} />
                    }
                  />
                </SidebarMenu>               
            </div>
          </SidebarStyle.Body>
      </div>
    </Box>
  )
}

export default Sidebar