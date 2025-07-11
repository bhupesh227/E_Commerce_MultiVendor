"use client";
import { LoaderCircle, Pencil, WandSparkles, X } from 'lucide-react';
import Image from 'next/image';
import React, { ChangeEvent, useEffect, useState } from 'react'


type UploadedImage = {
    fileUrl: string;
    fileId: string;
};

interface ImagePlaceHolderProps {
    size: string;
    index: any;
    small?: boolean;
    onImageChange: (file: File | null, index: number) => void;
    onRemove: (index: number) => void;
    defaultImage?: string | null;
    setOpenImageModal: (openImageModal: boolean) => void;
    setSelectedImage: (image: string | null) => void;
    images: (UploadedImage | null)[];
    isUploading?: boolean;
    isDeleting?: boolean;
}


const ImagePlaceholder = ({
    size,
    index = null,
    small,
    onImageChange,
    onRemove,
    defaultImage = null,
    setOpenImageModal,
    setSelectedImage,
    images,
    isUploading,
    isDeleting 
}: ImagePlaceHolderProps) => {

    const [imagePreview, setImagePreview] = useState<string | null>(defaultImage);

    const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];

        if (file) {
        setImagePreview(URL.createObjectURL(file));
        onImageChange(file, index);
        }
    };

    useEffect(() => {
        const uploadedUrl = images[index]?.fileUrl;
        if (uploadedUrl) {
            setImagePreview(uploadedUrl);
        }
}, [images, index]);
  return (
    <div className={`relative ${small ? 'h-[180px]' : 'h-[450px]'
      } w-full cursor-pointer bg-[#1e1e1e] border border-gray-600 rounded-lg flex flex-col items-center justify-center`}>
        
        <input
            type="file"
            accept="image/*"
            className="hidden"
            id={`image-upload-${index}`}
            onChange={handleFileChange}
        />

        {imagePreview ? (
            <>
                <button
                    type="button"
                    disabled={isDeleting}
                    onClick={() =>{
                        onRemove?.(index!)
                        setImagePreview(null);
                    }}
                    className="absolute top-3 right-3 p-2 rounded bg-red-600 shadow-lg"
                >
                    {isDeleting ? (
                        <LoaderCircle className='animate-spin' size={16} />
                    ) : (
                        <X size={16} />
                    )}    
                </button>
                <button
                    disabled={isUploading}
                    className="absolute top-3 right-[70px] p-2 rounded bg-blue-500 shadow-lg cursor-pointer"
                    onClick={() => {
                        setOpenImageModal(true);
                        setSelectedImage(images[index]?.fileUrl || null);
                    }}
                    
                >
                    {isUploading ? (
                        <LoaderCircle className='animate-spin' size={16} />
                    ):(
                        <WandSparkles size={16} />
                    )}
                    
                </button>
            </>
        ) : (
            <label
                htmlFor={`image-upload-${index}`}
                className="absolute top-3 right-3 p-2 rounded bg-slate-700 shadow-lg cursor-pointer"
            >
                <Pencil size={16} />
            </label>
        )}

        {imagePreview ? (
            <Image
                src={imagePreview}
                alt="uploaded"
                width={400}
                height={300}
                className="w-full h-full object-cover rounded-lg"
            />
        ) : (
            <>
                <p
                    className={`text-gray-400 font-semibold ${
                    small ? 'text-xl' : 'text-4xl'
                    }`}
                >
                    {size}
                </p>
                <p
                    className={`text-gray-500 pt-2 text-center ${
                    small ? 'text-sm' : 'text-lg'
                    }`}
                >
                    Please choose an image <br />
                    according to the expected ratio
                </p>
            </>
        )}
    </div>
  )
}

export default ImagePlaceholder