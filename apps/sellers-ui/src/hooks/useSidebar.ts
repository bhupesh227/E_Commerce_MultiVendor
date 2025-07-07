'use client';

import { useAtom } from 'jotai';
import { activeSidebarItem } from '../constants';


export const useSidebar = () => {
  const [activeSidebar, setActiveSidebar] = useAtom(activeSidebarItem);

  return { activeSidebar, setActiveSidebar };
};