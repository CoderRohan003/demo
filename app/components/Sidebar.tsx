"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  Home,
  BookOpen,
  Layers,
  Shield,
  Cpu,
  UserCog,
  ChevronsLeft,
  ChevronDown,
  ChevronUp,
  X,
  Megaphone,
  BookCopy,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";

// =======================================================================
// NavItem Sub-component: A reusable component for each navigation link
// =======================================================================
type NavItemProps = {
  href: string;
  icon: React.ReactNode;
  label: string;
  isCollapsed: boolean;
  isActive: boolean;
  onClick?: (e: React.MouseEvent<HTMLElement>) => void;
  notificationCount?: number;
};

const NavItem = ({ href, icon, label, isCollapsed, isActive, onClick, notificationCount }: NavItemProps) => (
  <Link
    href={href}
    onClick={onClick}
    className={`
      relative flex items-center p-2.5 my-1 rounded-lg transition-colors duration-200
      ${isActive
        ? 'bg-blue-100 dark:bg-gray-700 text-blue-600 dark:text-blue-300 font-semibold'
        : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300'
      }
    `}
  >
    {/* Active link indicator bar */}
    <div className={`
      absolute left-0 top-0 h-full w-1 bg-blue-600 rounded-r-full
      transition-transform duration-300 ease-in-out
      ${isActive ? 'scale-y-100' : 'scale-y-0'}
    `}></div>

    {icon}

    <span className={`
      ml-4 whitespace-nowrap transition-opacity duration-200
      ${isCollapsed ? 'lg:opacity-0 lg:hidden' : 'opacity-100'}
    `}>
      {label}
    </span>

    {/* Notification Badge */}
    {notificationCount && notificationCount > 0 && (
       <span className={`
        ml-auto text-xs font-bold text-white bg-red-500 rounded-full
        flex items-center justify-center transition-all duration-200
        ${isCollapsed ? 'h-5 w-5' : 'h-6 w-6'}
        ${isCollapsed ? 'absolute top-1 left-[2.1rem]' : ''}
       `}>
         {notificationCount > 9 ? '9+' : notificationCount}
       </span>
    )}
  </Link>
);


// =======================================================================
// Main Sidebar Component
// =======================================================================
type SidebarProps = {
  isSidebarOpen: boolean;
  setIsSidebarOpen: (open: boolean) => void;
  isSidebarCollapsed: boolean;
  setIsSidebarCollapsed: (collapsed: boolean) => void;
};

const Sidebar = ({
  isSidebarOpen,
  setIsSidebarOpen,
  isSidebarCollapsed,
  setIsSidebarCollapsed,
}: SidebarProps) => {
  const { profile } = useAuth();
  const pathname = usePathname();

  const isClassesPathActive = pathname.startsWith("/class/");
  const [isClassesOpen, setIsClassesOpen] = useState(isClassesPathActive);

  const iconClass = "flex-shrink-0 w-6 h-6";

  const handleSidebarClick = () => {
    if (isSidebarCollapsed) {
      setIsSidebarCollapsed(false);
    }
  };

  const stopPropagation = (e: React.MouseEvent<HTMLElement>) => {
    e.stopPropagation();
  };

  return (
    <aside
      onClick={handleSidebarClick}
      className={`
        fixed top-0 left-0 h-screen bg-white dark:bg-gray-900 
        text-gray-900 dark:text-white flex flex-col shadow-2xl 
        transition-all duration-300 ease-in-out z-40 
        ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"}
        lg:translate-x-0 
        ${isSidebarCollapsed ? "lg:w-20" : "lg:w-64"}
        ${isSidebarCollapsed ? "cursor-pointer" : ""}
      `}
    >
      {/* --- Header with Logo and Title --- */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 h-[65px] overflow-hidden">
        <div className="flex items-center gap-2">
          {/* Logo: Only visible when collapsed on desktop */}
          <Image
            src="/favicon.ico"
            alt="Mise Logo"
            width={32}
            height={32}
            className={`flex-shrink-0 transition-all duration-300 ${
              isSidebarCollapsed ? "lg:opacity-100" : "lg:opacity-0 lg:w-0"
            }`}
          />
          {/* Title: Only visible when expanded */}
          <span
            className={`text-2xl font-bold whitespace-nowrap transition-opacity duration-200 ${
              isSidebarCollapsed ? "opacity-0" : "opacity-100"
            }`}
          >
            MISE Education
          </span>
        </div>

        <div className="flex items-center">
          <button onClick={(e) => { stopPropagation(e); setIsSidebarCollapsed(!isSidebarCollapsed); }} className="hidden lg:block p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700">
            <ChevronsLeft className={`transition-transform duration-300 ${isSidebarCollapsed ? "rotate-180" : ""}`} />
          </button>
          <button onClick={() => setIsSidebarOpen(false)} className="p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 lg:hidden">
            <X />
          </button>
        </div>
      </div>


      {/* Navigation */}
      <nav className="flex-grow px-2 py-4 flex flex-col overflow-y-auto">
        {profile?.role === "student" && (
          <>
            <NavItem href="/home" icon={<Home className={iconClass} />} label="Home" isCollapsed={isSidebarCollapsed} isActive={pathname === '/home'} onClick={stopPropagation} />
            <NavItem href="/library" icon={<BookCopy className={iconClass} />} label="Library" isCollapsed={isSidebarCollapsed} isActive={pathname === '/library'} onClick={stopPropagation} />
          </>
        )}

        <NavItem 
          href="/announcements" 
          icon={<Megaphone className={iconClass} />} 
          label="Announcements" 
          isCollapsed={isSidebarCollapsed} 
          isActive={pathname === '/announcements'} 
          onClick={stopPropagation} 
        />

        {/* Academic Classes Dropdown */}
        <div className="relative">
          {isClassesOpen && !isSidebarCollapsed && (
            <div className="absolute left-8 top-14 w-px bg-gray-300 dark:bg-gray-600 h-[calc(100%-4.5rem)]"></div>
          )}

          <button
            onClick={(e) => { stopPropagation(e); if (!isSidebarCollapsed) setIsClassesOpen(!isClassesOpen); }}
            className={`
              w-full flex items-center justify-between p-2.5 my-1 rounded-lg transition-colors duration-200
              ${isClassesPathActive
                ? 'bg-blue-100 dark:bg-gray-700 text-blue-600 dark:text-blue-300 font-semibold'
                : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300'
              }
              ${isSidebarCollapsed ? 'cursor-default' : ''}
            `}
          >
            <div className="flex items-center">
                <BookOpen className={iconClass} />
                <span className={`ml-4 whitespace-nowrap transition-opacity duration-200 ${isSidebarCollapsed ? 'lg:opacity-0 lg:hidden' : 'opacity-100'}`}>
                    Academic Classes
                </span>
            </div>
            <div className={`transition-opacity duration-200 ${isSidebarCollapsed ? 'lg:opacity-0 lg:hidden' : ''}`}>
                {isClassesOpen ? <ChevronUp /> : <ChevronDown />}
            </div>
          </button>
          {isClassesOpen && !isSidebarCollapsed && (
            <div className="pl-8 mt-2 flex flex-col space-y-1">
              {[6, 7, 8, 9, 10, 11, 12].map((cls) => (
                <Link
                  key={cls}
                  href={`/class/${cls}`}
                  onClick={stopPropagation}
                  className={`
                    relative p-1.5 rounded-md text-sm transition-colors
                    ${pathname === `/class/${cls}`
                      ? 'text-blue-600 dark:text-blue-300 font-bold'
                      : 'text-gray-500 dark:text-gray-400 hover:text-black dark:hover:text-white'
                    }
                  `}
                >
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 h-px w-4 bg-gray-300 dark:bg-gray-600"></div>
                  <span className="ml-5">Class {cls}</span>
                </Link>
              ))}
            </div>
          )}
        </div>

        <NavItem href="/coding-ai" icon={<Cpu className={iconClass} />} label="Coding & AI" isCollapsed={isSidebarCollapsed} isActive={pathname === '/coding-ai'} onClick={stopPropagation} />

        {(profile?.role === "student" || profile?.role === "teacher") && (
          <NavItem href="/batches" icon={<Layers className={iconClass} />} label="My Batches" isCollapsed={isSidebarCollapsed} isActive={pathname === '/batches'} onClick={stopPropagation} />
        )}

        {profile?.role === "teacher" && (
          <NavItem href="/admin/upload" icon={<Shield className={iconClass} />} label="Admin Panel" isCollapsed={isSidebarCollapsed} isActive={pathname.startsWith('/admin')} onClick={stopPropagation} />
        )}

        {profile?.role === "super-admin" && (
          <NavItem href="/super-admin" icon={<UserCog className={iconClass} />} label="Super Admin" isCollapsed={isSidebarCollapsed} isActive={pathname.startsWith('/super-admin')} onClick={stopPropagation} />
        )}
      </nav>

      {/* Footer */}
      <div className="p-4 mt-auto border-t border-gray-200 dark:border-gray-700">
        <div className={`text-center transition-opacity duration-200 ${isSidebarCollapsed ? "lg:opacity-0 lg:hidden" : ""}`}>
             <p className="text-sm text-gray-400 dark:text-gray-500">© 2025 mise.org.in</p>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;