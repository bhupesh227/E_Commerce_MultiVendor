
'use client';

import { navItems } from 'apps/users-ui/src/config/constants';
import useUser from 'apps/users-ui/src/hooks/useUser';
import { useStore } from 'apps/users-ui/src/store';
import {
  AlignLeft,
  ChevronDown,
  Heart,
  ShoppingCart,
  User,
} from 'lucide-react';
import Link from 'next/link';
import { useState, useEffect } from 'react';

const HeaderBottom = () => {
  const [show, setShow] = useState<boolean>(false);
  const [isSticky, setIsSticky] = useState(false);
  const { user, isLoading } = useUser();
  const cart = useStore((state) => state.cart);
  const wishlist = useStore((state) => state.wishlist);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 100) {
        setIsSticky(true);
      } else {
        setIsSticky(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  return (
    <div
      className={`w-full transition-all duration-300 ${
        isSticky ? 'fixed top-0 left-0 z-[100] bg-white shadow-lg' : 'relative'
      }`}
    >
      <div
        className={`w-[80%] relative m-auto flex items-center justify-between ${
          isSticky ? 'pt-3' : 'py-0'
        }`}
      >
        {/*Dropdowns */}
        <div
          className={`w-[260px] ${
            isSticky && '-mb-2'
          } cursor-pointer flex items-center justify-between px-5 h-[50px] bg-[#3489ff]`}
          onClick={() => setShow(!show)}
        >
          <div className="flex items-center gap-2">
            <AlignLeft color="white" />
            <span className="text-white font-medium">All Details</span>
          </div>
          <ChevronDown color="white" />
        </div>

        {/* Dropdown menu */}
        {show && (
          <div
            className={`absolute left-0 ${
              isSticky ? 'top-[70px]' : 'top-[50px]'
            } w-[260px] h-[400px] bg-[#f5f5f5]`}
          ></div>
        )}
        
        {/* Nav links */}
        <div className="flex items-center">
          {navItems.map((item: NavItemTypes, index: number) => (
            <Link
              href={item.href}
              key={index}
              className="px-5 font-medium text-lg"
            >
              {item.title}
            </Link>
          ))}
        </div>

        <div>
          {isSticky && (
            <div className="flex items-center gap-8 pb-2">

              {!isLoading && user ? (
                <Link href="/profile" className="flex items-center gap-2">
                  <div className="border-2 w-[50px] h-[50px] flex items-center justify-center rounded-full border-[#010f1c1a]">
                    <User />
                  </div>
                  <div>
                    <span className="block font-medium">Hello,</span>
                    <span className="font-semibold capitalize">
                      {user.name.split(' ')[0]}
                    </span>
                  </div>
                </Link>
              ) : (
                <Link href="/login" className="flex items-center gap-2">
                  <div className="border-2 w-[50px] h-[50px] flex items-center justify-center rounded-full border-[#010f1c1a]">
                    <User />
                  </div>
                  <div>
                    <span className="block font-medium">Hello,</span>
                    <span className="font-semibold">
                      {isLoading ? '...' : 'Sign In'}
                    </span>
                  </div>
                </Link>
              )}

              <div className="flex items-center gap-5">
                <Link href="/wishlist" className="relative">
                  <Heart />
                  <div className="h-6 w-6 border-2 border-white bg-red-500 rounded-full flex items-center justify-center absolute top-[-10px] right-[-10px]">
                    <span className="text-white font-medium text-sm">
                      {wishlist.length}
                    </span>
                  </div>
                </Link>
              </div>
              <div className="flex items-center gap-5">
                <Link href="/cart" className="relative">
                  <ShoppingCart />
                  <div className="h-6 w-6 border-2 border-white bg-red-500 rounded-full flex items-center justify-center absolute top-[-10px] right-[-10px]">
                    <span className="text-white font-medium text-sm">
                      {cart.length}
                    </span>
                  </div>
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default HeaderBottom;