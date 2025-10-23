"use client";

import { useState, useEffect } from "react";
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
  Clock,
  ClipboardList, // Ensure this icon is imported
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";

// =======================================================================
// NavItem Sub-component
// =======================================================================
type NavItemProps = {
  href: string;
  icon: React.ReactNode;
  label: string;
  isCollapsed: boolean;
  isActive: boolean;
  onMobileClick?: () => void;
  notificationCount?: number;
  disabled?: boolean;
};

const NavItem = ({ href, icon, label, isCollapsed, isActive, onMobileClick, notificationCount, disabled }: NavItemProps) => (
  <Link
    href={href}
    onClick={onMobileClick}
    className={`
        group relative flex items-center px-3 py-2.5 my-0.5 rounded-xl transition-all duration-200 cursor-${disabled ? 'not-allowed' : 'pointer'}
        ${isActive
        ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/30'
        : disabled
          ? 'bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-500 opacity-50'
          : 'hover:bg-gray-50 dark:hover:bg-gray-800/50 text-gray-700 dark:text-gray-300 hover:translate-x-1'
      }
        ${disabled ? 'pointer-events-none' : ''}
      `}
  >
    <div className={`flex-shrink-0 ${isActive ? 'text-white' : disabled ? 'text-gray-400 dark:text-gray-500' : 'text-gray-500 dark:text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-400'}`}>
      {icon}
    </div>

    <span className={`
        ml-3 font-medium whitespace-nowrap transition-opacity duration-200
        ${isCollapsed ? 'lg:opacity-0 lg:hidden' : 'opacity-100'}
        ${disabled ? 'text-gray-400 dark:text-gray-500' : ''}
      `}>
      {label}
    </span>

    {/* Notification Badge */}
    {notificationCount && notificationCount > 0 && !disabled && (
      <span className={`
          ml-auto text-xs font-bold text-white bg-red-500 rounded-full
          flex items-center justify-center shadow-lg transition-all duration-200
          ${isCollapsed ? 'h-5 w-5' : 'h-5 w-5'}
          ${isCollapsed ? 'absolute top-1 left-8' : ''}
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
  const isPendingTeacher = profile?.role === 'teacher' && profile.approved !== true;
  const isClassesPathActive = pathname.startsWith("/class/");
  const [isClassesOpen, setIsClassesOpen] = useState(isClassesPathActive);
  const iconClass = "flex-shrink-0 w-5 h-5";

  const handleSidebarClick = () => {
    if (isSidebarCollapsed && !isPendingTeacher) {
      setIsSidebarCollapsed(false);
    }
  };

  const stopPropagation = (e: React.MouseEvent<Element, MouseEvent>) => {
    e.stopPropagation();
  };

  const handleMobileNavClick = () => {
    if (window.innerWidth < 1024) {
      setIsSidebarOpen(false);
    }
  };

  const handleCollapseToggle = (e: React.MouseEvent) => {
    if (isPendingTeacher) {
      e.preventDefault();
      return;
    }
    stopPropagation(e);
    setIsSidebarCollapsed(!isSidebarCollapsed);
  };

  return (
    <aside
      onClick={handleSidebarClick}
      className={`
        fixed top-0 left-0 h-screen
        bg-white dark:bg-gray-950
        text-gray-900 dark:text-white flex flex-col
        transition-all duration-300 ease-in-out z-40
        ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"}
        lg:translate-x-0
        ${isSidebarCollapsed ? "lg:w-20" : "lg:w-64"}
        ${isSidebarCollapsed ? "cursor-pointer" : ""}
        ${isPendingTeacher ? 'cursor-not-allowed opacity-75' : ''}
      `}
    >
      {/* Right edge separator */}
      <div className="absolute top-0 right-0 h-full w-[3px] bg-gray-200 dark:bg-gradient-to-r dark:from-blue-900/50 dark:via-purple-900/30 dark:to-transparent"></div>

      {/* Pending Teacher Banner */}
      {isPendingTeacher && (
        <div className="p-4 border-b border-yellow-200 dark:border-yellow-800 bg-yellow-50 dark:bg-yellow-900/20">
          <div className="flex items-center gap-2 text-sm text-yellow-800 dark:text-yellow-200">
            <Clock className="w-4 h-4" />
            <span>Your account is under review. Admin access will be enabled soon.</span>
          </div>
        </div>
      )}

      {/* Header with Logo and Title */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 h-[65px] overflow-hidden">
        {/* Logo for mobile */}
        <Image
          src="/miselogo.png"
          alt="Mise Logo"
          width={50}
          height={50}
          className="flex-shrink-0 lg:hidden"
        />
        <div className="flex items-center justify-center gap-2 flex-1 lg:justify-center">
          {/* Logo: Desktop Collapsed */}
          <Image
            src="/miselogo.png"
            alt="Mise Logo"
            width={50}
            height={50}
            className={`hidden lg:block flex-shrink-0 transition-all duration-300 ${isSidebarCollapsed ? "lg:opacity-100" : "lg:opacity-0 lg:w-0"}`}
          />
          {/* Title */}
          <div className={`transition-opacity duration-200 ${isSidebarCollapsed ? "lg:opacity-0" : "lg:opacity-100"}`}>
            <span className="text-2xl font-bold text-blue-600 dark:text-blue-500">MISE</span>
          </div>
        </div>
        <div className="flex items-center gap-1">
          {/* Collapse Button */}
          <button
            onClick={handleCollapseToggle}
            disabled={isPendingTeacher}
            className={`hidden lg:flex items-center justify-center w-8 h-8 rounded-lg transition-colors ${isPendingTeacher ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-100 dark:hover:bg-gray-800'}`}
          >
            <ChevronsLeft className={`w-5 h-5 text-gray-600 dark:text-gray-400 transition-transform duration-300 ${isSidebarCollapsed ? "rotate-180" : ""}`} />
          </button>
          {/* Close Button Mobile */}
          <button
            onClick={() => setIsSidebarOpen(false)}
            className="flex lg:hidden items-center justify-center w-8 h-8 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            <X className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          </button>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-grow px-3 py-4 flex flex-col overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-700">
        {profile?.role === "student" && (
          <>
            <NavItem href="/home" icon={<Home className={iconClass} />} label="Home" isCollapsed={isSidebarCollapsed} isActive={pathname === '/home'} onMobileClick={handleMobileNavClick} />
            <NavItem href="/library" icon={<BookCopy className={iconClass} />} label="Library" isCollapsed={isSidebarCollapsed} isActive={pathname === '/library'} onMobileClick={handleMobileNavClick} />
          </>
        )}

        <NavItem
          href="/announcements"
          icon={<Megaphone className={iconClass} />}
          label="Announcements"
          isCollapsed={isSidebarCollapsed}
          isActive={pathname === '/announcements'}
          onMobileClick={handleMobileNavClick}
          disabled={isPendingTeacher}
        />

        {/* Academic Classes Dropdown */}
        <div className="relative mt-1">
          {isClassesOpen && !isSidebarCollapsed && !isPendingTeacher && (
            <div className="absolute left-8 top-12 w-px bg-blue-200 dark:bg-blue-900 h-[calc(100%-4rem)]"></div>
          )}
          <button
            onClick={(e) => {
              stopPropagation(e);
              if (!isSidebarCollapsed && !isPendingTeacher) setIsClassesOpen(!isClassesOpen);
            }}
            disabled={isPendingTeacher}
            className={`
               w-full flex items-center justify-between px-3 py-2.5 my-0.5 rounded-xl transition-all duration-200 group cursor-${isPendingTeacher ? 'not-allowed' : 'pointer'}
               ${isClassesPathActive
                ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/30'
                : isPendingTeacher
                  ? 'bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-500 opacity-50'
                  : 'hover:bg-gray-50 dark:hover:bg-gray-800/50 text-gray-700 dark:text-gray-300 hover:translate-x-1'
              }
               ${isPendingTeacher ? 'pointer-events-none' : ''}
             `}
          >
            <div className="flex items-center">
              <div className={`flex-shrink-0 ${isClassesPathActive ? 'text-white' : isPendingTeacher ? 'text-gray-400 dark:text-gray-500' : 'text-gray-500 dark:text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-400'}`}>
                <BookOpen className={iconClass} />
              </div>
              <span className={`ml-3 font-medium whitespace-nowrap transition-opacity duration-200 ${isSidebarCollapsed ? 'lg:opacity-0 lg:hidden' : 'opacity-100'} ${isPendingTeacher ? 'text-gray-400 dark:text-gray-500' : ''}`}>
                Academic Classes
              </span>
            </div>
            <div className={`transition-all duration-200 ${isSidebarCollapsed ? 'lg:opacity-0 lg:hidden' : ''} ${isClassesPathActive ? 'text-white' : isPendingTeacher ? 'text-gray-400' : 'text-gray-400'}`}>
              {isClassesOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </div>
          </button>
          {isClassesOpen && !isSidebarCollapsed && !isPendingTeacher && (
            <div className="pl-8 mt-2 flex flex-col space-y-1">
              {[6, 7, 8, 9, 10, 11, 12].map((cls) => (
                <Link
                  key={cls}
                  href={`/class/${cls}`}
                  onClick={handleMobileNavClick}
                  className={`
                     relative p-1.5 rounded-md text-sm transition-colors
                     ${pathname === `/class/${cls}`
                      ? 'text-blue-600 dark:text-blue-300 font-bold'
                      : 'text-gray-500 dark:text-gray-400 hover:text-black dark:hover:text-white'
                    }
                   `}
                >
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 h-px w-4 bg-gray-300 dark:bg-blue-900"></div>
                  <span className="ml-5">Class {cls}</span>
                </Link>
              ))}
            </div>
          )}
        </div>

        <div className={`my-4 border-t border-gray-200 dark:border-gray-600 transition-opacity duration-200 ${isSidebarCollapsed ? 'lg:border-1' : ''}`}></div>

        <NavItem href="/coding-ai" icon={<Cpu className={iconClass} />} label="Coding & AI" isCollapsed={isSidebarCollapsed} isActive={pathname === '/coding-ai'} onMobileClick={handleMobileNavClick} disabled={isPendingTeacher} />

        {(profile?.role === "student" || (profile?.role === "teacher" && !isPendingTeacher)) && (
          <NavItem href="/batches" icon={<Layers className={iconClass} />} label="My Batches" isCollapsed={isSidebarCollapsed} isActive={pathname === '/batches'} onMobileClick={handleMobileNavClick} disabled={isPendingTeacher} />
        )}

        {/* --- Teacher Specific Links --- */}
        {profile?.role === "teacher" && !isPendingTeacher && (
          <>
            <div className={`my-4 border-t border-gray-200 dark:border-gray-800 transition-opacity duration-200 ${isSidebarCollapsed ? 'lg:opacity-0' : ''}`}></div>
            <NavItem
              href="/admin/upload"
              icon={<Shield className={iconClass} />}
              label="Upload Lecture"
              isCollapsed={isSidebarCollapsed}
              isActive={pathname === '/admin/upload'}
              onMobileClick={handleMobileNavClick}
            />
            {/* --- NEW: Create DPP Link --- */}
            <NavItem
              href="/admin/create-dpp"
              icon={<ClipboardList className={iconClass} />}
              label="Create DPP"
              isCollapsed={isSidebarCollapsed}
              isActive={pathname === '/admin/create-dpp'}
              onMobileClick={handleMobileNavClick}
            />
          </>
        )}

        {/* Super Admin Link */}
        {profile?.role === "super-admin" && (
          <>
            <div className={`my-4 border-t border-gray-200 dark:border-gray-800 transition-opacity duration-200 ${isSidebarCollapsed ? 'lg:opacity-0' : ''}`}></div>
            <NavItem href="/super-admin" icon={<UserCog className={iconClass} />} label="Super Admin" isCollapsed={isSidebarCollapsed} isActive={pathname.startsWith('/super-admin')} onMobileClick={handleMobileNavClick} />
          </>
        )}

        {/* Pending Teacher Note */}
        {isPendingTeacher && (
          <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-800/50 rounded-xl text-center">
            <p className="text-xs text-gray-500 dark:text-gray-400">Pending approval - Limited access</p>
          </div>
        )}
      </nav>

      {/* Footer */}
      <div className="px-4 py-3 mt-auto border-t border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/50">
        <div className={`text-center transition-opacity duration-200 ${isSidebarCollapsed ? "lg:opacity-0 lg:hidden" : ""}`}>
          <p className="text-xs font-medium text-gray-500 dark:text-gray-500">© 2025 mise.org.in</p>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;