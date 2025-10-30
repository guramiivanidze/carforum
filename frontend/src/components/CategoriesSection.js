import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getCategories } from '../services/api';

function CategoriesSection() {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const data = await getCategories();
        setCategories(data);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching categories:', err);
        setError('Failed to load categories');
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

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

  if (error) {
    return (
      <section className="categories-section">
        <h2>Categories</h2>
        <div style={{ color: 'red' }}>{error}</div>
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
