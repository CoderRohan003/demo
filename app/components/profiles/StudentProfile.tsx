'use client';

import { useState, useRef, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { databases } from '@/lib/appwrite';
import { User, Mail, Edit, Save, X, Camera } from 'lucide-react';
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

    const formInputStyle = "w-full bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md text-gray-900 dark:text-white px-2 py-1";

    return (
        <div className="max-w-4xl mx-auto">
            <ImageCropperModal
                isOpen={isCropperOpen}
                imageSrc={cropImageSrc}
                onClose={handleCloseCropper}
                onCropComplete={handleCropComplete}
            />
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border border-gray-200 dark:border-gray-700">
                <div className="flex items-center space-x-6">
                    <div className="relative">
                        <img
                            src={avatarPreview || (profile?.avatarS3Key ? `/api/avatar-view?s3Key=${profile.avatarS3Key}` : '/no-dp.png')}
                            alt="Profile Picture"
                            width={128}
                            height={128}
                            className="rounded-full border-4 border-white dark:border-gray-800 object-cover w-32 h-32"
                        />
                        {isEditing && (
                            <>
                                <button onClick={() => fileInputRef.current?.click()} className="absolute bottom-0 right-0 bg-blue-600 p-2 rounded-full hover:bg-blue-700">
                                    <Camera size={16} className="text-white"/>
                                </button>
                                <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/*" />
                            </>
                        )}
                    </div>
                    <div className="flex-grow">
                        {isEditing ? (
                            <input type="text" value={name} onChange={(e) => setName(e.target.value)} className={`text-3xl font-bold ${formInputStyle}`} />
                        ) : (
                            <h1 className="text-3xl font-bold">{profile?.name}</h1>
                        )}
                        <p className="text-gray-500 dark:text-gray-400 flex items-center gap-2"><Mail size={16} /> {user?.email}</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Academic Level: {profile?.academicLevel || 'Not set'}</p>
                    </div>
                    {isEditing ? (
                        <div className="flex gap-2">
                            <button onClick={handleUpdate} className="bg-green-600 hover:bg-green-700 text-white p-2 rounded-lg"><Save size={16} /></button>
                            <button onClick={() => setIsEditing(false)} className="bg-red-600 hover:bg-red-700 text-white p-2 rounded-lg"><X size={16} /></button>
                        </div>
                    ) : (
                        <button onClick={() => setIsEditing(true)} className="ml-auto bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 px-4 py-2 rounded-lg flex items-center gap-2">
                            <Edit size={16} /> Edit Profile
                        </button>
                    )}
                </div>
                <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                    <h2 className="font-semibold mb-2">Bio</h2>
                    {isEditing ? (
                        <textarea value={bio} onChange={(e) => setBio(e.target.value)} placeholder="Tell us about yourself..." className={formInputStyle} rows={3}></textarea>
                    ) : (
                        <p className="text-gray-600 dark:text-gray-400">{profile?.bio || 'No bio set.'}</p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default StudentProfile;