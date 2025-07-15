
import ProductDetails from 'apps/users-ui/src/shared/module/ProductDetails';
import axiosInstance from 'apps/users-ui/src/utils/axiosInstance';
import { Metadata } from 'next';
import React from 'react';


async function fetchProductDetails(slug: string) {
    const response = await axiosInstance.get(`/product/api/get-product/${slug}`);
    return response.data.product; 
}

export async function generateMetadata({ params}: {params: Promise<{ slug: string}>}):Promise<Metadata> {
    const slug = (await params).slug;
    const productDetails = await fetchProductDetails(slug);
    return {
        title:  `${productDetails?.title} | E-Commerce(Bhupesh)`,
        description: productDetails?.detailedDescription || "Discover the high quality details of this product.",
        openGraph: {
            title: productDetails?.title,
            description: productDetails?.shortDescription || "Explore the features and benefits of this product.",
            images: [
                productDetails?.images?.[0]?.url || "/default-image.jpg",
            ],
            type: 'website',
        },
        twitter:{
            card: 'summary_large_image',
            title: productDetails?.title,   
            description: productDetails?.shortDescription || "Explore the features and benefits of this product.",
            images: [
                productDetails?.images?.[0]?.url || "/default-image.jpg",
            ]
        },
    };
    
}


const Page = async ({ params}: {params: Promise<{ slug: string}>}) => {
    const slug = (await params).slug;
    const productDetails = await fetchProductDetails(slug);

  return (
    <ProductDetails productDetails={productDetails} />
  );
};

export default Page;