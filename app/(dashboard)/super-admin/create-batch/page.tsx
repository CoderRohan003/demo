'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import withSuperAdminAuth from '@/app/components/auth/withSuperAdminAuth';
import Image from 'next/image';

interface BatchData {
    name: string;
    description: string;
    price: number;
    category: string;
    duration: string;
    imageUrl: string;
    subjects: string[];
    faculty: string[];
    features: string[];
    targetClasses?: number[];
    level?: string;
}

const CreateBatchPage = () => {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        price: 0,
        category: 'Academic',
        level: '',
        targetClasses: '',
        subjects: '',
        duration: '',
        faculty: '',
        features: '',
        imageFile: null as File | null,
    });
    const [imagePreview, setImagePreview] = useState<string | null>(null);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: name === 'price' ? Number(value) : value }));
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
        setIsLoading(true);
        setError('');

        try {
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
                description: formData.description,
                price: formData.price,
                category: formData.category,
                duration: formData.duration,
                imageUrl: imageUrl,
                subjects: formData.subjects.split(',').map(s => s.trim()).filter(Boolean),
                faculty: formData.faculty.split(',').map(f => f.trim()).filter(Boolean),
                features: formData.features.split(',').map(f => f.trim()).filter(Boolean),
            };

            if (formData.category === 'Academic') {
                finalBatchData.targetClasses = formData.targetClasses.split(',').map(c => parseInt(c.trim(), 10)).filter(c => !isNaN(c));
            } else {
                finalBatchData.level = formData.level;
            }

            const createBatchRes = await fetch('/api/super-admin/batches', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(finalBatchData),
            });
            if (!createBatchRes.ok) throw new Error('Failed to create the batch.');

            router.push('/super-admin');

        } catch (err) {
            setError(err instanceof Error ? err.message : 'An unknown error occurred.');
            setIsLoading(false);
        }
    };
    
    const formInputStyle = "w-full px-3 py-2 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md";

    return (
        <div className="max-w-4xl mx-auto p-6">
            <h1 className="text-3xl font-bold mb-6">Create New Batch</h1>
            <form onSubmit={handleSubmit} className="p-8 space-y-6 bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700">
                
                <div>
                    <label htmlFor="imageFile" className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">Cover Image</label>
                    <input type="file" id="imageFile" name="imageFile" onChange={handleImageChange} accept="image/*" className="w-full text-sm text-gray-500 dark:text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:bg-blue-600 file:text-white hover:file:bg-blue-700" />
                    {imagePreview && (
                        <div className="mt-4 relative w-full h-64 rounded-lg overflow-hidden border border-gray-300 dark:border-gray-600">
                             <Image src={imagePreview} alt="Batch preview" layout="fill" objectFit="cover" />
                        </div>
                    )}
                </div>

                <input type="text" name="name" placeholder="Batch Name" required onChange={handleChange} className={formInputStyle} />
                <textarea name="description" placeholder="Description" required rows={4} onChange={handleChange} className={formInputStyle} />
                <input type="number" name="price" placeholder="Price" required onChange={handleChange} className={formInputStyle} />
                <select name="category" onChange={handleChange} value={formData.category} className={formInputStyle}>
                    <option value="Academic">Academic</option>
                    <option value="Coding and AI">Coding and AI</option>
                </select>
                
                {formData.category === 'Academic' && (
                    <input type="text" name="targetClasses" placeholder="Target Classes (e.g., 11, 12)" required={formData.category === 'Academic'} onChange={handleChange} className={formInputStyle} />
                )}
                {formData.category === 'Coding and AI' && (
                    <input type="text" name="level" placeholder="Level (e.g., Level 1)" required={formData.category === 'Coding and AI'} onChange={handleChange} className={formInputStyle} />
                )}
                
                <input type="text" name="subjects" placeholder="Subjects (comma-separated)" required onChange={handleChange} className={formInputStyle} />
                <input type="text" name="faculty" placeholder="Faculty (comma-separated)" required onChange={handleChange} className={formInputStyle} />
                <textarea name="features" placeholder="Features (comma-separated)" required rows={3} onChange={handleChange} className={formInputStyle} />
                <input type="text" name="duration" placeholder="Duration (e.g., 3 months)" required onChange={handleChange} className={formInputStyle} />

                {error && <p className="text-sm text-red-400 text-center">{error}</p>}
                
                <div className="pt-4">
                    <button type="submit" disabled={isLoading} className="w-full px-4 py-3 font-bold text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:bg-gray-500">
                        {isLoading ? 'Creating Batch...' : 'Create Batch'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default withSuperAdminAuth(CreateBatchPage);