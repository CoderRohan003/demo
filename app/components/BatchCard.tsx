// 'use client';

// import { useState } from 'react';
// import Image from 'next/image';
// import Link from 'next/link';
// import { ChevronDown } from 'lucide-react';

// interface Batch {
//     $id: string;
//     name: string;
//     description: string;
//     imageUrl?: string;
//     price: number;
// }

// const BatchCard = ({ batch }: { batch: Batch }) => {
//     const [isExpanded, setIsExpanded] = useState(false);

//     return (
//         <div className="rounded-xl shadow-2xl flex flex-col transition-all duration-500 ease-in-out hover:transform hover:-translate-y-2 bg-gradient-to-br from-sky-200 via-sky-400 to-sky-600 dark:from-gray-800 dark:via-indigo-900 dark:to-gray-900 text-[rgb(var(--card-foreground))] dark:text-white overflow-hidden">
//          {/* <div className="rounded-xl shadow-2xl flex flex-col transition-all duration-500 ease-in-out hover:transform hover:-translate-y-2 bg-gradient-to-br from-teal-200 via-emerald-300 to-green-500 dark:from-green-800 dark:via-teal-900 dark:to-gray-900 text-[rgb(var(--card-foreground))] dark:text-white overflow-hidden"> */}
//             {/* <div className="rounded-xl shadow-2xl flex flex-col transition-all duration-500 ease-in-out hover:transform hover:-translate-y-2 bg-gradient-to-br from-purple-200 via-indigo-300 to-pink-400 dark:from-indigo-900 dark:via-purple-800 dark:to-violet-700 text-[rgb(var(--card-foreground))] dark:text-white overflow-hidden"> */}
//             <div className="relative h-48 w-full">
//                 <Image
//                     src={batch.imageUrl ? `/api/super-admin/batch-image-view?s3Key=${batch.imageUrl}` : "/no-dp.png"}
//                     alt={batch.name}
//                     layout="fill"
//                     objectFit="cover"
//                 />
//                 <div className="absolute inset-0 bg-black/20"></div>
//             </div>
//             <div className="p-6">
//                 <h2 className="text-2xl font-bold">{batch.name}</h2>
//                 <div>
//                     <button
//                         onClick={() => setIsExpanded(!isExpanded)}
//                         className="flex items-center justify-between w-full text-left text-blue-800 dark:text-purple-200 hover:text-black dark:hover:text-white focus:outline-none"
//                     >
//                         <span className="font-semibold">Description</span>
//                         <ChevronDown className={`transform transition-transform duration-300 ${isExpanded ? "rotate-180" : ""}`} />
//                     </button>
//                     <div className={`overflow-hidden transition-all duration-500 ease-in-out ${isExpanded ? "max-h-40 mt-2" : "max-h-0"}`}>
//                         <p className="text-sm pt-2 border-t border-black/20 dark:border-white/20 text-gray-800 dark:text-purple-100">
//                             {batch.description}
//                         </p>
//                     </div>
//                 </div>
//             </div>
//             <div className="mt-auto px-6 pt-4 pb-6 border-t border-black/20 dark:border-white/20">
//                 <div className="flex flex-col sm:flex-row gap-4 sm:gap-0 justify-between items-center">
//                     <p className="text-2xl font-bold">
//                         ₹{batch.price?.toLocaleString("en-IN") ?? "N/A"}
//                     </p>
//                     <Link href={`/batch/${batch.$id}`}>
//                         <button className="bg-white/90 hover:bg-white text-blue-600 font-semibold py-2 px-6 rounded-lg transition-colors duration-300 dark:bg-purple-500 dark:hover:bg-purple-400 dark:text-white">
//                             Explore
//                         </button>
//                     </Link>
//                 </div>
//             </div>
//         </div>
//     );
// };

// export default BatchCard;





'use client';
import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
    ChevronDown,
    Star,
    Clock,
    Users,
    BookOpen,
    ArrowRight,
    Sparkles,
    Award,
    Eye,
    Heart
} from 'lucide-react';

interface Batch {
    $id: string;
    slug: string;   
    name: string;
    description: string;
    imageUrl?: string;
    price: number;
}

const BatchCard = ({ batch }: { batch: Batch }) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const [isHovered, setIsHovered] = useState(false);
    const [isLiked, setIsLiked] = useState(false);

    return (
        <Link href={`/batch/${batch.slug}`} className="block">
            <div
                className="group relative rounded-3xl overflow-hidden bg-white dark:bg-gray-800 shadow-xl hover:shadow-2xl transition-all duration-700 ease-out hover:-translate-y-3 hover:scale-[1.02] cursor-pointer"
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
            >
                {/* Gradient Border */}
                <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 via-sky-500 to-blue-500 dark:from-blue-500 dark:via-purple-500 dark:to-pink-500 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 p-0.5">
                    <div className="w-full h-full bg-white dark:bg-gray-800 rounded-3xl"></div>
                </div>
                {/* Content Container */}
                <div className="relative z-10 flex flex-col h-full">
                    {/* Image Section with Overlays */}
                    <div className="relative h-48 sm:h-56 md:h-64 overflow-hidden">
                        <Image
                            src={batch.imageUrl ? `/api/super-admin/batch-image-view?s3Key=${batch.imageUrl}` : "/no-dp.png"}
                            alt={batch.name}
                            layout="fill"
                            objectFit="cover"
                            className="transition-transform duration-700 group-hover:scale-110"
                        />
                        {/* Gradient Overlay */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent"></div>
                    </div>
                    {/* Content Section */}
                    <div className="flex-1 p-4 sm:p-5 md:p-6 space-y-3 sm:space-y-4">
                        {/* Title */}
                        <div>
                            <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white leading-tight group-hover:text-indigo-600 dark:group-hover:text-blue-400 transition-colors duration-300">
                                {batch.name}
                            </h2>
                            <div className="flex items-center gap-2 mt-2">
                                <div className="flex items-center gap-1">
                                    <BookOpen className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-indigo-500 dark:text-blue-500" />
                                    <span className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">Course</span>
                                </div>
                                <div className="w-1 h-1 bg-gray-300 rounded-full"></div>
                                <div className="flex items-center gap-1">
                                    <Award className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-sky-500 dark:text-purple-500" />
                                    <span className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">Certificate</span>
                                </div>
                            </div>
                        </div>
                        {/* Description Toggle */}
                        <div>
                            <button
                                onClick={(e) => {
                                    e.preventDefault();
                                    setIsExpanded(!isExpanded);
                                }}
                                className="flex items-center justify-between w-full text-left group/desc hover:text-indigo-600 dark:hover:text-blue-400 focus:outline-none transition-colors duration-200"
                            >
                                <span className="font-medium text-sm sm:text-base text-gray-700 dark:text-gray-300">
                                    Description
                                </span>
                                <ChevronDown
                                    className={`w-4 h-4 text-gray-500 dark:text-gray-400 transition-all duration-300 group-hover/desc:text-indigo-500 dark:group-hover/desc:text-blue-500 ${isExpanded ? "rotate-180 text-indigo-500 dark:text-blue-500" : ""
                                        }`}
                                />
                            </button>
                            <div className={`overflow-hidden transition-all duration-500 ease-out ${isExpanded ? "max-h-96 mt-3 opacity-100" : "max-h-0 opacity-0"
                                }`}>
                                <div className="relative">
                                    <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-indigo-500/50 to-sky-500/50 dark:from-blue-500/50 dark:to-purple-500/50"></div>
                                    <div className="pt-3">
                                        <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                                            {batch.description}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    {/* Footer */}
                    <div className="px-4 sm:px-5 md:px-6 pb-4 sm:pb-5 md:pb-6">
                        <div className="flex items-center justify-between p-3 sm:p-4 bg-gray-50 dark:bg-gray-700/50 rounded-2xl">
                            <div className="flex flex-col">
                                <span className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide font-medium">
                                    Price
                                </span>
                                <div className="flex items-baseline gap-1">
                                    <span className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
                                        ₹{batch.price?.toLocaleString("en-IN") ?? "N/A"}
                                    </span>
                                </div>
                            </div>
                            <div className="group/btn relative bg-indigo-600 dark:bg-blue-600 hover:bg-sky-600 dark:hover:bg-purple-600 text-white font-semibold py-2 sm:py-3 px-4 sm:px-6 rounded-xl transition-all duration-300 hover:scale-105 hover:shadow-lg overflow-hidden text-sm sm:text-base">
                                <div className="absolute inset-0 bg-sky-600 dark:bg-purple-600 -translate-x-full group-hover/btn:translate-x-0 transition-transform duration-500 ease-out"></div>
                                <div className="relative flex items-center gap-2">
                                    <span>Explore</span>
                                    <ArrowRight className={`w-3.5 h-3.5 sm:w-4 sm:h-4 transition-transform duration-300 ${isHovered ? 'translate-x-1' : ''
                                        }`} />
                                </div>
                            </div>
                        </div>
                    </div>
                    {/* Hover Glow Effect */}
                    <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-indigo-500/10 via-sky-500/10 to-blue-500/10 dark:from-blue-500/10 dark:via-purple-500/10 dark:to-pink-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>
                </div>
            </div>
        </Link>
    );
};

export default BatchCard;












/* Same card structure only Green color theme */

// 'use client';
// import { useState } from 'react';
// import Image from 'next/image';
// import Link from 'next/link';
// import {
//     ChevronDown,
//     Star,
//     Clock,
//     Users,
//     BookOpen,
//     ArrowRight,
//     Sparkles,
//     Award,
//     Eye,
//     Heart
// } from 'lucide-react';

// interface Batch {
//     $id: string;
//     name: string;
//     description: string;
//     imageUrl?: string;
//     price: number;
// }

// const BatchCard = ({ batch }: { batch: Batch }) => {
//     const [isExpanded, setIsExpanded] = useState(false);
//     const [isHovered, setIsHovered] = useState(false);
//     const [isLiked, setIsLiked] = useState(false);

//     return (
//         <Link href={`/batch/${batch.$id}`} className="block">
//             <div
//                 className="group relative rounded-3xl overflow-hidden bg-white dark:bg-gray-800 shadow-xl hover:shadow-2xl transition-all duration-700 ease-out hover:-translate-y-3 hover:scale-[1.02] cursor-pointer"
//                 onMouseEnter={() => setIsHovered(true)}
//                 onMouseLeave={() => setIsHovered(false)}
//             >
//                 {/* Gradient Border */}
//                 <div className="absolute inset-0 bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 dark:from-blue-500 dark:via-purple-500 dark:to-pink-500 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 p-0.5">
//                     <div className="w-full h-full bg-white dark:bg-gray-800 rounded-3xl"></div>
//                 </div>
//                 {/* Content Container */}
//                 <div className="relative z-10 flex flex-col h-full">
//                     {/* Image Section with Overlays */}
//                     <div className="relative h-48 sm:h-56 md:h-64 overflow-hidden">
//                         <Image
//                             src={batch.imageUrl ? `/api/super-admin/batch-image-view?s3Key=${batch.imageUrl}` : "/no-dp.png"}
//                             alt={batch.name}
//                             layout="fill"
//                             objectFit="cover"
//                             className="transition-transform duration-700 group-hover:scale-110"
//                         />
//                         {/* Gradient Overlay */}
//                         <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent"></div>
//                     </div>
//                     {/* Content Section */}
//                     <div className="flex-1 p-4 sm:p-5 md:p-6 space-y-3 sm:space-y-4">
//                         {/* Title */}
//                         <div>
//                             <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white leading-tight group-hover:text-emerald-600 dark:group-hover:text-blue-400 transition-colors duration-300">
//                                 {batch.name}
//                             </h2>
//                             <div className="flex items-center gap-2 mt-2">
//                                 <div className="flex items-center gap-1">
//                                     <BookOpen className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-500 dark:text-blue-500" />
//                                     <span className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">Course</span>
//                                 </div>
//                                 <div className="w-1 h-1 bg-gray-300 rounded-full"></div>
//                                 <div className="flex items-center gap-1">
//                                     <Award className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-teal-500 dark:text-purple-500" />
//                                     <span className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">Certificate</span>
//                                 </div>
//                             </div>
//                         </div>
//                         {/* Description Toggle */}
//                         <div>
//                             <button
//                                 onClick={(e) => {
//                                     e.preventDefault();
//                                     setIsExpanded(!isExpanded);
//                                 }}
//                                 className="flex items-center justify-between w-full text-left group/desc hover:text-emerald-600 dark:hover:text-blue-400 focus:outline-none transition-colors duration-200"
//                             >
//                                 <span className="font-medium text-sm sm:text-base text-gray-700 dark:text-gray-300">
//                                     Description
//                                 </span>
//                                 <ChevronDown
//                                     className={`w-4 h-4 text-gray-500 dark:text-gray-400 transition-all duration-300 group-hover/desc:text-emerald-500 dark:group-hover/desc:text-blue-500 ${isExpanded ? "rotate-180 text-emerald-500 dark:text-blue-500" : ""
//                                         }`}
//                                 />
//                             </button>
//                             <div className={`overflow-hidden transition-all duration-500 ease-out ${isExpanded ? "max-h-96 mt-3 opacity-100" : "max-h-0 opacity-0"
//                                 }`}>
//                                 <div className="relative">
//                                     <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-emerald-500/50 to-teal-500/50 dark:from-blue-500/50 dark:to-purple-500/50"></div>
//                                     <div className="pt-3">
//                                         <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
//                                             {batch.description}
//                                         </p>
//                                     </div>
//                                 </div>
//                             </div>
//                         </div>
//                     </div>
//                     {/* Footer */}
//                     <div className="px-4 sm:px-5 md:px-6 pb-4 sm:pb-5 md:pb-6">
//                         <div className="flex items-center justify-between p-3 sm:p-4 bg-gray-50 dark:bg-gray-700/50 rounded-2xl">
//                             <div className="flex flex-col">
//                                 <span className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide font-medium">
//                                     Price
//                                 </span>
//                                 <div className="flex items-baseline gap-1">
//                                     <span className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
//                                         ₹{batch.price?.toLocaleString("en-IN") ?? "N/A"}
//                                     </span>
//                                 </div>
//                             </div>
//                             <div className="group/btn relative bg-emerald-600 dark:bg-blue-600 hover:bg-teal-600 dark:hover:bg-purple-600 text-white font-semibold py-2 sm:py-3 px-4 sm:px-6 rounded-xl transition-all duration-300 hover:scale-105 hover:shadow-lg overflow-hidden text-sm sm:text-base">
//                                 <div className="absolute inset-0 bg-teal-600 dark:bg-purple-600 -translate-x-full group-hover/btn:translate-x-0 transition-transform duration-500 ease-out"></div>
//                                 <div className="relative flex items-center gap-2">
//                                     <span>Explore</span>
//                                     <ArrowRight className={`w-3.5 h-3.5 sm:w-4 sm:h-4 transition-transform duration-300 ${isHovered ? 'translate-x-1' : ''
//                                         }`} />
//                                 </div>
//                             </div>
//                         </div>
//                     </div>
//                     {/* Hover Glow Effect */}
//                     <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-emerald-500/10 via-teal-500/10 to-cyan-500/10 dark:from-blue-500/10 dark:via-purple-500/10 dark:to-pink-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>
//                 </div>
//             </div>
//         </Link>
//     );
// };

// export default BatchCard;