'use client';

import { useState, useRef, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { databases } from '@/lib/appwrite';
import { Camera } from 'lucide-react';
import ImageCropperModal from '@/utilities/ImageCropperModal';
import Image from 'next/image';

const DATABASE_ID = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!;
const PROFILES_COLLECTION_ID = process.env.NEXT_PUBLIC_APPWRITE_TEACHER_PROFILES_COLLECTION_ID!;

const TeacherProfile = () => {
    const { user, profile, refetchProfile } = useAuth();
    const [isEditing, setIsEditing] = useState(false);

    const [name, setName] = useState('');
    const [title, setTitle] = useState('');
    const [bio, setBio] = useState('');
    const [experience, setExperience] = useState('');
    const [qualifications, setQualifications] = useState('');
    const [avatarFile, setAvatarFile] = useState<File | null>(null);
    const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [cropImageSrc, setCropImageSrc] = useState<string | null>(null);
    const [isCropperOpen, setIsCropperOpen] = useState(false);

    useEffect(() => {
        if (profile) {
            setName(profile.name || '');
            setTitle(profile.title || '');
            setBio(profile.bio || '');
            setExperience(profile.experience || '');
            setQualifications(Array.isArray(profile.qualifications) ? profile.qualifications.join(', ') : '');
            if (!isEditing) {
                setAvatarFile(null);
                setAvatarPreview(null);
            }
        }
    }, [profile, isEditing]);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            const reader = new FileReader();
            reader.onload = () => {
                setCropImageSrc(reader.result as string);
                setIsCropperOpen(true);
            };
            reader.readAsDataURL(file);
        }
        e.target.value = '';
    };

    const handleCropComplete = (croppedFile: File) => {
        setAvatarFile(croppedFile);
        setAvatarPreview(URL.createObjectURL(croppedFile));
        setIsCropperOpen(false);
    };

    const handleUpdate = async () => {
        if (!profile) return;

        try {
            let newAvatarS3Key = profile.avatarS3Key;

            if (avatarFile) {
                const presignResponse = await fetch('/api/avatar-upload', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ filename: avatarFile.name, contentType: avatarFile.type }),
                });
                if (!presignResponse.ok) throw new Error('Failed to get pre-signed URL for avatar.');
                const { url, key } = await presignResponse.json();

                await fetch(url, { method: 'PUT', body: avatarFile, headers: { 'Content-Type': avatarFile.type } });
                newAvatarS3Key = key;
            }

            const dataToUpdate = {
                name,
                title,
                bio,
                experience,
                qualifications: qualifications.split(',').map(q => q.trim()),
                avatarS3Key: newAvatarS3Key,
            };

            await databases.updateDocument(
                DATABASE_ID,
                PROFILES_COLLECTION_ID,
                profile.$id,
                dataToUpdate
            );

            setIsEditing(false);
            refetchProfile();
            alert("Profile updated successfully!");

        } catch (error) {
            console.error("Failed to update profile", error);
            alert("Failed to update profile.");
        }
    };

    const handleCloseCropper = () => {
        setIsCropperOpen(false);
        setCropImageSrc(null);
    };

    return (
        <div className="w-full px-4 sm:px-6 lg:px-8 py-6 max-w-6xl mx-auto">
            <ImageCropperModal
                isOpen={isCropperOpen}
                imageSrc={cropImageSrc}
                onClose={handleCloseCropper}
                onCropComplete={handleCropComplete}
            />
            
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-indigo-100 dark:border-indigo-900/30 overflow-hidden">
                {/* Header Banner */}
                <div className="relative h-40 sm:h-48 lg:h-56 bg-gradient-to-r from-indigo-600 via-blue-600 to-cyan-600">
                    {/* School Info - Responsive */}
                    <div className="absolute inset-0 flex items-center justify-center px-4 sm:px-6">
                        <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-6">
                            <div className="hidden sm:block bg-white/95 dark:bg-gray-900/95 p-1.5 sm:p-2 rounded-xl sm:rounded-2xl shadow-lg backdrop-blur-sm">
                                <Image
                                    width={80}
                                    height={80}
                                    src="/miselogo.png"
                                    alt='School Logo'
                                    className='object-contain w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24'
                                />
                            </div>
                            <div className="text-center sm:text-left -mt-11 sm:mt-0">
                                <h1 className="text-lg sm:text-2xl lg:text-3xl font-bold text-white drop-shadow-lg">
                                    MICHAELNAGAR INSTITUTE
                                </h1>
                                <p className="text-sm sm:text-base lg:text-xl text-white/90 drop-shadow-md font-medium">
                                    OF SCIENCE & EXCELLENCE
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Profile Content */}
                <div className="px-4 sm:px-6 lg:px-10 pb-8">
                    {/* Avatar and Basic Info */}
                    <div className="flex flex-col items-center -mt-16 sm:-mt-20 mb-6">
                        {/* Avatar */}
                        <div className="relative mb-4">
                            <Image
                                src={avatarPreview || (profile?.avatarS3Key ? `/api/avatar-view?s3Key=${profile.avatarS3Key}` : '/no-dp.png')}
                                alt="Profile Picture"
                                width={128}
                                height={128}
                                className="rounded-full border-4 border-white dark:border-gray-800 object-cover w-28 h-28 sm:w-32 sm:h-32 lg:w-36 lg:h-36 shadow-xl ring-4 ring-indigo-200 dark:ring-indigo-900/50"
                            />
                            {isEditing && (
                                <>
                                    <button 
                                        onClick={() => fileInputRef.current?.click()} 
                                        className="absolute bottom-0 right-0 bg-gradient-to-r from-indigo-600 to-blue-600 p-2.5 rounded-full hover:from-indigo-700 hover:to-blue-700 transition-all shadow-lg"
                                    >
                                        <Camera size={18} className="text-white"/>
                                    </button>
                                    <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/*" />
                                </>
                            )}
                        </div>

                        {/* Name and Title */}
                        <div className="text-center w-full max-w-2xl px-4">
                            {isEditing ? (
                                <div className="space-y-3">
                                    <input 
                                        type="text" 
                                        value={name} 
                                        onChange={(e) => setName(e.target.value)} 
                                        className="w-full text-2xl sm:text-3xl font-bold text-center bg-indigo-50 dark:bg-gray-700 border-2 border-indigo-300 dark:border-indigo-600 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-900 dark:text-white"
                                        placeholder="Your Name"
                                    />
                                    <input 
                                        type="text" 
                                        value={title} 
                                        onChange={(e) => setTitle(e.target.value)} 
                                        placeholder="e.g., Physics Faculty" 
                                        className="w-full text-lg sm:text-xl text-center bg-indigo-50 dark:bg-gray-700 border-2 border-indigo-300 dark:border-indigo-600 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-900 dark:text-white"
                                    />
                                </div>
                            ) : (
                                <>
                                    <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-2">
                                        {profile?.name}
                                    </h2>
                                    <p className="text-lg sm:text-xl text-gray-600 dark:text-gray-400">
                                        {profile?.title || 'Teacher'}
                                    </p>
                                </>
                            )}
                        </div>

                        {/* Edit/Action Buttons */}
                        <div className="mt-6 w-full max-w-md">
                            {isEditing ? (
                                <div className="flex gap-3 justify-center">
                                    <button
                                        onClick={handleUpdate}
                                        className="px-6 py-2.5 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white rounded-lg transition-all font-semibold shadow-md hover:shadow-lg"
                                    >
                                        Save Changes
                                    </button>
                                    <button
                                        onClick={() => setIsEditing(false)}
                                        className="px-6 py-2.5 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-900 dark:text-white rounded-lg transition-colors font-semibold"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            ) : (
                                <button
                                    onClick={() => setIsEditing(true)}
                                    className="w-full sm:w-auto px-6 py-2.5 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white rounded-lg transition-all font-semibold shadow-md hover:shadow-lg mx-auto block"
                                >
                                    Edit Profile
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Bio Section */}
                    <div className="mb-6 pt-6 border-t-2 border-indigo-100 dark:border-indigo-900/30">
                        <h3 className="text-xl sm:text-2xl font-bold mb-3 text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-blue-600 dark:from-indigo-400 dark:to-blue-400">
                            About Me
                        </h3>
                        {isEditing ? (
                            <textarea 
                                value={bio} 
                                onChange={(e) => setBio(e.target.value)} 
                                placeholder="Tell us about your teaching philosophy, background, and what inspires you..." 
                                className="w-full bg-white dark:bg-gray-700 border-2 border-indigo-200 dark:border-indigo-700 rounded-lg text-gray-900 dark:text-white px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                                rows={5}
                            />
                        ) : (
                            <p className="text-base sm:text-lg text-gray-700 dark:text-gray-300 leading-relaxed">
                                {profile?.bio || 'No bio set.'}
                            </p>
                        )}
                    </div>

                    {/* Experience and Qualifications Grid */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Experience Card */}
                        <div className="bg-gradient-to-br from-indigo-50 to-blue-50 dark:from-gray-700 dark:to-gray-800 p-6 rounded-xl border-2 border-indigo-100 dark:border-indigo-900/30">
                            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
                                Experience
                            </h3>
                            {isEditing ? (
                                <input 
                                    type="text" 
                                    value={experience} 
                                    onChange={(e) => setExperience(e.target.value)} 
                                    placeholder="e.g., 10+ Years Teaching Physics" 
                                    className="w-full bg-white dark:bg-gray-600 border-2 border-indigo-200 dark:border-indigo-700 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-900 dark:text-white"
                                />
                            ) : (
                                <p className="text-lg font-semibold text-gray-800 dark:text-gray-200">
                                    {profile?.experience || 'Not set'}
                                </p>
                            )}
                        </div>

                        {/* Qualifications Card */}
                        <div className="bg-gradient-to-br from-cyan-50 to-teal-50 dark:from-gray-700 dark:to-gray-800 p-6 rounded-xl border-2 border-cyan-100 dark:border-cyan-900/30">
                            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
                                Qualifications
                            </h3>
                            {isEditing ? (
                                <input 
                                    type="text" 
                                    value={qualifications} 
                                    onChange={(e) => setQualifications(e.target.value)} 
                                    placeholder="e.g., M.Sc. Physics, PhD, B.Ed." 
                                    className="w-full bg-white dark:bg-gray-600 border-2 border-cyan-200 dark:border-cyan-700 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-cyan-500 text-gray-900 dark:text-white"
                                />
                            ) : (
                                <ul className="space-y-2">
                                    {(Array.isArray(profile?.qualifications) && profile.qualifications.length > 0) ?
                                        profile.qualifications.map((q: string, i: number) => (
                                            <li key={i} className="flex items-start gap-2 text-base sm:text-lg text-gray-800 dark:text-gray-200">
                                                <span className="text-cyan-600 dark:text-cyan-400 font-bold mt-1">•</span>
                                                <span className="font-medium">{q}</span>
                                            </li>
                                        )) :
                                        <li className="text-gray-500 dark:text-gray-400">Not set</li>
                                    }
                                </ul>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TeacherProfile;