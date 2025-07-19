import { ChevronRight } from 'lucide-react'
import Link from 'next/link'
import React from 'react'


const BreadCrumbs = ({ title }: { title: string }) => {
  return (
    <div className="flex items-center text-lg py-4">
        <Link href="/dashboard" className="text-[#80deea] cursor-pointer font-medium">
            Dashboard
        </Link>
        <ChevronRight size={20} className="opacity-[0.98] text-white"  />
        <span className='underline text-[#55585b]'>{title}</span>
    </div>
  )
}

export default BreadCrumbs