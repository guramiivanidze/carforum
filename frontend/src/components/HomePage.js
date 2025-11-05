import React, { useState, useEffect } from 'react';
import { getTopics, getTopMembers } from '../services/api';
import { useCategories } from '../context/CategoriesContext';
import HeroSection from './HeroSection';
import CategoriesSection from './CategoriesSection';
import TopicsSection from './TopicsSection';
import Sidebar from './Sidebar';
import AdBanner from './AdBanner';

function HomePage() {
  const { categories, loading: categoriesLoading } = useCategories();
  const [topics, setTopics] = useState([]);
  const [topMembers, setTopMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const fetchAllData = async () => {
      try {
        // Fetch fewer topics on mobile (5) vs desktop (10)
        const topicsLimit = isMobile ? 5 : 10;
        
        const [topicsData, membersData] = await Promise.all([
          getTopics({ page: 1, page_size: topicsLimit }),
          getTopMembers()
        ]);
        
        // Handle paginated responses - extract results array if paginated
        setTopics(topicsData.results || topicsData);
        setTopMembers(membersData.slice(0, 10)); // Top 10 members
        setLoading(false);
      } catch (err) {
        console.error('Error fetching home page data:', err);
        setLoading(false);
      }
    };

    fetchAllData();
  }, [isMobile]);

  return (
    <div className="main-container">
      <div className="main-content">
        <HeroSection />
        <CategoriesSection categories={categories} loading={categoriesLoading} />
        
        {/* Ad Banner between Categories and Topics */}
        <AdBanner location="home_between_sections" />
        
        <TopicsSection topics={topics} loading={loading} />
      </div>
      <Sidebar topics={topics} topMembers={topMembers} />
    </div>
  );
}

export default HomePage;
