import SellerProfile from 'apps/users-ui/src/shared/module/SellerProfile';
import axiosInstance from 'apps/users-ui/src/utils/axiosInstance';
import { Metadata } from 'next';
import React from 'react';



async function fetchSellerDetails(id: string) {
  const res = await axiosInstance.get(`/seller/api/get-seller/${id}`);
  return res.data;
}

export async function generateMetadata({ params}: {params: Promise<{ id: string}>}):Promise<Metadata> {
    const id = (await params).id;
    const data = await fetchSellerDetails(id);
    return {
        title:  `${data?.shop?.name} | E-Commerce Marketplace`,
        description: data?.shop?.bio || "Explore the shop's offerings and unique products.",
        openGraph: {
            title: data?.shop?.name,
            description: data?.shop?.bio || "Discover the unique products offered by this shop.",
            images: [
                {
                    url: data?.shop?.avatar?.[0] || "/coverimage.jpg",
                    width: 800,
                    height: 600,
                    alt: data?.shop?.name || "Shop Cover Image",
                }
            ],
            type: 'website',
        },
        twitter:{
            card: 'summary_large_image',
            title: data?.shop?.name || "E-Commerce Marketplace",
            description: data?.shop?.bio || "Explore the features and benefits of this product.",
            images: [
                {
                    url: data?.shop?.avatar?.[0] || "/coverimage.jpg",
                    width: 800,
                    height: 600,
                    alt: data?.shop?.name || "Shop Cover Image",
                }
            ]
        },
    };
    
}

const ShopContentPage = async ({ params}: {params: Promise<{ id: string}>}) => {
    const id = (await params).id;
    const data = await fetchSellerDetails(id);
  return (
    <div>
        <SellerProfile shop={data?.shop} followerCount={data?.followerCount} />
    </div>
  )
}

export default ShopContentPage