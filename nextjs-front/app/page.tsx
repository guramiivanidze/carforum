'use client';

import { useCategories } from '@/contexts/CategoriesContext';
import { useBanners } from '@/contexts/BannersContext';
import Link from 'next/link';
import AdBannerComponent from '@/components/AdBanner';
import { FaComments, FaReply, FaClock } from 'react-icons/fa';

export default function Home() {
  const { categories, loading } = useCategories();
  const { getBannersByLocation } = useBanners();

  const topBanners = getBannersByLocation('home_top');
  const sideBanners = getBannersByLocation('home_sidebar');
  const bottomBanners = getBannersByLocation('home_bottom');

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">Loading...</div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Top Banner */}
      {topBanners.length > 0 && (
        <div className="container mx-auto px-4 py-4">
          <AdBannerComponent location="home_top" />
        </div>
      )}

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-3">
            {/* Welcome Section */}
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <h1 className="text-3xl font-bold mb-2">Welcome to Car Forum</h1>
              <p className="text-gray-600">
                Join thousands of car enthusiasts discussing everything automotive.
              </p>
            </div>

            {/* Categories Section */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-2xl font-bold mb-6">Categories</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {categories.map((category) => (
                  <Link
                    key={category.id}
                    href={`/category/${category.id}`}
                    className="border border-gray-200 rounded-lg p-4 hover:border-blue-500 hover:shadow-lg transition-all"
                  >
                    <h3 className="text-lg font-bold text-blue-600 mb-2">
                      {category.title || category.name}
                    </h3>
                    <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                      {category.description}
                    </p>
                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      <span className="flex items-center gap-1">
                        <FaComments />
                        {category.topics_count || 0} topics
                      </span>
                      <span className="flex items-center gap-1">
                        <FaReply />
                        {category.replies_count || 0} replies
                      </span>
                    </div>
                    {category.latest_topic && (
                      <div className="mt-3 pt-3 border-t border-gray-100">
                        <p className="text-xs text-gray-500 flex items-center gap-1">
                          <FaClock />
                          Latest: {category.latest_topic.title.substring(0, 30)}...
                        </p>
                      </div>
                    )}
                  </Link>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            {/* Sidebar Banner */}
            {sideBanners.length > 0 && (
              <div className="mb-6">
                <AdBannerComponent location="home_sidebar" />
              </div>
            )}

            {/* Stats Card */}
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <h3 className="text-lg font-bold mb-4">Forum Stats</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Categories:</span>
                  <span className="font-bold">{categories.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Topics:</span>
                  <span className="font-bold">
                    {categories.reduce((sum, cat) => sum + (cat.topics_count || 0), 0)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Replies:</span>
                  <span className="font-bold">
                    {categories.reduce((sum, cat) => sum + (cat.replies_count || 0), 0)}
                  </span>
                </div>
              </div>
            </div>

            {/* Quick Links */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-bold mb-4">Quick Links</h3>
              <ul className="space-y-2">
                <li>
                  <Link href="/leaderboard" className="text-blue-600 hover:underline">
                    Top Members
                  </Link>
                </li>
                <li>
                  <Link href="/tags" className="text-blue-600 hover:underline">
                    Popular Tags
                  </Link>
                </li>
                <li>
                  <Link href="/guidelines" className="text-blue-600 hover:underline">
                    Community Guidelines
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Banner */}
      {bottomBanners.length > 0 && (
        <div className="container mx-auto px-4 py-4">
          <AdBannerComponent location="home_bottom" />
        </div>
      )}
    </div>
  );
}

