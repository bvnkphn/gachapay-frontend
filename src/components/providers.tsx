"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider } from "next-themes";
import { Toaster } from "sonner";
import { useState } from "react";
import { SidebarProvider } from "@/components/sidebar-context";

export function Providers({ children }: { children: React.ReactNode }) {
    const [queryClient] = useState(() => new QueryClient());

    return (
        <QueryClientProvider client={queryClient}>
            <ThemeProvider attribute="class" defaultTheme="dark" disableTransitionOnChange>
                <SidebarProvider>
                    {children}
                </SidebarProvider>
                <Toaster
                    position="bottom-right"
                    toastOptions={{
                        style: {
                            background: 'var(--card)',
                            color: 'var(--card-foreground)',
                            border: '1px solid hsl(var(--border))',
                            borderRadius: '16px',
                            boxShadow: '0 10px 30px -10px rgba(0, 0, 0, 0.3)',
                            fontFamily: 'inherit',
                        },
                        success: {
                            style: {
                                border: '1px solid rgba(6, 182, 212, 0.4)', // cyan accent
                                boxShadow: '0 10px 25px -5px rgba(6, 182, 212, 0.15)',
                                background: 'var(--card)',
                                color: 'var(--card-foreground)',
                            },
                        },
                        error: {
                            style: {
                                border: '1px solid rgba(239, 68, 68, 0.4)', // red accent
                                boxShadow: '0 10px 25px -5px rgba(239, 68, 68, 0.15)',
                                background: 'var(--card)',
                                color: 'var(--card-foreground)',
                            },
                        },
                    }}
                />
            </ThemeProvider>
        </QueryClientProvider>
    );
}
