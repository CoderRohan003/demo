// // app/(dashboard)/announcements/page.tsx
// 'use client';

// import { useState, useEffect } from 'react';
// import withAuth from '@/app/components/auth/withAuth';
// import { useAuth } from '@/context/AuthContext';
// import { FullPageLoader } from '@/app/components/FullPageLoader';
// import { 
//     Rss, 
//     Megaphone, 
//     Globe, 
//     GraduationCap, 
//     Bell, 
//     Calendar,
//     Filter,
//     Search,
//     Clock,
//     AlertCircle,
//     Star,
//     TrendingUp
// } from 'lucide-react';

// interface Announcement {
//     $id: string;
//     message: string;
//     targetId: string;
//     $createdAt: string;
// }

// const AnnouncementsPage = () => {
//     const { user } = useAuth();
//     const [announcements, setAnnouncements] = useState<Announcement[]>([]);
//     const [isLoading, setIsLoading] = useState(true);
//     const [searchTerm, setSearchTerm] = useState('');
//     const [filter, setFilter] = useState<'all' | 'global' | 'batch'>('all');

//     useEffect(() => {
//         if (user) {
//             const fetchAnnouncements = async () => {
//                 setIsLoading(true);
//                 try {
//                     const response = await fetch('/api/announcements', {
//                         headers: { 'X-User-Id': user.$id },
//                     });
//                     if (response.ok) {
//                         const data = await response.json();
//                         setAnnouncements(data);
//                     }
//                 } catch (error) {
//                     console.error("Failed to fetch announcements", error);
//                 } finally {
//                     setIsLoading(false);
//                 }
//             };
//             fetchAnnouncements();
//         }
//     }, [user]);

//     const filteredAnnouncements = announcements.filter(announcement => {
//         const matchesSearch = announcement.message.toLowerCase().includes(searchTerm.toLowerCase());
//         const matchesFilter = filter === 'all' || 
//             (filter === 'global' && announcement.targetId === 'global') ||
//             (filter === 'batch' && announcement.targetId !== 'global');
//         return matchesSearch && matchesFilter;
//     });

//     const formatDate = (dateString: string) => {
//         const date = new Date(dateString);
//         const now = new Date();
//         const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
        
//         if (diffInHours < 1) return 'Just now';
//         if (diffInHours < 24) return `${diffInHours}h ago`;
//         if (diffInHours < 168) return `${Math.floor(diffInHours / 24)}d ago`;
//         return date.toLocaleDateString();
//     };

//     const getAnnouncementPriority = (announcement: Announcement) => {
//         const hoursOld = Math.floor((new Date().getTime() - new Date(announcement.$createdAt).getTime()) / (1000 * 60 * 60));
//         if (hoursOld < 24) return 'new';
//         if (hoursOld < 168) return 'recent';
//         return '';
//     };

//     if (isLoading) {
//         return <FullPageLoader />;
//     }

//     return (
//         <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/50 dark:from-gray-900 dark:via-gray-900 dark:to-indigo-950/20">
//             {/* Header Section */}
//             <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-md border-b border-gray-200/50 dark:border-gray-700/50 top-0 z-10">
//                 <div className="max-w-6xl mx-auto px-6 py-8">
//                     <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
//                         {/* Title Section */}
//                         <div className="flex items-center gap-4">
//                             <div className="relative">
//                                 <div className="w-16 h-16 bg-gradient-to-br from-blue-500 via-indigo-600 to-purple-600 rounded-3xl flex items-center justify-center shadow-lg">
//                                     <Megaphone className="w-8 h-8 text-white" />
//                                 </div>
//                                 {/* Animated pulse ring */}
//                                 <div className="absolute -inset-1 bg-gradient-to-br from-blue-500 via-indigo-600 to-purple-600 rounded-3xl opacity-20 animate-pulse"></div>
//                             </div>
//                             <div>
//                                 <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 via-blue-800 to-indigo-800 dark:from-white dark:via-blue-200 dark:to-indigo-200 bg-clip-text text-transparent">
//                                     Announcements
//                                 </h1>
//                                 <p className="text-gray-600 dark:text-gray-400 text-lg mt-1">
//                                     Stay updated with the latest news and updates
//                                 </p>
//                             </div>
//                         </div>

//                         {/* Stats Cards */}
//                         <div className="flex gap-4">
//                             <div className="bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950/20 dark:to-teal-950/20 p-4 rounded-2xl border border-emerald-200/50 dark:border-emerald-800/50">
//                                 <div className="flex items-center gap-3">
//                                     <TrendingUp className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
//                                     <div>
//                                         <p className="text-sm text-emerald-600 dark:text-emerald-400 font-medium">Total</p>
//                                         <p className="text-xl font-bold text-emerald-700 dark:text-emerald-300">{announcements.length}</p>
//                                     </div>
//                                 </div>
//                             </div>
//                             <div className="bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-950/20 dark:to-amber-950/20 p-4 rounded-2xl border border-orange-200/50 dark:border-orange-800/50">
//                                 <div className="flex items-center gap-3">
//                                     <Bell className="w-5 h-5 text-orange-600 dark:text-orange-400" />
//                                     <div>
//                                         <p className="text-sm text-orange-600 dark:text-orange-400 font-medium">New</p>
//                                         <p className="text-xl font-bold text-orange-700 dark:text-orange-300">
//                                             {announcements.filter(a => getAnnouncementPriority(a) === 'new').length}
//                                         </p>
//                                     </div>
//                                 </div>
//                             </div>
//                         </div>
//                     </div>

//                     {/* Search and Filter Bar */}
//                     <div className="flex flex-col md:flex-row gap-4 mt-8">
//                         {/* Search Bar */}
//                         <div className="relative flex-1">
//                             <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 w-5 h-5" />
//                             <input
//                                 type="text"
//                                 value={searchTerm}
//                                 onChange={(e) => setSearchTerm(e.target.value)}
//                                 placeholder="Search announcements..."
//                                 className="w-full bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm border border-gray-200/50 dark:border-gray-600/50 rounded-2xl pl-12 pr-4 py-4 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 dark:focus:ring-blue-400/50 focus:border-blue-500/50 dark:focus:border-blue-400/50 transition-all shadow-sm"
//                             />
//                         </div>

//                         {/* Filter Buttons */}
//                         <div className="flex gap-2">
//                             {[
//                                 { key: 'all', label: 'All', icon: Filter },
//                                 { key: 'global', label: 'Global', icon: Globe },
//                                 { key: 'batch', label: 'Batch', icon: GraduationCap }
//                             ].map(({ key, label, icon: Icon }) => (
//                                 <button
//                                     key={key}
//                                     onClick={() => setFilter(key as any)}
//                                     className={`flex items-center gap-2 px-6 py-4 rounded-2xl font-medium transition-all duration-300 border ${
//                                         filter === key
//                                             ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white border-blue-500/50 shadow-lg shadow-blue-500/25'
//                                             : 'bg-white/70 dark:bg-gray-800/70 text-gray-700 dark:text-gray-300 border-gray-200/50 dark:border-gray-600/50 hover:bg-gray-50 dark:hover:bg-gray-700/50'
//                                     }`}
//                                 >
//                                     <Icon className="w-4 h-4" />
//                                     <span>{label}</span>
//                                 </button>
//                             ))}
//                         </div>
//                     </div>
//                 </div>
//             </div>

//             {/* Content Section */}
//             <div className="max-w-6xl mx-auto px-6 py-8">
//                 {filteredAnnouncements.length > 0 ? (
//                     <div className="space-y-6">
//                         {filteredAnnouncements.map((item) => {
//                             const priority = getAnnouncementPriority(item);
//                             const isGlobal = item.targetId === 'global';
                            
//                             return (
//                                 <div key={item.$id} className="group relative">
//                                     {/* Priority indicator */}
//                                     {priority === 'new' && (
//                                         <div className="absolute -top-2 -right-2 z-10">
//                                             <div className="bg-gradient-to-r from-red-500 to-pink-500 text-white px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 shadow-lg">
//                                                 <Star className="w-3 h-3" />
//                                                 NEW
//                                             </div>
//                                         </div>
//                                     )}

//                                     <div className={`p-8 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-3xl shadow-xl border transition-all duration-300 group-hover:shadow-2xl group-hover:scale-[1.01] ${
//                                         isGlobal 
//                                             ? 'border-purple-200/50 dark:border-purple-800/30 bg-gradient-to-br from-purple-50/50 to-pink-50/50 dark:from-purple-950/20 dark:to-pink-950/20' 
//                                             : 'border-gray-200/50 dark:border-gray-700/50'
//                                     }`}>
//                                         {/* Header */}
//                                         <div className="flex items-center justify-between mb-6">
//                                             <div className={`flex items-center gap-3 text-sm font-semibold px-4 py-2 rounded-full transition-all ${
//                                                 isGlobal 
//                                                     ? 'bg-gradient-to-r from-purple-100 to-pink-100 dark:from-purple-900/40 dark:to-pink-900/40 text-purple-700 dark:text-purple-300 border border-purple-200/50 dark:border-purple-700/50'
//                                                     : 'bg-gradient-to-r from-blue-100 to-cyan-100 dark:from-blue-900/40 dark:to-cyan-900/40 text-blue-700 dark:text-blue-300 border border-blue-200/50 dark:border-blue-700/50'
//                                             }`}>
//                                                 <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
//                                                     isGlobal 
//                                                         ? 'bg-gradient-to-br from-purple-500 to-pink-500' 
//                                                         : 'bg-gradient-to-br from-blue-500 to-cyan-500'
//                                                 }`}>
//                                                     {isGlobal ? <Globe className="w-4 h-4 text-white" /> : <GraduationCap className="w-4 h-4 text-white" />}
//                                                 </div>
//                                                 <span>{isGlobal ? 'Global Announcement' : 'Batch Announcement'}</span>
//                                                 {priority === 'new' && <AlertCircle className="w-4 h-4 text-red-500" />}
//                                             </div>
                                            
//                                             <div className="flex items-center gap-3 text-gray-500 dark:text-gray-400">
//                                                 <Clock className="w-4 h-4" />
//                                                 <span className="text-sm font-medium">{formatDate(item.$createdAt)}</span>
//                                             </div>
//                                         </div>

//                                         {/* Message */}
//                                         <div className="relative">
//                                             <div className={`absolute -left-4 top-0 w-1 h-full rounded-full ${
//                                                 isGlobal 
//                                                     ? 'bg-gradient-to-b from-purple-500 to-pink-500' 
//                                                     : 'bg-gradient-to-b from-blue-500 to-cyan-500'
//                                             }`}></div>
//                                             <p className="text-gray-800 dark:text-gray-200 leading-relaxed text-lg pl-6">
//                                                 {item.message}
//                                             </p>
//                                         </div>

//                                         {/* Footer */}
//                                         <div className="flex items-center justify-between mt-6 pt-6 border-t border-gray-200/50 dark:border-gray-700/50">
//                                             <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
//                                                 <Calendar className="w-4 h-4" />
//                                                 <span>{new Date(item.$createdAt).toLocaleDateString('en-US', { 
//                                                     weekday: 'long', 
//                                                     year: 'numeric', 
//                                                     month: 'long', 
//                                                     day: 'numeric' 
//                                                 })}</span>
//                                             </div>
                                            
//                                             <div className={`px-3 py-1 rounded-full text-xs font-medium ${
//                                                 priority === 'new' 
//                                                     ? 'bg-gradient-to-r from-green-100 to-emerald-100 dark:from-green-900/30 dark:to-emerald-900/30 text-green-700 dark:text-green-400'
//                                                     : priority === 'recent'
//                                                     ? 'bg-gradient-to-r from-yellow-100 to-orange-100 dark:from-yellow-900/30 dark:to-orange-900/30 text-yellow-700 dark:text-yellow-400'
//                                                     : 'bg-gradient-to-r from-gray-100 to-slate-100 dark:from-gray-800 dark:to-slate-800 text-gray-600 dark:text-gray-400'
//                                             }`}>
//                                                 {priority === 'new' ? 'Fresh' : priority === 'recent' ? 'Recent' : 'Archived'}
//                                             </div>
//                                         </div>
//                                     </div>
//                                 </div>
//                             );
//                         })}
//                     </div>
//                 ) : (
//                     <div className="text-center py-20 px-8">
//                         <div className="max-w-md mx-auto">
//                             {/* Empty state illustration */}
//                             <div className="relative mb-8">
//                                 <div className="w-32 h-32 bg-gradient-to-br from-blue-100 via-indigo-100 to-purple-100 dark:from-blue-900/20 dark:via-indigo-900/20 dark:to-purple-900/20 rounded-3xl flex items-center justify-center mx-auto border border-gray-200/50 dark:border-gray-700/50">
//                                     <Rss className="w-16 h-16 text-gray-400 dark:text-gray-500" />
//                                 </div>
//                                 <div className="absolute -inset-4 bg-gradient-to-br from-blue-500/10 via-indigo-500/10 to-purple-500/10 rounded-3xl animate-pulse"></div>
//                             </div>
                            
//                             <h3 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
//                                 {searchTerm || filter !== 'all' ? 'No matching announcements' : 'No announcements yet'}
//                             </h3>
//                             <p className="text-lg text-gray-500 dark:text-gray-400 leading-relaxed">
//                                 {searchTerm || filter !== 'all' 
//                                     ? 'Try adjusting your search or filter criteria to find what you\'re looking for.'
//                                     : 'Check back later for important updates and news from the administration.'
//                                 }
//                             </p>

//                             {(searchTerm || filter !== 'all') && (
//                                 <button
//                                     onClick={() => {
//                                         setSearchTerm('');
//                                         setFilter('all');
//                                     }}
//                                     className="mt-6 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-medium py-3 px-6 rounded-2xl transition-all duration-300 hover:shadow-lg hover:scale-105"
//                                 >
//                                     Clear filters
//                                 </button>
//                             )}
//                         </div>
//                     </div>
//                 )}
//             </div>
//         </div>
//     );
// };

// export default withAuth(AnnouncementsPage);






// app/(dashboard)/announcements/page.tsx
'use client';

import { useState, useEffect, useMemo } from 'react';
import withAuth from '@/app/components/auth/withAuth';
import { useAuth } from '@/context/AuthContext';
import { FullPageLoader } from '@/app/components/FullPageLoader';
import { 
    Rss, 
    Megaphone, 
    Globe, 
    GraduationCap, 
    Bell, 
    Calendar,
    Filter,
    Search,
    Clock,
    AlertCircle,
    Star,
    TrendingUp
} from 'lucide-react';

interface Announcement {
    $id: string;
    message: string;
    targetId: string;
    $createdAt: string;
}

const AnnouncementsPage = () => {
    const { user } = useAuth();
    const [announcements, setAnnouncements] = useState<Announcement[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filter, setFilter] = useState<'all' | 'global' | 'batch'>('all');

    useEffect(() => {
        if (user) {
            const fetchAnnouncements = async () => {
                setIsLoading(true);
                try {
                    const response = await fetch('/api/announcements', {
                        headers: { 'X-User-Id': user.$id },
                    });
                    if (response.ok) {
                        const data = await response.json();
                        setAnnouncements(data);
                    }
                } catch (error) {
                    console.error("Failed to fetch announcements", error);
                } finally {
                    setIsLoading(false);
                }
            };
            fetchAnnouncements();
        }
    }, [user]);

    // Memoize filtered results to prevent unnecessary recalculations
    const filteredAnnouncements = useMemo(() => {
        return announcements.filter(announcement => {
            const matchesSearch = announcement.message.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesFilter = filter === 'all' || 
                (filter === 'global' && announcement.targetId === 'global') ||
                (filter === 'batch' && announcement.targetId !== 'global');
            return matchesSearch && matchesFilter;
        });
    }, [announcements, searchTerm, filter]);

    // Memoize stats to prevent recalculation
    const stats = useMemo(() => {
        const newCount = announcements.filter(a => {
            const hoursOld = Math.floor((new Date().getTime() - new Date(a.$createdAt).getTime()) / (1000 * 60 * 60));
            return hoursOld < 24;
        }).length;
        return { total: announcements.length, newCount };
    }, [announcements]);

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
        
        if (diffInHours < 1) return 'Just now';
        if (diffInHours < 24) return `${diffInHours}h ago`;
        if (diffInHours < 168) return `${Math.floor(diffInHours / 24)}d ago`;
        return date.toLocaleDateString();
    };

    const getAnnouncementPriority = (announcement: Announcement) => {
        const hoursOld = Math.floor((new Date().getTime() - new Date(announcement.$createdAt).getTime()) / (1000 * 60 * 60));
        if (hoursOld < 24) return 'new';
        if (hoursOld < 168) return 'recent';
        return '';
    };

    if (isLoading) {
        return <FullPageLoader />;
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
            {/* Header Section - Simplified gradients */}
            <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 top-0 z-10">
                <div className="max-w-6xl mx-auto px-6 py-8">
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                        {/* Title Section - Removed animated pulse */}
                        <div className="flex items-center gap-4">
                            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg">
                                <Megaphone className="w-8 h-8 text-white" />
                            </div>
                            <div>
                                <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
                                    Announcements
                                </h1>
                                <p className="text-gray-600 dark:text-gray-400 text-lg mt-1">
                                    Stay updated with the latest news
                                </p>
                            </div>
                        </div>

                        {/* Stats Cards - Simplified */}
                        <div className="flex gap-4">
                            <div className="bg-emerald-50 dark:bg-emerald-950/30 p-4 rounded-xl border border-emerald-200 dark:border-emerald-800">
                                <div className="flex items-center gap-3">
                                    <TrendingUp className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                                    <div>
                                        <p className="text-sm text-emerald-600 dark:text-emerald-400 font-medium">Total</p>
                                        <p className="text-xl font-bold text-emerald-700 dark:text-emerald-300">{stats.total}</p>
                                    </div>
                                </div>
                            </div>
                            <div className="bg-orange-50 dark:bg-orange-950/30 p-4 rounded-xl border border-orange-200 dark:border-orange-800">
                                <div className="flex items-center gap-3">
                                    <Bell className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                                    <div>
                                        <p className="text-sm text-orange-600 dark:text-orange-400 font-medium">New</p>
                                        <p className="text-xl font-bold text-orange-700 dark:text-orange-300">{stats.newCount}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Search and Filter Bar - Removed backdrop-blur */}
                    <div className="flex flex-col md:flex-row gap-4 mt-8">
                        <div className="relative flex-1">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                            <input
                                type="text"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                placeholder="Search announcements..."
                                className="w-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-xl pl-12 pr-4 py-3 text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-shadow"
                            />
                        </div>

                        {/* Filter Buttons - Simplified transitions */}
                        <div className="flex gap-2">
                            {[
                                { key: 'all', label: 'All', icon: Filter },
                                { key: 'global', label: 'Global', icon: Globe },
                                { key: 'batch', label: 'Batch', icon: GraduationCap }
                            ].map(({ key, label, icon: Icon }) => (
                                <button
                                    key={key}
                                    onClick={() => setFilter(key as any)}
                                    className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-colors border ${
                                        filter === key
                                            ? 'bg-blue-600 text-white border-blue-600 shadow-md'
                                            : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'
                                    }`}
                                >
                                    <Icon className="w-4 h-4" />
                                    <span className="hidden sm:inline">{label}</span>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Content Section - Removed backdrop-blur and complex gradients */}
            <div className="max-w-6xl mx-auto px-6 py-8">
                {filteredAnnouncements.length > 0 ? (
                    <div className="space-y-4">
                        {filteredAnnouncements.map((item) => {
                            const priority = getAnnouncementPriority(item);
                            const isGlobal = item.targetId === 'global';
                            
                            return (
                                <div key={item.$id} className="relative">
                                    {/* Priority indicator */}
                                    {priority === 'new' && (
                                        <div className="absolute -top-2 -right-2 z-10">
                                            <div className="bg-red-500 text-white px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 shadow-md">
                                                <Star className="w-3 h-3" />
                                                NEW
                                            </div>
                                        </div>
                                    )}

                                    <div className={`p-6 bg-white dark:bg-gray-800 rounded-xl shadow-md border transition-shadow hover:shadow-lg ${
                                        isGlobal 
                                            ? 'border-purple-200 dark:border-purple-800' 
                                            : 'border-gray-200 dark:border-gray-700'
                                    }`}>
                                        {/* Header */}
                                        <div className="flex items-center justify-between mb-4">
                                            <div className={`flex items-center gap-2 text-sm font-semibold px-3 py-1.5 rounded-full ${
                                                isGlobal 
                                                    ? 'bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300'
                                                    : 'bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300'
                                            }`}>
                                                {isGlobal ? <Globe className="w-4 h-4" /> : <GraduationCap className="w-4 h-4" />}
                                                <span>{isGlobal ? 'Global' : 'Batch'}</span>
                                            </div>
                                            
                                            <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400">
                                                <Clock className="w-4 h-4" />
                                                <span className="text-sm">{formatDate(item.$createdAt)}</span>
                                            </div>
                                        </div>

                                        {/* Message */}
                                        <p className="text-gray-800 dark:text-gray-200 leading-relaxed mb-4">
                                            {item.message}
                                        </p>

                                        {/* Footer */}
                                        <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
                                            <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                                                <Calendar className="w-4 h-4" />
                                                <span>{new Date(item.$createdAt).toLocaleDateString('en-US', { 
                                                    year: 'numeric', 
                                                    month: 'short', 
                                                    day: 'numeric' 
                                                })}</span>
                                            </div>
                                            
                                            <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                                                priority === 'new' 
                                                    ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                                                    : priority === 'recent'
                                                    ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400'
                                                    : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'
                                            }`}>
                                                {priority === 'new' ? 'Fresh' : priority === 'recent' ? 'Recent' : 'Archived'}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <div className="text-center py-20 px-8">
                        <div className="max-w-md mx-auto">
                            <div className="w-24 h-24 bg-gray-100 dark:bg-gray-800 rounded-2xl flex items-center justify-center mx-auto mb-6">
                                <Rss className="w-12 h-12 text-gray-400" />
                            </div>
                            
                            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
                                {searchTerm || filter !== 'all' ? 'No matching announcements' : 'No announcements yet'}
                            </h3>
                            <p className="text-gray-500 dark:text-gray-400 mb-6">
                                {searchTerm || filter !== 'all' 
                                    ? 'Try adjusting your search or filter criteria.'
                                    : 'Check back later for important updates and news.'
                                }
                            </p>

                            {(searchTerm || filter !== 'all') && (
                                <button
                                    onClick={() => {
                                        setSearchTerm('');
                                        setFilter('all');
                                    }}
                                    className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded-lg transition-colors"
                                >
                                    Clear filters
                                </button>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default withAuth(AnnouncementsPage);