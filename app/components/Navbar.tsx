// Navbar.tsx
'use client';

import { useAuth } from '@/context/AuthContext';
import { useDate } from '@/context/DateContext';
import { Menu, Transition } from '@headlessui/react';
import { ChevronDown, User, LogOut, Calendar, Bell, Menu as MenuIcon } from 'lucide-react';
import { DayPicker } from 'react-day-picker';
import 'react-day-picker/dist/style.css';
import '@/app/globals.css';
import Link from 'next/link';

// Import both theme toggle components
import { ThemeToggleButton as PCThemeToggleButton } from './ThemeToggleButton';
import { ThemeToggleButton as MobileThemeToggleButton } from './ThemeToggleButtonMobile';

// Import the new custom hook
import { useIsMobile } from '@/lib/useIsMobile';

type NavbarProps = {
  setIsSidebarOpen: (open: boolean) => void;
};

export default function Navbar({ setIsSidebarOpen }: NavbarProps) {
  const { user, isLoading, logout } = useAuth();
  const { selectedDate, setSelectedDate } = useDate();
  
  // Call the custom hook
  const isMobile = useIsMobile();

  if (isLoading) {
    return (
      <header className="bg-[rgb(var(--card))] p-4 flex justify-between items-center border-b border-[rgb(var(--border))]">
        <div className="h-8 w-8 bg-[rgb(var(--background))] rounded-md animate-pulse lg:hidden"></div>
        <div className="flex-grow flex justify-end">
            <div className="h-8 w-32 bg-[rgb(var(--background))] rounded-md animate-pulse"></div>
        </div>
      </header>
    );
  }

  return (
    <header
      className="
        relative z-20 
        p-4 flex justify-between items-center 
        border-b border-[rgb(var(--border))]
        bg-gradient-to-r from-blue-700 via-blue-400 to-blue-200
        dark:from-blue-950 dark:via-slate-800 dark:to-slate-900
        shadow-lg
      "
    >
      <div className="flex items-center gap-4">
        <button 
          onClick={() => setIsSidebarOpen(true)}
          className="p-2 rounded-full text-[rgb(var(--foreground))] hover:bg-black/10 dark:text-white dark:hover:bg-white/10 transition-colors lg:hidden"
        >
          <MenuIcon size={24} />
        </button>
        <h1 className="text-2xl font-bold tracking-wide hidden sm:block text-white dark:text-white">Dashboard</h1>
      </div>

      <div className="flex justify-end items-center space-x-2 sm:space-x-4 text-[rgb(var(--foreground))] dark:text-white">
        {/* Conditional rendering based on screen size */}
        {isMobile ? <MobileThemeToggleButton /> : <PCThemeToggleButton />}

        <button className="p-2 rounded-full hover:bg-black/10 dark:hover:bg-white/10 transition-colors">
          <Bell size={20} />
        </button>

        <Menu as="div" className="relative">
          <Menu.Button className="p-2 rounded-full hover:bg-black/10 dark:hover:bg-white/10 transition-colors">
            <Calendar size={20} />
          </Menu.Button>
          <Transition
            enter="transition ease-out duration-100"
            enterFrom="transform opacity-0 scale-95"
            enterTo="transform opacity-100 scale-100"
            leave="transition ease-in duration-75"
            leaveFrom="transform opacity-100 scale-100"
            leaveTo="transform opacity-0 scale-95"
          >
            <Menu.Items className="absolute right-[-4rem] md:right-0 mt-2 w-auto origin-top-right rounded-md bg-[rgb(var(--card))] shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none p-2 border border-[rgb(var(--border))] z-50">
              <DayPicker
                mode="single"
                selected={selectedDate}
                onSelect={(day) => day && setSelectedDate(day)}
              />
            </Menu.Items>
          </Transition>
        </Menu>

        {user && (
          <Menu as="div" className="relative">
            <Menu.Button className="flex items-center space-x-2 p-2 rounded-md hover:bg-black/10 dark:hover:bg-white/10 transition-colors">
              <User size={20} />
              <span className="hidden sm:inline">{user.name}</span>
              <ChevronDown size={16} />
            </Menu.Button>
            <Transition
              enter="transition ease-out duration-100"
              enterFrom="transform opacity-0 scale-95"
              enterTo="transform opacity-100 scale-100"
              leave="transition ease-in duration-75"
              leaveFrom="transform opacity-100 scale-100"
              leaveTo="transform opacity-0 scale-95"
            >
              <Menu.Items className="absolute right-0 mt-2 w-48 origin-top-right divide-y divide-[rgb(var(--border))] rounded-md bg-[rgb(var(--card))] shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none border border-[rgb(var(--border))] z-50">
                <div className="px-1 py-1">
                  <Menu.Item>
                    {({ active }) => (
                      <Link
                        href="/profile"
                        className={`${
                          active
                            ? 'bg-[rgb(var(--primary))] text-[rgb(var(--primary-foreground))]'
                            : 'text-[rgb(var(--card-foreground))]'
                        } group flex w-full items-center rounded-md px-2 py-2 text-sm`}
                      >
                        <User className="mr-2 h-5 w-5" />
                        Profile
                      </Link>
                    )}
                  </Menu.Item>
                </div>
                <div className="px-1 py-1">
                  <Menu.Item>
                    {({ active }) => (
                      <button
                        onClick={logout}
                        className={`${
                          active
                            ? 'bg-[rgb(var(--destructive))] text-[rgb(var(--destructive-foreground))]'
                            : 'text-[rgb(var(--card-foreground))]'
                        } group flex w-full items-center rounded-md px-2 py-2 text-sm`}
                      >
                        <LogOut className="mr-2 h-5 w-5" />
                        Logout
                      </button>
                    )}
                  </Menu.Item>
                </div>
              </Menu.Items>
            </Transition>
          </Menu>
        )}
      </div>
    </header>
  );
}