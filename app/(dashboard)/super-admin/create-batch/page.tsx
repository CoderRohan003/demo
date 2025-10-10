'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import withSuperAdminAuth from '@/app/components/auth/withSuperAdminAuth';
import Image from 'next/image';
import { databases } from '@/lib/appwrite';
import { ID, Query } from 'appwrite';
import { X } from 'lucide-react';

// Interface for the shape of a Teacher object
interface Teacher {
    userId: string;
    name: string;
}

// Interface for the final data structure sent to the API
interface BatchData {
    name: string;
    slug: string;
    description: string;
    price: number;
    category: string;
    duration: string;
    imageUrl: string;
    subjects: string[];
    faculty: string[];
    features: string[];
    teacherIds: string[]; // Crucial field for assigning a teacher
    targetClasses?: number[];
    level?: string;
}

// --- Collection IDs ---
const DATABASE_ID = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!;
const BATCHES_COLLECTION_ID = process.env.NEXT_PUBLIC_APPWRITE_BATCHES_ID!;
const TEACHER_PROFILES_COLLECTION_ID = process.env.NEXT_PUBLIC_APPWRITE_TEACHER_PROFILES_COLLECTION_ID!;


const CreateBatchPage = () => {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [allTeachers, setAllTeachers] = useState<Teacher[]>([]);
    const [unselectedTeachers, setUnselectedTeachers] = useState<Teacher[]>([]);

    // --- Consolidated formData state ---
    const [formData, setFormData] = useState({
        name: '',
        slug: '', // Manual slug input
        description: '',
        price: 0,
        category: 'Academic',
        level: '',
        targetClasses: [] as number[],
        subjects: [] as string[],
        duration: '',
        faculty: [] as string[],
        features: [] as string[],
        imageFile: null as File | null,
        teacherIds: [] as string[],
    });

    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [currentInput, setCurrentInput] = useState({
        subject: '',
        faculty: '',
        feature: ''
    });

    const availableClasses = [6, 7, 8, 9, 10, 11, 12];

    // --- Fetch teachers when the component mounts ---
    useEffect(() => {
        const fetchTeachers = async () => {
            try {
                const response = await databases.listDocuments(
                    DATABASE_ID,
                    TEACHER_PROFILES_COLLECTION_ID,
                    [Query.limit(100)]
                );
                const fetchedTeachers = response.documents as unknown as Teacher[];
                setAllTeachers(fetchedTeachers);
                setUnselectedTeachers(fetchedTeachers);
            } catch (error) {
                console.error("Failed to fetch teachers:", error);
                setError("Could not load the list of teachers. Please check the console.");
            }
        };
        fetchTeachers();
    }, []);

    // --- MODIFIED: Simplified handleChange function ---
    // The slug is now just a normal input field.
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: name === 'price' ? Number(value) : value
        }));
    };

    // --- NEW: Functions to handle multi-teacher selection ---
    const handleAddTeacher = (teacherId: string) => {
        if (teacherId && !formData.teacherIds.includes(teacherId)) {
            const newTeacherIds = [...formData.teacherIds, teacherId];
            setFormData(prev => ({ ...prev, teacherIds: newTeacherIds }));
            // Update the list of unselected teachers
            setUnselectedTeachers(allTeachers.filter(t => !newTeacherIds.includes(t.userId)));
        }
    };

    const handleRemoveTeacher = (teacherIdToRemove: string) => {
        const newTeacherIds = formData.teacherIds.filter(id => id !== teacherIdToRemove);
        setFormData(prev => ({ ...prev, teacherIds: newTeacherIds }));
        // Update the list of unselected teachers
        setUnselectedTeachers(allTeachers.filter(t => !newTeacherIds.includes(t.userId)));
    };


    const handleCurrentInputChange = (field: string, value: string) => {
        setCurrentInput(prev => ({ ...prev, [field]: value }));
    };

    const addItem = (field: 'subjects' | 'faculty' | 'features', inputField: 'subject' | 'faculty' | 'feature') => {
        const value = currentInput[inputField].trim();
        if (value && !formData[field].includes(value)) {
            setFormData(prev => ({ ...prev, [field]: [...prev[field], value] }));
            setCurrentInput(prev => ({ ...prev, [inputField]: '' }));
        }
    };

    const removeItem = (field: 'subjects' | 'faculty' | 'features', index: number) => {
        setFormData(prev => ({
            ...prev,
            [field]: prev[field].filter((_, i) => i !== index)
        }));
    };

    const handleClassToggle = (classNum: number) => {
        setFormData(prev => ({
            ...prev,
            targetClasses: prev.targetClasses.includes(classNum)
                ? prev.targetClasses.filter(c => c !== classNum)
                : [...prev.targetClasses, classNum].sort((a, b) => a - b)
        }));
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setFormData(prev => ({ ...prev, imageFile: file }));
            setImagePreview(URL.createObjectURL(file));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (formData.teacherIds.length === 0) {
            setError("You must assign at least one teacher to the batch.");
            return;
        }
        if (!formData.slug.match(/^[a-z0-9_]+$/)) {
            setError("Slug can only contain lowercase letters, numbers, and underscores (_).");
            return;
        }

        setIsLoading(true);
        setError('');

        try {
            // ... (your image upload logic is correct and remains the same)
            let imageUrl = '';
            if (formData.imageFile) {
                const presignRes = await fetch('/api/super-admin/batch-image-upload', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ filename: formData.imageFile.name, contentType: formData.imageFile.type }),
                });
                if (!presignRes.ok) throw new Error('Failed to get pre-signed URL for image.');
                const { url, key } = await presignRes.json();
                await fetch(url, { method: 'PUT', body: formData.imageFile, headers: { 'Content-Type': formData.imageFile.type } });
                imageUrl = key;
            }

            const finalBatchData: Partial<BatchData> = {
                name: formData.name,
                slug: formData.slug,
                teacherIds: formData.teacherIds, // Pass the array of teacher IDs
                description: formData.description,
                price: formData.price,
                category: formData.category,
                duration: formData.duration,
                imageUrl: imageUrl,
                subjects: formData.subjects,
                faculty: formData.faculty,
                features: formData.features,
            };

            if (formData.category === 'Academic') {
                finalBatchData.targetClasses = formData.targetClasses;
            } else {
                finalBatchData.level = formData.level;
            }

            // ... (your fetch call to create the batch is correct)
            const createBatchRes = await fetch('/api/super-admin/batches', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(finalBatchData),
            });
            if (!createBatchRes.ok) {
                const errorData = await createBatchRes.json();
                throw new Error(errorData.error || 'Failed to create the batch.');
            }

            router.push('/super-admin');

        } catch (err) {
            setError(err instanceof Error ? err.message : 'An unknown error occurred.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 px-4">
            <div className="max-w-3xl mx-auto">
                <div className="mb-8">
                    <h1 className="text-3xl font-semibold text-gray-900 dark:text-white">Create New Batch</h1>
                    <p className="mt-2 text-base text-gray-600 dark:text-gray-400">Fill in the details to create a new course batch</p>
                </div>

                <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
                    <div className="p-8 space-y-8">
                        <div className="space-y-6">
                            <div>
                                <label htmlFor="name" className="block text-base font-medium text-gray-700 dark:text-gray-300 mb-2">Batch Name</label>
                                <input
                                    type="text"
                                    id="name"
                                    name="name"
                                    value={formData.name}
                                    placeholder="Enter batch name"
                                    required
                                    onChange={handleChange}
                                    className="w-full px-4 py-2.5 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 dark:text-white"
                                />
                            </div>

                            <div>
                                <label htmlFor="slug" className="block text-base font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    URL Slug
                                </label>
                                <input
                                    type="text"
                                    id="slug"
                                    name="slug"
                                    value={formData.slug}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2.5 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 dark:text-white"
                                    placeholder="e.g., jee_advanced_2025"
                                    required
                                />
                                <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">Use only lowercase letters, numbers, and underscores (_).</p>
                            </div>

                            <div>
                                <label htmlFor="description" className="block text-base font-medium text-gray-700 dark:text-gray-300 mb-2">Description</label>
                                <textarea
                                    id="description"
                                    name="description"
                                    placeholder="Describe the batch"
                                    required
                                    rows={4}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2.5 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 dark:text-white resize-none"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label htmlFor="price" className="block text-base font-medium text-gray-700 dark:text-gray-300 mb-2">Price (₹)</label>
                                    <input
                                        type="number"
                                        id="price"
                                        name="price"
                                        placeholder="0"
                                        required
                                        onChange={handleChange}
                                        className="w-full px-4 py-2.5 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 dark:text-white"
                                    />
                                </div>
                                <div>
                                    <label htmlFor="duration" className="block text-base font-medium text-gray-700 dark:text-gray-300 mb-2">Duration</label>
                                    <input
                                        type="text"
                                        id="duration"
                                        name="duration"
                                        placeholder="e.g., 3 months"
                                        required
                                        onChange={handleChange}
                                        className="w-full px-4 py-2.5 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 dark:text-white"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* --- NEW: Multi-Select UI for Teachers --- */}
                        <div>
                            <label htmlFor="teacherIds" className="block text-base font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Assign Teachers
                            </label>
                            {/* Display selected teachers as tags */}
                            <div className="flex flex-wrap gap-2 mb-2 p-2 border border-gray-200 dark:border-gray-700 rounded-lg min-h-[44px]">
                                {formData.teacherIds.map(teacherId => {
                                    const teacher = allTeachers.find(t => t.userId === teacherId);
                                    return (
                                        <span key={teacherId} className="inline-flex items-center gap-2 px-3 py-1 bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-200 rounded-full text-sm font-medium">
                                            {teacher?.name || '...'}
                                            <button
                                                type="button"
                                                onClick={() => handleRemoveTeacher(teacherId)}
                                                className="text-blue-600 dark:text-blue-300 hover:text-blue-800 dark:hover:text-blue-100"
                                            >
                                                <X size={14} />
                                            </button>
                                        </span>
                                    );
                                })}
                                {formData.teacherIds.length === 0 && <p className="text-sm text-gray-500 px-2 py-1">No teachers assigned yet.</p>}
                            </div>

                            {/* Dropdown to add new teachers */}
                            <select
                                id="teacherIds"
                                value={""} // Always reset the dropdown
                                onChange={(e) => handleAddTeacher(e.target.value)}
                                className="w-full px-4 py-2.5 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg ..."
                            >
                                <option value="" disabled>Add a teacher to this batch...</option>
                                {unselectedTeachers.map(teacher => (
                                    <option key={teacher.userId} value={teacher.userId}>
                                        {teacher.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Category Section */}
                        <div className="space-y-6">
                            <h2 className="text-lg font-bold text-gray-900 dark:text-white pb-2 border-b border-gray-200 dark:border-gray-700">Category</h2>

                            <div>
                                <label htmlFor="category" className="block text-base font-medium text-gray-700 dark:text-gray-300 mb-2">Batch Category</label>
                                <select
                                    id="category"
                                    name="category"
                                    onChange={handleChange}
                                    value={formData.category}
                                    className="w-full px-4 py-2.5 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 dark:text-white"
                                >
                                    <option value="Academic">Academic</option>
                                    <option value="Coding and AI">Coding and AI</option>
                                </select>
                            </div>

                            {formData.category === 'Academic' && (
                                <div>
                                    <label className="block text-base font-medium text-gray-700 dark:text-gray-300 mb-3">Target Classes</label>
                                    <div className="flex flex-wrap gap-3">
                                        {availableClasses.map(classNum => (
                                            <button
                                                key={classNum}
                                                type="button"
                                                onClick={() => handleClassToggle(classNum)}
                                                className={`px-5 py-2.5 rounded-lg border-2 font-medium transition-all ${formData.targetClasses.includes(classNum)
                                                    ? 'bg-blue-600 border-blue-600 text-white'
                                                    : 'bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:border-blue-400'
                                                    }`}
                                            >
                                                Class {classNum}
                                            </button>
                                        ))}
                                    </div>
                                    {formData.targetClasses.length === 0 && (
                                        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">Please select at least one class</p>
                                    )}
                                </div>
                            )}

                            {formData.category === 'Coding and AI' && (
                                <div>
                                    <label htmlFor="level" className="block text-base font-medium text-gray-700 dark:text-gray-300 mb-2">Level</label>
                                    <input
                                        type="text"
                                        id="level"
                                        name="level"
                                        placeholder="e.g., Level 1, Beginner"
                                        required={formData.category === 'Coding and AI'}
                                        onChange={handleChange}
                                        className="w-full px-4 py-2.5 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 dark:text-white"
                                    />
                                </div>
                            )}
                        </div>

                        {/* Course Details Section */}
                        <div className="space-y-6">
                            <h2 className="text-lg font-bold text-gray-900 dark:text-white pb-2 border-b border-gray-200 dark:border-gray-700">Course Details</h2>

                            {/* Subjects */}
                            <div>
                                <label className="block text-base font-medium text-gray-700 dark:text-gray-300 mb-2">Subjects</label>
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        value={currentInput.subject}
                                        onChange={(e) => handleCurrentInputChange('subject', e.target.value)}
                                        onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addItem('subjects', 'subject'))}
                                        placeholder="Enter subject name"
                                        className="flex-1 px-4 py-2.5 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 dark:text-white"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => addItem('subjects', 'subject')}
                                        className="px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
                                    >
                                        Add
                                    </button>
                                </div>
                                {formData.subjects.length > 0 && (
                                    <div className="mt-3 flex flex-wrap gap-2">
                                        {formData.subjects.map((subject, index) => (
                                            <span key={index} className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 rounded-lg text-base">
                                                {subject}
                                                <button
                                                    type="button"
                                                    onClick={() => removeItem('subjects', index)}
                                                    className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-200"
                                                >
                                                    ×
                                                </button>
                                            </span>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Faculty */}
                            <div>
                                <label className="block text-base font-medium text-gray-700 dark:text-gray-300 mb-2">Faculty</label>
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        value={currentInput.faculty}
                                        onChange={(e) => handleCurrentInputChange('faculty', e.target.value)}
                                        onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addItem('faculty', 'faculty'))}
                                        placeholder="Enter faculty name"
                                        className="flex-1 px-4 py-2.5 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 dark:text-white"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => addItem('faculty', 'faculty')}
                                        className="px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
                                    >
                                        Add
                                    </button>
                                </div>
                                {formData.faculty.length > 0 && (
                                    <div className="mt-3 flex flex-wrap gap-2">
                                        {formData.faculty.map((member, index) => (
                                            <span key={index} className="inline-flex items-center gap-2 px-3 py-1.5 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 rounded-lg text-base">
                                                {member}
                                                <button
                                                    type="button"
                                                    onClick={() => removeItem('faculty', index)}
                                                    className="text-green-600 dark:text-green-400 hover:text-green-800 dark:hover:text-green-200"
                                                >
                                                    ×
                                                </button>
                                            </span>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Features */}
                            <div>
                                <label className="block text-base font-medium text-gray-700 dark:text-gray-300 mb-2">Features</label>
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        value={currentInput.feature}
                                        onChange={(e) => handleCurrentInputChange('feature', e.target.value)}
                                        onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addItem('features', 'feature'))}
                                        placeholder="Enter features"
                                        className="flex-1 px-4 py-2.5 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 dark:text-white"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => addItem('features', 'feature')}
                                        className="px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
                                    >
                                        Add
                                    </button>
                                </div>
                                {formData.features.length > 0 && (
                                    <div className="mt-3 flex flex-wrap gap-2">
                                        {formData.features.map((feature, index) => (
                                            <span key={index} className="inline-flex items-center gap-2 px-3 py-1.5 bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300 rounded-lg text-base">
                                                {feature}
                                                <button
                                                    type="button"
                                                    onClick={() => removeItem('features', index)}
                                                    className="text-purple-600 dark:text-purple-400 hover:text-purple-800 dark:hover:text-purple-200"
                                                >
                                                    ×
                                                </button>
                                            </span>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Cover Image Section */}
                        <div className="space-y-6">
                            <h2 className="text-lg font-medium text-gray-900 dark:text-white pb-2 border-b border-gray-200 dark:border-gray-700">Cover Image</h2>

                            <div>
                                <label htmlFor="imageFile" className="block text-base font-medium text-gray-700 dark:text-gray-300 mb-2">Upload Image</label>
                                <input
                                    type="file"
                                    id="imageFile"
                                    name="imageFile"
                                    onChange={handleImageChange}
                                    accept="image/*"
                                    className="w-full text-base text-gray-600 dark:text-gray-400 file:mr-4 file:py-2.5 file:px-4 file:rounded-lg file:border-0 file:text-base file:font-medium file:bg-blue-600 file:text-white hover:file:bg-blue-700 file:cursor-pointer"
                                />
                                {imagePreview && (
                                    <div className="mt-4 relative w-full h-64 rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700">
                                        <Image src={imagePreview} alt="Batch preview" layout="fill" objectFit="cover" />
                                    </div>
                                )}
                            </div>
                        </div>

                        {error && (
                            <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                                <p className="text-base text-red-600 dark:text-red-400">{error}</p>
                            </div>
                        )}
                    </div>

                    <div className="px-8 py-6 bg-gray-50 dark:bg-gray-900/50 border-t border-gray-200 dark:border-gray-700 rounded-b-lg">
                        <button
                            type="submit"
                            disabled={isLoading || (formData.category === 'Academic' && formData.targetClasses.length === 0)}
                            className="w-full px-6 py-3 text-base font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                        >
                            {isLoading ? 'Creating Batch...' : 'Create Batch'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};


export default withSuperAdminAuth(CreateBatchPage);