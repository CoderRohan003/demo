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

  return (
    // Added print styles to allow the container to expand
    <div className="flex h-screen overflow-hidden bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-white print:h-auto print:overflow-visible">
      {/* Sidebar */}
      <Sidebar isSidebarOpen={isSidebarOpen} setIsSidebarOpen={setIsSidebarOpen} />
      
      {/* Overlay for mobile */}
      {isSidebarOpen && (
        <div 
          onClick={() => setIsSidebarOpen(false)}
          className="fixed inset-0 z-30 bg-black/50 lg:hidden print:hidden" // Hide overlay on print
        ></div>
      )}

      {/* Main Content Area */}
      <div className="flex flex-1 flex-col transition-all duration-300 lg:ml-64 print:ml-0"> {/* Remove margin on print */}
        <DateProvider>
          <Navbar setIsSidebarOpen={setIsSidebarOpen} />
          
          {/* Added print style to make the main content area visible */}
          <main className="flex-grow p-4 md:p-6 overflow-y-auto print:overflow-visible">
            {children}
          </main>
        </DateProvider>
      </div>
    </div>
  );
}