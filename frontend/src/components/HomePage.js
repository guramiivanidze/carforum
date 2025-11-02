import React, { useState, useEffect } from 'react';
import { getCategories, getTopics, getTopMembers } from '../services/api';
import HeroSection from './HeroSection';
import CategoriesSection from './CategoriesSection';
import TopicsSection from './TopicsSection';
import Sidebar from './Sidebar';

function HomePage() {
  const [categories, setCategories] = useState([]);
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
        
        const [categoriesData, topicsData, membersData] = await Promise.all([
          getCategories(),
          getTopics({ page: 1, page_size: topicsLimit }),
          getTopMembers()
        ]);
        
        // Handle paginated responses - extract results array if paginated
        setCategories(categoriesData.results || categoriesData);
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
        <CategoriesSection categories={categories} loading={loading} />
        <TopicsSection topics={topics} loading={loading} />
      </div>
      <Sidebar topics={topics} topMembers={topMembers} />
    </div>
  );
}

export default HomePage;
