

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
        <div 
            className="group relative rounded-3xl overflow-hidden bg-white dark:bg-gray-800 shadow-xl hover:shadow-2xl transition-all duration-700 ease-out hover:-translate-y-3 hover:scale-[1.02]"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            {/* Gradient Border */}
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 p-0.5">
                <div className="w-full h-full bg-white dark:bg-gray-800 rounded-3xl"></div>
            </div>

            {/* Content Container */}
            <div className="relative z-10 flex flex-col h-full">
                {/* Image Section with Overlays */}
                <div className="relative h-56 overflow-hidden">
                    <Image
                        src={batch.imageUrl ? `/api/super-admin/batch-image-view?s3Key=${batch.imageUrl}` : "/no-dp.png"}
                        alt={batch.name}
                        layout="fill"
                        objectFit="cover"
                        className="transition-transform duration-700 group-hover:scale-110"
                    />
                    
                    {/* Gradient Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent"></div>
                    
                    {/* Top Left Badge */}
                    {/* <div className="absolute top-4 left-4">
                        <div className="flex items-center gap-1 bg-white/20 backdrop-blur-md text-white px-3 py-1 rounded-full text-sm font-medium">
                            <Sparkles className="w-3 h-3" />
                            <span>Premium</span>
                        </div>
                    </div> */}

                    {/* Bottom Course Stats */}
                    <div className="absolute bottom-4 left-4 right-4">
                        <div className="flex items-center justify-between text-white/90 text-sm">
                            <div className="flex items-center gap-4">
                                <div className="flex items-center gap-1">
                                    <Star className="w-3 h-3 fill-current text-yellow-400" />
                                    <span>4.8</span>
                                </div>
                                <div className="flex items-center gap-1">
                                    <Users className="w-3 h-3" />
                                    <span>1.2k</span>
                                </div>
                                <div className="flex items-center gap-1">
                                    <Clock className="w-3 h-3" />
                                    <span>12 weeks</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Content Section */}
                <div className="flex-1 p-6 space-y-4">
                    {/* Title */}
                    <div>
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white leading-tight group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-300">
                            {batch.name}
                        </h2>
                        <div className="flex items-center gap-2 mt-2">
                            <div className="flex items-center gap-1">
                                <BookOpen className="w-4 h-4 text-blue-500" />
                                <span className="text-sm text-gray-500 dark:text-gray-400">Course</span>
                            </div>
                            <div className="w-1 h-1 bg-gray-300 rounded-full"></div>
                            <div className="flex items-center gap-1">
                                <Award className="w-4 h-4 text-purple-500" />
                                <span className="text-sm text-gray-500 dark:text-gray-400">Certificate</span>
                            </div>
                        </div>
                    </div>

                    {/* Description Toggle */}
                    <div>
                        <button
                            onClick={() => setIsExpanded(!isExpanded)}
                            className="flex items-center justify-between w-full text-left group/desc hover:text-blue-600 dark:hover:text-blue-400 focus:outline-none transition-colors duration-200"
                        >
                            <span className="font-medium text-gray-700 dark:text-gray-300">
                                Description
                            </span>
                            <ChevronDown 
                                className={`w-4 h-4 text-gray-500 transition-all duration-300 group-hover/desc:text-blue-500 ${
                                    isExpanded ? "rotate-180 text-blue-500" : ""
                                }`} 
                            />
                        </button>
                        
                        <div className={`overflow-hidden transition-all duration-500 ease-out ${
                            isExpanded ? "max-h-32 mt-3 opacity-100" : "max-h-0 opacity-0"
                        }`}>
                            <div className="relative">
                                <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-blue-500/50 to-purple-500/50"></div>
                                <div className="pt-3 h-28 overflow-y-auto scrollbar-thin scrollbar-thumb-blue-500/50 scrollbar-track-gray-200 dark:scrollbar-track-gray-700">
                                    <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed pr-2">
                                        {batch.description}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="px-6 pb-6">
                    <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-2xl">
                        <div className="flex flex-col">
                            <span className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide font-medium">
                                Price
                            </span>
                            <div className="flex items-baseline gap-1">
                                <span className="text-2xl font-bold text-gray-900 dark:text-white">
                                    ₹{batch.price?.toLocaleString("en-IN") ?? "N/A"}
                                </span>
                                <span className="text-sm text-gray-500 dark:text-gray-400 line-through">
                                    ₹{Math.round((batch.price || 0) * 1.5).toLocaleString("en-IN")}
                                </span>
                            </div>
                        </div>
                        
                        <Link href={`/batch/${batch.$id}`}>
                            <button className="group/btn relative bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-300 hover:scale-105 hover:shadow-lg overflow-hidden">
                                <div className="absolute inset-0 bg-white/20 translate-x-full group-hover/btn:translate-x-0 transition-transform duration-500 ease-out"></div>
                                <div className="relative flex items-center gap-2">
                                    <span>Explore</span>
                                    <ArrowRight className={`w-4 h-4 transition-transform duration-300 ${
                                        isHovered ? 'translate-x-1' : ''
                                    }`} />
                                </div>
                            </button>
                        </Link>
                    </div>
                </div>

                {/* Hover Glow Effect */}
                <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-pink-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>
            </div>
        </div>
    );
};

export default BatchCard;