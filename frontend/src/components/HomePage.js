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

  useEffect(() => {
    const fetchAllData = async () => {
      try {
        const [categoriesData, topicsData, membersData] = await Promise.all([
          getCategories(),
          getTopics(),
          getTopMembers()
        ]);
        
        setCategories(categoriesData);
        setTopics(topicsData);
        setTopMembers(membersData.slice(0, 5)); // Only top 5 members
        setLoading(false);
      } catch (err) {
        console.error('Error fetching home page data:', err);
        setLoading(false);
      }
    };

    fetchAllData();
  }, []);

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
