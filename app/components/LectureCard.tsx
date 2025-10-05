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
      <div className="rounded-xl shadow-lg flex flex-col items-center text-center transition-all duration-500 transform group-hover:scale-105 cursor-pointer overflow-hidden relative bg-gradient-to-br from-cyan-200 via-blue-400 to-blue-700 dark:bg-gradient-to-br dark:from-black dark:via-gray-900 dark:to-purple-900 text-[rgb(var(--card-foreground))] dark:text-white">
        {isCompleted && (
          <div className="absolute top-3 right-3 bg-green-500 rounded-full p-1 z-10">
            <CheckCircle size={20} className="text-white" />
          </div>
        )}
        <div className="w-full bg-black/20 text-white py-2 px-4 rounded-t-lg">
          <p className="text-lg font-bold">{subject}</p>
        </div>
        <div className="p-6 flex flex-col items-center">
          <div className="w-24 h-24 rounded-full overflow-hidden mb-4 border-2 border-black/10 dark:border-white/30">
            <Image
              src={teacherImage}
              alt={`Image of ${teacherName}`}
              width={96}
              height={96}
              className="w-full h-full object-cover"
            />
          </div>
          <h3 className="text-xl font-semibold mb-2">{title}</h3>
          <p className="text-blue-800 dark:text-purple-200 text-xs">Taught by {teacherName}</p>
        </div>
      </div>
    </Link>
  );
};

export default LectureCard;