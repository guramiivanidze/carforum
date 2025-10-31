import React from 'react';
import { useNavigate } from 'react-router-dom';

function CategoriesSection({ categories, loading }) {
  const navigate = useNavigate();

  const handleCategoryClick = (categoryId) => {
    navigate(`/category/${categoryId}`);
  };

  if (loading) {
    return (
      <section className="categories-section">
        <h2>Categories</h2>
        <div>Loading categories...</div>
      </section>
    );
  }

  return (
    <section className="categories-section">
      <h2>Categories</h2>
      <div className="categories-grid">
        {categories.map((category) => (
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
        ))}
      </div>
    </section>
  );
}

export default CategoriesSection;
