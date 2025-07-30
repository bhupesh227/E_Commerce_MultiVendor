"use client";

import { useQuery } from '@tanstack/react-query';
import { aiEnhancements, REQUIRED_BASE_EFFECTS } from 'apps/sellers-ui/src/constants';
import ImagePlaceholder from 'apps/sellers-ui/src/shared/components/ImagePlaceholder';
import axiosInstance from 'apps/sellers-ui/src/utils/axiosInstance';
import { ChevronRight, LoaderCircle, Wand, X } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import ColorSelector from 'packages/components/ColorSelector';
import CustomProperties from 'packages/components/CustomProperties';
import CustomSpecification from 'packages/components/CustomSpecification';
import Input from 'packages/components/Input';
import RichTextEditor from 'packages/components/RichTextEditor';
import SizeSelector from 'packages/components/SizeSelector';
import React, { useMemo, useState } from 'react'
import { Controller, useForm } from 'react-hook-form';
import { toast } from 'sonner';

type FormData = {
    discountCodes: string[];
    title: string;
    description: string;
    tags: string;
    warranty: string;
    slug: string;
    brand: string;
    cashOnDelivery: string;
    category: string;
    subcategory: string;
    detailedDescription: string;
    videoUrl: string;
    regularPrice: number;
    salePrice: number;
    stock: number;
    images: (UploadedImage | null)[];
    colors: string[];
    customSpecifications: { name: string; value: string }[];
    customProperties: { label: string; values: string[] }[];
    sizes: string[];
    startingDate: string; 
    endingDate: string;   
};

type UploadedImage = {
    fileUrl: string;
    fileId: string;
};


const CreateEvent = () => {
    const defaultValues: FormData = {
        discountCodes: [],
        title: '',
        description: '',
        tags: '',
        warranty: '',
        slug: '',
        brand: '',
        cashOnDelivery: 'yes',
        category: '',
        subcategory: '',
        detailedDescription: '',
        videoUrl: '',
        regularPrice: 0,
        salePrice: 0,
        stock: 1,
        images: [null],
        colors: [],
        customSpecifications: [],
        customProperties: [],
        sizes: [],
        startingDate: '', 
        endingDate: '',   
    };
    const { register, control,watch, setValue, handleSubmit,formState: { errors }} = useForm({defaultValues,mode: 'onChange'});
    
    const [openImageModal, setOpenImageModal] = useState(false);
    const [isChanged, setIsChanged] = useState(false);
    const [images, setImages] = useState<(UploadedImage | null)[]>([null]);
    const [Loading, setLoading] = useState(false);
    const [selectedImage, setSelectedImage] = useState<string | null>(null);
    const [isUploading, setIsUploading] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [activeEffect, setActiveEffect] = useState<string []>([]);
    const [Processing, setProcessing] = useState(false);
    const [formSubmitted, setFormSubmitted] = useState(false);

    const router = useRouter();

    const {data, isLoading, isError}= useQuery({
        queryKey: ['categories'],
        queryFn: async () => {
            try {
                const response = await axiosInstance.get('/product/api/get-categories');
                return response.data;
            } catch (error) {
                console.error('Error fetching categories:', error);
                return [];
            }
        },
        staleTime: 1000 * 60 * 5,
        retry: 2,
    });

    const categories = data?.categories || [];
    const subCategoriesData = data?.subCategories || {};

    const selectedCategory = watch('category');
    const regularPrice = watch('regularPrice');
    const startingDate = watch('startingDate'); 
    
    const subCategories = useMemo(() => {
        return selectedCategory ? subCategoriesData[selectedCategory] || [] : [];
    }, [selectedCategory, subCategoriesData]);

    const { data: discount_codes, isLoading: isDiscountLoading } = useQuery({
        queryKey: ['discount-codes'],
        queryFn: async () => {
            const response = await axiosInstance.get('/product/api/get-discount-codes');
            return response.data.discountCodes || [];
        },
        staleTime: 1000 * 60 * 5,
        retry: 2,
    });

    const convertFileToBase64 =async (file: File) => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => resolve(reader.result);
            reader.onerror = (error) => reject(error);
        });
    };

    const handleImageChange = async (file: File | null, index: number) => {
        if(!file) return;
        setIsUploading(true);
        try {
            const fileName = await convertFileToBase64(file);
            const response = await axiosInstance.post("/product/api/upload-event-image", { fileName});
            const updatedImages = [...images];
            const uploadedFile = {
                fileId: response.data.fileId,
                fileUrl: response.data.fileUrl,
            };
            updatedImages[index] = uploadedFile;
            if (index == images.length - 1 && images.length < 8) {
                updatedImages.push(null);
            }
            setImages(updatedImages);
            setValue('images', updatedImages);
        } catch (error) {
            console.error("Error uploading image:", error);
        } finally{
            setIsUploading(false);  
        }
    };

    const handleRemoveImage = async (index: number) => {
        setIsDeleting(true);
        try {
            const updatedImages = [...images];
            const imageToRemove = updatedImages[index];
            if(imageToRemove && typeof imageToRemove === "object") {
                await axiosInstance.delete("/product/api/delete-product-image", {
                    data: { fileId: imageToRemove.fileId },
                });
            }
            updatedImages.splice(index, 1);
            if (!updatedImages.includes(null) && updatedImages.length < 8) {
                updatedImages.push(null);
            }
            setImages([...updatedImages]);
            setValue('images', [...updatedImages]);
        } catch (error) {
            console.error("Error removing image:", error);
            
        } finally{
            setIsDeleting(false);
        }
    };

    const handleSaveDraft = () => {
        
    };

    const applyTransformation = async (effect: string) => {
        if (Processing || !selectedImage) return;
        setProcessing(true);
        try {
            const [baseUrl] = selectedImage.split('?tr=');
            let updatedEffects = [...activeEffect];
            const dependencies = REQUIRED_BASE_EFFECTS[effect] || [];
            dependencies.forEach((dep) => {
                if (!updatedEffects.includes(dep)) {
                    updatedEffects.push(dep);
                }
            });
            if (updatedEffects.includes(effect)) {
                updatedEffects = updatedEffects.filter((e) => e !== effect);
                Object.entries(REQUIRED_BASE_EFFECTS).forEach(([dependent, deps]) => {
                    if (deps.includes(effect)) {
                    updatedEffects = updatedEffects.filter((e) => e !== dependent);
                    }
                });
            } else {
                updatedEffects.push(effect);
            }
            const transformedUrl = `${baseUrl}?tr=${updatedEffects.join(':')}`;
            setSelectedImage(transformedUrl);
            setActiveEffect(updatedEffects);
        } catch (error) {
            console.error('Error applying transformation:', error);
        } finally {
            setProcessing(false);
        }
    };

    const onSubmit = async (data: FormData) => {
        setLoading(true);
        try {
            setFormSubmitted(true);
            if (images.length === 0 || images.every(img => img === null)) {
                toast.error('Please upload at least one event image');
                return;
            }
            const payload = {
                ...data,
                shortDescription: data.description,
                subCategory: data.subcategory,
                cashOnDelivery: data.cashOnDelivery === 'yes',
                images: (data.images || []).filter(
                    (img) => img && img.fileId && img.fileUrl
                ),
            };
            await axiosInstance.post('/product/api/create-event', payload); 
            
            toast.success('Event created successfully');
            setIsChanged(false);
            router.push('/dashboard/all-events'); 

        } catch (error: any) {
            const message =
                error?.response?.data?.message ||
                error?.data?.message ||
                error?.message ||
                'Something went wrong';
            toast.error(message);
        } finally {
            setLoading(false);
        }
    };

 return (
    <form className="w-full mx-auto p-8 shadow-md rounded-lg text-white"
      onSubmit={handleSubmit(onSubmit)}>
        <h2 className="text-2xl py-2 font-semibold font-Poppins text-white">
            Create Event
        </h2>
        <div className="flex items-center">
            <Link href="/dashboard" className="text-[#80deea] cursor-pointer">
                Dashboard
            </Link>
            <ChevronRight size={20} className="opacity-[0.98]" />
            <span>Create Event</span>
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
                        setSelectedImage={setSelectedImage}
                        images={images}
                        isUploading={isUploading}
                        isDeleting={isDeleting}
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
                            setSelectedImage={setSelectedImage}
                            images={images}
                            isUploading={isUploading}
                            isDeleting={isDeleting}
                        />
                    ))}
                </div>
                {formSubmitted && images.length === 0 && (
                    <p className="text-red-500 text-sm mt-2">
                        Please upload at least one event image
                    </p>
                )}
            </div> 

            <div className='md:w-[65%]'>
                <div className='w-full flex max-md:flex-col gap-6'>
                    <div className='w-full md:w-2/4'>
                        <Input
                            type="text"
                            label="Event Title *"
                            placeholder="Enter event title"
                            {...register('title', {
                                required: `Title is required`,
                                minLength: { value: 3, message: 'Title must be at least 3 characters' },
                                maxLength: { value: 40, message: 'Title must be under 40 characters' },
                                pattern: {
                                    value: /^[A-Za-z\s\-']+$/,
                                    message: 'Title must not contain numbers or special characters',
                                },
                            })}
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
                                placeholder="Enter event description for quick view"
                                {...register('description', {
                                    required: `Description is required`,
                                    validate: (value) => {
                                        const wordCount = value.trim().split(/\s+/).length;
                                        if (/^[^a-zA-Z0-9]+$/.test(value)) return 'Description cannot be just symbols';
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
                                placeholder="sale,flash-sale,.."
                                {...register('tags', { 
                                    required: `Separate related tags with a comma`,
                                    validate: (value) => {
                                        const tags = value.split(',').map(t => t.trim()).filter(Boolean);
                                        if (tags.length === 0) return 'Please provide at least one tag';
                                        if (tags.length > 10) return 'You can only provide up to 10 tags';
                                        if (tags.some(tag => /\d/.test(tag))) return 'Tags should not contain numbers';
                                        return true;
                                    }
                                })}
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
                                {...register('warranty', {
                                    required: `Warranty is required`,
                                    pattern:{
                                        value: /^(\d+\s*(Month|Months|Year|Years))|No warranty$/i,
                                        message: 'Warranty must be like "1 Year", "2 Years", or "No warranty"', 
                                    }
                                })}
                            />
                            {errors.warranty && (
                                <p className="text-error">{String(errors.warranty.message)}</p>
                            )}
                        </div>
                        <div className="mt-2">
                            <Input
                                label="Slug *"
                                placeholder="event-slug"
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
                    
                    <div className='w-full md:w-2/4'>
                        <label className="block font-semibold text-gray-300 mb-1">
                            Category *
                        </label>

                        {isLoading ? (
                            <div className="text-gray-400 flex items-center justify-center">
                                <LoaderCircle size={20} className="animate-spin" />
                            </div>
                        ) : isError ? (
                            <p className="text-error">Failed to Load categories</p>
                        ) : (
                            <Controller
                                control={control}
                                name="category"
                                rules={{ required: `Category is required`,}}
                                render={({ field }) => (
                                    <select
                                        {...field}
                                        className="w-full border border-gray-700 outline-none bg-black p-2 rounded-md"
                                    >
                                        <option value="">Select Category</option>
                                        {categories.map((category: string) => (
                                            <option key={category} value={category} className="bg-black">
                                                {category}
                                            </option>
                                        ))}
                                    </select>
                                )}
                            />
                        )}
                        {errors.category && (
                            <p className="text-error">{String(errors.category.message)}</p>
                        )}

                        <div className='mt-2'>
                            <label className="block font-semibold text-gray-300 mb-1">
                                Subcategory *
                            </label>
                            {isLoading ? (
                                <p className="text-gray-400">
                                    Loading subcategories...
                                </p>
                            ) : isError ? (
                                <p className="text-red-500">
                                    Failed to load subcategories
                                </p> 
                            ) : (
                                <Controller 
                                    name="subcategory"
                                    control={control}
                                    rules={{ required : "Subcategory is required! "}}
                                    render={({field}) => (
                                        <select
                                            {...field}
                                            className="w-full border outline-none border-gray-700 bg-transparent py-1 px-2 rounded-md"
                                        >
                                            
                                            <option value="" className="bg-black">
                                                Select Subcategory
                                            </option>

                                            { subCategories.map((subcategory : string, index:number) => (
                                                <option value={subcategory} key={index} className="bg-black">
                                                    {subcategory}
                                                </option>
                                            )) }
                                        </select>
                                    )}
                                />
                            )}
                            {errors.subcategory && (
                                <p className="text-red-500 text-sm">
                                    {errors.subcategory.message as string}
                                </p>
                            )}
                        </div>
                        <div className="mt-2">
                            <label className="block font-semibold text-gray-300 mb-1">
                                Detailed description *
                            </label>
                            <Controller
                                control={control}
                                name="detailedDescription"
                                rules={{
                                    required: `Detailed description is required`,
                                    validate: (value) => {
                                        const textOnly = value
                                            .replace(/<[^>]+>/g, '')
                                            .replace(/&nbsp;/g, ' ')
                                            .trim();
                                        const wordCount = textOnly
                                            .split(/\s+/)
                                            .filter(Boolean).length;
                                        return (
                                            wordCount >= 50 ||
                                            `Description cannot be less than 50 words (Current: ${wordCount})`
                                        );
                                    },
                                }}
                                render={({ field }) => <RichTextEditor {...field} />}
                            />
                            {errors.detailedDescription && (
                                <p className="text-error">
                                    {String(errors.detailedDescription.message)}
                                </p>
                            )}
                        </div>
                        <div className="mt-2">
                            <Input
                                label="Video URL"
                                placeholder="https://www.youtoube.com/embed/something"
                                {...register('videoUrl', {
                                    pattern: {
                                        value:
                                            /^(https?:\/\/)?(www\.)?(youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)[a-zA-Z0-9_-]{11}$/,
                                        message: `Invalid YouTube URL`,
                                    },
                                })}
                            />
                            {errors.videoUrl && (
                                <p className="text-error"> {String(errors.videoUrl.message)} </p>
                            )}
                        </div>
                        <div className="mt-2">
                             <Input
                                 type="datetime-local"
                                 label="Starting Date *"
                                 {...register('startingDate', {
                                     required: 'Starting date is required',
                                     validate: value => new Date(value) > new Date() || 'Start date must be in the future',
                                 })}
                             />
                             {errors.startingDate && (
                                 <p className="text-error">{String(errors.startingDate.message)}</p>
                             )}
                         </div>
                         <div className="mt-2">
                             <Input
                                 type="datetime-local"
                                 label="Ending Date *"
                                 {...register('endingDate', {
                                     required: 'Ending date is required',
                                     validate: value => 
                                         (startingDate && new Date(value) > new Date(startingDate)) || 'End date must be after the start date',
                                 })}
                             />
                             {errors.endingDate && (
                                 <p className="text-error">{String(errors.endingDate.message)}</p>
                             )}
                         </div>
                        <div className="mt-2">
                            <Input
                                label="Regular Price *"
                                placeholder="1000"
                                {...register('regularPrice', {
                                    required: `Regular Price is required`,
                                    valueAsNumber: true,
                                    min: { value: 1, message: `Price must be greater than 0` },
                                    validate: (value) =>
                                        !isNaN(value) || `Only numbers are allowed`,
                                })}
                            />
                            {errors.regularPrice && (
                                <p className="text-error"> {String(errors.regularPrice.message)} </p>
                            )}
                        </div>
                        <div className="mt-2">
                            <Input
                                label="Sale Price *"
                                placeholder="20"
                                {...register('salePrice', {
                                    required: `Sale Price is required`,
                                    valueAsNumber: true,
                                    min: { value: 1, message: `Price must be greater than 0` },
                                    validate: (value) => {
                                        if (isNaN(value)) return `Only numbers are allowed`;
                                        if (regularPrice && value >= regularPrice)
                                            return `Sale price must be less than regular price`;
                                        return true;
                                    },
                                })}
                            />
                            {errors.salePrice && (
                                <p className="text-error"> {String(errors.salePrice.message)}</p>
                            )}
                        </div>
                        <div className="mt-2">
                            <Input
                                label="Stock *"
                                placeholder="100(Available)"
                                {...register('stock', {
                                    required: `Stock is required`,
                                    valueAsNumber: true,
                                    min: { value: 1, message: `Stock must be at least 1` },
                                    max: { value: 1000, message: `Stock cannot exceed 1000` },
                                    validate: (value) => {
                                        if (isNaN(value)) return `Only numbers are allowed`;
                                        if (!Number.isInteger(value))
                                            return `Stock must be a whole number`;
                                        return true;
                                    },
                                })}
                            />
                            {errors.stock && (
                                <p className="text-error">{String(errors.stock.message)}</p>
                            )}
                        </div>
                        <div className="mt-2">
                            <SizeSelector control={control} errors={errors} />
                        </div>
                        <div className="mt-3">
                            <label className="block font-semibold text-gray-300 mb-1">
                                Select Discount Codes (optional)
                            </label>

                            {isDiscountLoading ?(
                                <div className="text-gray-400 flex items-center justify-center">
                                    <LoaderCircle size={20} className="animate-spin" />
                                </div>
                            ):(
                                <div className="flex flex-wrap gap-2">
                                    {discount_codes.map((code:any)=>(
                                        <button
                                            key={code.id}
                                            className={`px-3 py-1 rounded-md text-sm font-semibold border ${
                                                watch('discountCodes')?.includes(code.id)
                                                    ? 'bg-blue-600 text-white border-blue-600'
                                                    : 'bg-gray-700 text-gray-300 border-gray-600 hover:border-gray-700'
                                                }`
                                            }
                                            onClick={() => {
                                                const currentSelection = watch('discountCodes') || [];
                                                const updatedSelection = currentSelection?.includes(code.id)
                                                    ? currentSelection.filter((id: string) => id !== code.id)
                                                    : [...currentSelection, code.id];
                                                setValue('discountCodes', updatedSelection);
                                            }}
                                        >
                                            {code.publicName} ({code.discountValue}{' '}
                                            {code.discountType === 'percentage' ? '%' : '₹'})
                                        </button>
                                    ))}
                                </div>
                            )} 
                        </div>
                    </div>
                </div>
            </div>
        </div>
        {openImageModal && (
            <div className="fixed top-0 left-0 w-full h-full bg-black bg-opacity-50 flex items-center justify-center">
                <div className="bg-gray-800 p-6 rounded-lg w-[450px] text-white">
                    <div className="flex justify-between items-center pb-3 mb-4">
                        <h2 className="text-lg font-semibold">Enhance event image</h2>
                        <X size={20} className="cursor-pointer" onClick={() => setOpenImageModal(!openImageModal)}/>
                    </div>
                    <div className="relative w-full h-[250px] rounded-md overflow-hidden border border-gray-600">
                        {selectedImage && (
                            <Image src={selectedImage} alt="selected image" fill unoptimized style={{objectFit:'cover'}}/>
                        )}
                    </div>
                    {selectedImage && (
                        <div className="mt-4 space-y-2">
                            {activeEffect.length > 0 && (
                                <div className="flex gap-2 mt-1 flex-wrap">
                                    {activeEffect.map(effect => (
                                    <span key={effect} className="px-2 py-1 text-sm bg-blue-600 text-white rounded">
                                        {effect.replace('e-', '').replace(/-/g, ' ')}
                                    </span>
                                    ))}
                                </div>
                            )}
                            <h3 className="text-white text-sm font-semibold">
                                AI Enhancements
                            </h3>
                            <div className="grid grid-cols-2 gap-3 max-h-[250px] overflow-y-auto">
                                {aiEnhancements.map(({ label, effect }) => (
                                    <button
                                        key={effect}
                                        className={`p-2 rounded-md flex items-center gap-2 whitespace-nowrap ${
                                            activeEffect.includes(effect)
                                                ? 'bg-blue-600 text-white'
                                                : 'bg-gray-700 hover:bg-gray-600 text-gray-300'
                                        }`}
                                        onClick={() => applyTransformation(effect)}
                                        disabled={Processing}
                                    >
                                        <Wand size={18} />
                                        {label}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        )}
        <div className='mt-6 flex justify-end gap-3'>
            {isChanged && (
                <button
                    type="button"
                    className="bg-gray-700 text-white px-4 py-2 rounded-md"
                    onClick={handleSaveDraft}
                >
                    Save Draft
                </button>
            )}
            <button
                type="submit"
                disabled={Loading}
                className="bg-blue-600 text-white px-4 py-2 rounded-md disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
                {Loading ? (
                    <LoaderCircle size={20} className="animate-spin" />
                ) : (
                    'Save Event'
                )}
            </button>
        </div>
    </form>
)
};

export default CreateEvent;