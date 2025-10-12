// "use client";

// import { useState, useEffect } from "react";
// import { useParams } from "next/navigation";
// import withAuth from "@/app/components/auth/withAuth";
// import { databases } from "@/lib/appwrite";
// import { Query } from "appwrite";
// import BatchCard from "@/app/components/BatchCard"; // Import the new component

// const DATABASE_ID = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!;
// const BATCHES_COLLECTION_ID = process.env.NEXT_PUBLIC_APPWRITE_BATCHES_ID!;

// interface Batch {
//   $id: string;
//   name: string;
//   description: string;
//   imageUrl?: string;
//   price: number;
// }

// const SkeletonCard = () => (
//     <div className="rounded-xl shadow-2xl animate-pulse bg-gray-200 dark:bg-gray-800 h-[26rem]">
//         <div className="h-48 bg-gray-300 dark:bg-gray-700"></div>
//         <div className="p-6 space-y-4">
//             <div className="h-6 bg-gray-300 dark:bg-gray-700 rounded w-3/4"></div>
//             <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded"></div>
//         </div>
//         <div className="px-6 pt-4 pb-6 mt-auto flex justify-between items-center">
//             <div className="h-8 bg-gray-300 dark:bg-gray-700 rounded w-1/4"></div>
//             <div className="h-10 bg-gray-300 dark:bg-gray-700 rounded w-1/3"></div>
//         </div>
//     </div>
// );

// const ClassPage = () => {
//   const params = useParams();
//   const { classId } = params;
//   const [batches, setBatches] = useState<Batch[]>([]);
//   const [isLoading, setIsLoading] = useState(true);

//   useEffect(() => {
//     if (!classId) return;
//     const fetchBatches = async () => {
//       setIsLoading(true);
//       try {
//         const response = await databases.listDocuments(
//           DATABASE_ID,
//           BATCHES_COLLECTION_ID,
//           [
//             Query.equal("category", "Academic"), 
//             Query.equal("targetClasses", Number(classId))
//           ]
//         );
//         setBatches(response.documents as unknown as Batch[]);
//       } catch (error) {
//         console.error("Failed to fetch batches:", error);
//       } finally {
//         setIsLoading(false);
//       }
//     };
//     fetchBatches();
//   }, [classId]);

//   return (
//     <div className="container mx-auto px-4 py-8">
//       <h1 className="text-4xl font-extrabold mb-8 text-center text-gray-900 dark:text-white">
//         Available Batches for{" "}
//         <span className="text-blue-500 dark:text-blue-400">Class {classId}</span>
//       </h1>
//       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 items-start">
//         {isLoading ? (
//           <>
//             <SkeletonCard />
//             <SkeletonCard />
//             <SkeletonCard />
//           </>
//         ) : batches.length > 0 ? (
//           batches.map((batch) => <BatchCard key={batch.$id} batch={batch} />)
//         ) : (
//           <div className="col-span-full text-center py-16">
//             <p className="text-2xl text-gray-500 dark:text-gray-400">
//               😕 No academic batches found for this class yet.
//             </p>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// };

// export default withAuth(ClassPage);





"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import withAuth from "@/app/components/auth/withAuth";
import { databases } from "@/lib/appwrite";
import { Query } from "appwrite";
import BatchCard from "@/app/components/BatchCard";
import { GraduationCap, BookOpen, Users, Star, Search, ShieldAlert } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { FullPageLoader } from "@/app/components/FullPageLoader";

const DATABASE_ID = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!;
const BATCHES_COLLECTION_ID = process.env.NEXT_PUBLIC_APPWRITE_BATCHES_ID!;

interface Batch {
  $id: string;
  slug: string;
  name: string;
  description: string;
  imageUrl?: string;
  price: number;
}

const SkeletonCard = ({ index }: { index: number }) => (
  <div 
    className="bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm rounded-3xl shadow-lg border border-gray-200/50 dark:border-gray-700/50 overflow-hidden animate-pulse"
    style={{
      animationDelay: `${index * 150}ms`,
      animation: 'fadeInUp 0.8s ease-out forwards'
    }}
  >
    <div className="h-48 bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-600 dark:to-gray-700 relative">
      <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
    </div>
    <div className="p-6 space-y-4">
      <div className="flex items-center space-x-2">
        <div className="w-6 h-6 bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-600 dark:to-gray-700 rounded-full"></div>
        <div className="h-4 bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-600 dark:to-gray-700 rounded w-1/3"></div>
      </div>
      <div className="h-6 bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-600 dark:to-gray-700 rounded w-3/4"></div>
      <div className="space-y-2">
        <div className="h-4 bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-600 dark:to-gray-700 rounded"></div>
        <div className="h-4 bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-600 dark:to-gray-700 rounded w-2/3"></div>
      </div>
      <div className="flex justify-between items-center pt-4">
        <div className="h-8 bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-600 dark:to-gray-700 rounded w-1/4"></div>
        <div className="h-10 bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-600 dark:to-gray-700 rounded w-1/3"></div>
      </div>
    </div>
  </div>
);

const EmptyState = ({ classId }: { classId: string }) => (
  <div className="col-span-full flex flex-col items-center justify-center py-20 px-6">
    <div className="relative mb-8">
      <div className="w-32 h-32 bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-full flex items-center justify-center">
        <GraduationCap className="w-16 h-16 text-blue-500 dark:text-blue-400" />
      </div>
      <div className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-br from-orange-400 to-pink-500 rounded-full flex items-center justify-center">
        <Search className="w-4 h-4 text-white" />
      </div>
    </div>
    
    <h3 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
      No Batches Found
    </h3>
    <p className="text-gray-600 dark:text-gray-400 text-center max-w-md leading-relaxed mb-6">
      We couldn&apos;t find any academic batches for Class {classId} at the moment. New batches are added regularly!
    </p>
    
    <div className="flex flex-col sm:flex-row gap-4 items-center">
      <div className="flex items-center space-x-2 px-4 py-2 bg-blue-50 dark:bg-blue-900/20 rounded-full border border-blue-200 dark:border-blue-800">
        <Star className="w-4 h-4 text-blue-600 dark:text-blue-400" />
        <span className="text-sm font-medium text-blue-700 dark:text-blue-300">
          Check back soon for new batches
        </span>
      </div>
    </div>
  </div>
);

const StatsCard = ({ icon: Icon, title, value, gradient }: { 
  icon: React.ElementType, 
  title: string, 
  value: string | number, 
  gradient: string 
}) => (
  <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-md rounded-2xl p-6 border border-gray-200/50 dark:border-gray-700/50 shadow-lg">
    <div className="flex items-center space-x-4">
      <div className={`p-3 rounded-xl ${gradient}`}>
        <Icon className="w-6 h-6 text-white" />
      </div>
      <div>
        <div className="text-2xl font-bold text-gray-900 dark:text-white">
          {value}
        </div>
        <div className="text-sm text-gray-600 dark:text-gray-400">
          {title}
        </div>
      </div>
    </div>
  </div>
);

const AccessDenied = () => (
    <div className="col-span-full flex flex-col items-center justify-center py-20 px-6">
        <div className="relative mb-8">
            <div className="w-32 h-32 bg-gradient-to-br from-red-100 to-orange-100 dark:from-red-900/20 dark:to-orange-900/20 rounded-full flex items-center justify-center">
                <ShieldAlert className="w-16 h-16 text-red-500 dark:text-red-400" />
            </div>
        </div>
        <h3 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            Access Denied
        </h3>
        <p className="text-gray-600 dark:text-gray-400 text-center max-w-md leading-relaxed">
            You do not have permission to view the batches for this class.
        </p>
    </div>
);


const ClassPage = () => {
  const params = useParams();
    const router = useRouter();
    const { classId } = params;
    // --- NEW: Get student profile and auth loading state ---
    const { profile, isLoading: isAuthLoading } = useAuth();
  
    const [batches, setBatches] = useState<Batch[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    // --- NEW: State to manage access control ---
    const [accessGranted, setAccessGranted] = useState(false);


  // Convert classId to string for proper handling
  const classNumber = Array.isArray(classId) ? classId[0] : classId;

      useEffect(() => {
        // Wait for profile to be loaded
        if (isAuthLoading || !profile) return;

        // --- SECURITY CHECK ---
        // Grant access if the user is a teacher/admin, OR if they are a student in the correct class.
        if (
            profile.role !== 'student' ||
            (profile.role === 'student' && Number(profile.academicLevel) === Number(classNumber))
        ) {
            setAccessGranted(true);
            const fetchBatches = async () => {
                setIsLoading(true);
                try {
                    const response = await databases.listDocuments(
                        DATABASE_ID,
                        BATCHES_COLLECTION_ID,
                        [
                            Query.equal("category", "Academic"),
                            Query.equal("targetClasses", Number(classNumber))
                        ]
                    );
                    setBatches(response.documents as unknown as Batch[]);
                } catch (error) {
                    console.error("Failed to fetch batches:", error);
                } finally {
                    setIsLoading(false);
                }
            };
            fetchBatches();
        } else {
            // If the check fails, deny access.
            setAccessGranted(false);
            setIsLoading(false);
        }
    }, [classNumber, profile, isAuthLoading]);

    if (isAuthLoading) {
        return <FullPageLoader />;
    }

    if (!accessGranted) {
        return <div className="container mx-auto"><AccessDenied /></div>;
    }

  // Filter batches based on search term
  const filteredBatches = batches.filter(batch =>
    batch.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    batch.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getClassOrdinal = (num: string) => {
    const n = parseInt(num);
    const suffix = ["th", "st", "nd", "rd"];
    const v = n % 100;
    return n + (suffix[(v - 20) % 10] || suffix[v] || suffix[0]);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/30 dark:from-gray-900 dark:via-blue-950/20 dark:to-indigo-950/20">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(99,102,241,0.1)_1px,transparent_0)] [background-size:20px_20px] pointer-events-none"></div>
      
      <div className="relative w-full max-w-7xl mx-auto px-6 py-6">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex justify-between items-center mt-3 mb-6">
            <h1 className="text-4xl lg:text-5xl font-bold bg-gradient-to-r from-gray-900 via-blue-900 to-indigo-900 dark:from-white dark:via-blue-100 dark:to-indigo-100 bg-clip-text text-transparent leading-tight">
              {classNumber && getClassOrdinal(classNumber)} Grade
            </h1>

            {/* Search Bar */}
            {!isLoading && batches.length > 0 && (
                <div className="max-w-md relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none z-10">
                  <Search className="h-5 w-5 text-blue-600 dark:text-gray-400 " />
                </div>
                <input
                  type="text"
                  placeholder="Search batches..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-white/70 dark:bg-gray-800/70 backdrop-blur-md border border-gray-200/50 dark:border-gray-700/50 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all duration-300 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                />
                </div>
            )}
          </div>

          {/* Stats Cards */}
          {!isLoading && batches.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto mb-8">
              <StatsCard
                icon={BookOpen}
                title="Available Batches"
                value={filteredBatches.length}
                gradient="bg-gradient-to-br from-green-500 to-emerald-600"
              />
              <StatsCard
                icon={Users}
                title="Academic Focus"
                value="100%"
                gradient="bg-gradient-to-br from-blue-500 to-cyan-600"
              />
              <StatsCard
                icon={Star}
                title="Grade Level"
                value={classNumber ?? ""}
                gradient="bg-gradient-to-br from-purple-500 to-pink-600"
              />
            </div>
          )}
        </div>

        {/* Content Section */}
        <div className="relative">
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[...Array(6)].map((_, index) => (
                <SkeletonCard key={index} index={index} />
              ))}
            </div>
          ) : filteredBatches.length > 0 ? (
            <>
              {searchTerm && (
                <div className="mb-6 text-center">
                  <p className="text-gray-600 dark:text-gray-400">
                    Found <span className="font-semibold text-blue-600 dark:text-blue-400">{filteredBatches.length}</span> batch{filteredBatches.length !== 1 ? 'es' : ''} matching &quot;{searchTerm}&quot;
                  </p>
                </div>
              )}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {filteredBatches.map((batch, index) => (
                  <div 
                    key={batch.$id}
                    className="transform hover:scale-105 transition-all duration-300"
                    style={{ 
                      animationDelay: `${index * 150}ms`,
                      animation: 'fadeInUp 0.8s ease-out forwards'
                    }}
                  >
                    <BatchCard batch={batch} />
                  </div>
                ))}
              </div>
            </>
          ) : searchTerm ? (
            <div className="col-span-full text-center py-16">
              <div className="w-24 h-24 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800 rounded-full flex items-center justify-center mb-6 mx-auto">
                <Search className="w-12 h-12 text-gray-400" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
                No matches found
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                No batches match your search for &quot;{searchTerm}&quot;
              </p>
              <button
                onClick={() => setSearchTerm("")}
                className="px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-2xl font-semibold hover:from-blue-600 hover:to-indigo-700 transition-all duration-300 transform hover:scale-105"
              >
                Clear Search
              </button>
            </div>
          ) : (
            <EmptyState classId={classNumber ?? "N/A"} />
          )}
        </div>

        {/* Additional Info Section */}
        {!isLoading && batches.length > 0 && (
          <div className="mt-12 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-3xl p-8 border border-blue-200/50 dark:border-blue-700/50">
            <div className="text-center">
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                Why Choose Our Academic Batches?
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
                <div className="text-center">
                  <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center mx-auto mb-3">
                    <BookOpen className="w-6 h-6 text-white" />
                  </div>
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Expert Faculty</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Learn from experienced educators</p>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-xl flex items-center justify-center mx-auto mb-3">
                    <Users className="w-6 h-6 text-white" />
                  </div>
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Small Batches</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Personalized attention for every student</p>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center mx-auto mb-3">
                    <Star className="w-6 h-6 text-white" />
                  </div>
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Proven Results</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Track record of academic excellence</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* CSS Animations */}
      <style jsx>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes pulse {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: 0.5;
          }
        }
      `}</style>
    </div>
  );
};

export default withAuth(ClassPage);