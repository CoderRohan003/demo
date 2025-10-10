// app/(dashboard)/super-admin/page.tsx

'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import withSuperAdminAuth from '@/app/components/auth/withSuperAdminAuth';
import {
  Users,
  Book,
  Trash2,
  UserPlus,
  PlusCircle,
  Search,
  Crown,
  Shield,
  Award,
  BarChart3,
  Filter,
  Download,
  Eye,
  Edit,
  UserCheck,
  GraduationCap,
  Activity,
  MessageSquarePlus
} from 'lucide-react';
import { FullPageLoader } from '@/app/components/FullPageLoader';

interface DashboardStats {
  studentCount: number;
  teacherCount: number;
  batchCount: number;
  batchEnrollments: { batchName: string; enrollmentCount: number }[];
}

interface User {
  $id: string;
  userId: string;
  name: string;
  email?: string;
  isTeamMember?: boolean;
}

interface Batch {
  $id: string;
  name: string;
}

const SuperAdminPage = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [users, setUsers] = useState<{ students: User[]; teachers: User[] }>({ students: [], teachers: [] });
  const [batches, setBatches] = useState<Batch[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [teacherSearch, setTeacherSearch] = useState('');
  const [studentSearch, setStudentSearch] = useState('');

  const fetchData = async () => {
    try {
      !isLoading && setIsLoading(true);
      const [statsRes, usersRes, batchesRes] = await Promise.all([
        fetch('/api/super-admin/dashboard'),
        fetch('/api/super-admin/users'),
        fetch('/api/super-admin/batches'),
      ]);
      if (!statsRes.ok || !usersRes.ok || !batchesRes.ok) throw new Error('Failed to fetch data.');

      const statsData = await statsRes.json();
      const usersData = await usersRes.json();
      const batchesData = await batchesRes.json();

      setStats(statsData);
      setUsers(usersData);
      setBatches(batchesData.documents || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const filteredTeachers = useMemo(() =>
    users.teachers.filter(teacher =>
      teacher.name.toLowerCase().includes(teacherSearch.toLowerCase()) ||
      (teacher.email && teacher.email.toLowerCase().includes(teacherSearch.toLowerCase()))
    ), [users.teachers, teacherSearch]);

  const filteredStudents = useMemo(() =>
    users.students.filter(student =>
      student.name.toLowerCase().includes(studentSearch.toLowerCase()) ||
      (student.email && student.email.toLowerCase().includes(studentSearch.toLowerCase()))
    ), [users.students, studentSearch]);

  const handleDeleteUser = async (user: User, role: 'student' | 'teacher') => {
    if (confirm(`Are you sure you want to delete this ${role}: ${user.name}? This is irreversible.`)) {
      try {
        const res = await fetch('/api/super-admin/users', {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId: user.userId, profileId: user.$id, role }),
        });
        if (!res.ok) throw new Error('Failed to delete user.');
        fetchData();
      } catch (err) {
        setError(err instanceof Error ? err.message : `Failed to delete ${role}.`);
      }
    }
  };

  const handleAddTeacherToTeam = async (user: User) => {
    try {
      const res = await fetch('/api/super-admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.userId, email: user.email, name: user.name }),
      });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Failed to add teacher to team.');
      }
      fetchData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add teacher.');
    }
  };

  const handleDeleteBatch = async (batchId: string) => {
    if (confirm('Are you sure you want to delete this batch?')) {
      try {
        const res = await fetch('/api/super-admin/batches', {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ batchId }),
        });
        if (!res.ok) throw new Error('Failed to delete batch.');
        fetchData();
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to delete batch.');
      }
    }
  };

  const handleDownload = () => {
    window.print();
  };

  if (isLoading) return <div className="flex justify-center items-center h-full"><FullPageLoader /></div>;
  if (error) return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-800/20">
      <div className="text-center p-10 bg-white dark:bg-gray-800 rounded-3xl shadow-2xl border border-red-200 dark:border-red-800">
        <div className="w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
          <Shield className="w-8 h-8 text-red-500" />
        </div>
        <h3 className="text-xl font-bold text-red-600 dark:text-red-400 mb-2">Error Loading Dashboard</h3>
        <p className="text-red-500 dark:text-red-300">{error}</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-700 print:hidden">
        <div className="px-6 py-6">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center">
                <Crown className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
                  Super Admin Dashboard
                </h1>
                <p className="text-gray-600 dark:text-gray-400 text-sm">Manage your platform with complete control</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {/* 
              <Link
                href="/super-admin/create-announcement"
                className="group bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white font-medium py-3 px-6 rounded-xl transition-all duration-300 hover:shadow-lg hover:scale-105 flex items-center gap-2 print:hidden"
              >
                <MessageSquarePlus className="w-4 h-4 group-hover:scale-110 transition-transform duration-200" />
                <span className="font-semibold">Create Announcement</span>
              </Link>

              Alternative: If you want to match the "Create Batch" button style exactly
              <Link
                href="/super-admin/create-announcement"
                className="group bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium py-3 px-6 rounded-xl transition-all duration-300 hover:shadow-lg hover:scale-105 flex items-center gap-2 print:hidden"
              >
                <MessageSquarePlus className="w-4 h-4 group-hover:rotate-12 transition-transform duration-200" />
                <span>Create Announcement</span>
              </Link> 
               */}

              {/* Alternative: Unique styling that still matches the overall design */}
              <Link
                href="/super-admin/create-announcement"
                className="group bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white font-medium mr-4 py-3 px-6 rounded-xl transition-all duration-300 hover:shadow-lg hover:scale-105 flex items-center gap-2 relative overflow-hidden print:hidden"
              >
                {/* Animated background effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-white/5 transform -skew-x-12 group-hover:translate-x-full transition-transform duration-700 ease-out"></div>

                <MessageSquarePlus className="w-4 h-4 group-hover:scale-110 transition-transform duration-200 relative z-10" />
                <span className="font-semibold relative z-10">Announce</span>

                {/* Notification indicator */}
                <div className="w-2 h-2 bg-yellow-300 rounded-full animate-pulse relative z-10"></div>
              </Link>
              <button onClick={handleDownload} className="p-2 rounded-xl bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors border-2 border-black dark:border-white">
                <Download className="w-5 h-5 text-gray-600 dark:text-gray-300" />
              </button>
              <div className="w-8 h-8 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center">
                <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <StatCard
            icon={<GraduationCap className="w-6 h-6" />}
            title="Total Students"
            value={stats?.studentCount ?? 0}
            color="blue"
          />
          <StatCard
            icon={<Users className="w-6 h-6" />}
            title="Total Teachers"
            value={stats?.teacherCount ?? 0}
            color="purple"
          />
          <StatCard
            icon={<Book className="w-6 h-6" />}
            title="Total Batches"
            value={stats?.batchCount ?? 0}
            color="emerald"
          />
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
          {/* Batch Enrollments */}
          <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/20 rounded-xl flex items-center justify-center">
                    <BarChart3 className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">Batch Enrollments</h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Student distribution across batches</p>
                  </div>
                </div>
                <button className="p-2 rounded-xl bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors print:hidden">
                  <Eye className="w-4 h-4 text-gray-600 dark:text-gray-300" />
                </button>
              </div>
            </div>
            <div className="p-6 max-h-80 overflow-y-auto print:max-h-none print:overflow-visible">
              <div className="space-y-3">
                {stats?.batchEnrollments.map((batch, index) => (
                  <div key={batch.batchName} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center text-white font-bold text-sm">
                        {index + 1}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">{batch.batchName}</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Active batch</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-lg text-gray-900 dark:text-white">{batch.enrollmentCount}</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">students</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Batch Management */}
          <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-emerald-100 dark:bg-emerald-900/20 rounded-xl flex items-center justify-center">
                    <Award className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">Batch Management</h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Create and manage course batches</p>
                  </div>
                </div>
                <Link href="/super-admin/create-batch" className="group bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium py-3 px-6 rounded-xl transition-all duration-300 hover:shadow-lg hover:scale-105 flex items-center gap-2 print:hidden">
                  <PlusCircle className="w-4 h-4" />
                  Create Batch
                </Link>
              </div>
            </div>
            <div className="p-6 max-h-80 overflow-y-auto print:max-h-none print:overflow-visible">
              <div className="space-y-3">
                {batches.map((batch) => (
                  <div key={batch.$id} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl group">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <div className="w-8 h-8 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-lg flex items-center justify-center">
                        <Book className="w-4 h-4 text-white" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="font-medium text-gray-900 dark:text-white truncate">{batch.name}</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Active course</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity print:hidden">
                      <button className="p-2 text-blue-500 hover:text-blue-600 dark:hover:text-blue-400 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors">
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteBatch(batch.$id)}
                        className="p-2 text-red-500 hover:text-red-600 dark:hover:text-red-400 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* User Management Sections */}
        <div className="space-y-8">
          <UserManagementSection
            title="Teachers"
            users={filteredTeachers}
            searchTerm={teacherSearch}
            setSearchTerm={setTeacherSearch}
            onDelete={(user) => handleDeleteUser(user, 'teacher')}
            onAddToTeam={handleAddTeacherToTeam}
            icon={<Users className="w-5 h-5" />}
            color="purple"
          />

          <UserManagementSection
            title="Students"
            users={filteredStudents}
            searchTerm={studentSearch}
            setSearchTerm={setStudentSearch}
            onDelete={(user) => handleDeleteUser(user, 'student')}
            icon={<GraduationCap className="w-5 h-5" />}
            color="blue"
          />
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ icon, title, value, color }: {
  icon: React.ReactNode;
  title: string;
  value: number;
  color: 'blue' | 'purple' | 'emerald';
}) => {
  const colorClasses = {
    blue: 'from-blue-500 to-cyan-600',
    purple: 'from-purple-500 to-pink-600',
    emerald: 'from-emerald-500 to-teal-600'
  };

  const bgClasses = {
    blue: 'bg-blue-100 dark:bg-blue-900/20',
    purple: 'bg-purple-100 dark:bg-purple-900/20',
    emerald: 'bg-emerald-100 dark:bg-emerald-900/20'
  };

  const textClasses = {
    blue: 'text-blue-600 dark:text-blue-400',
    purple: 'text-purple-600 dark:text-purple-400',
    emerald: 'text-emerald-600 dark:text-emerald-400'
  }

  return (
    <div className="group relative bg-white dark:bg-gray-800 p-6 rounded-3xl shadow-xl border border-gray-200 dark:border-gray-700">
      <div className="absolute inset-0 opacity-5 dark:opacity-10">
        <div className={`absolute inset-0 bg-gradient-to-br ${colorClasses[color]} transform rotate-12 scale-150`}></div>
      </div>

      <div className="relative flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className={`${bgClasses[color]} p-4 rounded-2xl`}>
            <div className={textClasses[color]}>
              {icon}
            </div>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">{title}</p>
            <p className="text-3xl font-bold text-gray-900 dark:text-white">{value.toLocaleString()}</p>
          </div>
        </div>

        <div className="flex flex-col items-end print:hidden">
          <Activity className="w-5 h-5 text-gray-400 dark:text-gray-500 mb-2" />
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
        </div>
      </div>
    </div>
  );
};

const UserManagementSection = ({
  title,
  users,
  searchTerm,
  setSearchTerm,
  onDelete,
  onAddToTeam,
  icon,
  color
}: {
  title: string;
  users: User[];
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  onDelete: (user: User) => void;
  onAddToTeam?: (user: User) => void;
  icon: React.ReactNode;
  color: 'purple' | 'blue';
}) => {
  const bgClasses = {
    purple: 'bg-purple-100 dark:bg-purple-900/20',
    blue: 'bg-blue-100 dark:bg-blue-900/20'
  };

  const textClasses = {
    purple: 'text-purple-600 dark:text-purple-400',
    blue: 'text-blue-600 dark:text-blue-400'
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
      {/* Header */}
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 ${bgClasses[color]} rounded-xl flex items-center justify-center`}>
              <div className={textClasses[color]}>
                {icon}
              </div>
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">{title} Management</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">Manage and monitor {title.toLowerCase()}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 print:hidden">
            <span className="text-sm text-gray-500 dark:text-gray-400">{users.length} total</span>
            <Filter className="w-4 h-4 text-gray-400" />
          </div>
        </div>

        {/* Search Bar */}
        <div className="relative print:hidden">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 w-5 h-5" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder={`Search ${title.toLowerCase()} by name or email...`}
            className="w-full bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl pl-12 pr-4 py-3 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent transition-all"
          />
        </div>
      </div>

      {/* Content */}
      <div className="p-6 max-h-96 overflow-y-auto print:max-h-none print:overflow-visible">
        <div className="space-y-4">
          {users.length > 0 ? users.map(user => (
            <UserCard
              key={user.$id}
              user={user}
              onDelete={onDelete}
              onAddToTeam={onAddToTeam}
              color={color}
            />
          )) : (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-gray-400" />
              </div>
              <p className="text-gray-500 dark:text-gray-400 font-medium">No {title.toLowerCase()} found</p>
              <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">Try adjusting your search criteria</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const UserCard = ({
  user,
  onDelete,
  onAddToTeam,
  color
}: {
  user: User;
  onDelete: (user: User) => void;
  onAddToTeam?: (user: User) => void;
  color: 'purple' | 'blue';
}) => {
  const colorClasses = {
    purple: 'from-purple-500 to-pink-600',
    blue: 'from-blue-500 to-cyan-600'
  };

  return (
    <div className="group p-5 bg-gray-50 dark:bg-gray-700/50 rounded-2xl">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        {/* User Info */}
        <div className="flex items-center gap-4 flex-1 min-w-0">
          <div className={`w-12 h-12 bg-gradient-to-br ${colorClasses[color]} rounded-2xl flex items-center justify-center text-white font-bold text-lg flex-shrink-0`}>
            {user.name.charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 mb-1">
              <p className="font-bold text-lg text-gray-900 dark:text-white truncate">{user.name}</p>
              {user.isTeamMember && (
                <div className="bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400 px-2 py-1 rounded-md text-xs font-medium flex items-center gap-1 print:hidden">
                  <UserCheck className="w-3 h-3" />
                  Team
                </div>
              )}
            </div>
            {user.email ? (
              <p className="text-sm text-gray-600 dark:text-gray-400 truncate">{user.email}</p>
            ) : (
              <p className="text-sm text-gray-400 dark:text-gray-500 italic">Email not available</p>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3 flex-shrink-0 print:hidden">
          {onAddToTeam && !user.isTeamMember && (
            <button
              onClick={() => onAddToTeam(user)}
              className="group/btn bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-medium py-2 px-4 rounded-xl transition-all duration-300 hover:shadow-lg hover:scale-105 flex items-center gap-2 text-sm"
            >
              <UserPlus className="w-4 h-4" />
              Add to Team
            </button>
          )}

          <button
            onClick={() => onDelete(user)}
            className="p-3 bg-red-500 hover:bg-red-600 text-white rounded-xl transition-all duration-300 hover:shadow-lg hover:scale-105 group-hover:opacity-100 opacity-60"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default withSuperAdminAuth(SuperAdminPage);