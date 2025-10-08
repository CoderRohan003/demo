// 'use client';

// import { useState, useEffect } from 'react';
// import withAuth from '@/app/components/auth/withAuth';
// import { databases } from '@/lib/appwrite';
// import { Query } from 'appwrite';
// import Link from 'next/link';
// import { ChevronRight, Code, SearchX } from 'lucide-react';

// const DATABASE_ID = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!;
// const BATCHES_COLLECTION_ID = process.env.NEXT_PUBLIC_APPWRITE_BATCHES_ID!;

// // A skeleton component for the loading state
// const SkeletonLink = () => (
//   <div className="bg-white dark:bg-slate-800/50 p-6 rounded-xl shadow-sm flex justify-between items-center border border-gray-200 dark:border-slate-700 animate-pulse">
//     <div className="flex items-center gap-4">
//       <div className="w-12 h-12 bg-gray-200 dark:bg-slate-700 rounded-lg"></div>
//       <div className="h-7 bg-gray-200 dark:bg-slate-700 rounded-md w-48"></div>
//     </div>
//     <div className="w-7 h-7 bg-gray-200 dark:bg-slate-700 rounded-full"></div>
//   </div>
// );


// const CodingAIHomePage = () => {
//   const [levels, setLevels] = useState<string[]>([]);
//   const [isLoading, setIsLoading] = useState(true);

//   useEffect(() => {
//     const fetchLevels = async () => {
//       setIsLoading(true);
//       try {
//         const response = await databases.listDocuments(
//           DATABASE_ID,
//           BATCHES_COLLECTION_ID,
//           [Query.equal("category", "Coding and AI"), Query.limit(100)]
//         );
        
//         const uniqueLevels = [...new Set(response.documents.map(doc => doc.level).filter(Boolean))];
//         setLevels(uniqueLevels.sort());

//       } catch (error) {
//         console.error("Failed to fetch Coding & AI levels:", error);
//       } finally {
//         setIsLoading(false);
//       }
//     };

//     fetchLevels();
//   }, []);

//   return (
//     <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-10">
//       <div className="text-center mb-12">
//         <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 dark:text-white tracking-tight">
//           🚀 Coding & AI Courses
//         </h1>
//         <p className="mt-4 text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
//           Choose your level and begin your journey into the world of code and artificial intelligence.
//         </p>
//       </div>
      
//       <div className="max-w-3xl mx-auto">
//         {isLoading ? (
//           <div className="space-y-4">
//             <SkeletonLink />
//             <SkeletonLink />
//             <SkeletonLink />
//           </div>
//         ) : levels.length > 0 ? (
//           <div className="space-y-6">
//             {levels.map((level) => (
//               <Link 
//                 key={level} 
//                 href={`/coding-ai/${encodeURIComponent(level)}`} 
//                 className="group revolving-trail block p-1 rounded-xl"
//               >
//                 {/* The inner container gets the background color AND the border */}
//                 <div className="bg-white dark:bg-slate-900 p-5 rounded-lg w-full h-full flex justify-between items-center transition-colors duration-300 group-hover:bg-gray-50 dark:group-hover:bg-slate-800 border border-black/20 dark:border-slate-700">
//                     <div className="flex items-center gap-4">
//                         <div className="bg-gray-100 dark:bg-slate-800 p-3 rounded-lg">
//                             <Code className="text-blue-600 dark:text-blue-400 h-6 w-6" />
//                         </div>
//                         <span className="text-xl font-bold text-gray-800 dark:text-gray-100">{level}</span>
//                     </div>
//                     <ChevronRight size={28} className="text-gray-400 dark:text-gray-500 group-hover:text-blue-500 dark:group-hover:text-blue-400 transition-colors duration-300" />
//                 </div>
//               </Link>
//             ))}
//           </div>
//         ) : (
//           <div className="text-center py-16 px-6 bg-gray-50 dark:bg-slate-800/50 rounded-xl border border-gray-200 dark:border-slate-700">
//             <SearchX className="mx-auto h-16 w-16 text-gray-400 dark:text-gray-500" />
//             <h3 className="mt-4 text-2xl font-semibold text-gray-900 dark:text-white">No Courses Found</h3>
//             <p className="mt-2 text-md text-gray-500 dark:text-gray-400">
//               It seems there are no Coding & AI courses available at the moment. Please check back later!
//             </p>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// };

// export default withAuth(CodingAIHomePage);





































'use client';

import { useState, useEffect } from 'react';
import withAuth from '@/app/components/auth/withAuth';
import { databases } from '@/lib/appwrite';
import { Query } from 'appwrite';
import Link from 'next/link';
import { ChevronRight, Code, SearchX, Zap, Brain, Cpu } from 'lucide-react';

const DATABASE_ID = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!;
const BATCHES_COLLECTION_ID = process.env.NEXT_PUBLIC_APPWRITE_BATCHES_ID!;

// A skeleton component for the loading state
const SkeletonLink = () => (
  <div className="bg-white dark:bg-slate-800/50 p-6 rounded-xl shadow-sm flex justify-between items-center border border-gray-200 dark:border-slate-700 animate-pulse">
    <div className="flex items-center gap-4">
      <div className="w-12 h-12 bg-gray-200 dark:bg-slate-700 rounded-lg"></div>
      <div className="h-7 bg-gray-200 dark:bg-slate-700 rounded-md w-48"></div>
    </div>
    <div className="w-7 h-7 bg-gray-200 dark:bg-slate-700 rounded-full"></div>
  </div>
);

// Icon mapping for different levels
const getLevelIcon = (level: string) => {
  const lowerLevel = level.toLowerCase();
  if (lowerLevel.includes('beginner') || lowerLevel.includes('basic')) {
    return Code;
  } else if (lowerLevel.includes('intermediate') || lowerLevel.includes('advanced')) {
    return Cpu;
  } else if (lowerLevel.includes('ai') || lowerLevel.includes('machine')) {
    return Brain;
  }
  return Zap;
};

// Color mapping for different levels
const getLevelColors = (level: string) => {
  const lowerLevel = level.toLowerCase();
  if (lowerLevel.includes('beginner') || lowerLevel.includes('basic')) {
    return {
      bg: 'bg-green-100 dark:bg-green-900/20',
      icon: 'text-green-600 dark:text-green-400'
    };
  } else if (lowerLevel.includes('intermediate')) {
    return {
      bg: 'bg-yellow-100 dark:bg-yellow-900/20',
      icon: 'text-yellow-600 dark:text-yellow-400'
    };
  } else if (lowerLevel.includes('advanced')) {
    return {
      bg: 'bg-red-100 dark:bg-red-900/20',
      icon: 'text-red-600 dark:text-red-400'
    };
  } else if (lowerLevel.includes('ai') || lowerLevel.includes('machine')) {
    return {
      bg: 'bg-purple-100 dark:bg-purple-900/20',
      icon: 'text-purple-600 dark:text-purple-400'
    };
  }
  return {
    bg: 'bg-blue-100 dark:bg-blue-900/20',
    icon: 'text-blue-600 dark:text-blue-400'
  };
};

const CodingAIHomePage = () => {
  const [levels, setLevels] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchLevels = async () => {
      setIsLoading(true);
      try {
        const response = await databases.listDocuments(
          DATABASE_ID,
          BATCHES_COLLECTION_ID,
          [Query.equal("category", "Coding and AI"), Query.limit(100)]
        );
        
        const uniqueLevels = [...new Set(response.documents.map(doc => doc.level).filter(Boolean))];
        setLevels(uniqueLevels.sort());

      } catch (error) {
        console.error("Failed to fetch Coding & AI levels:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchLevels();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-purple-900/20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Minimal Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-3 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm px-6 py-3 rounded-full border border-gray-200 dark:border-gray-700 mb-6">
            <Brain className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            <span className="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide">
              Coding & AI
            </span>
          </div>
          
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white tracking-tight mb-4">
            {/* <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent"> */}
            <span className="bg-gradient-to-r from-blue-600 to-emerald-500 bg-clip-text text-transparent">
              Code Your Future
            </span>
          </h1>
          
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Explore coding and AI learning paths from beginner to advanced.
          </p>
        </div>
        
        {/* Course Levels */}
        <div className="max-w-4xl mx-auto">
          {isLoading ? (
            <div className="space-y-6">
              {[1, 2, 3].map((i) => (
                <SkeletonLink key={i} />
              ))}
            </div>
          ) : levels.length > 0 ? (
            <div className="space-y-6">
              {levels.map((level, index) => {
                const IconComponent = getLevelIcon(level);
                const colors = getLevelColors(level);
                
                return (
                  <Link 
                    key={level} 
                    href={`/coding-ai/${encodeURIComponent(level)}`} 
                    className="block group"
                  >
                    <div className="relative bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm p-8 rounded-2xl border border-gray-200 dark:border-gray-700 transition-all duration-500 hover:bg-white dark:hover:bg-gray-800 hover:shadow-2xl hover:-translate-y-1 overflow-hidden">
                      
                      {/* Content */}
                      <div className="relative flex justify-between items-center">
                        <div className="flex items-center gap-6">
                          <div className={`${colors.bg} p-4 rounded-2xl group-hover:scale-110 transition-transform duration-300`}>
                            <IconComponent className={`${colors.icon} h-8 w-8`} />
                          </div>
                          
                          <div>
                            <h3 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-2">
                              {level}
                            </h3>
                            <p className="text-gray-600 dark:text-gray-400">
                              {index === 0 && "Start with programming basics"}
                              {index === 1 && "Deepen your coding skills"}
                              {index === 2 && "Advanced algorithms & AI"}
                              {index > 2 && "Specialized coding tracks"}
                            </p>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-4">
                          <div className="hidden sm:flex flex-col items-end text-sm text-gray-500 dark:text-gray-400">
                            <span className="font-medium">Explore</span>
                            <span className="text-xs">Courses</span>
                          </div>
                          
                          <div className="bg-gray-100 dark:bg-gray-700 p-3 rounded-xl group-hover:bg-gradient-to-r group-hover:from-blue-500 group-hover:to-purple-600 transition-all duration-300">
                            <ChevronRight className="w-6 h-6 text-gray-600 dark:text-gray-300 group-hover:text-white group-hover:translate-x-1 transition-all duration-300" />
                          </div>
                        </div>
                      </div>
                      
                      {/* Hover Glow Effect */}
                      <div className="absolute inset-0 opacity-0 group-hover:opacity-20 bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-pink-500/10 rounded-2xl transition-opacity duration-500 pointer-events-none"></div>
                    </div>
                  </Link>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-20 px-8 bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-3xl border border-gray-200 dark:border-gray-700">
              <div className="w-24 h-24 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <SearchX className="h-12 w-12 text-gray-400 dark:text-gray-500" />
              </div>
              <h3 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">No Courses Available</h3>
              <p className="text-lg text-gray-600 dark:text-gray-400 max-w-md mx-auto">
                Coding & AI courses coming soon.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default withAuth(CodingAIHomePage);