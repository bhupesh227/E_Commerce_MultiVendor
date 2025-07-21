"use client";
import React ,{useState} from 'react';
import type { PickerProps } from 'emoji-picker-react';
import { ImageIcon, Send, Smile } from 'lucide-react';
import dynamic from 'next/dynamic';


const EmojiPicker = dynamic(() => import('emoji-picker-react').then(
    (mod) => mod.default as React.FC<PickerProps>),
    { ssr: false }
);

type ChatProps = {
    onSendMessage: (e: any) => void;
    message: string;
    setMessage: React.Dispatch<React.SetStateAction<string>>;
};


const ChatInput = ({onSendMessage,message,setMessage}:ChatProps) => {
    const [showEmoji, setShowEmoji] = useState(false);

    const handleEmojiClick = (emojiData: any) => {
        setMessage((prev) => prev + emojiData.emoji);
        setShowEmoji(false);
    };

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];   
        if (file) {
            console.log("Uploading File",file.name);
        }
    };

  return (
    <form
        className='border-t border-t-slate-700 bg-slate-950 p-4 flex items-center gap-2 relative'
        onSubmit={onSendMessage}
    >
        <label className='cursor-pointer p-2 hover:bg-gray-100 rounded-md'>
            <ImageIcon className='w-5 h-5 text-gray-300' />
            <input
                type='file'
                accept='image/*'
                onChange={handleImageUpload}
                hidden
            />
        </label>
        <div className='relative'>
            <button
                type='button'
                className='p-2 hover:bg-gray-800 rounded-md'
                onClick={() => setShowEmoji(prev => !prev)}
            >
                <Smile className='w-5 h-5 text-gray-300' />
            </button>
            {showEmoji && (
                <div className='absolute bottom-12 left-0 z-50 mb-2'>
                    <EmojiPicker onEmojiClick={handleEmojiClick} />
                </div>
            )}
        </div>
        <input
            type='text'
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder='Type a message...'
            className='flex-1 p-2 border border-gray-300 rounded-md text-black text-sm'
        />
        <button
            type='submit'
            className='bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition '
        >
            <Send className='w-5 h-5' />
        </button>
    </form>
  );
};

export default ChatInput;