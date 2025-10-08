'use client';

import { useState, useRef, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { databases } from '@/lib/appwrite';
import { Mail, Camera, HatGlasses } from 'lucide-react';
import Image from 'next/image';
import ImageCropperModal from '@/utilities/ImageCropperModal';

const DATABASE_ID = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!;
const PROFILES_COLLECTION_ID = process.env.NEXT_PUBLIC_APPWRITE_PROFILES_COLLECTION_ID!;

const StudentProfile = () => {
    const { user, profile, refetchProfile } = useAuth();
    const [isEditing, setIsEditing] = useState(false);

    const [name, setName] = useState('');
    const [bio, setBio] = useState('');
    const [avatarFile, setAvatarFile] = useState<File | null>(null);
    const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [cropImageSrc, setCropImageSrc] = useState<string | null>(null);
    const [isCropperOpen, setIsCropperOpen] = useState(false);

    useEffect(() => {
        if (profile) {
            setName(profile.name || '');
            setBio(profile.bio || '');
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
                bio,
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
        <div className="w-full px-4 sm:px-6 lg:px-8 py-6 max-w-5xl mx-auto">
            <ImageCropperModal
                isOpen={isCropperOpen}
                imageSrc={cropImageSrc}
                onClose={handleCloseCropper}
                onCropComplete={handleCropComplete}
            />
            
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
                {/* Header Section */}
                <div className="p-6 sm:p-8 lg:p-10 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/10 dark:to-indigo-900/10">
                    <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
                        {/* Avatar */}
                        <div className="relative shrink-0">
                            <img
                                src={avatarPreview || (profile?.avatarS3Key ? `/api/avatar-view?s3Key=${profile.avatarS3Key}` : '/no-dp.png')}
                                alt="Profile Picture"
                                width={120}
                                height={120}
                                className="rounded-full border-2 border-blue-300 dark:border-blue-700 object-cover w-24 h-24 sm:w-28 sm:h-28 lg:w-32 lg:h-32 shadow-md"
                            />
                            {isEditing && (
                                <>
                                    <button 
                                        onClick={() => fileInputRef.current?.click()} 
                                        className="absolute bottom-0 right-0 bg-blue-600 p-2 rounded-full hover:bg-blue-700 transition-colors shadow-lg"
                                    >
                                        <Camera size={16} className="text-white"/>
                                    </button>
                                    <input 
                                        type="file" 
                                        ref={fileInputRef} 
                                        onChange={handleFileChange} 
                                        className="hidden" 
                                        accept="image/*" 
                                    />
                                </>
                            )}
                        </div>

                        {/* Profile Info */}
                        <div className="flex-grow w-full sm:w-auto text-center sm:text-left">
                            {isEditing ? (
                                <input 
                                    type="text" 
                                    value={name} 
                                    onChange={(e) => setName(e.target.value)} 
                                    className="w-full text-2xl sm:text-3xl font-semibold bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white"
                                    placeholder="Your name"
                                />
                            ) : (
                                <h1 className="text-2xl sm:text-3xl font-semibold text-gray-900 dark:text-white mb-2">{profile?.name}</h1>
                            )}
                            
                            <div className="space-y-1 mt-3">
                                <p className="text-gray-600 dark:text-gray-400 text-sm sm:text-base flex items-center justify-center sm:justify-start gap-2">
                                    <Mail size={16} className="shrink-0 text-blue-600 dark:text-blue-400" /> 
                                    <span className="truncate">{user?.email}</span>
                                </p>
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                    <HatGlasses size={16} className="inline-block mr-1 mb-0.5 text-purple-600 dark:text-purple-400" />
                                    Academic Level: <span className="font-medium">{profile?.academicLevel || 'Not set'}</span>
                                </p>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="w-full sm:w-auto sm:ml-auto mt-4 sm:mt-0">
                            {isEditing ? (
                                <div className="flex gap-3 justify-center sm:justify-end">
                                    <button 
                                        onClick={handleUpdate} 
                                        className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium"
                                    >
                                        Save
                                    </button>
                                    <button 
                                        onClick={() => setIsEditing(false)} 
                                        className="px-6 py-2 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-900 dark:text-white rounded-lg transition-colors font-medium"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            ) : (
                                <button 
                                    onClick={() => setIsEditing(true)} 
                                    className="w-full sm:w-auto px-6 py-2 bg-green-400 dark:bg-purple-500 hover:bg-blue-300 hover:cursor-pointer dark:hover:bg-purple-600 text-gray-900 dark:text-white rounded-lg transition-colors font-medium"
                                >
                                    Edit Profile
                                </button>
                            )}
                        </div>
                    </div>
                </div>

                {/* Bio Section */}
                <div className="border-t border-gray-200 dark:border-gray-700 p-6 sm:p-8 lg:p-10 bg-indigo-50 dark:bg-indigo-900/20">
                    <h2 className="text-lg font-semibold mb-3 text-gray-900 dark:text-white">About</h2>
                    {isEditing ? (
                        <textarea 
                            value={bio} 
                            onChange={(e) => setBio(e.target.value)} 
                            placeholder="Tell us about yourself..." 
                            className="w-full bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                            rows={4}
                        />
                    ) : (
                        <p className="text-gray-600 dark:text-gray-400 leading-relaxed whitespace-pre-wrap">
                            {profile?.bio || 'No bio set.'}
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default StudentProfile;