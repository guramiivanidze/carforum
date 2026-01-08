'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { getTopMembers } from '@/lib/api';
import Link from 'next/link';
import { FaHome, FaTrophy, FaMedal, FaCrown, FaStar } from 'react-icons/fa';

interface LeaderboardUser {
  id: number;
  username: string;
  user_image_url: string | null;
  points: number;
  topics_count: number;
  replies_count: number;
  likes_received: number;
  level: number;
  level_name: string;
  xp: number;
}

export default function LeaderboardPage() {
  const [topUsers, setTopUsers] = useState<LeaderboardUser[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        setLoading(true);
        const data = await getTopMembers();
        setTopUsers(data);
      } catch (error) {
        console.error('Failed to fetch leaderboard:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchLeaderboard();
  }, []);

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <FaCrown className="text-yellow-500 text-2xl" />;
      case 2:
        return <FaMedal className="text-gray-400 text-2xl" />;
      case 3:
        return <FaMedal className="text-amber-600 text-2xl" />;
      default:
        return <span className="text-lg font-bold text-gray-400">#{rank}</span>;
    }
  };

  const getRankBg = (rank: number) => {
    switch (rank) {
      case 1:
        return 'bg-gradient-to-r from-yellow-50 to-yellow-100 border-yellow-300';
      case 2:
        return 'bg-gradient-to-r from-gray-50 to-gray-100 border-gray-300';
      case 3:
        return 'bg-gradient-to-r from-amber-50 to-amber-100 border-amber-300';
      default:
        return 'bg-white border-gray-200';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading leaderboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="container mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <div className="mb-6 flex items-center gap-2 text-sm bg-white px-4 py-3 rounded-lg shadow-sm">
          <Link href="/" className="text-blue-600 hover:text-blue-700 font-medium transition flex items-center gap-1">
            <FaHome className="text-xs" />
            Home
          </Link>
          <span className="text-gray-300">/</span>
          <span className="text-gray-600">საუკეთესო წევრები</span>
        </div>

        {/* Header */}
        <div className="bg-white border border-gray-200 rounded-lg p-4 mb-6 shadow-sm">
          <h1 className="text-2xl font-bold text-gray-900">საუკეთესო წევრები</h1>
          <p className="text-gray-600 text-sm mt-1">ყველაზე აქტიური საზოგადოების წევრები</p>
        </div>

        {/* Leaderboard */}
        {topUsers.length === 0 ? (
          <div className="bg-white border border-gray-200 rounded-lg p-8 text-center shadow-sm">
            <p className="text-gray-600">ჯერ არ არის მონაცემები.</p>
          </div>
        ) : (
          <div className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm">
            <table className="w-full">
              <thead className="bg-gray-100 border-b border-gray-200">
                <tr>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">რანგი</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">მომხმარებელი</th>
                  <th className="text-center py-3 px-4 text-sm font-semibold text-gray-700">დონე</th>
                  <th className="text-center py-3 px-4 text-sm font-semibold text-gray-700">ქულა</th>
                  <th className="text-center py-3 px-4 text-sm font-semibold text-gray-700">XP</th>
                  <th className="text-center py-3 px-4 text-sm font-semibold text-gray-700">თემა</th>
                  <th className="text-center py-3 px-4 text-sm font-semibold text-gray-700">პასუხი</th>
                  <th className="text-center py-3 px-4 text-sm font-semibold text-gray-700">მოწონება</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {topUsers.map((member, index) => (
                  <tr
                    key={member.id}
                    className={`hover:bg-gray-50 ${user?.id === member.id ? 'bg-blue-50' : ''}`}
                  >
                    {/* Rank */}
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        {index < 3 ? (
                          <span className="text-xl">{getRankIcon(index + 1)}</span>
                        ) : (
                          <span className="text-gray-600 font-medium">#{index + 1}</span>
                        )}
                      </div>
                    </td>

                    {/* User */}
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <Link href={`/profile/${member.id}`}>
                          {member.user_image_url ? (
                            <img
                              src={member.user_image_url}
                              alt={member.username}
                              className="w-10 h-10 rounded-full object-cover border border-gray-200"
                            />
                          ) : (
                            <div className="w-10 h-10 bg-gray-500 text-white rounded-full flex items-center justify-center font-semibold text-sm">
                              {member.username.charAt(0).toUpperCase()}
                            </div>
                          )}
                        </Link>
                        <div>
                          <Link
                            href={`/profile/${member.id}`}
                            className="font-semibold text-gray-900 hover:text-blue-600"
                          >
                            {member.username}
                          </Link>
                          {user?.id === member.id && (
                            <span className="ml-2 px-2 py-0.5 bg-blue-100 text-blue-700 text-xs font-medium rounded">
                              თქვენ
                            </span>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Level */}
                    <td className="py-3 px-4 text-center">
                      <span className="inline-block px-2 py-1 bg-purple-100 text-purple-700 text-xs font-medium rounded">
                        {member.level} - {member.level_name}
                      </span>
                    </td>

                    {/* Points */}
                    <td className="py-3 px-4 text-center text-gray-900 font-medium">
                      {member.points}
                    </td>

                    {/* XP */}
                    <td className="py-3 px-4 text-center text-gray-900 font-medium">
                      {member.xp}
                    </td>

                    {/* Topics */}
                    <td className="py-3 px-4 text-center text-gray-700">
                      {member.topics_count}
                    </td>

                    {/* Replies */}
                    <td className="py-3 px-4 text-center text-gray-700">
                      {member.replies_count}
                    </td>

                    {/* Likes */}
                    <td className="py-3 px-4 text-center text-gray-700">
                      {member.likes_received}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
