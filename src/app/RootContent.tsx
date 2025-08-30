'use client';

import { usePathname, useSearchParams } from 'next/navigation';
import TopBar from '@/components/TopBar';
import BottomNav from '@/components/BottomNav';
import Footer from '@/components/Footer';
import { Toaster } from '@/components/ui/toaster';
import OfferPopup from '@/components/OfferPopup';
import AdminNav from '@/components/AdminNav';
import { AuthProvider } from '@/context/AuthContext';
import { useEffect, useState } from 'react';
import LoadingScreen from '@/components/LoadingScreen';
import { useProductStore } from '@/lib/productStore';

export default function RootContent({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isLoading, setIsLoading] = useState(true);
  const { init, isLoading: productsLoading } = useProductStore();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const isAdminPage = pathname.startsWith('/admin');

  useEffect(() => {
    const initializeApp = async () => {
      // Initialize products
      await init();
      
      // Reduce loading time for better performance
      setTimeout(() => {
        setIsLoading(false);
      }, 300);
    };

    initializeApp();
  }, [init]);

  if (isLoading || productsLoading) {
    return <LoadingScreen />;
  }

  if (isAdminPage) {
    return (
      <>
        <AdminNav />
        <main className="container py-6 flex-grow">{children}</main>
      </>
    );
  }

  return (
    <>
      <div className="flex flex-col min-h-screen">
        <TopBar />
        <main className="container py-4 pb-24 md:pb-8 flex-grow">
          {children}
        </main>
        <Footer />
      </div>
      <BottomNav />
      <OfferPopup />
      <Toaster />
    </>
  );
}
