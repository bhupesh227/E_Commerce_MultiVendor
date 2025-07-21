"use client";
import React ,{Suspense, useEffect,useRef,useState} from 'react'
import { useRouter, useSearchParams } from 'next/navigation';
import { Loader2 , CheckCheck} from 'lucide-react';
import Image from 'next/image';
import useSeller from 'apps/sellers-ui/src/hooks/useSeller';
import { useWebSocket } from 'apps/sellers-ui/src/context/web-socket-context';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import axiosInstance from 'apps/sellers-ui/src/utils/axiosInstance';
import ChatInput from 'apps/sellers-ui/src/shared/components/ChatInput';




const ChatPage= ( )=> {
    const searchParams = useSearchParams();
    const router = useRouter();
    const messageConatinerRef = useRef<HTMLDivElement | null>(null);
    const {seller } = useSeller();
    const conversationId = searchParams.get("conversationId");
    const {ws } = useWebSocket();
    const queryClient = useQueryClient();

    const [chats, setChats] = useState<any[]>([]);
    const [selectedChat, setSelectedChat] = useState<any|null>(null);
    const [message, setMessage] = useState("");
    const [hasFetchedOnce, setHasFetchedOnce] = useState(false);

    const {data: messages = []} = useQuery({
        queryKey: ['messages', conversationId],
        queryFn: async () => {
            if (!conversationId || hasFetchedOnce) return [];
            const response = await axiosInstance.get(`/chatting/api/get-seller-messages/${conversationId}?page=1`);

            setHasFetchedOnce(true);
            return response.data.messages.reverse();
        },
        enabled: !!conversationId,
        staleTime: 1000 * 60 * 2,
    });

    useEffect(() => {
        if (!conversationId || messages.length === 0) return;
        const timeout = setTimeout(scrollToBottom, 100);
        return () => clearTimeout(timeout);
    }, [conversationId, messages.length]);

    useEffect(()=> {
        if (conversationId && chats.length >0){
            const chat = chats.find((c) => c.conversationId === conversationId);
            setSelectedChat(chat || null);
        }
    },[conversationId , chats]);

    const scrollToBottom = () => {
        requestAnimationFrame(() => {
            setTimeout(() => {
                const container = messageConatinerRef.current;
                if (container) {
                    container.scrollTop = container.scrollHeight;
                }
            }, 50);
        });
    };

    const {data: conversations, isLoading} = useQuery({
        queryKey: ['conversations'],
        queryFn: async () => {
            const response = await axiosInstance.get('/chatting/api/get-seller-conversations');
            return response.data.conversations;
        },
    });

    useEffect(() => {
        if (conversations) setChats(conversations);
    }, [conversations]);

    useEffect(() => {
        if (!ws) return;
        ws.onmessage = (event:any) => {
            const data = JSON.parse(event.data);
            if (data.type === 'NEW_MESSAGE') {
                const newMsg = data?.payload;
                if(newMsg.conversationId === conversationId) {
                    queryClient.setQueryData(['messages', conversationId], (old: any = []) => [
                       ...old, 
                       {
                            content : newMsg.messageBody || newMsg.content || "",
                            senderType : newMsg.senderType,
                            seen : false,
                            createdAt : newMsg.createdAt || new Date().toISOString(),
                        }
                    ]);
                    scrollToBottom();
                }
                setChats((prevChats) => 
                    prevChats.map((chat) => 
                        chat.conversationId === newMsg.conversationId
                            ? { ...chat , lastMessage :newMsg.content}
                            : chat
                    )
                );
            }

            if (data.type === 'UNSEEN_COUNT_UPDATE') {
                const {conversationId , count }= data.payload;
                setChats((prevChats) => 
                    prevChats.map((chat) => 
                        chat.conversationId === conversationId 
                            ? { ...chat, unreadCount: count }
                            : chat
                    )
                );
            }
        };
    }, [ws, conversationId]);


    const handleChatSelect = (chat: any) => {
        setHasFetchedOnce(false);
        setChats((prev) =>
            prev.map((c) => 
                c.conversationId === chat.conversationId ? { ...c, unreadCount: 0 } : c
            )
        );
        router.push(`?conversationId=${chat.conversationId}`);

        if (ws && ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify({
                type: 'MARK_AS_SEEN',
                conversationId: chat.conversationId,  
            }));
        }
    };

    const handleSend = (e:any) =>{
        e.preventDefault();
        if (!message.trim() || !selectedChat || !ws || ws.readyState !== WebSocket.OPEN) return;

        const payload = {
            fromUserId: seller.id,
            toUserId : selectedChat.user.id,
            conversationId: selectedChat.conversationId,
            messageBody: message,
            senderType: 'seller',
        };

        ws.send(JSON.stringify(payload));

        setMessage("");
        scrollToBottom();
    };

    return(
        <div className='w-full'>
            <div className='flex h-screen shadow-inner overflow-hidden bg-gray-950 text-white'>
                <div className='w-[320px] border-r border-gray-800 bg-gray-900'>
                    <div className='p-4 border-b border-gray-800 text-lg font-semibold'>
                        Messages
                    </div>
                    <div className='divide-y divide-gray-900'>
                        {isLoading ? (
                            <div className='flex justify-center items-center h-24'>
                                <Loader2 className='animate-spin h-6 w-6 text-blue-500' />
                            </div>
                            ) : chats.length === 0 ? (
                                    <p className='p-4 text-center text-gray-500'>
                                        No conversations found.
                                    </p>  
                            ): (chats.map((chat) => {
                                const isActive = chat.conversationId === selectedChat?.conversationId;
                                return (
                                    <button
                                        key={chat.conversationId}
                                        className={`w-full text-left p-4 transition ${isActive ? 'bg-gray-800' : 'hover:bg-gray-400'}`}
                                        onClick={() => {
                                            handleChatSelect(chat);
                                        }}
                                    >
                                        <div className='flex items-center gap-3'>
                                            <Image
                                                src={chat.user?.avatar[0] || 'https://ik.imagekit.io/bhupesh227/ecomm/product/product-1752305092836_YimfOVAdR.jpg'}
                                                alt={chat.user?.name}
                                                width={40}
                                                height={40}
                                                className='rounded-full border w-[40px] h-[40px] object-cover'
                                            />
                                            <div className='flex-1'>
                                                <div className='flex items-center justify-between'>
                                                    <span className={`text-sm font-medium text-white capitalize`}>
                                                        {chat.user?.name || 'Unknown User'}
                                                    </span>
                                                    {chat.user?.isOnline && (
                                                        <span className='ml-1 w-2 h-2 bg-green-500 rounded-full inline-block'/>
                                                    )}
                                                </div>
                                                <div className='flex items-center justify-between'>
                                                    <p className={`text-xs text-gray-400 truncate max-w-[170px]`}>
                                                        {chat.lastMessage || 'No messages yet'}
                                                    </p>
                                                    {chat.unreadCount > 0 && (
                                                        <span className='bg-blue-600 text-white text-xs font-semibold px-2 py-1 rounded-full'>
                                                            {chat.unreadCount }
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </button>
                                )
                            })
                        )}
                    </div>
                </div>
                <div className='flex-1 flex flex-col bg-gray-950'>
                    {selectedChat ?(
                        <>
                            <div className='p-4 border-b border-gray-800 flex items-center gap-3'>
                                <Image
                                    src={selectedChat.user?.avatar[0] || 'https://ik.imagekit.io/bhupesh227/ecomm/product/product-1752305092836_YimfOVAdR.jpg'}
                                    alt={selectedChat.user?.name}
                                    width={40}
                                    height={40}
                                    className='rounded-full border w-[40px] h-[40px] object-cover border-gray-700'
                                />
                                <div>
                                    <h2 className='text-lg font-semibold text-white'>
                                        {selectedChat.user?.name || 'Unknown User'}
                                    </h2>
                                    <p className='text-sm text-gray-400'>
                                        {selectedChat.user?.isOnline ? 'Online' : 'Offline'} 
                                        {selectedChat.user?.isOnline && (
                                            <span className='ml-1 w-2 h-2 bg-green-500 rounded-full inline-block'/>
                                        )}
                                    </p>
                                </div>
                            </div>
                            <div className='flex-1 overflow-y-auto p-4 space-y-4 text-sm'
                                ref={messageConatinerRef}
                            >
                                {messages.map((msg:any, index:number) => (
                                    <div key={index} className={`flex flex-col max-w-[100%] ${msg.senderType === 'seller' ? 'items-end text-white' : 'items-start text-gray-200'}`}>
                                        <div className={`p-3 rounded-lg mb-2 shadow-md w-fit ${msg.senderType === 'seller' ? 'bg-blue-600 text-white' : 'bg-gray-800 text-gray-200'}`}>
                                            {msg.content}
                                        </div>
                                        <div className={`text-[11px] text-gray-400 mt-1 flex items-center gap-1 ${msg.senderType === 'seller' ? 'justify-end' : 'justify-start ml-1'}`}>
                                            {new Date(msg.createdAt).toLocaleTimeString([], {
                                                hour: '2-digit',
                                                minute: '2-digit',
                                            })}
                                            {msg.seen && <CheckCheck className='h-4 w-4 text-green-400' />}
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <ChatInput
                                message={message}
                                setMessage={setMessage}
                                onSendMessage={handleSend}
                            />
                        </>
                    ):(
                        <div className='flex flex-col items-center justify-center h-full text-gray-500'>
                            Select a conversation to start chatting.
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

const Page = () => {
  return (
    <Suspense fallback={
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="animate-spin h-12 w-12 text-blue-600" />
      </div>
    }>
      <ChatPage />
    </Suspense>
  )
}

export default Page