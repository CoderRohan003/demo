'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import withAdminAuth from '@/app/components/auth/withAdminAuth';
import { databases } from '@/lib/appwrite';
import { ID, Query } from 'appwrite';
import { useAuth } from '@/context/AuthContext';
import { PlusCircle, X } from 'lucide-react';

// Batch interface
interface Batch {
  $id: string;
  name: string;
  subjects: string[];
  category: string; // "Academic" or "Coding and AI"
}

const DATABASE_ID = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!;
const LECTURES_COLLECTION_ID = process.env.NEXT_PUBLIC_APPWRITE_LECTURES_COLLECTION_ID!;
const BATCHES_COLLECTION_ID = process.env.NEXT_PUBLIC_APPWRITE_BATCHES_ID!;
const LECTURE_RESOURCES_COLLECTION_ID = process.env.NEXT_PUBLIC_APPWRITE_LECTURE_RESOURCES_COLLECTION_ID!;
const ENROLLMENTS_COLLECTION_ID = process.env.NEXT_PUBLIC_APPWRITE_ENROLLMENTS_COLLECTION_ID!;
const NOTIFICATIONS_COLLECTION_ID = process.env.NEXT_PUBLIC_APPWRITE_NOTIFICATIONS_COLLECTION_ID!;

const UploadPage = () => {
  const { user } = useAuth();
  const router = useRouter();
  const resourceInputRef = useRef<HTMLInputElement>(null);

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const [allBatches, setAllBatches] = useState<Batch[]>([]);
  const [filteredBatches, setFilteredBatches] = useState<Batch[]>([]);
  const [availableSubjects, setAvailableSubjects] = useState<string[]>([]);

  const [formState, setFormState] = useState({
    title: '',
    subject: '',
    lectureDate: '',
    videoFile: null as File | null,
    description: '',
    batchId: '',
    category: '',
  });
  const [resourceFiles, setResourceFiles] = useState<File[]>([]);
  const [videoPreview, setVideoPreview] = useState<string | null>(null);

  useEffect(() => {
    const fetchBatches = async () => {
      try {
        const response = await databases.listDocuments(DATABASE_ID, BATCHES_COLLECTION_ID);
        setAllBatches(response.documents as unknown as Batch[]);
      } catch (error) {
        console.error("Failed to fetch batches:", error);
      }
    };
    fetchBatches();
  }, []);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { id, value } = e.target;
    let newFormState = { ...formState, [id]: value };

    if (id === 'category') {
      const filtered = allBatches.filter(batch => batch.category === value);
      setFilteredBatches(filtered);
      newFormState.batchId = '';
      newFormState.subject = '';
      setAvailableSubjects([]);
    }

    if (id === 'batchId') {
      const selectedBatch = allBatches.find(batch => batch.$id === value);
      if (selectedBatch) {
        setAvailableSubjects(selectedBatch.subjects || []);
      } else {
        setAvailableSubjects([]);
      }
      newFormState.subject = '';
    }

    setFormState(newFormState);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    if (file) {
      setFormState(prev => ({ ...prev, videoFile: file }));
      setVideoPreview(URL.createObjectURL(file));
    }
  };

  const handleResourceFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      setResourceFiles(prevFiles => [...prevFiles, ...newFiles]);
    }
    e.target.value = '';
  };

  const handleRemoveResourceFile = (indexToRemove: number) => {
    setResourceFiles(prev => prev.filter((_, index) => index !== indexToRemove));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formState.videoFile || !user || !formState.batchId) {
      setError('Please fill all fields, select a video file, and choose a batch.');
      return;
    }
    setIsLoading(true);
    setError('');
    setSuccessMessage('');

    try {
      // Upload video
      const presignResponse = await fetch('/api/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          filename: formState.videoFile.name,
          contentType: formState.videoFile.type,
        }),
      });
      if (!presignResponse.ok) throw new Error('Failed to get pre-signed URL for video.');
      const { url: videoUrl, key: videoKey } = await presignResponse.json();
      await fetch(videoUrl, { method: 'PUT', body: formState.videoFile, headers: { 'Content-Type': formState.videoFile.type } });

      // Create lecture doc
      const newLecture = await databases.createDocument(DATABASE_ID, LECTURES_COLLECTION_ID, ID.unique(), {
        title: formState.title,
        subject: formState.subject,
        lectureDate: new Date(formState.lectureDate).toISOString(),
        s3Key: videoKey,
        uploaderId: user.$id,
        description: formState.description,
        batchId: formState.batchId,
      });

      // --- START: NEW, EFFICIENT NOTIFICATION LOGIC ---
      // Create only ONE notification, targeted at the batch.
      await databases.createDocument(
        DATABASE_ID,
        NOTIFICATIONS_COLLECTION_ID,
        ID.unique(),
        {
          targetId: formState.batchId, // Target the batch, not individual users
          message: `New Lecture: "${formState.title}" was added to your batch.`,
          link: `/lecture/${newLecture.$id}`,
          type: 'lecture',
        }
      );
      // --- END: NEW NOTIFICATION LOGIC ---

      // Upload resources
      for (const file of resourceFiles) {
        const resourcePresignResponse = await fetch('/api/resources/upload', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ filename: file.name, contentType: file.type }),
        });
        if (!resourcePresignResponse.ok) throw new Error(`Failed for ${file.name}.`);
        const { url: resourceUrl, key: resourceKey } = await resourcePresignResponse.json();
        await fetch(resourceUrl, { method: 'PUT', body: file, headers: { 'Content-Type': file.type } });

        await databases.createDocument(DATABASE_ID, LECTURE_RESOURCES_COLLECTION_ID, ID.unique(), {
          lectureId: newLecture.$id,
          title: file.name,
          fileS3Key: resourceKey,
        });
      }

      setSuccessMessage('Lecture and resources uploaded successfully!');
      setTimeout(() => router.push('/home'), 2000);
    } catch (err) {
      if (err instanceof Error) setError(err.message);
      else setError('An error occurred during upload.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Upload New Lecture</h1>
      <form onSubmit={handleSubmit} className="p-8 space-y-6 bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700">

        {/* Category + Batch */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="category" className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">Category</label>
            <select id="category" value={formState.category} onChange={handleInputChange} className="w-full px-3 py-2 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md" required>
              <option value="">Select a Category</option>
              <option value="Academic">Academic</option>
              <option value="Coding and AI">Coding and AI</option>
            </select>
          </div>
          <div>
            <label htmlFor="batchId" className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">Batch</label>
            <select id="batchId" value={formState.batchId} onChange={handleInputChange} className="w-full px-3 py-2 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md" required disabled={!formState.category}>
              <option value="">Select a Batch</option>
              {filteredBatches.map(batch => (
                <option key={batch.$id} value={batch.$id}>{batch.name}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Title */}
        <div>
          <label htmlFor="title" className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">Lecture Title</label>
          <input type="text" id="title" value={formState.title} onChange={handleInputChange} className="w-full px-3 py-2 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md" required />
        </div>

        {/* Description */}
        <div>
          <label htmlFor="description" className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">Description</label>
          <textarea id="description" value={formState.description} onChange={handleInputChange} className="w-full px-3 py-2 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md" rows={4} />
        </div>

        {/* Subject + Date */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="subject" className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">Subject</label>
            <select id="subject" value={formState.subject} onChange={handleInputChange} className="w-full px-3 py-2 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md disabled:bg-gray-200 dark:disabled:bg-gray-600 disabled:cursor-not-allowed" required disabled={!formState.batchId}>
              <option value="">Select a Subject</option>
              {availableSubjects.map(subject => (<option key={subject} value={subject}>{subject}</option>))}
            </select>
          </div>
          <div>
            <label htmlFor="lectureDate" className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">Lecture Date</label>
            <input type="date" id="lectureDate" value={formState.lectureDate} onChange={handleInputChange} className="w-full px-3 py-2 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md" required />
          </div>
        </div>

        {/* Video File + Preview */}
        <div>
          <label htmlFor="videoFile" className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">Video File</label>
          <input type="file" id="videoFile" accept="video/mp4,video/x-m4v,video/*" onChange={handleFileChange} className="w-full text-sm text-gray-500 dark:text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:bg-blue-600 file:text-white hover:file:bg-blue-700" required />

          {videoPreview && (
            <div className="mt-4">
              <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">Preview:</p>
              <video controls className="w-full rounded-md" src={videoPreview}></video>
            </div>
          )}
        </div>

        {/* Resources */}
        <div>
          <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">Lecture Resources</label>
          <div className="space-y-2">
            {resourceFiles.map((file, index) => (
              <div key={index} className="flex items-center justify-between bg-gray-100 dark:bg-gray-700 p-2 rounded-md">
                <span className="text-sm text-gray-800 dark:text-gray-300 truncate">{file.name}</span>
                <button type="button" onClick={() => handleRemoveResourceFile(index)} className="text-red-500 dark:text-red-400 hover:text-red-600 dark:hover:text-red-500"><X size={16} /></button>
              </div>
            ))}
          </div>
          <button type="button" onClick={() => resourceInputRef.current?.click()} className="mt-2 flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"><PlusCircle size={16} />Add Resource</button>
          <input type="file" ref={resourceInputRef} onChange={handleResourceFileChange} className="hidden" multiple accept=".pdf,.doc,.docx,.zip,.rar,.txt" />
        </div>

        {error && <p className="text-sm text-red-400 text-center">{error}</p>}
        {successMessage && <p className="text-sm text-green-400 text-center">{successMessage}</p>}

        <div className="pt-4">
          <button type="submit" disabled={isLoading || successMessage !== ''} className="w-full px-4 py-3 font-bold text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:bg-gray-500">
            {isLoading ? 'Uploading...' : 'Upload Lecture'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default withAdminAuth(UploadPage);























// 'use client';

// import { useState, useEffect, useRef } from 'react';
// import { useRouter } from 'next/navigation';
// import withAdminAuth from '@/app/components/auth/withAdminAuth';
// import { databases } from '@/lib/appwrite';
// import { ID } from 'appwrite';
// import { useAuth } from '@/context/AuthContext';
// import {
//   PlusCircle,
//   X,
//   Upload,
//   Video,
//   FileText,
//   Calendar,
//   BookOpen,
//   Tag,
//   Users,
//   Play,
//   CheckCircle,
//   AlertCircle,
//   Loader2,
//   XCircle
// } from 'lucide-react';

// // Batch interface
// interface Batch {
//   $id: string;
//   name: string;
//   subjects: string[];
//   category: string; // "Academic" or "Coding and AI"
// }

// const DATABASE_ID = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!;
// const LECTURES_COLLECTION_ID = process.env.NEXT_PUBLIC_APPWRITE_LECTURES_COLLECTION_ID!;
// const BATCHES_COLLECTION_ID = process.env.NEXT_PUBLIC_APPWRITE_BATCHES_ID!;
// const LECTURE_RESOURCES_COLLECTION_ID = process.env.NEXT_PUBLIC_APPWRITE_LECTURE_RESOURCES_COLLECTION_ID!;

// const UploadPage = () => {
//   const { user } = useAuth();
//   const router = useRouter();
//   const resourceInputRef = useRef<HTMLInputElement>(null);

//   const [isLoading, setIsLoading] = useState(false);
//   const [error, setError] = useState('');
//   const [successMessage, setSuccessMessage] = useState('');

//   const [allBatches, setAllBatches] = useState<Batch[]>([]);
//   const [filteredBatches, setFilteredBatches] = useState<Batch[]>([]);
//   const [availableSubjects, setAvailableSubjects] = useState<string[]>([]);

//   const [formState, setFormState] = useState({
//     title: '',
//     subject: '',
//     lectureDate: '',
//     videoFile: null as File | null,
//     description: '',
//     batchId: '',
//     category: '',
//   });
//   const [resourceFiles, setResourceFiles] = useState<File[]>([]);
//   const [videoPreview, setVideoPreview] = useState<string | null>(null);
//   const [uploadProgress, setUploadProgress] = useState(0);
//   const [showToast, setShowToast] = useState(false);
//   const [toastType, setToastType] = useState<'success' | 'error'>('success');
//   const [toastMessage, setToastMessage] = useState('');

//   useEffect(() => {
//     const fetchBatches = async () => {
//       try {
//         const response = await databases.listDocuments(DATABASE_ID, BATCHES_COLLECTION_ID);
//         setAllBatches(response.documents as unknown as Batch[]);
//       } catch (error) {
//         console.error("Failed to fetch batches:", error);
//       }
//     };
//     fetchBatches();
//   }, []);

//   const handleInputChange = (
//     e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
//   ) => {
//     const { id, value } = e.target;
//     let newFormState = { ...formState, [id]: value };

//     if (id === 'category') {
//       const filtered = allBatches.filter(batch => batch.category === value);
//       setFilteredBatches(filtered);
//       newFormState.batchId = '';
//       newFormState.subject = '';
//       setAvailableSubjects([]);
//     }

//     if (id === 'batchId') {
//       const selectedBatch = allBatches.find(batch => batch.$id === value);
//       if (selectedBatch) {
//         setAvailableSubjects(selectedBatch.subjects || []);
//       } else {
//         setAvailableSubjects([]);
//       }
//       newFormState.subject = '';
//     }

//     setFormState(newFormState);
//   };

//   const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     const file = e.target.files?.[0] ?? null;
//     if (file) {
//       setFormState(prev => ({ ...prev, videoFile: file }));
//       setVideoPreview(URL.createObjectURL(file));
//     }
//   };

//   const handleResourceFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     if (e.target.files) {
//       const newFiles = Array.from(e.target.files);
//       setResourceFiles(prevFiles => [...prevFiles, ...newFiles]);
//     }
//     e.target.value = '';
//   };

//   const handleRemoveResourceFile = (indexToRemove: number) => {
//     setResourceFiles(prev => prev.filter((_, index) => index !== indexToRemove));
//   };

//   const formatFileSize = (bytes: number) => {
//     if (bytes === 0) return '0 Bytes';
//     const k = 1024;
//     const sizes = ['Bytes', 'KB', 'MB', 'GB'];
//     const i = Math.floor(Math.log(bytes) / Math.log(k));
//     return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
//   };

//   const showToastNotification = (type: 'success' | 'error', message: string) => {
//     setToastType(type);
//     setToastMessage(message);
//     setShowToast(true);

//     // Auto-hide after 5 seconds
//     setTimeout(() => {
//       setShowToast(false);
//     }, 5000);
//   };

//   const getFileIcon = (filename: string) => {
//     const extension = filename.split('.').pop()?.toLowerCase();
//     switch (extension) {
//       case 'pdf':
//         return '📄';
//       case 'doc':
//       case 'docx':
//         return '📝';
//       case 'zip':
//       case 'rar':
//         return '🗜️';
//       default:
//         return '📎';
//     }
//   };

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
//     if (!formState.videoFile || !user || !formState.batchId) {
//       setError('Please fill all fields, select a video file, and choose a batch.');
//       return;
//     }
//     setIsLoading(true);
//     setError('');
//     setSuccessMessage('');
//     setUploadProgress(0);

//     try {
//       setUploadProgress(10);

//       // Upload video
//       const presignResponse = await fetch('/api/upload', {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({
//           filename: formState.videoFile.name,
//           contentType: formState.videoFile.type,
//         }),
//       });
//       if (!presignResponse.ok) throw new Error('Failed to get pre-signed URL for video.');
//       const { url: videoUrl, key: videoKey } = await presignResponse.json();

//       setUploadProgress(30);

//       await fetch(videoUrl, {
//         method: 'PUT',
//         body: formState.videoFile,
//         headers: { 'Content-Type': formState.videoFile.type }
//       });

//       setUploadProgress(50);

//       // Create lecture doc
//       const newLecture = await databases.createDocument(DATABASE_ID, LECTURES_COLLECTION_ID, ID.unique(), {
//         title: formState.title,
//         subject: formState.subject,
//         lectureDate: new Date(formState.lectureDate).toISOString(),
//         s3Key: videoKey,
//         uploaderId: user.$id,
//         description: formState.description,
//         batchId: formState.batchId,
//       });

//       setUploadProgress(70);

//       // Upload resources
//       for (let i = 0; i < resourceFiles.length; i++) {
//         const file = resourceFiles[i];
//         const resourcePresignResponse = await fetch('/api/resources/upload', {
//           method: 'POST',
//           headers: { 'Content-Type': 'application/json' },
//           body: JSON.stringify({ filename: file.name, contentType: file.type }),
//         });
//         if (!resourcePresignResponse.ok) throw new Error(`Failed for ${file.name}.`);
//         const { url: resourceUrl, key: resourceKey } = await resourcePresignResponse.json();
//         await fetch(resourceUrl, { method: 'PUT', body: file, headers: { 'Content-Type': file.type } });

//         await databases.createDocument(DATABASE_ID, LECTURE_RESOURCES_COLLECTION_ID, ID.unique(), {
//           lectureId: newLecture.$id,
//           title: file.name,
//           fileS3Key: resourceKey,
//         });

//         setUploadProgress(70 + (i + 1) / resourceFiles.length * 20);
//       }

//       setUploadProgress(100);
//       setSuccessMessage('Lecture and resources uploaded successfully!');
//       showToastNotification('success', 'Lecture uploaded successfully! Redirecting to home...');

//       setTimeout(() => router.push('/home'), 3000);
//     } catch (err) {
//       if (err instanceof Error) {
//         setError(err.message);
//         showToastNotification('error', `Upload failed: ${err.message}`);
//       } else {
//         setError('An error occurred during upload.');
//         showToastNotification('error', 'An unexpected error occurred during upload.');
//       }
//       setUploadProgress(0);
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   const isFormComplete = formState.title && formState.subject && formState.lectureDate &&
//     formState.videoFile && formState.batchId && formState.category;

//   const hideToast = () => {
//     setShowToast(false);
//   };


//   return (
//     <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/30 dark:from-gray-900 dark:via-blue-950/20 dark:to-indigo-950/20">
//       {/* Background Pattern */}
//       <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(99,102,241,0.1)_1px,transparent_0)] [background-size:20px_20px] pointer-events-none"></div>

//       <div className="relative w-full max-w-5xl mx-auto px-6 py-8">
//         {/* Header */}
//         <div className="text-center mb-12">
//           <div className="flex items-center justify-center space-x-3 mb-6">
//             <div className="p-4 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-3xl">
//               <Upload className="w-8 h-8 text-white" />
//             </div>
//           </div>

//           <h1 className="text-4xl lg:text-5xl font-bold bg-gradient-to-r from-gray-900 via-blue-900 to-indigo-900 dark:from-white dark:via-blue-100 dark:to-indigo-100 bg-clip-text text-transparent mb-4">
//             Upload New Lecture
//           </h1>

//           <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
//             Upload video lectures and resources
//           </p>
//         </div>

//         {/* Main Form */}
//         <form onSubmit={handleSubmit} className="space-y-8">
//           <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-md rounded-3xl p-8 border border-gray-200/50 dark:border-gray-700/50 shadow-xl">

//             {/* Progress Indicator */}
//             {(isLoading || uploadProgress > 0) && (
//               <div className="mb-8 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-2xl p-6 border border-blue-200/50 dark:border-blue-700/50">
//                 <div className="flex items-center justify-between mb-3">
//                   <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">Upload Progress</span>
//                   <span className="text-sm font-bold text-blue-600 dark:text-blue-400">{uploadProgress}%</span>
//                 </div>
//                 <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 overflow-hidden">
//                   <div
//                     className="h-full bg-gradient-to-r from-blue-500 via-purple-500 to-indigo-600 rounded-full transition-all duration-500 ease-out"
//                     style={{ width: `${uploadProgress}%` }}
//                   ></div>
//                 </div>
//               </div>
//             )}

//             {/* Category and Batch Selection */}
//             <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
//               <div className="space-y-3">
//                 <label htmlFor="category" className="flex items-center space-x-2 text-sm font-semibold text-gray-700 dark:text-gray-300">
//                   <Tag className="w-4 h-4 text-purple-500" />
//                   <span>Category</span>
//                 </label>
//                 <select
//                   id="category"
//                   value={formState.category}
//                   onChange={handleInputChange}
//                   className="w-full px-4 py-3 bg-white/50 dark:bg-gray-700/50 backdrop-blur-sm border border-gray-200 dark:border-gray-600 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all duration-300 text-gray-900 dark:text-white"
//                   required
//                 >
//                   <option value="">Choose category...</option>
//                   <option value="Academic">🎓 Academic</option>
//                   <option value="Coding and AI">💻 Coding and AI</option>
//                 </select>
//               </div>

//               <div className="space-y-3">
//                 <label htmlFor="batchId" className="flex items-center space-x-2 text-sm font-semibold text-gray-700 dark:text-gray-300">
//                   <Users className="w-4 h-4 text-green-500" />
//                   <span>Batch</span>
//                 </label>
//                 <select
//                   id="batchId"
//                   value={formState.batchId}
//                   onChange={handleInputChange}
//                   className="w-full px-4 py-3 bg-white/50 dark:bg-gray-700/50 backdrop-blur-sm border border-gray-200 dark:border-gray-600 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all duration-300 text-gray-900 dark:text-white disabled:bg-gray-200/50 dark:disabled:bg-gray-600/50 disabled:cursor-not-allowed"
//                   required
//                   disabled={!formState.category}
//                 >
//                   <option value="">Select batch...</option>
//                   {filteredBatches.map(batch => (
//                     <option key={batch.$id} value={batch.$id}>{batch.name}</option>
//                   ))}
//                 </select>
//               </div>
//             </div>

//             {/* Title */}
//             <div className="space-y-3 mb-8">
//               <label htmlFor="title" className="flex items-center space-x-2 text-sm font-semibold text-gray-700 dark:text-gray-300">
//                 <BookOpen className="w-4 h-4 text-blue-500" />
//                 <span>Lecture Title</span>
//               </label>
//               <input
//                 type="text"
//                 id="title"
//                 value={formState.title}
//                 onChange={handleInputChange}
//                 className="w-full px-4 py-3 bg-white/50 dark:bg-gray-700/50 backdrop-blur-sm border border-gray-200 dark:border-gray-600 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all duration-300 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
//                 placeholder="Enter a descriptive title for your lecture..."
//                 required
//               />
//             </div>

//             {/* Description */}
//             <div className="space-y-3 mb-8">
//               <label htmlFor="description" className="flex items-center space-x-2 text-sm font-semibold text-gray-700 dark:text-gray-300">
//                 <FileText className="w-4 h-4 text-orange-500" />
//                 <span>Description</span>
//               </label>
//               <textarea
//                 id="description"
//                 value={formState.description}
//                 onChange={handleInputChange}
//                 className="w-full px-4 py-3 bg-white/50 dark:bg-gray-700/50 backdrop-blur-sm border border-gray-200 dark:border-gray-600 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all duration-300 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 resize-none"
//                 rows={4}
//                 placeholder="Describe what students will learn in this lecture..."
//               />
//             </div>

//             {/* Subject and Date */}
//             <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
//               <div className="space-y-3">
//                 <label htmlFor="subject" className="flex items-center space-x-2 text-sm font-semibold text-gray-700 dark:text-gray-300">
//                   <BookOpen className="w-4 h-4 text-indigo-500" />
//                   <span>Subject</span>
//                 </label>
//                 <select
//                   id="subject"
//                   value={formState.subject}
//                   onChange={handleInputChange}
//                   className="w-full px-4 py-3 bg-white/50 dark:bg-gray-700/50 backdrop-blur-sm border border-gray-200 dark:border-gray-600 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all duration-300 text-gray-900 dark:text-white disabled:bg-gray-200/50 dark:disabled:bg-gray-600/50 disabled:cursor-not-allowed"
//                   required
//                   disabled={!formState.batchId}
//                 >
//                   <option value="">Choose subject...</option>
//                   {availableSubjects.map(subject => (
//                     <option key={subject} value={subject}>{subject}</option>
//                   ))}
//                 </select>
//               </div>

//               <div className="space-y-3">
//                 <label htmlFor="lectureDate" className="flex items-center space-x-2 text-sm font-semibold text-gray-700 dark:text-gray-300">
//                   <Calendar className="w-4 h-4 text-pink-500" />
//                   <span>Lecture Date</span>
//                 </label>
//                 <input
//                   type="date"
//                   id="lectureDate"
//                   value={formState.lectureDate}
//                   onChange={handleInputChange}
//                   className="w-full px-4 py-3 bg-white/50 dark:bg-gray-700/50 backdrop-blur-sm border border-gray-200 dark:border-gray-600 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all duration-300 text-gray-900 dark:text-white"
//                   required
//                 />
//               </div>
//             </div>

//             {/* Video File Upload */}
//             <div className="space-y-4 mb-8">
//               <label htmlFor="videoFile" className="flex items-center space-x-2 text-sm font-semibold text-gray-700 dark:text-gray-300">
//                 <Video className="w-4 h-4 text-red-500" />
//                 <span>Video File</span>
//               </label>

//               <div className="relative">
//                 <input
//                   type="file"
//                   id="videoFile"
//                   accept="video/mp4,video/x-m4v,video/*"
//                   onChange={handleFileChange}
//                   className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
//                   required
//                 />
//                 <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border-2 border-dashed border-blue-300 dark:border-blue-600 rounded-2xl p-8 text-center hover:from-blue-100 hover:to-indigo-100 dark:hover:from-blue-900/30 dark:hover:to-indigo-900/30 transition-all duration-300">
//                   <Video className="w-12 h-12 text-blue-500 dark:text-blue-400 mx-auto mb-4" />
//                   <p className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2">
//                     {formState.videoFile ? formState.videoFile.name : 'Choose video file'}
//                   </p>
//                   <p className="text-sm text-gray-500 dark:text-gray-400">
//                     {formState.videoFile ? formatFileSize(formState.videoFile.size) : 'Drag and drop or click to browse'}
//                   </p>
//                 </div>
//               </div>

//               {/* Video Preview */}
//               {videoPreview && (
//                 <div className="bg-black rounded-2xl overflow-hidden shadow-lg">
//                   <div className="p-4 bg-gradient-to-r from-gray-900 to-black">
//                     <div className="flex items-center space-x-2">
//                       <Play className="w-4 h-4 text-white" />
//                       <span className="text-sm font-medium text-white">Video Preview</span>
//                     </div>
//                   </div>
//                   <video controls className="w-full" src={videoPreview}></video>
//                 </div>
//               )}
//             </div>

//             {/* Resources Section */}
//             <div className="space-y-4">
//               <label className="flex items-center space-x-2 text-sm font-semibold text-gray-700 dark:text-gray-300">
//                 <FileText className="w-4 h-4 text-green-500" />
//                 <span>Lecture Resources</span>
//                 <span className="text-xs text-gray-500 dark:text-gray-400">(Optional)</span>
//               </label>

//               {/* Resource Files List */}
//               {resourceFiles.length > 0 && (
//                 <div className="space-y-3">
//                   {resourceFiles.map((file, index) => (
//                     <div key={index} className="flex items-center justify-between bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 p-4 rounded-2xl border border-green-200/50 dark:border-green-700/50">
//                       <div className="flex items-center space-x-3">
//                         <span className="text-2xl">{getFileIcon(file.name)}</span>
//                         <div>
//                           <span className="text-sm font-medium text-gray-800 dark:text-gray-200 block truncate max-w-xs">
//                             {file.name}
//                           </span>
//                           <span className="text-xs text-gray-500 dark:text-gray-400">
//                             {formatFileSize(file.size)}
//                           </span>
//                         </div>
//                       </div>
//                       <button
//                         type="button"
//                         onClick={() => handleRemoveResourceFile(index)}
//                         className="p-2 text-red-500 dark:text-red-400 hover:text-red-600 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-all duration-200"
//                       >
//                         <X className="w-4 h-4" />
//                       </button>
//                     </div>
//                   ))}
//                 </div>
//               )}

//               {/* Add Resource Button */}
//               <button
//                 type="button"
//                 onClick={() => resourceInputRef.current?.click()}
//                 className="w-full flex items-center justify-center gap-3 px-6 py-4 text-sm font-semibold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-2xl hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-all duration-300"
//               >
//                 <PlusCircle className="w-5 h-5" />
//                 Add Resource Files
//               </button>
//               <input
//                 type="file"
//                 ref={resourceInputRef}
//                 onChange={handleResourceFileChange}
//                 className="hidden"
//                 multiple
//                 accept=".pdf,.doc,.docx,.zip,.rar,.txt"
//               />
//             </div>

//             {/* Error and Success Messages */}
//             {error && (
//               <div className="flex items-center space-x-3 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-2xl">
//                 <AlertCircle className="w-5 h-5 text-red-500" />
//                 <p className="text-sm text-red-600 dark:text-red-400 font-medium">{error}</p>
//               </div>
//             )}

//             {successMessage && (
//               <div className="flex items-center space-x-3 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-2xl">
//                 <CheckCircle className="w-5 h-5 text-green-500" />
//                 <p className="text-sm text-green-600 dark:text-green-400 font-medium">{successMessage}</p>
//               </div>
//             )}

//             {/* Submit Button */}
//             <div className="pt-6">
//               <button
//                 type="submit"
//                 disabled={isLoading || successMessage !== '' || !isFormComplete}
//                 className={`w-full flex items-center justify-center space-x-3 px-8 py-4 text-lg font-bold rounded-2xl transition-all duration-300 transform ${isFormComplete && !isLoading && !successMessage
//                     ? 'bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 text-white shadow-lg hover:shadow-xl hover:scale-105'
//                     : 'bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed'
//                   }`}
//               >
//                 {isLoading ? (
//                   <>
//                     <Loader2 className="w-6 h-6 animate-spin" />
//                     <span>Uploading...</span>
//                   </>
//                 ) : successMessage ? (
//                   <>
//                     <CheckCircle className="w-6 h-6" />
//                     <span>Upload Complete!</span>
//                   </>
//                 ) : (
//                   <>
//                     <Upload className="w-6 h-6" />
//                     <span>Upload Lecture</span>
//                   </>
//                 )}
//               </button>
//             </div>
//           </div>
//         </form>

//         {/* Toast Notification */}
//         {showToast && (
//           <div className={`fixed top-6 right-6 z-50 transform transition-all duration-300 ${showToast ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'
//             }`}>
//             <div className={`flex items-center space-x-3 px-6 py-4 rounded-2xl shadow-2xl backdrop-blur-md border min-w-96 ${toastType === 'success'
//                 ? 'bg-green-50/90 dark:bg-green-900/80 border-green-200 dark:border-green-700'
//                 : 'bg-red-50/90 dark:bg-red-900/80 border-red-200 dark:border-red-700'
//               }`}>
//               <div className={`p-2 rounded-full ${toastType === 'success'
//                   ? 'bg-green-500'
//                   : 'bg-red-500'
//                 }`}>
//                 {toastType === 'success' ? (
//                   <CheckCircle className="w-5 h-5 text-white" />
//                 ) : (
//                   <XCircle className="w-5 h-5 text-white" />
//                 )}
//               </div>

//               <div className="flex-1">
//                 <p className={`font-semibold ${toastType === 'success'
//                     ? 'text-green-800 dark:text-green-200'
//                     : 'text-red-800 dark:text-red-200'
//                   }`}>
//                   {toastType === 'success' ? 'Success!' : 'Error!'}
//                 </p>
//                 <p className={`text-sm ${toastType === 'success'
//                     ? 'text-green-700 dark:text-green-300'
//                     : 'text-red-700 dark:text-red-300'
//                   }`}>
//                   {toastMessage}
//                 </p>
//               </div>

//               <button
//                 onClick={hideToast}
//                 className={`p-1 rounded-lg transition-colors ${toastType === 'success'
//                     ? 'hover:bg-green-200 dark:hover:bg-green-800 text-green-600 dark:text-green-400'
//                     : 'hover:bg-red-200 dark:hover:bg-red-800 text-red-600 dark:text-red-400'
//                   }`}
//               >
//                 <X className="w-4 h-4" />
//               </button>
//             </div>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// };

// export default withAdminAuth(UploadPage);