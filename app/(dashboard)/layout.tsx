'use client';
import Sidebar from '@/app/components/Sidebar';
import Navbar from '@/app/components/Navbar';
import { DateProvider } from '@/context/DateContext';
import { useState } from 'react';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-white print:h-auto print:overflow-visible">
      <Sidebar
        isSidebarOpen={isSidebarOpen}
        setIsSidebarOpen={setIsSidebarOpen}
        isSidebarCollapsed={isSidebarCollapsed}
        setIsSidebarCollapsed={setIsSidebarCollapsed}
      />
      
      {isSidebarOpen && (
        <div 
          onClick={() => setIsSidebarOpen(false)}
          className="fixed inset-0 z-30 bg-black/50 lg:hidden print:hidden"
        ></div>
      )}

      {/* --- CHANGE IS HERE --- */}
      {/* The transition is now specifically on 'margin-left' for better performance */}
      <div className={`flex flex-1 flex-col transition-[margin-left] duration-300 ease-in-out print:ml-0 ${isSidebarCollapsed ? 'lg:ml-20' : 'lg:ml-64'}`}>
        <DateProvider>
          <Navbar setIsSidebarOpen={setIsSidebarOpen} />
          <main className="flex-grow p-4 md:p-6 overflow-y-auto print:overflow-visible">
            {children}
          </main>
        </DateProvider>
      </div>
    </div>
  );
}