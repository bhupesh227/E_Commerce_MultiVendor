"use client";

import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useWebSocket } from 'apps/users-ui/src/context/web-socket-context';
import useUserRequiredAuth from 'apps/users-ui/src/hooks/useUserRequiredAuth';
import ChatInput from 'apps/users-ui/src/shared/components/ChatInput';
import axiosInstance from 'apps/users-ui/src/utils/axiosInstance';
import { isProtected } from 'apps/users-ui/src/utils/isProtected';
import { Loader2 } from 'lucide-react';
import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';
import React, { Suspense, useEffect, useRef, useState } from 'react';



const InboxPageContent = () => {
    const searchParams = useSearchParams();
    const {user, } = useUserRequiredAuth();
    const router = useRouter();
    const messageConatinerRef = useRef<HTMLDivElement | null>(null);
    const scrollAnchorRef = useRef<HTMLDivElement | null>(null);
    const queryClient = useQueryClient();

    const [chats, setChats] = useState<any[]>([]);
    const [selectedChat, setSelectedChat] = useState<any|null>(null);
    const [message, setMessage] = useState("");
    const [hasMore , setHasMore] = useState(false);
    const [hasFetchedOnce, setHasFetchedOnce] = useState(false);
    const [page, setPage] = useState(1);

    const conversationId = searchParams.get("conversationId");
    const {ws ,} = useWebSocket();

    const {data: conversations, isLoading} = useQuery({
        queryKey: ['conversations'],
        queryFn: async () => {
            const response = await axiosInstance.get('/chatting/api/get-user-conversations',isProtected);
            return response.data.conversations;
            
        },
    });

    const {data: messages= []} = useQuery({
        queryKey: ['messages', conversationId],
        queryFn: async () => {
            if (!conversationId || hasFetchedOnce) return [];
            const response = await axiosInstance.get(`/chatting/api/get-messages/${conversationId}?page=1`, 
                isProtected
            );
            setPage(1);
            setHasFetchedOnce(true);
            setHasMore(response.data.hasMore);
            return response.data.messages.reverse();
        },
        enabled: !!conversationId,
        staleTime: 1000 * 60 * 2,
    });

    const loadMoreMessages = async () => {
        const nextPage = page + 1;
        const response = await axiosInstance.get(`/chatting/api/get-messages/${conversationId}?page=${nextPage}`, isProtected);
        queryClient.setQueryData(['messages', conversationId], (old: any[]) => [
            ...old,
            ...response.data.messages.reverse()
        ]);
        setPage(nextPage);
        setHasMore(response.data.hasMore);
    };

    useEffect(() => {
      if (conversations) setChats(conversations);
    }, [conversations]);

    useEffect(()=>{
      if (conversationId && chats.length > 0) {
        const chat = chats.find((c) => c.conversationId === conversationId);
        setSelectedChat(chat || null);
      }
    }, [conversationId, chats]);

    useEffect(()=>{
      if (messages?.length > 0 ) {
        scrollToBottom();
      }
    },[messages]);

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
                    content : newMsg.content ,
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
    }, [ws, queryClient]);

    const getLastMessage = (chat: any) => chat?.lastMessage || "";

    const handleChatSelect = (chat: any) => {
        setHasFetchedOnce(false);
        setChats(prev => prev.map((c) => c.conversationId === chat.conversationId ? {...c, unreadCount: 0} : c));
        router.push(`?conversationId=${chat.conversationId}`);
        ws?.send(JSON.stringify({
            type: 'MARK_AS_SEEN',
            conversationId: chat.conversationId,
          })
        );
    };


    const scrollToBottom = () => {
      requestAnimationFrame(() => {
        setTimeout(() => {
          scrollAnchorRef.current?.scrollIntoView({
            behavior: 'smooth',
          });
        }, 0);
      });
    }


    const handleSend = async (e:any) =>{
      e.preventDefault();  
      if (!message.trim() || !selectedChat) return; 

      const payload = {
        conversationId: selectedChat?.conversationId,
        fromUserId: user?.id,
        toUserId : selectedChat?.seller?.id,
        messageBody : message,
        senderType: "user",
      };

      ws?.send(JSON.stringify(payload));

      setChats((prevChats) =>
        prevChats.map((chat) =>
          chat.conversationId === selectedChat?.conversationId
            ? {
                ...chat,
                lastMessage: payload.messageBody,
              }
            : chat
        )
      );

      setMessage("");
      scrollToBottom();
    };
    

    return(
      <div className='w-full'>
        <div className='md:w-[80%]  mx-auto pt-4'>
          <div className='flex h-[80vh] shadow-sm overflow-hidden gap-4'>
            <div className='w-[320px] border-r border-gray-200 overflow-y-auto bg-gray-50'>
              <div className='p-4 border-b border-b-gray-200 text-lg font-semibold text-gray-800'>
                  Messages
              </div>
              <div className='divide-y divide-gray-300'>
                {isLoading ? (
                  <div className='flex justify-center items-center h-full'>
                    <Loader2 className='animate-spin h-12 w-12 text-blue-600' />
                  </div>
                  ) : chats.length=== 0 ?(
                    <div className='flex justify-center items-center h-full'>
                      <p className='text-gray-500'>No conversations found.</p>
                    </div>
                  ) : (
                    chats.map((chat) => {
                      const isActive = selectedChat?.conversationId === chat.conversationId;
                      return (
                        <button
                            key={chat.conversationId}
                            onClick={() => handleChatSelect(chat)}
                            className={`w-full text-left p-4 transition hover:bg-blue-100 ${isActive ? 'bg-blue-200' : ''}`}
                        >
                          <div className='flex items-center gap-2'>
                            <Image
                              src={chat.seller?.avatar?.[0] || '/defaultprofile.jpg'}
                              alt={chat.seller?.name || 'Seller Avatar'}
                              width={40}
                              height={40}
                              className='rounded-full border w-[40px] h-[40px] object-cover'
                            />
                            <div className='flex-1'>
                              <div className='flex items-center justify-between'>
                                <span className='text-gray-800 font-semibold'>
                                  {chat.seller?.name || 'Unknown Seller'}
                                </span>
                                {chat.seller?.isOnline && (
                                  <span className='text-green-500 rounded-full w-2 h-2'/>
                                )}
                                {chat.seller?.isOnline && (
                                  <span className='ml-1 w-2 h-2 bg-green-500 rounded-full inline-block'/>
                                )}
                              </div>
                              <div className='flex items-center justify-between mt-1'>
                                <p className='text-gray-600 text-sm truncate max-w-[170px]'>
                                  {getLastMessage(chat)}
                                </p>
                                {chat.unreadCount > 0 && (
                                  <span className='bg-blue-600 text-white text-xs font-semibold px-2 py-1 rounded-full'>
                                    {chat?.unreadCount}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        </button>
                      );
                    })
                )}
              </div>
            </div>
            <div className='flex-1 flex flex-col bg-gray-100'>
              {selectedChat ? (
                <>
                  <div className='p-4 border-b border-b-gray-200 bg-white flex items-center gap-4'>
                    <Image
                      src={selectedChat.seller?.avatar?.[0]?.url || '/defaultprofile.jpg'}
                      alt={selectedChat.seller?.name || 'Seller Avatar'}
                      width={40}
                      height={40}
                      className='rounded-full border w-[40px] h-[40px] object-cover'
                    />
                    <div>
                      <span className='text-lg font-semibold text-gray-800'>
                        {selectedChat.seller?.name || 'Unknown Seller'}
                      </span>
                      <p className='text-sm text-gray-500'>
                        {selectedChat.seller?.isOnline ? 'Online' : 'Offline'}
                      </p>
                    </div>
                  </div>
                  <div ref={messageConatinerRef} className='flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50'>
                    
                    {hasMore && (
                      <div className='flex justify-between mb-2'>
                        <button
                          onClick={loadMoreMessages}
                          className='mt-2 text-blue-600 hover:underline'
                        >
                          Load Previous messages
                        </button>
                      </div>
                    )}
                    {messages.map((msg :any, index:number) => (
                      <div key={index} className={`mb-2 flex flex-col max-w-[80%] ${msg.senderType === "user" ? 'items-end ml-auto' : 'items-start'}`}>
                        <div className={`p-2 rounded-lg shadow-sm w-fit ${msg.senderType === "user" ? 'bg-blue-600 text-white' : 'bg-white text-gray-800'}`}>
                          {msg.text || msg.content}
                        </div>
                        <div className={`text[11px] text-gray-400 mt-1 flex items-center ${msg.senderType === "user" ? 'mr-1 justify-end' : 'ml-1 justify-start'}`}>
                          {msg.time || new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </div>
                    ))}
                    <div ref={scrollAnchorRef}/>
                  </div>
                  <ChatInput
                    message={message}
                    setMessage={setMessage}
                    onSendMessage = {handleSend}
                  />
                </>
              ) : (
                  <div className='flex-1 flex items-center justify-center text-gray-500'>
                    <p className='text-lg'>Select a conversation to start chatting</p>
                  </div>
                )}
              </div>  
          </div>
        </div>
      </div>
    );

}
const Page = () => {
  return (
    <Suspense fallback={
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="animate-spin h-12 w-12 text-blue-600" />
      </div>
    }>
      <InboxPageContent />
    </Suspense>
  )
}

export default Page