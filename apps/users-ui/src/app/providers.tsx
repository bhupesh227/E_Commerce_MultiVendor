'use client';

import { ReactNode, useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import useUser from '../hooks/useUser';
import { WebSocketProvider } from '../context/web-socket-context';

interface Props {
  children?: ReactNode;
}

const Providers = ({ children }: Props) => {
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        refetchOnWindowFocus: false,
        staleTime: 1000 * 60 * 5, 
      },
    },
  }));
  return (
    <QueryClientProvider client={queryClient}>
        <ProviderWithWebSocket>
          {children}
        </ProviderWithWebSocket>
    </QueryClientProvider>
  );
};



const ProviderWithWebSocket = ({children}:{ children: ReactNode }) => {
  const  {user ,isLoading} = useUser();
  if (isLoading) {
    return <div>Loading...</div>; 
  }
  
  return (
    <>
      {user ? (
        <WebSocketProvider user={user}>
          {children}
        </WebSocketProvider>
      ) : (
        children
      )}
    </>
  )
}
export default Providers;