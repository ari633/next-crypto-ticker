"use client";

import {
  QueryClient,
  QueryClientProvider,
} from "@tanstack/react-query";

import { SocketProvider } from '@/context/Socket'

const queryClient = new QueryClient();

const Providers = ({ children }) => {
  return (
    <QueryClientProvider client={queryClient}>
      <SocketProvider>
        {children}
      </SocketProvider>
    </QueryClientProvider>
  );
}

export default Providers;