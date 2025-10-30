import React from 'react';
import HeroSection from './HeroSection';
import CategoriesSection from './CategoriesSection';
import TopicsSection from './TopicsSection';
import Sidebar from './Sidebar';

function HomePage() {
  return (
    <div className="main-container">
      <div className="main-content">
        <HeroSection />
        <CategoriesSection />
        <TopicsSection />
      </div>
      <Sidebar />
    </div>
  );
}

export default HomePage;
