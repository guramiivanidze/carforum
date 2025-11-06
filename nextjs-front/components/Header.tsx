'use client';

import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { FaSearch, FaUser, FaBell, FaSignOutAlt, FaSignInAlt } from 'react-icons/fa';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function Header() {
  const { user, logout, loading } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const router = useRouter();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  const handleLogout = async () => {
    await logout();
    router.push('/');
  };

  return (
    <header className="bg-white shadow-md sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between py-4">
          {/* Logo */}
          <Link href="/" className="text-2xl font-bold text-blue-600 hover:text-blue-700">
            Car Forum
          </Link>

          {/* Search Bar */}
          <form onSubmit={handleSearch} className="flex-1 max-w-xl mx-8">
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search topics, categories..."
                className="w-full px-4 py-2 pl-10 pr-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            </div>
          </form>

          {/* Navigation */}
          <nav className="flex items-center gap-6">
            {loading ? (
              <div className="text-gray-400">Loading...</div>
            ) : user ? (
              <>
                <Link
                  href="/create-topic"
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
                >
                  Create Topic
                </Link>
                
                <Link href="/notifications" className="text-gray-600 hover:text-blue-600 relative">
                  <FaBell size={20} />
                </Link>

                <Link href={`/profile/${user.id}`} className="text-gray-600 hover:text-blue-600">
                  <FaUser size={20} />
                </Link>

                <button
                  onClick={handleLogout}
                  className="text-gray-600 hover:text-red-600 flex items-center gap-2"
                >
                  <FaSignOutAlt size={20} />
                  <span>Logout</span>
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="text-gray-600 hover:text-blue-600 flex items-center gap-2"
                >
                  <FaSignInAlt size={20} />
                  <span>Login</span>
                </Link>
                <Link
                  href="/register"
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
                >
                  Register
                </Link>
              </>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
}
