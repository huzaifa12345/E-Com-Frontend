import React, { useState, useEffect } from 'react';
import { themeApi } from '../services/themeApi';

const HierarchicalCategorySelector = ({ onCategorySelect, selectedCategory }) => {
  const [level1Categories, setLevel1Categories] = useState([]);
  const [level2Categories, setLevel2Categories] = useState([]);
  const [level3Categories, setLevel3Categories] = useState([]);
  const [selectedLevel1, setSelectedLevel1] = useState('');
  const [selectedLevel2, setSelectedLevel2] = useState('');
  const [selectedLevel3, setSelectedLevel3] = useState('');
  const [loading, setLoading] = useState(false);

  // Load level 1 categories (Seasons) on component mount
  useEffect(() => {
    loadLevel1Categories();
  }, []);

  const loadLevel1Categories = async () => {
    try {
      setLoading(true);
      const categories = await themeApi.getCategoriesByLevel(1);
      setLevel1Categories(categories);
      console.log('Level 1 categories (Seasons):', categories);
    } catch (error) {
      console.error('Error loading level 1 categories:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadLevel2Categories = async (level1Id) => {
    try {
      setLoading(true);
      const categories = await themeApi.getCategoriesByLevel(2, level1Id);
      setLevel2Categories(categories);
      setLevel3Categories([]); // Reset level 3
      setSelectedLevel2('');
      setSelectedLevel3('');
      console.log('Level 2 categories (Gender):', categories);
    } catch (error) {
      console.error('Error loading level 2 categories:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadLevel3Categories = async (level2Id) => {
    try {
      setLoading(true);
      const categories = await themeApi.getCategoriesByLevel(3, level2Id);
      setLevel3Categories(categories);
      setSelectedLevel3('');
      console.log('Level 3 categories (Custom):', categories);
    } catch (error) {
      console.error('Error loading level 3 categories:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLevel1Change = (e) => {
    const value = e.target.value;
    setSelectedLevel1(value);
    setSelectedLevel2('');
    setSelectedLevel3('');
    setLevel2Categories([]);
    setLevel3Categories([]);
    
    if (value) {
      loadLevel2Categories(value);
      const selectedCat = level1Categories.find(cat => cat.id === parseInt(value));
      if (onCategorySelect) {
        onCategorySelect(selectedCat);
      }
    } else {
      if (onCategorySelect) {
        onCategorySelect(null);
      }
    }
  };

  const handleLevel2Change = (e) => {
    const value = e.target.value;
    setSelectedLevel2(value);
    setSelectedLevel3('');
    setLevel3Categories([]);
    
    if (value) {
      loadLevel3Categories(value);
      const selectedCat = level2Categories.find(cat => cat.id === parseInt(value));
      if (onCategorySelect) {
        onCategorySelect(selectedCat);
      }
    } else {
      if (onCategorySelect) {
        onCategorySelect(level1Categories.find(cat => cat.id === parseInt(selectedLevel1)));
      }
    }
  };

  const handleLevel3Change = (e) => {
    const value = e.target.value;
    setSelectedLevel3(value);
    
    if (value) {
      const selectedCat = level3Categories.find(cat => cat.id === parseInt(value));
      if (onCategorySelect) {
        onCategorySelect(selectedCat);
      }
    } else {
      if (onCategorySelect) {
        onCategorySelect(level2Categories.find(cat => cat.id === parseInt(selectedLevel2)));
      }
    }
  };

  return (
    <div className="hierarchical-category-selector">
      <div className="row">
        {/* Level 1: Season */}
        <div className="col-md-4 mb-3">
          <label className="form-label fw-bold">
            <i className="fas fa-snowflake me-2"></i>
            Season
          </label>
          <select 
            className="form-select"
            value={selectedLevel1}
            onChange={handleLevel1Change}
            disabled={loading}
          >
            <option value="">Select Season</option>
            {level1Categories.map(category => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </div>

        {/* Level 2: Gender */}
        <div className="col-md-4 mb-3">
          <label className="form-label fw-bold">
            <i className="fas fa-venus-mars me-2"></i>
            Gender
          </label>
          <select 
            className="form-select"
            value={selectedLevel2}
            onChange={handleLevel2Change}
            disabled={loading || !selectedLevel1}
          >
            <option value="">Select Gender</option>
            {level2Categories.map(category => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </div>

        {/* Level 3: Custom Category */}
        <div className="col-md-4 mb-3">
          <label className="form-label fw-bold">
            <i className="fas fa-tag me-2"></i>
            Category
          </label>
          <select 
            className="form-select"
            value={selectedLevel3}
            onChange={handleLevel3Change}
            disabled={loading || !selectedLevel2}
          >
            <option value="">Select Category</option>
            {level3Categories.map(category => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Selected Category Display */}
      {selectedCategory && (
        <div className="alert alert-info mt-3">
          <h6 className="alert-heading">
            <i className="fas fa-check-circle me-2"></i>
            Selected Category:
          </h6>
          <div className="breadcrumb mb-0">
            <span className="breadcrumb-item active">
              {selectedCategory.name}
            </span>
          </div>
          {selectedCategory.description && (
            <small className="text-muted d-block mt-1">
              {selectedCategory.description}
            </small>
          )}
        </div>
      )}

      {/* Loading Indicator */}
      {loading && (
        <div className="text-center mt-2">
          <div className="spinner-border spinner-border-sm" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default HierarchicalCategorySelector;
