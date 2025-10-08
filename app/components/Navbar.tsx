'use client';

import { useAuth } from '@/context/AuthContext';
import { useDate } from '@/context/DateContext';
import { Menu, Transition } from '@headlessui/react';
import { ChevronDown, User, LogOut, Calendar, Bell, Menu as MenuIcon, BookOpen, Rss } from 'lucide-react';
import { DayPicker } from 'react-day-picker';
import 'react-day-picker/dist/style.css';
import '@/app/globals.css';
import Link from 'next/link';
import { useEffect, useState } from 'react';

import { ThemeToggleButton as PCThemeToggleButton } from './ThemeToggleButton';
import { ThemeToggleButtonMobile as MobileThemeToggleButton } from './ThemeToggleButtonMobile';
import { useIsMobile } from '@/lib/useIsMobile';
import { databases } from '@/lib/appwrite';
import { Query } from 'appwrite';


const DATABASE_ID = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!;
const ENROLLMENTS_COLLECTION_ID = process.env.NEXT_PUBLIC_APPWRITE_ENROLLMENTS_COLLECTION_ID!;
const NOTIFICATIONS_COLLECTION_ID = process.env.NEXT_PUBLIC_APPWRITE_NOTIFICATIONS_COLLECTION_ID!;

type NavbarProps = {
  setIsSidebarOpen: (open: boolean) => void;
};

interface Notification {
  $id: string;
  message: string;
  link?: string;
  type: 'lecture' | 'announcement';
  $createdAt: string;
}

export default function Navbar({ setIsSidebarOpen }: NavbarProps) {
  const { user, isLoading, logout } = useAuth();
  const { selectedDate, setSelectedDate } = useDate();
  const isMobile = useIsMobile();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  
  // State to track if the red dot should be visible
  const [hasUnseenNotifications, setHasUnseenNotifications] = useState(false);

  const [showAllNotifications, setShowAllNotifications] = useState(false);

  useEffect(() => {
    if (user) {
      const fetchNotifications = async () => {
        try {
          const enrollmentResponse = await databases.listDocuments(
            DATABASE_ID,
            ENROLLMENTS_COLLECTION_ID,
            [Query.equal('userId', user.$id)]
          );

          const enrolledBatchIds = enrollmentResponse.documents.map(doc => doc.batchId);

          const queries = [
            Query.equal('targetId', ['global', ...enrolledBatchIds]),
            Query.orderDesc('$createdAt'),
            Query.limit(50)
          ];

          const notificationResponse = await databases.listDocuments(
            DATABASE_ID,
            NOTIFICATIONS_COLLECTION_ID,
            queries
          );

          const twelveHoursAgo = new Date(Date.now() - 12 * 60 * 60 * 1000);
          const recentNotifications = notificationResponse.documents.filter(notif => {
            const notificationDate = new Date(notif.$createdAt);
            return notificationDate > twelveHoursAgo;
          });

          setNotifications(recentNotifications as unknown as Notification[]);

          // If there are new notifications, show the dot
          if (recentNotifications.length > 0) {
            setHasUnseenNotifications(true);
          }

        } catch (error) {
          console.error("Failed to fetch notifications:", error);
        }
      };
      fetchNotifications();
    }
  }, [user]);

  const displayedNotifications = showAllNotifications ? notifications : notifications.slice(0, 3);
  const hasMoreNotifications = notifications.length > 3;

  if (isLoading) {
    return (
      <header className="bg-[rgb(var(--card))] p-4 flex justify-between items-center border-b border-[rgb(var(--border))]">
        <div className="h-8 w-32 bg-[rgb(var(--background))] rounded-md animate-pulse"></div>
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
        shadow-lg print:hidden
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
        {isMobile ? <MobileThemeToggleButton /> : <PCThemeToggleButton />}

        {/* --- NOTIFICATION BELL --- */}
        <Menu as="div" className="relative">
          <Menu.Button 
            className="relative p-2 rounded-full hover:bg-black/10 dark:hover:bg-white/10 transition-colors"
            onClick={() => setHasUnseenNotifications(false)} // When clicked, hide the dot
          >
            <Bell size={20} />
            {/* Render dot based on the 'hasUnseenNotifications' state */}
            {hasUnseenNotifications && (
              <span className="absolute top-1 right-1 block h-2 w-2 rounded-full bg-red-500 ring-2 ring-white dark:ring-gray-800" />
            )}
          </Menu.Button>
          <Transition
            enter="transition ease-out duration-100"
            enterFrom="transform opacity-0 scale-95"
            enterTo="transform opacity-100 scale-100"
            leave="transition ease-in duration-75"
            leaveFrom="transform opacity-100 scale-100"
            leaveTo="transform opacity-0 scale-95"
            afterLeave={() => setShowAllNotifications(false)}
          >
            <Menu.Items className="absolute right-[-2rem] xs:right-[-2rem] sm:right-0 mt-2 w-[calc(100vw-4rem)] xs:w-[calc(100vw-3rem)] sm:w-96 max-w-[280px] xs:max-w-sm sm:max-w-md origin-top-right rounded-md bg-[rgb(var(--card))] shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none border border-[rgb(var(--border))] z-50">
              <div className="p-2">
                <p className="text-sm font-semibold p-2 text-gray-900 dark:text-white">Notifications</p>
                <div className="max-h-[70vh] overflow-y-auto">
                  {displayedNotifications.length > 0 ? (
                    <>
                      {displayedNotifications.map((notif) => (
                        <Menu.Item key={notif.$id}>
                          {({ active }) => {
                            const content = (
                              <div
                                className={`${active ? 'bg-gray-100 dark:bg-gray-700' : ''
                                  } flex items-start gap-3 p-2 rounded-md text-sm w-full`}
                              >
                                {notif.type === 'lecture' ? <BookOpen className="w-5 h-5 mt-1 text-blue-500 flex-shrink-0" /> : <Rss className="w-5 h-5 mt-1 text-purple-500 flex-shrink-0" />}
                                <div className="flex-1">
                                  <p className="text-gray-800 dark:text-gray-200">{notif.message}</p>
                                  <p className="text-xs text-gray-500 mt-1">{new Date(notif.$createdAt).toLocaleString()}</p>
                                </div>
                              </div>
                            );

                            return notif.link ? <Link href={notif.link}>{content}</Link> : <div className="cursor-default">{content}</div>;
                          }}
                        </Menu.Item>
                      ))}
                      {hasMoreNotifications && (
                        <Menu.Item>
                          {({ active }) => (
                            <Link
                              href="/announcements"
                              className={`${active ? 'bg-gray-100 dark:bg-gray-700' : ''
                                } block w-full mt-2 p-2 text-sm text-center text-blue-600 dark:text-blue-400 rounded-md transition-colors`}
                            >
                              Show More ({notifications.length - 3} more)
                            </Link>
                          )}
                        </Menu.Item>
                      )}

                    </>
                  ) : (
                    <p className="p-4 text-center text-sm text-gray-500">No new notifications.</p>
                  )}
                </div>
              </div>
            </Menu.Items>
          </Transition>
        </Menu>


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
                        className={`${active
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
                        className={`${active
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