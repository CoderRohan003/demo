// 'use client';

// import { useState } from 'react';
// import Link from 'next/link';
// import { 
//   Home, BookOpen, Layers, Shield, Cpu, UserCog,
//   ChevronDown, ChevronUp, X
// } from 'lucide-react';
// import { useAuth } from '@/context/AuthContext';

// type SidebarProps = {
//   isSidebarOpen: boolean;
//   setIsSidebarOpen: (open: boolean) => void;
// };

// const Sidebar = ({ isSidebarOpen, setIsSidebarOpen }: SidebarProps) => {
//   const { profile } = useAuth();
//   const [isClassesOpen, setIsClassesOpen] = useState(false);

//   return (
//     <aside 
//       className={`
//         fixed top-0 left-0 h-screen 
//         bg-gradient-to-b from-orange-400 via-yellow-300 to-yellow-100 
//         dark:from-gray-900 dark:via-purple-800 dark:to-purple-950
//         text-gray-900 dark:text-white flex flex-col shadow-xl 
//         transition-transform duration-300 ease-in-out z-40 
//         w-64
//         ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
//         lg:translate-x-0 lg:w-64
//       `}
//     >
//       {/* Header */}
//       <div className="flex items-center justify-between p-4 mb-6 border-b border-black dark:border-white/35">
//         <span className="text-2xl font-bold text-white drop-shadow-lg">MISE Education</span>
//         <button onClick={() => setIsSidebarOpen(false)} className="p-2 rounded-lg hover:bg-white/20 dark:hover:bg-white/10 lg:hidden transition-colors">
//           <X />
//         </button>
//       </div>

//       {/* Navigation */}
//       <nav className="flex-grow px-4 flex flex-col space-y-2">
//         {profile?.role === 'student' && (
//           <Link 
//             href="/home" 
//             className="flex items-center p-2 rounded-lg hover:bg-white/20 dark:hover:bg-white/10 transition-colors hover:translate-x-1 duration-200"
//           >
//             <Home className="mr-3" />
//             Home
//           </Link>
//         )}
        
//         <div>
//           <button
//             onClick={() => setIsClassesOpen(!isClassesOpen)}
//             className="w-full flex items-center justify-between p-2 rounded-lg hover:bg-white/20 dark:hover:bg-white/10 transition-colors hover:translate-x-1 duration-200"
//           >
//             <div className="flex items-center">
//               <BookOpen className="mr-3" />
//               Academic Classes
//             </div>
//             {isClassesOpen ? <ChevronUp /> : <ChevronDown />}
//           </button>
//           {isClassesOpen && (
//             <div className="pl-8 mt-2 flex flex-col space-y-2">
//               {[6, 7, 8, 9, 10, 11, 12].map(cls => (
//                 <Link 
//                   key={cls} 
//                   href={`/class/${cls}`} 
//                   className="p-1 rounded hover:bg-white/30 dark:hover:bg-purple-700 transition-colors hover:text-orange-400 dark:hover:text-yellow-300"
//                 >
//                   Class {cls}
//                 </Link>
//               ))}
//             </div>
//           )}
//         </div>
        
//         <Link href="/coding-ai" className="flex items-center p-2 rounded-lg hover:bg-white/20 dark:hover:bg-purple-700 transition-colors hover:translate-x-1 duration-200">
//           <Cpu className="mr-3" />
//           Coding & AI
//         </Link>

//         {(profile?.role === 'student' || profile?.role === 'teacher') && (
//           <Link href="/batches" className="flex items-center p-2 rounded-lg hover:bg-white/20 dark:hover:bg-purple-700 transition-colors hover:translate-x-1 duration-200">
//             <Layers className="mr-3" />
//             My Batches
//           </Link>
//         )}

//         {profile?.role === 'teacher' && (
//           <Link href="/admin/upload" className="flex items-center p-2 rounded-lg hover:bg-white/20 dark:hover:bg-purple-700 transition-colors hover:translate-x-1 duration-200">
//             <Shield className="mr-3" />
//             Admin Panel
//           </Link>
//         )}

//         {profile?.role === 'super-admin' && (
//           <Link href="/super-admin" className="flex items-center p-2 rounded-lg hover:bg-white/20 dark:hover:bg-purple-700 transition-colors hover:translate-x-1 duration-200">
//             <UserCog className="mr-3" />
//             Super Admin
//           </Link>
//         )}
//       </nav>

//       {/* Footer */}
//       <div className="p-4 mt-auto text-white/70 dark:text-gray-400 text-sm">
//         © 2025 mise.org.in
//       </div>
//     </aside>
//   );
// };

// export default Sidebar;


'use client';

import { useState } from 'react';
import Link from 'next/link';
import { 
  Home, BookOpen, Layers, Shield, Cpu, UserCog,
  ChevronsLeft, ChevronsRight, ChevronDown, ChevronUp, X
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

type SidebarProps = {
  isSidebarOpen: boolean;
  setIsSidebarOpen: (open: boolean) => void;
};

const Sidebar = ({ isSidebarOpen, setIsSidebarOpen }: SidebarProps) => {
  const { profile } = useAuth();
  const [isClassesOpen, setIsClassesOpen] = useState(false);

  return (
    // Responsive positioning and transitions
    <aside 
      className={`
        fixed top-0 left-0 h-screen bg-white dark:bg-gray-800 
        text-gray-900 dark:text-white flex flex-col shadow-lg 
        transition-transform duration-300 ease-in-out z-40 
        w-64 
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0 lg:w-64
      `}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 mb-6 border-b border-gray-200 dark:border-gray-700">
        <span className="text-2xl font-bold">MISE Education</span>
        {/* Close button for mobile */}
        <button onClick={() => setIsSidebarOpen(false)} className="p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 lg:hidden">
          <X />
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-grow px-4 flex flex-col space-y-2">
        {profile?.role === 'student' && (
          <Link href="/home" className="flex items-center p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
            <Home className="mr-3" />
            Home
          </Link>
        )}
        
        <div>
          <button
            onClick={() => setIsClassesOpen(!isClassesOpen)}
            className="w-full flex items-center justify-between p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
          >
            <div className="flex items-center">
              <BookOpen className="mr-3" />
              Academic Classes
            </div>
            {isClassesOpen ? <ChevronUp /> : <ChevronDown />}
          </button>
          {isClassesOpen && (
            <div className="pl-8 mt-2 flex flex-col space-y-2">
              {[6, 7, 8, 9, 10, 11, 12].map(cls => (
                <Link key={cls} href={`/class/${cls}`} className="p-1 hover:text-blue-500 dark:hover:text-blue-400">
                  Class {cls}
                </Link>
              ))}
            </div>
          )}
        </div>
        
        <Link href="/coding-ai" className="flex items-center p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
          <Cpu className="mr-3" />
          Coding & AI
        </Link>

        {(profile?.role === 'student' || profile?.role === 'teacher') && (
          <Link href="/batches" className="flex items-center p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
            <Layers className="mr-3" />
            My Batches
          </Link>
        )}

        {profile?.role === 'teacher' && (
          <Link href="/admin/upload" className="flex items-center p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
            <Shield className="mr-3" />
            Admin Panel
          </Link>
        )}

        {profile?.role === 'super-admin' && (
          <Link href="/super-admin" className="flex items-center p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
            <UserCog className="mr-3" />
            Super Admin
          </Link>
        )}
      </nav>

      {/* Footer */}
      <div className="p-4 mt-auto">
        <p className="text-sm text-gray-400 dark:text-gray-500">© 2025 mise.org.in</p>
      </div>
    </aside>
  );
};

export default Sidebar;

