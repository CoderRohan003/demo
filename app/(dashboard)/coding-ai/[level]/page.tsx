

"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import withAuth from "@/app/components/auth/withAuth";
import { databases } from "@/lib/appwrite";
import { Query } from "appwrite";
import Image from "next/image";
import Link from "next/link";
import { SearchX } from "lucide-react";

const DATABASE_ID = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!;
const BATCHES_COLLECTION_ID = process.env.NEXT_PUBLIC_APPWRITE_BATCHES_ID!;

interface Batch {
  $id: string;
  name: string;
  description: string;
  imageUrl?: string;
  price: number;
}

const SkeletonCard = () => (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden animate-pulse border border-gray-200 dark:border-gray-700">
        <div className="h-48 bg-gray-200 dark:bg-gray-700"></div>
        <div className="p-6 space-y-4">
            <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
        </div>
        <div className="px-6 pt-4 pb-6 border-t border-gray-200 dark:border-gray-700 flex justify-between items-center">
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
            <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded w-1/3"></div>
        </div>
    </div>
);

const BatchCard = ({ batch }: { batch: Batch }) => (
  // The 'revolving-trail' class enables all the hover effects
  <div className="revolving-trail group rounded-xl p-1">
    <div className="bg-white dark:bg-slate-900 rounded-lg shadow-lg overflow-hidden flex flex-col h-full border border-black/10 dark:border-slate-700">
      <div className="relative h-48 w-full">
        <Image
          src={batch.imageUrl ? `/api/super-admin/batch-image-view?s3Key=${batch.imageUrl}` : "/no-dp.png"}
          alt={batch.name}
          layout="fill"
          objectFit="cover"
        />
      </div>
      <div className="p-6 flex flex-col flex-grow">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">{batch.name}</h2>
        <p className="text-gray-600 dark:text-gray-400 text-sm line-clamp-3 flex-grow">{batch.description}</p>
      </div>
      <div className="mt-auto px-6 pt-4 pb-6 border-t border-gray-200 dark:border-gray-700">
        <div className="flex justify-between items-center">
          <p className="text-2xl font-bold text-green-500 dark:text-green-400">
            ₹{batch.price?.toLocaleString("en-IN") ?? "N/A"}
          </p>
          <Link href={`/batch/${batch.$id}`}>
            <button className="bg-blue-600 group-hover:bg-blue-700 dark:group-hover:bg-blue-500 text-white font-semibold py-2 px-6 rounded-lg transition-colors duration-300">
              Explore
            </button>
          </Link>
        </div>
      </div>
    </div>
  </div>
);

const AIBatchLevelPage = () => {
  const params = useParams();
  const { level: encodedLevel } = params;
  const level = decodeURIComponent(encodedLevel as string);
  const [batches, setBatches] = useState<Batch[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!level) return;

    const fetchBatches = async () => {
      setIsLoading(true);
      try {
        const response = await databases.listDocuments(
          DATABASE_ID,
          BATCHES_COLLECTION_ID,
          [
            Query.equal("category", "Coding and AI"),
            Query.equal("level", level)
          ]
        );
        setBatches(response.documents as unknown as Batch[]);
      } catch (error) {
        console.error("Failed to fetch batches:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchBatches();
  }, [level]);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 dark:text-white tracking-tight">
          Batches for <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-500 to-pink-500">{level}</span>
        </h1>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 items-start">
        {isLoading ? (
          <>
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </>
        ) : batches.length > 0 ? (
          batches.map((batch) => <BatchCard key={batch.$id} batch={batch} />)
        ) : (
          <div className="col-span-full text-center py-16 px-6 bg-gray-50 dark:bg-slate-800/50 rounded-xl border border-gray-200 dark:border-slate-700">
            <SearchX className="mx-auto h-16 w-16 text-gray-400 dark:text-gray-500" />
            <h3 className="mt-4 text-2xl font-semibold text-gray-900 dark:text-white">No Batches Found</h3>
            <p className="mt-2 text-md text-gray-500 dark:text-gray-400">
              It seems there are no batches available for this level yet. Please check back later!
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default withAuth(AIBatchLevelPage);