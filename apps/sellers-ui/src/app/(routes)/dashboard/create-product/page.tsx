"use client";

import ImagePlaceholder from 'apps/sellers-ui/src/shared/components/ImagePlaceholder';
import { ChevronRight } from 'lucide-react';
import Link from 'next/link';
import ColorSelector from 'packages/components/ColorSelector';
import CustomProperties from 'packages/components/CustomProperties';
import CustomSpecification from 'packages/components/CustomSpecification';
import Input from 'packages/components/Input';
import React, { useState } from 'react'
import { useForm } from 'react-hook-form';

const CreateProduct = () => {
    const { register, control, setValue, handleSubmit,formState: { errors },
        } = useForm({ mode: "onChange" });
    
    const [openImageModal, setOpenImageModal] = useState(false);
    //const [isChanged, setIsChanged] = useState(false);
    const [images, setImages] = useState<(File | null)[]>([]);
    //const [isLoading, setIsLoading] = useState(false);

    const onSubmit = (data:any) => {
        console.log(data);
        // Handle form submission logic here
    }

    const handleImageChange = async (file: File | null, index: number) => {
        
        const updatedImages = [...images];

        updatedImages[index] = file;

        if (index == images.length - 1 && images.length < 8) {
            updatedImages.push(null);
        }
        setImages(updatedImages);
        setValue('images', updatedImages);
        
    };

    const handleRemoveImage = async (index: number) => {
        setImages((prevImages) => {
            let updatedImages = [...prevImages];

            if(index ==-1){
                updatedImages[0] = null;
            }else{
                updatedImages.splice(index, 1);
            }

            if (updatedImages.includes(null) && updatedImages.length < 8) {
                updatedImages.push(null);
            }
            return updatedImages;
        })
        setValue('images', images);
    };

  return (
    <form className="w-full mx-auto p-8 shadow-md rounded-lg text-white"
      onSubmit={handleSubmit(onSubmit)}>

        <h2 className="text-2xl py-2 font-semibold font-Poppins text-white">
            Create Product
        </h2>

        <div className="flex items-center">
            <Link href="/dashboard" className="text-[#80deea] cursor-pointer">
                Dashboard
            </Link>
            <ChevronRight size={20} className="opacity-[0.98]" />
            <span>Create Product</span>
        </div>

        <div className="py-4 w-full flex max-md:flex-col gap-6">
           
            <div className="md:w-[35%]">
                {images.length < 8 && (
                    <ImagePlaceholder
                        setOpenImageModal={setOpenImageModal}
                        size="765 x 850"
                        small={false}
                        index={0}                    
                        onRemove={handleRemoveImage}
                        onImageChange={handleImageChange}
                    />
                )}
                <div className="grid grid-cols-2 gap-3 mt-4">
                    {images.slice(1).map((_, index) => (
                        <ImagePlaceholder
                            setOpenImageModal={setOpenImageModal}
                            size="765 x 850"
                            small
                            key={index}
                            index={index + 1}
                            onRemove={handleRemoveImage}
                            onImageChange={handleImageChange}
                        />
                    ))}
                </div>
            </div> 

            <div className='md:w-[65%]'>
                <div className='w-full flex max-md:flex-col gap-6'>
                    {/* Left side */}
                    <div className='w-full md:w-2/4'>
                        <Input
                            type="text"
                            label="Product Title *"
                            placeholder="Enter product title"
                            {...register('title', {required: `Title is required`,})}
                        />
                        {errors.title && (
                            <p className="text-red-500 text-sm mt-2">{errors.title.message as string} </p>
                        )}
                    
                        <div className="mt-2">
                            <Input
                                type="textarea"
                                rows={7}
                                cols={10}
                                label="Short Description * (Max 150 words)"
                                placeholder="Enter product description for quick view"
                                {...register('description', {
                                    required: `Description is required`,
                                    validate: (value) => {
                                    const wordCount = value.trim().split(/\s+/).length;
                                    return (
                                        wordCount <= 150 ||
                                        `Description cannot exceed 150 words (Current: ${wordCount})`
                                    );
                                    },
                                })}
                            />
                            {errors.description && (
                                <p className="text-error">{String(errors.description.message)}</p>
                            )}
                        </div>
                        <div className="mt-2">
                            <Input
                                type="text"
                                label="Tags *"
                                placeholder="apple,flagship,.."
                                {...register('tags', { required: `Separate related tags with a comma`,})}
                            />
                            {errors.tags && (
                                <p className="text-error">{String(errors.tags.message)}</p>
                            )}
                        </div>
                        <div className="mt-2">
                            <Input
                                type="text"
                                label="Warranty *"
                                placeholder="1 Year/ No warranty"
                                {...register('warranty', {required: `Warranty is required`,})}
                            />
                            {errors.warranty && (
                                <p className="text-error">{String(errors.warranty.message)}</p>
                            )}
                        </div>
                        <div className="mt-2">
                            <Input
                                label="Slug *"
                                placeholder="product-slug"
                                {...register('slug', {
                                    required: `Slug is required`,
                                    pattern: {
                                    value: /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
                                    message: `Invalid slug format! Use only lower case letters or numbers`,
                                    },
                                    minLength: {
                                    value: 3,
                                    message: `Slug must be at least 3 characters long`,
                                    },
                                    maxLength: {
                                    value: 100,
                                    message: `Slug cannot go beyond 100 characters`,
                                    },
                                })}
                            />
                            {errors.slug && (
                                <p className="text-red-500 text-sm mt-2">{String(errors.slug.message)}</p>
                            )}
                        </div>
                        <div className="mt-2">
                            <Input
                                type="text"
                                label="Brand "
                                placeholder="Apple"
                                {...register('brand')}
                            />
                            {errors.brand && (
                                <p className="text-error">{String(errors.brand.message)}</p>
                            )}
                        </div>
                        <div className='mt-2'>
                            <ColorSelector control={control} errors={errors}/>
                        </div>
                        <div className='mt-2'>
                            <CustomSpecification control={control} errors={errors}/>
                        </div>
                        <div className='mt-2'>
                            <CustomProperties control={control} errors={errors}/>
                        </div>
                        <div className="mt-2">
                            <label className="block font-semibold text-gray-300 mb-1">
                                Cash on Delivery
                            </label>
                            <select
                                defaultValue="yes"
                                {...register('cashOnDelivery', {
                                    required: `Cash on Delivery is required`,
                                })}
                                className="w-full p-2 rounded-md border border-gray-700 bg-black outline-none"
                            >
                                <option value="">Select</option>
                                <option value="yes">Yes</option>
                                <option value="no">No</option>
                            </select>
                            {errors.cashOnDelivery && (
                                <p className="text-error">
                                    {String(errors.cashOnDelivery.message)}
                                </p>
                            )}
                        </div>
                    </div>
                    
                    {/* Right side */}
                    <div className='w-full md:w-2/4'>

                    </div>
                </div>
            </div>
        </div>
    </form>
  )
}

export default CreateProduct