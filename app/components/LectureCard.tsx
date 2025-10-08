import Link from 'next/link';
import Image from 'next/image';
import { CheckCircle } from 'lucide-react';

interface LectureCardProps {
  id: string;
  title: string;
  subject: string;
  teacherName: string;
  teacherImage: string;
  isCompleted: boolean;
}

const LectureCard = ({ id, title, subject, teacherName, teacherImage, isCompleted }: LectureCardProps) => {
  return (
    <Link href={`/lecture/${id}`} className="block group">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 flex flex-col overflow-hidden hover:shadow-md transition-all duration-300 group-hover:scale-[1.02] cursor-pointer">
        {isCompleted && (
          <div className="absolute top-3 right-3 bg-green-500 rounded-full p-1.5 z-10 shadow-lg">
            <CheckCircle size={18} className="text-white" />
          </div>
        )}
        <div className="bg-blue-600 text-white py-3 px-4">
          <p className="text-base font-semibold flex justify-center">{subject}</p>
        </div>
        <div className="p-6 flex bg-yellow-50 dark:bg-zinc-700 flex-col items-center text-center">
          <div className="w-20 h-20 rounded-full overflow-hidden mb-4 border-2 border-blue-100 dark:border-blue-800 shadow-sm">
            <Image
              src={teacherImage}
              alt={`Image of ${teacherName}`}
              width={80}
              height={80}
              className="w-full h-full object-cover"
            />
          </div>
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2 line-clamp-2">{title}</h3>
          <p className="text-sm text-gray-600 dark:text-gray-300">Taught by {teacherName}</p>
        </div>
      </div>
    </Link>
  );
};

export default LectureCard;