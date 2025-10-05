'use client';

import { useState, useRef, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { databases } from '@/lib/appwrite';
import { User, Mail, Edit, Save, X, Camera, Book, Award, Briefcase } from 'lucide-react';
import ImageCropperModal from '@/utilities/ImageCropperModal';

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

    const formInputStyle = "w-full bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md text-gray-900 dark:text-white px-2 py-1";
    const formTextAreaStyle = `${formInputStyle} p-2`;


    return (
        <div className="max-w-5xl mx-auto">
            <ImageCropperModal
                isOpen={isCropperOpen}
                imageSrc={cropImageSrc}
                onClose={handleCloseCropper}
                onCropComplete={handleCropComplete}
            />
            <div className="h-48 bg-gray-200 dark:bg-gray-700 rounded-t-lg relative flex items-center justify-center">
                <img
                    width={700}
                    height={150}
                    src="/logo.webp"
                    alt='Cover Banner'
                />
            </div>

            <div className="bg-white dark:bg-gray-800 p-6 rounded-b-lg shadow-md border-x border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-end -mt-20">
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
                                <button onClick={() => fileInputRef.current?.click()} className="absolute bottom-2 right-2 bg-blue-600 p-2 rounded-full hover:bg-blue-700">
                                    <Camera size={16} className="text-white"/>
                                </button>
                                <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/*" />
                            </>
                        )}
                    </div>
                    <div className="mt-20 ml-4 flex-grow">
                        {isEditing ? (
                            <>
                                <input type="text" value={name} onChange={(e) => setName(e.target.value)} className={`text-3xl font-bold mb-1 ${formInputStyle}`} />
                                <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g., Physics Faculty" className={`text-lg ${formInputStyle}`} />
                            </>
                        ) : (
                            <>
                                <h1 className="text-3xl font-bold">{profile?.name}</h1>
                                <p className="text-lg text-gray-500 dark:text-gray-400">{profile?.title || 'Teacher'}</p>
                            </>
                        )}
                    </div>
                    {!isEditing && (
                        <button onClick={() => setIsEditing(true)} className="ml-auto bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 px-4 py-2 rounded-lg flex items-center gap-2">
                            <Edit size={16} /> Edit Profile
                        </button>
                    )}
                </div>

                <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                    <h2 className="text-xl font-semibold mb-2">About Me</h2>
                    {isEditing ? (
                        <textarea value={bio} onChange={(e) => setBio(e.target.value)} placeholder="Tell us about your teaching philosophy..." className={formTextAreaStyle} rows={4}></textarea>
                    ) : (
                        <p className="text-gray-600 dark:text-gray-400">{profile?.bio || 'No bio set.'}</p>
                    )}
                </div>

                <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-gray-100 dark:bg-gray-700 p-4 rounded-lg">
                        <h3 className="font-bold flex items-center gap-2 mb-2"><Briefcase /> Experience</h3>
                        {isEditing ? (
                            <input type="text" value={experience} onChange={(e) => setExperience(e.target.value)} placeholder="e.g., 10+ Years" className={formInputStyle} />
                        ) : (
                            <p className="text-gray-600 dark:text-gray-400">{profile?.experience || 'Not set'}</p>
                        )}
                    </div>
                    <div className="bg-gray-100 dark:bg-gray-700 p-4 rounded-lg">
                        <h3 className="font-bold flex items-center gap-2 mb-2"><Award /> Qualifications</h3>
                        {isEditing ? (
                            <input type="text" value={qualifications} onChange={(e) => setQualifications(e.target.value)} placeholder="e.g., M.Sc. Physics, PhD" className={formInputStyle} />
                        ) : (
                            <ul className="list-disc list-inside text-gray-600 dark:text-gray-400">
                                {(Array.isArray(profile?.qualifications) && profile.qualifications.length > 0) ?
                                    profile.qualifications.map((q: string, i: number) => <li key={i}>{q}</li>) :
                                    <li>Not set</li>
                                }
                            </ul>
                        )}
                    </div>
                </div>

                {isEditing && (
                    <div className="mt-6 flex justify-end gap-2">
                        <button
                            onClick={handleUpdate}
                            className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg flex items-center gap-2"
                        >
                            <Save size={20} /> Save Changes
                        </button>
                        <button
                            onClick={() => setIsEditing(false)}
                            className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-lg flex items-center gap-2"
                        >
                            <X size={20} /> Cancel
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default TeacherProfile;