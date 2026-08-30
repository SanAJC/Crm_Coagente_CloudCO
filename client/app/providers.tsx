"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState, type ReactNode } from "react";

import { CrmProvider } from "@/lib/crm-store";
import { Toaster } from "@/components/ui/sonner";

export function Providers({ children }: { children: ReactNode }) {
  const [queryClient] = useState(() => new QueryClient());

  return (
    <QueryClientProvider client={queryClient}>
      <CrmProvider>
        {children}
        <Toaster />
      </CrmProvider>
    </QueryClientProvider>
  );
}
