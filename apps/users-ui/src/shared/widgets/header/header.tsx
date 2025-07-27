"use client";
import Link from 'next/link';
import React from 'react'
import { Heart, Search, ShoppingCart, User } from 'lucide-react';
import Logo from 'apps/users-ui/src/assets/Logo';
import HeaderBottom from './header-bottom';
import useUser from 'apps/users-ui/src/hooks/useUser';
import { useStore } from 'apps/users-ui/src/store';
import useLayout from 'apps/users-ui/src/hooks/useLayout';
import Image from 'next/image';

const Header = () => {
  const { user, isLoading } = useUser();
  const cart = useStore((state) => state.cart);
  const wishlist = useStore((state) => state.wishlist);
  const {layout} = useLayout();


  return (
    <header className="w-full bg-white">
      <div className="w-[80%] py-5 m-auto flex items-center justify-between">
        <div>
          <Link href="/">
            {layout?.logo ?
              <Image src={layout.logo} alt="Logo" width={300} height={100} className='object-cover h-[70px] ml-[-50px] mb-[-30px]'/> :
              <Logo className='h-[70px] ml-[-50px] mb-[-30px]' />
            }
          </Link>
        </div>

        <div className="w-[50%] relative">
          <input
            type="text"
            placeholder="Search for products..."
            className="font-Poppins w-full px-4 font-medium border-[2.5px] border-[#3489ff] outline-none h-[55px]"
            
          />
          <div className="w-[60px] cursor-pointer flex items-center justify-center h-[55px] bg-[#3489ff] absolute right-0 top-0">
            <Search color="white" />
          </div>
        </div>

        <div className="flex items-center gap-8">
          {/* User Icon */}
          {!isLoading && user ? (
            <Link href="/profile" className="flex items-center gap-2">
              <div className="border-2 w-[50px] h-[50px] flex items-center justify-center rounded-full border-[#010f1c1a]">
                <User />
              </div>
              <div>
                <span className="block font-medium">Hello,</span>
                <span className="font-semibold capitalize">{user.name.split(' ')[0]}</span>
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

         
          {/* Wishlist Icon */}
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
          
          {/* Cart Icon */}
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
      </div>

      <div className="border-b border-b-[#99999938]">
        <HeaderBottom />
      </div>
    </header>
  )
}

export default Header