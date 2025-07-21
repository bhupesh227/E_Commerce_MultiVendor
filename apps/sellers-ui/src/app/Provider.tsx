'use client';

import { ReactNode, useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import useSeller from '../hooks/useSeller';
import { WebSocketProvider } from '../context/web-socket-context';

interface Props {
  children?: ReactNode;
}

const Provider = ({ children }: Props) => {
  const [queryClient] = useState(() => new QueryClient());
  return (
    <QueryClientProvider client={queryClient}>
      <ProviderWithWebSocket>
        {children}
      </ProviderWithWebSocket>
    </QueryClientProvider>
  );
};

const ProviderWithWebSocket = ({children}:{ children: ReactNode }) => {
  const  {seller ,isLoading} = useSeller();
  if (isLoading) {
    return null; 
  }
  
  return (
    <>
      {seller ? (
        <WebSocketProvider seller={seller}>
          {children}
        </WebSocketProvider>
      ) : (
        children
      )}
    </>
  )
}

export default Provider;