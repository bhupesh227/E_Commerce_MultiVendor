"use client";

import React, { useEffect } from 'react'
import { useSidebar } from '../../hooks/useSidebar';
import useSeller from '../../hooks/useSeller';
import { usePathname } from 'next/navigation';
import Box from '../components/Box';
import { SidebarStyle } from './Sidebar.styles';
import Link from 'next/link';
import { Circle } from 'lucide-react';
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
      $css={{
        height: '100vh',
        zIndex: 202,
        position: 'sticky',
        padding: '8px',
        top: 0,
        overflowY: 'scroll',
        scrollbarWidth: 'none',
      }}
      className="sidebar-wrapper"
    >
      <SidebarStyle.Header>
        <Box>
          <Link href="/" className="flex justify-center text-center gap-2">
            <Circle/>
            
            <Box>
              <h3 className="text-xl font-medium text-[#ecedee]">
                {seller?.shop?.name }
              </h3>
              <h5 className="font-medium text-xs text-[#ecedeecf] whitespace-nowrap overflow-hidden text-ellipsis max-w-[170px] pl-2">
                {seller?.shop?.address}
                
              </h5>
            </Box>

          </Link>
        </Box>
      </SidebarStyle.Header>

    </Box>
  )
}

export default Sidebar