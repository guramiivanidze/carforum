import React from 'react';
import { useNavigate } from 'react-router-dom';
import AdBanner from './AdBanner';

function CategoriesSection({ categories, loading }) {
  const navigate = useNavigate();

  const handleCategoryClick = (categoryId) => {
    navigate(`/category/${categoryId}`);
  };

  if (loading || !categories) {
    return (
      <section className="categories-section">
        <h2>Categories</h2>
        <div>Loading categories...</div>
      </section>
    );
  }

  // Ensure categories is an array
  const categoriesArray = Array.isArray(categories) ? categories : [];

  // Insert ad banner after 3rd category
  const categoriesWithAd = [];
  categoriesArray.forEach((category, index) => {
    categoriesWithAd.push(
      <div 
        key={category.id} 
        className="category-card"
        onClick={() => handleCategoryClick(category.id)}
      >
        <div className="category-icon">{category.icon}</div>
        <h3>{category.title}</h3>
        <p>{category.description}</p>
        <div className="category-stats">{category.topics_count} topics</div>
      </div>
    );
    
    // Add ad banner after 3rd category
    if (index === 2) {
      categoriesWithAd.push(
        <AdBanner key="ad-banner-categories" location="home_categories_grid" />
      );
    }
  });

  return (
    <section className="categories-section">
      <h2>Categories</h2>
      <div className="categories-grid">
        {categoriesWithAd}
      </div>
    </section>
  );
}

export default CategoriesSection;
