// 'use client';

// import React, { useState, useEffect, useMemo } from 'react';
// import withAuth from '@/app/components/auth/withAuth';
// import { useAuth } from '@/context/AuthContext';
// import { databases } from '@/lib/appwrite';
// import { Query } from 'appwrite';
// import { 
//     BookOpen, Video, FileText, Calendar, Download, Play, GraduationCap, User, BookCopy, Layers, Library, Users, Target, FlaskConical, Atom, Code, Sigma, PenTool, ClipboardList, Dna, ScrollText, Globe, BookMarked, ChevronDown
// } from 'lucide-react';
// import { FullPageLoader } from '@/app/components/FullPageLoader';
// import Link from 'next/link';

// // --- Appwrite Configuration ---
// const DATABASE_ID = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!;
// const BATCHES_COLLECTION_ID = process.env.NEXT_PUBLIC_APPWRITE_BATCHES_ID!;
// const ENROLLMENTS_COLLECTION_ID = process.env.NEXT_PUBLIC_APPWRITE_ENROLLMENTS_COLLECTION_ID!;
// const LECTURES_COLLECTION_ID = process.env.NEXT_PUBLIC_APPWRITE_LECTURES_COLLECTION_ID!;
// const LECTURE_RESOURCES_COLLECTION_ID = process.env.NEXT_PUBLIC_APPWRITE_LECTURE_RESOURCES_COLLECTION_ID!;
// const TEACHER_PROFILES_COLLECTION_ID = process.env.NEXT_PUBLIC_APPWRITE_TEACHER_PROFILES_COLLECTION_ID!;


// // --- TypeScript Interfaces ---
// interface Resource {
//     $id: string;
//     title: string;
//     fileS3Key: string;
//     $createdAt: string;
// }

// interface Lecture {
//     $id: string;
//     title: string;
//     lectureDate: string;
//     subject: string;
//     uploaderId: string;
//     teacherName?: string;
//     $createdAt: string;
// }

// interface Batch {
//     $id: string;
//     name: string;
//     lectures: Lecture[];
//     resources: Resource[];
// }

// type CombinedContent = {
//     type: 'lecture' | 'resource';
//     date: Date;
//     data: Lecture | Resource;
// };

// // --- Helper Icon Functions ---
// const batchIcons = [BookCopy, Library, Users, Target, FlaskConical, Atom, Code, Sigma, PenTool, ClipboardList];
// const getSubjectIcon = (subject: string) => {
//     const s = subject.toLowerCase();
//     if (s.includes('physics')) return Atom;
//     if (s.includes('chemistry')) return FlaskConical;
//     if (s.includes('biology') || s.includes('life science')) return Dna;
//     if (s.includes('math')) return Sigma;
//     if (s.includes('computer science') || s.includes('programming')) return Code;
//     if (s.includes('history')) return ScrollText;
//     if (s.includes('geography')) return Globe;
//     if (s.includes('english') || s.includes('literature')) return BookMarked;
//     return BookOpen; // Default
// };
// const colorClasses = ["from-blue-500 to-cyan-500", "from-purple-500 to-pink-500", "from-orange-500 to-red-500", "from-green-500 to-emerald-500"];


// // --- Child Components ---

// const BatchSelector = ({ batches, selectedBatchId, setSelectedBatchId, setActiveTab }: {
//     batches: Batch[];
//     selectedBatchId: string | null;
//     setSelectedBatchId: (id: string) => void;
//     setActiveTab: (tab: string) => void;
// }) => {
//     const handleSelect = (batchId: string) => {
//         setSelectedBatchId(batchId);
//         setActiveTab('all');
//     };
    
//     return (
//         <div className="hidden xl:flex w-80 bg-white dark:bg-gray-900 border-r border-slate-200 dark:border-gray-700 flex-col shadow-xl">
//             <div className="p-6 border-b border-slate-200 dark:border-gray-700">
//                 <div className="flex items-center gap-3 mb-1">
//                     <GraduationCap className="w-7 h-7 text-gray-500 dark:text-gray-400" />
//                     <h1 className="text-2xl font-bold text-gray-900 dark:text-white">My Library</h1>
//                 </div>
//                 <p className="text-slate-500 dark:text-slate-400 text-sm">All your enrolled batches</p>
//             </div>
//             <div className="flex-1 overflow-y-auto p-4 space-y-3">
//                 {batches.map((batch, index) => (
//                     <button
//                         key={batch.$id}
//                         onClick={() => handleSelect(batch.$id)}
//                         className={`w-full text-left p-4 rounded-xl transition-all duration-200 flex items-center gap-3 ${selectedBatchId === batch.$id
//                                 ? `bg-gradient-to-r ${colorClasses[index % colorClasses.length]} text-white shadow-lg scale-[1.02]`
//                                 : 'bg-slate-50 dark:bg-gray-800 hover:bg-slate-100 dark:hover:bg-gray-700 text-slate-900 dark:text-slate-200'
//                         }`}
//                     >
//                         {React.createElement(batchIcons[index % batchIcons.length], { className: `w-5 h-5 flex-shrink-0 ${selectedBatchId === batch.$id ? 'text-white' : 'text-gray-500'}` })}
//                         <span className="font-semibold text-sm leading-tight truncate">{batch.name}</span>
//                     </button>
//                 ))}
//             </div>
//         </div>
//     );
// };

// const MobileBatchDropdown = ({ batches, selectedBatchId, setSelectedBatchId, setActiveTab }: {
//     batches: Batch[];
//     selectedBatchId: string | null;
//     setSelectedBatchId: (id: string) => void;
//     setActiveTab: (tab: string) => void;
// }) => {
//     const [isOpen, setIsOpen] = useState(false);
//     const selectedBatch = batches.find(b => b.$id === selectedBatchId);
//     const selectedIndex = batches.findIndex(b => b.$id === selectedBatchId);
    
//     const handleSelect = (batchId: string) => {
//         setSelectedBatchId(batchId);
//         setActiveTab('all');
//         setIsOpen(false);
//     };

//     return (
//         <div className="xl:hidden relative px-3 py-4 sm:px-4 md:px-6 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 shadow-sm">
//             <div className="flex items-center gap-2 mb-3">
//                 <GraduationCap className="w-5 h-5 sm:w-6 sm:h-6 text-gray-500 dark:text-gray-400" />
//                 <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900 dark:text-white">My Library</h1>
//             </div>
//             <button 
//                 onClick={() => setIsOpen(!isOpen)} 
//                 className={`w-full flex items-center justify-between p-3 sm:p-4 md:p-5 rounded-lg transition-all ${
//                     selectedBatch 
//                         ? `bg-gradient-to-r ${colorClasses[selectedIndex % colorClasses.length]} text-white shadow-md`
//                         : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white'
//                 }`}
//             >
//                 <div className="flex items-center gap-2 min-w-0 flex-1">
//                     {selectedBatch && React.createElement(batchIcons[selectedIndex % batchIcons.length], { className: 'w-5 h-5 sm:w-6 sm:h-6 flex-shrink-0' })}
//                     <span className="font-semibold text-sm sm:text-base md:text-lg truncate">
//                         {selectedBatch ? selectedBatch.name : 'Select a Batch'}
//                     </span>
//                 </div>
//                 <ChevronDown className={`w-5 h-5 sm:w-6 sm:h-6 transition-transform flex-shrink-0 ml-2 ${isOpen ? 'rotate-180' : ''}`} />
//             </button>
//             {isOpen && (
//                 <>
//                     <div 
//                         className="fixed inset-0 z-20" 
//                         onClick={() => setIsOpen(false)}
//                     />
//                     <div className="absolute top-full left-3 right-3 sm:left-4 sm:right-4 md:left-6 md:right-6 mt-2 bg-white dark:bg-gray-700 rounded-lg shadow-xl z-30 p-2 space-y-1 max-h-[60vh] overflow-y-auto">
//                         {batches.map((batch, index) => (
//                             <button 
//                                 key={batch.$id} 
//                                 onClick={() => handleSelect(batch.$id)} 
//                                 className={`w-full text-left p-3 sm:p-4 rounded-md transition-colors flex items-center gap-2 sm:gap-3 ${
//                                     selectedBatchId === batch.$id
//                                         ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
//                                         : 'hover:bg-gray-100 dark:hover:bg-gray-600 text-gray-900 dark:text-white'
//                                 }`}
//                             >
//                                 {React.createElement(batchIcons[index % batchIcons.length], { 
//                                     className: `w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0 ${selectedBatchId === batch.$id ? 'text-blue-600 dark:text-blue-400' : 'text-gray-500'}` 
//                                 })}
//                                 <span className="text-sm sm:text-base md:text-lg truncate">{batch.name}</span>
//                             </button>
//                         ))}
//                     </div>
//                 </>
//             )}
//         </div>
//     );
// }

// const ContentCard = ({ item, onDownload }: { item: CombinedContent; onDownload: (s3Key: string) => void; }) => {
//     const isLecture = item.type === 'lecture';
//     const data = item.data as Lecture & Resource;
//     const Icon = isLecture ? Play : FileText;
//     const iconBg = isLecture ? "bg-blue-500" : "bg-gradient-to-br from-yellow-500 to-amber-600";
//     const SubjectIcon = isLecture ? getSubjectIcon(data.subject) : null;

//     const cardContent = (
//         <div className="group bg-white dark:bg-gray-900 hover:shadow-lg rounded-xl p-3 min-[488px]:p-4 sm:p-5 md:p-6 transition-all border border-slate-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-600">
//             <div className="flex items-start gap-2 min-[488px]:gap-3 sm:gap-4">
//                 <div className={`w-10 h-10 min-[488px]:w-12 min-[488px]:h-12 sm:w-14 sm:h-14 ${iconBg} rounded-xl flex items-center justify-center shadow-md flex-shrink-0`}>
//                     <Icon className="w-5 h-5 min-[488px]:w-6 min-[488px]:h-6 sm:w-7 sm:h-7 text-white" />
//                 </div>
//                 <div className="flex-1 min-w-0">
//                     <h3 className="font-semibold text-slate-900 dark:text-white text-sm min-[488px]:text-base sm:text-lg mb-1.5 min-[488px]:mb-2 line-clamp-2 sm:line-clamp-1">
//                         {data.title}
//                     </h3>
//                     <div className="flex items-center flex-wrap gap-x-2 min-[488px]:gap-x-3 sm:gap-x-4 gap-y-1 min-[488px]:gap-y-1.5 sm:gap-y-2 text-[10px] min-[488px]:text-xs sm:text-sm text-slate-600 dark:text-slate-400">
//                         {isLecture && SubjectIcon && (
//                             <span className="flex items-center gap-1 sm:gap-1.5">
//                                 <SubjectIcon className="w-3 h-3 min-[488px]:w-3.5 min-[488px]:h-3.5 sm:w-4 sm:h-4 text-sky-500 flex-shrink-0" />
//                                 <span className="truncate max-w-[100px] min-[488px]:max-w-[120px] sm:max-w-none">{data.subject}</span>
//                             </span>
//                         )}
//                         {isLecture && (
//                             <span className="flex items-center gap-1 sm:gap-1.5">
//                                 <User className="w-3 h-3 min-[488px]:w-3.5 min-[488px]:h-3.5 sm:w-4 sm:h-4 text-rose-500 flex-shrink-0" />
//                                 <span className="truncate max-w-[100px] min-[488px]:max-w-[120px] sm:max-w-none">{data.teacherName}</span>
//                             </span>
//                         )}
//                         <span className="flex items-center gap-1 sm:gap-1.5 whitespace-nowrap">
//                             <Calendar className="w-3 h-3 min-[488px]:w-3.5 min-[488px]:h-3.5 sm:w-4 sm:h-4 text-amber-500 flex-shrink-0" />
//                             {new Date(isLecture ? data.lectureDate : data.$createdAt).toLocaleDateString('en-US', { 
//                                 month: 'short', 
//                                 day: 'numeric',
//                                 year: 'numeric'
//                             })}
//                         </span>
//                     </div>
//                 </div>
//                 {!isLecture && (
//                     <button 
//                         onClick={() => onDownload(data.fileS3Key)} 
//                         className="p-2 min-[488px]:p-2.5 sm:p-3 bg-blue-50 dark:bg-blue-900/30 hover:bg-blue-100 dark:hover:bg-blue-800/50 rounded-xl transition-colors flex-shrink-0"
//                         aria-label="Download resource"
//                     >
//                         <Download className="w-3.5 h-3.5 min-[488px]:w-4 min-[488px]:h-4 sm:w-5 sm:h-5 text-blue-600" />
//                     </button>
//                 )}
//             </div>
//         </div>
//     );

//     return isLecture ? <Link href={`/lecture/${data.$id}`}>{cardContent}</Link> : <div>{cardContent}</div>;
// };


// // --- Main Page Component ---
// const BatchLibrary = () => {
//     const { user } = useAuth();
//     const [enrolledBatches, setEnrolledBatches] = useState<Batch[]>([]);
//     const [selectedBatchId, setSelectedBatchId] = useState<string | null>(null);
//     const [isLoadingBatches, setIsLoadingBatches] = useState(true);
//     const [isLoadingContent, setIsLoadingContent] = useState(false);
//     const [activeTab, setActiveTab] = useState('all');

//     // --- Data Fetching Logic ---
//     useEffect(() => {
//         if (!user) return;
//         const fetchEnrolledBatches = async () => {
//             setIsLoadingBatches(true);
//             try {
//                 const enrollmentResponse = await databases.listDocuments(
//                     DATABASE_ID, ENROLLMENTS_COLLECTION_ID, [Query.equal('userId', user.$id)]
//                 );
//                 if (enrollmentResponse.documents.length === 0) {
//                     setEnrolledBatches([]);
//                     return;
//                 }
//                 const batchIds = enrollmentResponse.documents.map(doc => doc.batchId);
//                 const batchResponse = await databases.listDocuments(
//                     DATABASE_ID, BATCHES_COLLECTION_ID, [Query.equal('$id', batchIds)]
//                 );
//                 const batchesWithEmptyContent = batchResponse.documents.map(b => ({ ...b, lectures: [], resources: [] })) as unknown as Batch[];
//                 setEnrolledBatches(batchesWithEmptyContent);
//                 if (batchesWithEmptyContent.length > 0) {
//                     setSelectedBatchId(batchesWithEmptyContent[0].$id);
//                 }
//             } catch (error) {
//                 console.error("Failed to fetch enrolled batches:", error);
//             } finally {
//                 setIsLoadingBatches(false);
//             }
//         };
//         fetchEnrolledBatches();
//     }, [user]);

//     useEffect(() => {
//         if (!selectedBatchId) return;

//         // Check if content is already loaded to avoid refetching
//         const currentBatch = enrolledBatches.find(b => b.$id === selectedBatchId);
//         if (currentBatch && (currentBatch.lectures.length > 0 || currentBatch.resources.length > 0)) {
//             // Data is likely already fetched, no need to fetch again unless you want fresh data.
//             return;
//         }

//         const fetchBatchContent = async () => {
//             setIsLoadingContent(true);
//             try {
//                 const lecturesResponse = await databases.listDocuments(
//                     DATABASE_ID, LECTURES_COLLECTION_ID,
//                     [Query.equal('batchId', selectedBatchId), Query.orderDesc('lectureDate'), Query.limit(100)]
//                 );
//                 const lectures = lecturesResponse.documents as unknown as Lecture[];

//                 const teacherUserIds = [...new Set(lectures.map(l => l.uploaderId).filter(Boolean))];
//                 const teacherMap = new Map<string, string>();
//                 if (teacherUserIds.length > 0) {
//                     const profilesResponse = await databases.listDocuments(
//                         DATABASE_ID, TEACHER_PROFILES_COLLECTION_ID,
//                         [Query.equal('userId', teacherUserIds)]
//                     );
//                     profilesResponse.documents.forEach(profile => teacherMap.set(profile.userId, profile.name));
//                 }
                
//                 const fetchedLectures = lectures.map(l => ({ ...l, teacherName: teacherMap.get(l.uploaderId) || 'Unknown Instructor' }));
//                 const lectureIds = fetchedLectures.map(l => l.$id);
//                 let fetchedResources: Resource[] = [];

//                 if (lectureIds.length > 0) {
//                     const resourcesResponse = await databases.listDocuments(
//                         DATABASE_ID, LECTURE_RESOURCES_COLLECTION_ID,
//                         [Query.equal('lectureId', lectureIds), Query.limit(100)]
//                     );
//                     fetchedResources = resourcesResponse.documents as unknown as Resource[];
//                 }

//                 setEnrolledBatches(prevBatches => prevBatches.map(batch =>
//                     batch.$id === selectedBatchId
//                         ? { ...batch, lectures: fetchedLectures, resources: fetchedResources }
//                         : batch
//                 ));
//             } catch (error) {
//                 console.error("Failed to fetch batch content:", error);
//             } finally {
//                 setIsLoadingContent(false);
//             }
//         };
//         fetchBatchContent();
//     }, [selectedBatchId, enrolledBatches]); // Add enrolledBatches to dependency array
    
//     // --- Memoization and Handlers ---
//     const selectedBatchData = enrolledBatches.find(b => b.$id === selectedBatchId);
    
//     const sortedContent = useMemo((): CombinedContent[] => {
//         if (!selectedBatchData) return [];
//         const combined = [
//             ...selectedBatchData.lectures.map(l => ({ type: 'lecture' as const, date: new Date(l.lectureDate), data: l })),
//             ...selectedBatchData.resources.map(r => ({ type: 'resource' as const, date: new Date(r.$createdAt), data: r })),
//         ];
//         return combined.sort((a, b) => b.date.getTime() - a.date.getTime());
//     }, [selectedBatchData]);
    
//     const handleResourceDownload = async (s3Key: string) => {
//         try {
//             const response = await fetch('/api/resources/view', {
//                 method: 'POST',
//                 headers: { 'Content-Type': 'application/json' },
//                 body: JSON.stringify({ s3Key }),
//             });
//             if (!response.ok) throw new Error('Failed to get resource URL.');
//             const { url } = await response.json();
//             window.open(url, '_blank');
//         } catch (error) {
//             alert('Could not download resource.');
//         }
//     };
    
//     const filteredContent = useMemo(() => {
//         if (activeTab === 'all') return sortedContent;
//         if (activeTab === 'lectures') return sortedContent.filter(item => item.type === 'lecture');
//         if (activeTab === 'resources') return sortedContent.filter(item => item.type === 'resource');
//         return [];
//     }, [activeTab, sortedContent]);


//     if (isLoadingBatches) {
//         return <FullPageLoader />;
//     }

//     return (
//         <div className="min-h-screen bg-slate-50 dark:bg-gray-900/50 flex flex-col xl:flex-row font-sans">
//             <BatchSelector 
//                 batches={enrolledBatches} 
//                 selectedBatchId={selectedBatchId} 
//                 setSelectedBatchId={setSelectedBatchId} 
//                 setActiveTab={setActiveTab}
//             />
            
//             {/* Right Content Area */}
//             <div className="flex-1 flex flex-col overflow-hidden">
//                 <MobileBatchDropdown
//                     batches={enrolledBatches}
//                     selectedBatchId={selectedBatchId}
//                     setSelectedBatchId={setSelectedBatchId}
//                     setActiveTab={setActiveTab}
//                 />
                
//                 {selectedBatchData ? (
//                     <>
//                         {/* Header */}
//                         <div className={`bg-gradient-to-r ${colorClasses[enrolledBatches.findIndex(b => b.$id === selectedBatchId) % colorClasses.length]} p-4 sm:p-5 md:p-6 text-white shadow-lg`}>
//                             <div className="max-w-5xl mx-auto">
//                                 <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold mb-2 line-clamp-2">
//                                     {selectedBatchData.name}
//                                 </h2>
//                                 <div className="flex items-center gap-3 sm:gap-4 text-xs sm:text-sm text-white/90">
//                                     <span className="flex items-center gap-1 sm:gap-1.5">
//                                         <Video className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
//                                         <span className="hidden xs:inline">{selectedBatchData.lectures.length} Lectures</span>
//                                         <span className="xs:hidden">{selectedBatchData.lectures.length}</span>
//                                     </span>
//                                     <span className="flex items-center gap-1 sm:gap-1.5">
//                                         <FileText className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
//                                         <span className="hidden xs:inline">{selectedBatchData.resources.length} Resources</span>
//                                         <span className="xs:hidden">{selectedBatchData.resources.length}</span>
//                                     </span>
//                                 </div>
//                             </div>
//                         </div>

//                         {/* Tabs */}
//                         <div className="bg-white dark:bg-gray-800 border-b border-slate-200 dark:border-gray-700 shadow-sm sticky top-0 z-10">
//                             <div className="max-w-5xl mx-auto flex">
//                                 <button 
//                                     onClick={() => setActiveTab('all')} 
//                                     className={`flex-1 px-2 sm:px-4 py-3 text-xs sm:text-sm md:text-base font-semibold transition-all ${
//                                         activeTab === 'all' 
//                                             ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50 dark:bg-blue-900/20' 
//                                             : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-gray-700'
//                                     }`}
//                                 >
//                                     <div className="flex items-center justify-center gap-1 sm:gap-2">
//                                         <Layers className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
//                                         <span>All</span>
//                                     </div>
//                                 </button>
//                                 <button 
//                                     onClick={() => setActiveTab('lectures')} 
//                                     className={`flex-1 px-2 sm:px-4 py-3 text-xs sm:text-sm md:text-base font-semibold transition-all ${
//                                         activeTab === 'lectures' 
//                                             ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50 dark:bg-blue-900/20' 
//                                             : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-gray-700'
//                                     }`}
//                                 >
//                                     <div className="flex items-center justify-center gap-1 sm:gap-2">
//                                         <Video className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
//                                         <span className="hidden sm:inline">Lectures</span>
//                                         <span>({selectedBatchData.lectures.length})</span>
//                                     </div>
//                                 </button>
//                                 <button 
//                                     onClick={() => setActiveTab('resources')} 
//                                     className={`flex-1 px-2 sm:px-4 py-3 text-xs sm:text-sm md:text-base font-semibold transition-all ${
//                                         activeTab === 'resources' 
//                                             ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50 dark:bg-blue-900/20' 
//                                             : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-gray-700'
//                                     }`}
//                                 >
//                                     <div className="flex items-center justify-center gap-1 sm:gap-2">
//                                         <FileText className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
//                                         <span className="hidden sm:inline">Resources</span>
//                                         <span>({selectedBatchData.resources.length})</span>
//                                     </div>
//                                 </button>
//                             </div>
//                         </div>

//                         {/* Content */}
//                         <div className="flex-1 overflow-y-auto p-2 min-[488px]:p-3 sm:p-4 md:p-6 lg:p-8 bg-slate-100 dark:bg-gray-800">
//                             <div className="max-w-5xl mx-auto">
//                                 {isLoadingContent ? (
//                                     <div className="text-center p-10">
//                                         <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
//                                     </div>
//                                 ) : (
//                                     <div className="space-y-2 min-[488px]:space-y-3 sm:space-y-4">
//                                         {filteredContent.length > 0 ? filteredContent.map((item) => (
//                                             <div key={`${item.type}-${item.data.$id}`} className="mx-auto w-[95%] min-[488px]:w-full min-[488px]:max-w-2xl sm:max-w-none">
//                                                 <ContentCard item={item} onDownload={handleResourceDownload} />
//                                             </div>
//                                         )) : (
//                                             <div className="text-center py-12 sm:py-16">
//                                                 <p className="text-gray-500 text-sm sm:text-base">No content found for this filter.</p>
//                                             </div>
//                                         )}
//                                     </div>
//                                 )}
//                             </div>
//                         </div>
//                     </>
//                 ) : (
//                     <div className="flex-1 flex items-center justify-center text-center p-6 sm:p-8">
//                         <div>
//                             <BookCopy className="w-16 h-16 sm:w-20 sm:h-20 text-slate-300 dark:text-gray-600 mx-auto mb-4" />
//                             <h2 className="text-xl sm:text-2xl font-bold text-slate-800 dark:text-slate-200 mb-2">
//                                 Welcome to Your Library
//                             </h2>
//                             <p className="text-slate-500 dark:text-slate-400 text-sm sm:text-base">
//                                 {enrolledBatches.length > 0 ? "Select a batch to view its content." : "You are not enrolled in any batches yet."}
//                             </p>
//                         </div>
//                     </div>
//                 )}
//             </div>
//         </div>
//     );
// };

// export default withAuth(BatchLibrary);












'use client';

import React, { useState, useEffect, useMemo } from 'react';
import withAuth from '@/app/components/auth/withAuth';
import { useAuth } from '@/context/AuthContext';
import { databases } from '@/lib/appwrite';
import { Query } from 'appwrite';
import {
    BookOpen, Video, FileText, Calendar, Download, Play, GraduationCap, User, BookCopy, Layers, Library, Users, Target, FlaskConical, Atom, Code, Sigma, PenTool, ClipboardList, Dna, ScrollText, Globe, BookMarked, ChevronDown
} from 'lucide-react';
import { FullPageLoader } from '@/app/components/FullPageLoader';
import Link from 'next/link';

// --- Appwrite Configuration ---
const DATABASE_ID = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!;
const BATCHES_COLLECTION_ID = process.env.NEXT_PUBLIC_APPWRITE_BATCHES_ID!;
const ENROLLMENTS_COLLECTION_ID = process.env.NEXT_PUBLIC_APPWRITE_ENROLLMENTS_COLLECTION_ID!;
const LECTURES_COLLECTION_ID = process.env.NEXT_PUBLIC_APPWRITE_LECTURES_COLLECTION_ID!;
const LECTURE_RESOURCES_COLLECTION_ID = process.env.NEXT_PUBLIC_APPWRITE_LECTURE_RESOURCES_COLLECTION_ID!;
const TEACHER_PROFILES_COLLECTION_ID = process.env.NEXT_PUBLIC_APPWRITE_TEACHER_PROFILES_COLLECTION_ID!;


// --- TypeScript Interfaces ---
interface Resource {
    $id: string;
    title: string;
    fileS3Key: string;
    $createdAt: string;
}

interface Lecture {
    $id: string;
    title: string;
    lectureDate: string;
    subject: string;
    uploaderId: string;
    teacherName?: string;
    $createdAt: string;
}

interface Batch {
    $id: string;
    name: string;
    lectures: Lecture[];
    resources: Resource[];
}

type CombinedContent = {
    type: 'lecture' | 'resource';
    date: Date;
    data: Lecture | Resource;
};

// --- Helper Icon Functions ---
const batchIcons = [BookCopy, Library, Users, Target, FlaskConical, Atom, Code, Sigma, PenTool, ClipboardList];
const getSubjectIcon = (subject: string) => {
    const s = subject.toLowerCase();
    if (s.includes('physics')) return Atom;
    if (s.includes('chemistry')) return FlaskConical;
    if (s.includes('biology') || s.includes('life science')) return Dna;
    if (s.includes('math')) return Sigma;
    if (s.includes('computer science') || s.includes('programming')) return Code;
    if (s.includes('history')) return ScrollText;
    if (s.includes('geography')) return Globe;
    if (s.includes('english') || s.includes('literature')) return BookMarked;
    return BookOpen; // Default
};
const colorClasses = ["from-blue-500 to-cyan-500", "from-purple-500 to-pink-500", "from-orange-500 to-red-500", "from-green-500 to-emerald-500"];


// --- Child Components ---

const BatchSelector = ({ batches, selectedBatchId, setSelectedBatchId, setActiveTab }: {
    batches: Batch[];
    selectedBatchId: string | null;
    setSelectedBatchId: (id: string) => void;
    setActiveTab: (tab: string) => void;
}) => {
    const handleSelect = (batchId: string) => {
        setSelectedBatchId(batchId);
        setActiveTab('lectures');
    };

    return (
        <div className="hidden xl:flex w-80 bg-white dark:bg-gray-900 border-r border-slate-200 dark:border-gray-700 flex-col shadow-xl">
            <div className="p-6 border-b border-slate-200 dark:border-gray-700">
                <div className="flex items-center gap-3 mb-1">
                    <GraduationCap className="w-7 h-7 text-gray-500 dark:text-gray-400" />
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">My Library</h1>
                </div>
                <p className="text-slate-500 dark:text-slate-400 text-sm">All your enrolled batches</p>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {batches.map((batch, index) => (
                    <button
                        key={batch.$id}
                        onClick={() => handleSelect(batch.$id)}
                        className={`w-full text-left p-4 rounded-xl transition-all duration-200 flex items-center gap-3 ${selectedBatchId === batch.$id
                                ? `bg-gradient-to-r ${colorClasses[index % colorClasses.length]} text-white shadow-lg scale-[1.02]`
                                : 'bg-slate-50 dark:bg-gray-800 hover:bg-slate-100 dark:hover:bg-gray-700 text-slate-900 dark:text-slate-200'
                            }`}
                    >
                        {React.createElement(batchIcons[index % batchIcons.length], { className: `w-5 h-5 flex-shrink-0 ${selectedBatchId === batch.$id ? 'text-white' : 'text-gray-500'}` })}
                        <span className="font-semibold text-sm leading-tight truncate">{batch.name}</span>
                    </button>
                ))}
            </div>
        </div>
    );
};

const MobileBatchDropdown = ({ batches, selectedBatchId, setSelectedBatchId, setActiveTab }: {
    batches: Batch[];
    selectedBatchId: string | null;
    setSelectedBatchId: (id: string) => void;
    setActiveTab: (tab: string) => void;
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const selectedBatch = batches.find(b => b.$id === selectedBatchId);
    const selectedIndex = batches.findIndex(b => b.$id === selectedBatchId);

    const handleSelect = (batchId: string) => {
        setSelectedBatchId(batchId);
        setActiveTab('lectures');
        setIsOpen(false);
    };

    return (
        <div className="xl:hidden relative px-3 py-4 sm:px-4 md:px-6 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 shadow-sm">
            <div className="flex items-center gap-2 mb-3">
                <GraduationCap className="w-5 h-5 sm:w-6 sm:h-6 text-gray-500 dark:text-gray-400" />
                <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900 dark:text-white">My Library</h1>
            </div>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`w-full flex items-center justify-between p-3 sm:p-4 md:p-5 rounded-lg transition-all ${selectedBatch
                        ? `bg-gradient-to-r ${colorClasses[selectedIndex % colorClasses.length]} text-white shadow-md`
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white'
                    }`}
            >
                <div className="flex items-center gap-2 min-w-0 flex-1">
                    {selectedBatch && React.createElement(batchIcons[selectedIndex % batchIcons.length], { className: 'w-5 h-5 sm:w-6 sm:h-6 flex-shrink-0' })}
                    <span className="font-semibold text-sm sm:text-base md:text-lg truncate">
                        {selectedBatch ? selectedBatch.name : 'Select a Batch'}
                    </span>
                </div>
                <ChevronDown className={`w-5 h-5 sm:w-6 sm:h-6 transition-transform flex-shrink-0 ml-2 ${isOpen ? 'rotate-180' : ''}`} />
            </button>
            {isOpen && (
                <>
                    <div
                        className="fixed inset-0 z-20"
                        onClick={() => setIsOpen(false)}
                    />
                    <div className="absolute top-full left-3 right-3 sm:left-4 sm:right-4 md:left-6 md:right-6 mt-2 bg-white dark:bg-gray-700 rounded-lg shadow-xl z-30 p-2 space-y-1 max-h-[60vh] overflow-y-auto">
                        {batches.map((batch, index) => (
                            <button
                                key={batch.$id}
                                onClick={() => handleSelect(batch.$id)}
                                className={`w-full text-left p-3 sm:p-4 rounded-md transition-colors flex items-center gap-2 sm:gap-3 ${selectedBatchId === batch.$id
                                        ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
                                        : 'hover:bg-gray-100 dark:hover:bg-gray-600 text-gray-900 dark:text-white'
                                    }`}
                            >
                                {React.createElement(batchIcons[index % batchIcons.length], {
                                    className: `w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0 ${selectedBatchId === batch.$id ? 'text-blue-600 dark:text-blue-400' : 'text-gray-500'}`
                                })}
                                <span className="text-sm sm:text-base md:text-lg truncate">{batch.name}</span>
                            </button>
                        ))}
                    </div>
                </>
            )}
        </div>
    );
}

const ContentCard = ({ item, onDownload }: { item: CombinedContent; onDownload: (s3Key: string) => void; }) => {
    const isLecture = item.type === 'lecture';
    const data = item.data as Lecture & Resource;
    const Icon = isLecture ? Play : FileText;
    const iconBg = isLecture ? "bg-blue-500" : "bg-gradient-to-br from-yellow-500 to-amber-600";
    const SubjectIcon = isLecture ? getSubjectIcon(data.subject) : null;

    const cardContent = (
        <div className="group bg-white dark:bg-gray-900 hover:shadow-lg rounded-xl p-3 min-[488px]:p-4 sm:p-5 md:p-6 transition-all border border-slate-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-600">
            <div className="flex items-start gap-2 min-[488px]:gap-3 sm:gap-4">
                <div className={`w-10 h-10 min-[488px]:w-12 min-[488px]:h-12 sm:w-14 sm:h-14 ${iconBg} rounded-xl flex items-center justify-center shadow-md flex-shrink-0`}>
                    <Icon className="w-5 h-5 min-[488px]:w-6 min-[488px]:h-6 sm:w-7 sm:h-7 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-slate-900 dark:text-white text-sm min-[488px]:text-base sm:text-lg mb-1.5 min-[488px]:mb-2 line-clamp-2 sm:line-clamp-1">
                        {data.title}
                    </h3>
                    <div className="flex items-center flex-wrap gap-x-2 min-[488px]:gap-x-3 sm:gap-x-4 gap-y-1 min-[488px]:gap-y-1.5 sm:gap-y-2 text-[10px] min-[488px]:text-xs sm:text-sm text-slate-600 dark:text-slate-400">
                        {isLecture && SubjectIcon && (
                            <span className="flex items-center gap-1 sm:gap-1.5">
                                <SubjectIcon className="w-3 h-3 min-[488px]:w-3.5 min-[488px]:h-3.5 sm:w-4 sm:h-4 text-sky-500 flex-shrink-0" />
                                <span className="truncate max-w-[100px] min-[488px]:max-w-[120px] sm:max-w-none">{data.subject}</span>
                            </span>
                        )}
                        {isLecture && (
                            <span className="flex items-center gap-1 sm:gap-1.5">
                                <User className="w-3 h-3 min-[488px]:w-3.5 min-[488px]:h-3.5 sm:w-4 sm:h-4 text-rose-500 flex-shrink-0" />
                                <span className="truncate max-w-[100px] min-[488px]:max-w-[120px] sm:max-w-none">{data.teacherName}</span>
                            </span>
                        )}
                        <span className="flex items-center gap-1 sm:gap-1.5 whitespace-nowrap">
                            <Calendar className="w-3 h-3 min-[488px]:w-3.5 min-[488px]:h-3.5 sm:w-4 sm:h-4 text-amber-500 flex-shrink-0" />
                            {new Date(isLecture ? data.lectureDate : data.$createdAt).toLocaleDateString('en-US', {
                                month: 'short',
                                day: 'numeric',
                                year: 'numeric'
                            })}
                        </span>
                    </div>
                </div>
                {!isLecture && (
                    <button
                        onClick={() => onDownload(data.fileS3Key)}
                        className="p-2 min-[488px]:p-2.5 sm:p-3 bg-blue-50 dark:bg-blue-900/30 hover:bg-blue-100 dark:hover:bg-blue-800/50 rounded-xl transition-colors flex-shrink-0"
                        aria-label="Download resource"
                    >
                        <Download className="w-3.5 h-3.5 min-[488px]:w-4 min-[488px]:h-4 sm:w-5 sm:h-5 text-blue-600" />
                    </button>
                )}
            </div>
        </div>
    );

    return isLecture ? <Link href={`/lecture/${data.$id}`}>{cardContent}</Link> : <div>{cardContent}</div>;
};


// --- Main Page Component ---
const BatchLibrary = () => {
    const { user } = useAuth();
    const [enrolledBatches, setEnrolledBatches] = useState<Batch[]>([]);
    const [selectedBatchId, setSelectedBatchId] = useState<string | null>(null);
    const [isLoadingBatches, setIsLoadingBatches] = useState(true);
    const [isLoadingContent, setIsLoadingContent] = useState(false);
    const [activeTab, setActiveTab] = useState('lectures');

    // --- Data Fetching Logic ---
    useEffect(() => {
        if (!user) return;
        const fetchEnrolledBatches = async () => {
            setIsLoadingBatches(true);
            try {
                const enrollmentResponse = await databases.listDocuments(
                    DATABASE_ID, ENROLLMENTS_COLLECTION_ID, [Query.equal('userId', user.$id)]
                );
                if (enrollmentResponse.documents.length === 0) {
                    setEnrolledBatches([]);
                    return;
                }
                const batchIds = enrollmentResponse.documents.map(doc => doc.batchId);
                const batchResponse = await databases.listDocuments(
                    DATABASE_ID, BATCHES_COLLECTION_ID, [Query.equal('$id', batchIds)]
                );
                const batchesWithEmptyContent = batchResponse.documents.map(b => ({ ...b, lectures: [], resources: [] })) as unknown as Batch[];
                setEnrolledBatches(batchesWithEmptyContent);
                if (batchesWithEmptyContent.length > 0) {
                    setSelectedBatchId(batchesWithEmptyContent[0].$id);
                }
            } catch (error) {
                console.error("Failed to fetch enrolled batches:", error);
            } finally {
                setIsLoadingBatches(false);
            }
        };
        fetchEnrolledBatches();
    }, [user]);

    useEffect(() => {
        if (!selectedBatchId) return;

        // Check if content is already loaded to avoid refetching
        const currentBatch = enrolledBatches.find(b => b.$id === selectedBatchId);
        if (currentBatch && (currentBatch.lectures.length > 0 || currentBatch.resources.length > 0)) {
            // Data is likely already fetched, no need to fetch again unless you want fresh data.
            return;
        }

        const fetchBatchContent = async () => {
            setIsLoadingContent(true);
            try {
                const lecturesResponse = await databases.listDocuments(
                    DATABASE_ID, LECTURES_COLLECTION_ID,
                    [Query.equal('batchId', selectedBatchId), Query.orderDesc('lectureDate'), Query.limit(100)]
                );
                const lectures = lecturesResponse.documents as unknown as Lecture[];

                const teacherUserIds = [...new Set(lectures.map(l => l.uploaderId).filter(Boolean))];
                const teacherMap = new Map<string, string>();
                if (teacherUserIds.length > 0) {
                    const profilesResponse = await databases.listDocuments(
                        DATABASE_ID, TEACHER_PROFILES_COLLECTION_ID,
                        [Query.equal('userId', teacherUserIds)]
                    );
                    profilesResponse.documents.forEach(profile => teacherMap.set(profile.userId, profile.name));
                }

                const fetchedLectures = lectures.map(l => ({ ...l, teacherName: teacherMap.get(l.uploaderId) || 'Unknown Instructor' }));
                const lectureIds = fetchedLectures.map(l => l.$id);
                let fetchedResources: Resource[] = [];

                if (lectureIds.length > 0) {
                    const resourcesResponse = await databases.listDocuments(
                        DATABASE_ID, LECTURE_RESOURCES_COLLECTION_ID,
                        [Query.equal('lectureId', lectureIds), Query.limit(100)]
                    );
                    fetchedResources = resourcesResponse.documents as unknown as Resource[];
                }

                setEnrolledBatches(prevBatches => prevBatches.map(batch =>
                    batch.$id === selectedBatchId
                        ? { ...batch, lectures: fetchedLectures, resources: fetchedResources }
                        : batch
                ));
            } catch (error) {
                console.error("Failed to fetch batch content:", error);
            } finally {
                setIsLoadingContent(false);
            }
        };
        fetchBatchContent();
    }, [selectedBatchId, enrolledBatches]); // Add enrolledBatches to dependency array

    // --- Memoization and Handlers ---
    const selectedBatchData = enrolledBatches.find(b => b.$id === selectedBatchId);

    const sortedContent = useMemo((): CombinedContent[] => {
        if (!selectedBatchData) return [];
        const combined = [
            ...selectedBatchData.lectures.map(l => ({ type: 'lecture' as const, date: new Date(l.lectureDate), data: l })),
            ...selectedBatchData.resources.map(r => ({ type: 'resource' as const, date: new Date(r.$createdAt), data: r })),
        ];
        return combined.sort((a, b) => b.date.getTime() - a.date.getTime());
    }, [selectedBatchData]);

    const handleResourceDownload = async (s3Key: string) => {
        try {
            const response = await fetch('/api/resources/view', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ s3Key }),
            });
            if (!response.ok) throw new Error('Failed to get resource URL.');
            const { url } = await response.json();
            window.open(url, '_blank');
        } catch (error) {
            alert('Could not download resource.');
        }
    };

    const filteredContent = useMemo(() => {
        if (activeTab === 'lectures') return sortedContent.filter(item => item.type === 'lecture');
        if (activeTab === 'resources') return sortedContent.filter(item => item.type === 'resource');
        return [];
    }, [activeTab, sortedContent]);


    if (isLoadingBatches) {
        return <FullPageLoader />;
    }

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-gray-900/50 flex flex-col xl:flex-row font-sans">
            <BatchSelector
                batches={enrolledBatches}
                selectedBatchId={selectedBatchId}
                setSelectedBatchId={setSelectedBatchId}
                setActiveTab={setActiveTab}
            />

            {/* Right Content Area */}
            <div className="flex-1 flex flex-col overflow-hidden">
                <MobileBatchDropdown
                    batches={enrolledBatches}
                    selectedBatchId={selectedBatchId}
                    setSelectedBatchId={setSelectedBatchId}
                    setActiveTab={setActiveTab}
                />

                {selectedBatchData ? (
                    <>
                        {/* Header */}
                        <div className={`bg-gradient-to-r ${colorClasses[enrolledBatches.findIndex(b => b.$id === selectedBatchId) % colorClasses.length]} p-4 sm:p-5 md:p-6 text-white shadow-lg`}>
                            <div className="max-w-5xl mx-auto">
                                <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold mb-2 line-clamp-2">
                                    {selectedBatchData.name}
                                </h2>
                                <div className="flex items-center gap-3 sm:gap-4 text-xs sm:text-sm text-white/90">
                                    <span className="flex items-center gap-1 sm:gap-1.5">
                                        <Video className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                                        <span className="hidden xs:inline">{selectedBatchData.lectures.length} Lectures</span>
                                        <span className="xs:hidden">{selectedBatchData.lectures.length}</span>
                                    </span>
                                    <span className="flex items-center gap-1 sm:gap-1.5">
                                        <FileText className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                                        <span className="hidden xs:inline">{selectedBatchData.resources.length} Resources</span>
                                        <span className="xs:hidden">{selectedBatchData.resources.length}</span>
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Tabs */}
                        <div className="bg-white dark:bg-gray-800 border-b border-slate-200 dark:border-gray-700 shadow-sm sticky top-0 z-10">
                            <div className="max-w-5xl mx-auto flex">
                                <button
                                    onClick={() => setActiveTab('lectures')}
                                    className={`flex-1 px-2 sm:px-4 py-3 text-xs sm:text-sm md:text-base font-semibold transition-all ${activeTab === 'lectures'
                                            ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50 dark:bg-blue-900/20'
                                            : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-gray-700'
                                        }`}
                                >
                                    <div className="flex items-center justify-center gap-1 sm:gap-2">
                                        <Video className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                                        <span className="hidden sm:inline">Lectures</span>
                                        <span>({selectedBatchData.lectures.length})</span>
                                    </div>
                                </button>
                                <button
                                    onClick={() => setActiveTab('resources')}
                                    className={`flex-1 px-2 sm:px-4 py-3 text-xs sm:text-sm md:text-base font-semibold transition-all ${activeTab === 'resources'
                                            ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50 dark:bg-blue-900/20'
                                            : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-gray-700'
                                        }`}
                                >
                                    <div className="flex items-center justify-center gap-1 sm:gap-2">
                                        <FileText className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                                        <span className="hidden sm:inline">Resources</span>
                                        <span>({selectedBatchData.resources.length})</span>
                                    </div>
                                </button>
                            </div>
                        </div>

                        {/* Content */}
                        <div className="flex-1 overflow-y-auto p-2 min-[488px]:p-3 sm:p-4 md:p-6 lg:p-8 bg-slate-100 dark:bg-gray-800">
                            <div className="max-w-5xl mx-auto">
                                {isLoadingContent ? (
                                    <div className="text-center p-10">
                                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                                    </div>
                                ) : (
                                    <div className="space-y-2 min-[488px]:space-y-3 sm:space-y-4">
                                        {filteredContent.length > 0 ? filteredContent.map((item) => (
                                            <div key={`${item.type}-${item.data.$id}`} className="mx-auto w-[95%] min-[488px]:w-full min-[488px]:max-w-2xl sm:max-w-none">
                                                <ContentCard item={item} onDownload={handleResourceDownload} />
                                            </div>
                                        )) : (
                                            <div className="text-center py-12 sm:py-16">
                                                <p className="text-gray-500 text-sm sm:text-base">No content found for this filter.</p>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    </>
                ) : (
                    <div className="flex-1 flex items-center justify-center text-center p-6 sm:p-8">
                        <div>
                            <BookCopy className="w-16 h-16 sm:w-20 sm:h-20 text-slate-300 dark:text-gray-600 mx-auto mb-4" />
                            <h2 className="text-xl sm:text-2xl font-bold text-slate-800 dark:text-slate-200 mb-2">
                                Welcome to Your Library
                            </h2>
                            <p className="text-slate-500 dark:text-slate-400 text-sm sm:text-base">
                                {enrolledBatches.length > 0 ? "Select a batch to view its content." : "You are not enrolled in any batches yet."}
                            </p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default withAuth(BatchLibrary);