'use client';

import { useState, useRef, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { databases } from '@/lib/appwrite';
import { Edit, Save, X, Camera, Book, Award, Briefcase } from 'lucide-react';
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

    const formInputStyle = "w-full bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white px-4 py-3 focus:outline-none focus:border-blue-500 dark:focus:border-blue-400 transition-colors";
    const formTextAreaStyle = `${formInputStyle} resize-none`;

    return (
        <div className="max-w-6xl mx-auto px-4 py-8">
            <ImageCropperModal
                isOpen={isCropperOpen}
                imageSrc={cropImageSrc}
                onClose={handleCloseCropper}
                onCropComplete={handleCropComplete}
            />
            
            {/* Header Card with Gradient */}
            <div className="relative overflow-hidden rounded-3xl shadow-2xl mb-8">
                {/* Gradient Background Banner */}
                <div className="h-72 bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700 relative">
                    <div className="absolute inset-0 bg-black opacity-10"></div>
                    <div className="absolute inset-0" style={{
                        backgroundImage: 'radial-gradient(circle at 20% 50%, rgba(255,255,255,0.1) 0%, transparent 50%), radial-gradient(circle at 80% 80%, rgba(255,255,255,0.1) 0%, transparent 50%)'
                    }}></div>
                    
                    {/* School Info - Centered in Banner */}
                    <div className="relative h-full flex items-center justify-center px-10">
                        <div className="flex items-center gap-6">
                            <div className="bg-white/95 dark:bg-gray-900/95 p-2 rounded-2xl shadow-xl backdrop-blur-sm">
                                <Image
                                    width={170}
                                    height={170}
                                    src="/miselogo.png"
                                    alt='School Logo'
                                    className='object-contain'
                                />
                            </div>
                            <div>
                                <h1 className="text-3xl font-bold text-white drop-shadow-lg mb-1">
                                    MICHAELNAGAR INSTITUTE
                                </h1>
                                <p className="text-xl text-white/90 drop-shadow-md font-medium">
                                    OF SCIENCE & EXCELLENCE
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Main Content Card */}
                <div className="bg-white dark:bg-gray-900 px-12 pb-8">
                    {/* Profile Section with Avatar */}
                    <div className="flex flex-col items-center -mt-20 mb-8">
                        {/* Avatar with Ring */}
                        <div className="relative group mb-6">
                            <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full blur opacity-75 group-hover:opacity-100 transition duration-300"></div>
                            <div className="relative">
                                <Image
                                    src={avatarPreview || (profile?.avatarS3Key ? `/api/avatar-view?s3Key=${profile.avatarS3Key}` : '/no-dp.png')}
                                    alt="Profile Picture"
                                    width={160}
                                    height={160}
                                    className="rounded-full border-8 border-white dark:border-gray-900 object-cover w-40 h-40 shadow-2xl"
                                />
                                {isEditing && (
                                    <>
                                        <button 
                                            onClick={() => fileInputRef.current?.click()} 
                                            className="absolute bottom-3 right-3 bg-gradient-to-r from-blue-600 to-indigo-600 p-3 rounded-full hover:from-blue-700 hover:to-indigo-700 shadow-lg transform hover:scale-110 transition-all duration-200"
                                        >
                                            <Camera size={20} className="text-white"/>
                                        </button>
                                        <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/*" />
                                    </>
                                )}
                            </div>
                        </div>

                        {/* Name and Title Section */}
                        <div className="text-center w-full max-w-2xl">
                            {isEditing ? (
                                <div className="space-y-3">
                                    <input 
                                        type="text" 
                                        value={name} 
                                        onChange={(e) => setName(e.target.value)} 
                                        className={`text-4xl font-bold text-center ${formInputStyle}`}
                                        placeholder="Your Name"
                                    />
                                    <input 
                                        type="text" 
                                        value={title} 
                                        onChange={(e) => setTitle(e.target.value)} 
                                        placeholder="e.g., Physics Faculty" 
                                        className={`text-xl text-center ${formInputStyle}`}
                                    />
                                </div>
                            ) : (
                                <>
                                    <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
                                        {profile?.name}
                                    </h2>
                                    <p className="text-xl text-gray-600 dark:text-gray-400 flex items-center justify-center gap-2">
                                        <Briefcase size={20} className="text-blue-600" />
                                        {profile?.title || 'Teacher'}
                                    </p>
                                </>
                            )}
                        </div>

                        {/* Edit Button - Positioned to the right */}
                        {!isEditing && (
                            <button
                                onClick={() => setIsEditing(true)}
                                className="absolute right-12 top-8 bg-white hover:bg-gray-100 text-black px-6 py-3 rounded-xl font-semibold flex items-center gap-2 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
                            >
                                <Edit size={18} /> Edit Profile
                            </button>
                        )}
                    </div>

                    {/* Bio Section */}
                    <div className="mb-8">
                        <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                            <div className="w-1 h-8 bg-gradient-to-b from-blue-600 to-purple-600 rounded-full"></div>
                            About Me
                        </h3>
                        {isEditing ? (
                            <textarea 
                                value={bio} 
                                onChange={(e) => setBio(e.target.value)} 
                                placeholder="Tell us about your teaching philosophy, background, and what inspires you..." 
                                className={formTextAreaStyle}
                                rows={5}
                            ></textarea>
                        ) : (
                            <p className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed pl-4">
                                {profile?.bio || 'No bio set.'}
                            </p>
                        )}
                    </div>

                    {/* Stats Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Experience Card */}
                        <div className="group relative overflow-hidden bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-700 p-6 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 border border-blue-100 dark:border-gray-600">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-full -mr-16 -mt-16 opacity-10 group-hover:opacity-20 transition-opacity"></div>
                            <div className="relative">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="bg-gradient-to-br from-blue-600 to-indigo-600 p-3 rounded-xl shadow-lg">
                                        <Briefcase size={24} className="text-white" />
                                    </div>
                                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">Experience</h3>
                                </div>
                                {isEditing ? (
                                    <input 
                                        type="text" 
                                        value={experience} 
                                        onChange={(e) => setExperience(e.target.value)} 
                                        placeholder="e.g., 10+ Years Teaching Physics" 
                                        className={formInputStyle}
                                    />
                                ) : (
                                    <p className="text-lg font-semibold text-gray-800 dark:text-gray-200">
                                        {profile?.experience || 'Not set'}
                                    </p>
                                )}
                            </div>
                        </div>

                        {/* Qualifications Card */}
                        <div className="group relative overflow-hidden bg-gradient-to-br from-purple-50 to-pink-50 dark:from-gray-800 dark:to-gray-700 p-6 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 border border-purple-100 dark:border-gray-600">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-purple-400 to-pink-500 rounded-full -mr-16 -mt-16 opacity-10 group-hover:opacity-20 transition-opacity"></div>
                            <div className="relative">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="bg-gradient-to-br from-purple-600 to-pink-600 p-3 rounded-xl shadow-lg">
                                        <Award size={24} className="text-white" />
                                    </div>
                                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">Qualifications</h3>
                                </div>
                                {isEditing ? (
                                    <input 
                                        type="text" 
                                        value={qualifications} 
                                        onChange={(e) => setQualifications(e.target.value)} 
                                        placeholder="e.g., M.Sc. Physics, PhD, B.Ed." 
                                        className={formInputStyle}
                                    />
                                ) : (
                                    <ul className="space-y-2">
                                        {(Array.isArray(profile?.qualifications) && profile.qualifications.length > 0) ?
                                            profile.qualifications.map((q: string, i: number) => (
                                                <li key={i} className="flex items-start gap-2 text-lg text-gray-800 dark:text-gray-200">
                                                    <span className="text-purple-600 dark:text-purple-400 font-bold mt-1">•</span>
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

                    {/* Action Buttons */}
                    {isEditing && (
                        <div className="mt-8 flex justify-end gap-4">
                            <button
                                onClick={() => setIsEditing(false)}
                                className="bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-white font-semibold py-3 px-6 rounded-xl flex items-center gap-2 shadow-md hover:shadow-lg transform hover:scale-105 transition-all duration-200"
                            >
                                <X size={20} /> Cancel
                            </button>
                            <button
                                onClick={handleUpdate}
                                className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-semibold py-3 px-6 rounded-xl flex items-center gap-2 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
                            >
                                <Save size={20} /> Save Changes
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default TeacherProfile;