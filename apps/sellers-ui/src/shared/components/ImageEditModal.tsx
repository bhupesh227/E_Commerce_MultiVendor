"use client";
import React, { ChangeEvent, useState } from 'react'
import axiosInstance from '../../utils/axiosInstance';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { X } from 'lucide-react';
import Image from 'next/image';

interface ImageEditModalProps {
  editType: 'avatar' | 'cover';
  onClose: () => void;
  currentImage?: string;
}

const ImageEditModal: React.FC<ImageEditModalProps> = ({ editType, onClose, currentImage }) => {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const queryClient = useQueryClient();

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);
      setPreview(URL.createObjectURL(selectedFile));
    }
  };

  const { mutate, isPending } = useMutation({
    mutationFn: async () => {
      if (!file) throw new Error("No file selected");

      const endpoint = editType === 'avatar' ? '/seller/api/update-shop-avatar' : '/seller/api/update-shop-cover';
      const fieldName = editType; 
      
      const formData = new FormData();
      formData.append(fieldName, file, file.name);
      
      const { data } = await axiosInstance.post(endpoint, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['seller'] });
      onClose();
    },
    onError: (error) => {
      console.error(`Error updating ${editType}:`, error);
      alert(`Failed to update ${editType}. Please try again.`);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;
    mutate();
  };

  const imageSrc = preview || currentImage || (editType === 'avatar' ? '/default-avatar.jpg' : '/default-cover.jpg');
  const aspectClass = editType === 'avatar' ? 'aspect-square' : 'aspect-video';
  const previewClass = editType === 'avatar' ? 'w-48 h-48 rounded-full' : 'w-full h-full';
  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex justify-center items-center z-50 p-4">
      <div className="bg-gray-800 p-6 rounded-lg shadow-xl w-full max-w-lg relative text-white">
        <button onClick={onClose} className="absolute top-3 right-3 text-gray-400 hover:text-white transition-colors">
          <X size={24} />
        </button>
        <h2 className="text-xl font-semibold mb-4 capitalize">Update {editType} Image</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="image-upload" className={`block w-full ${aspectClass} border-2 border-dashed border-gray-600 rounded-lg cursor-pointer flex flex-col justify-center items-center text-gray-400 hover:border-gray-500 hover:text-gray-300 transition-colors bg-gray-900 overflow-hidden`}>
                <Image src={imageSrc} alt="Preview" width={editType === 'avatar' ? 200 : 500} height={editType === 'avatar' ? 200 : 280} className={`object-cover ${previewClass}`} />
            </label>
            <input id="image-upload" type="file" className="hidden" accept="image/*" onChange={handleFileChange} />
             {file && <p className='text-sm text-gray-300 mt-2'>Selected: {file.name}</p>}
          </div>
          <div className="flex justify-end gap-4">
            <button type="button" onClick={onClose} className="px-4 py-2 rounded-md bg-gray-600 hover:bg-gray-500 transition-colors font-semibold">
              Cancel
            </button>
            <button type="submit" disabled={!file || isPending} className="px-4 py-2 rounded-md bg-blue-600 hover:bg-blue-500 disabled:bg-gray-500 disabled:cursor-not-allowed transition-colors font-semibold">
              {isPending ? 'Uploading...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default ImageEditModal