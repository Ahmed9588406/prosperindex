"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronDown, ChevronRight, Check, Square, CheckSquare, List } from 'lucide-react';
import './CategoryNavigation.css';

type Category = {
  name: string;
  fields: { name: string; description: string; path?: string }[];
};

interface CategoryNavigationProps {
  categories: Category[];
  onNavigate?: (categoryName: string, fieldName?: string) => void;
  isMobileMenuOpen?: boolean;
  onCloseMobileMenu?: () => void;
}

const CategoryNavigation: React.FC<CategoryNavigationProps> = ({ 
  categories, 
  onNavigate,
  isMobileMenuOpen = false,
  onCloseMobileMenu
}) => {
  const router = useRouter();
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());
  const [visitedCategories, setVisitedCategories] = useState<Set<string>>(new Set());
  const [completedCategories, setCompletedCategories] = useState<Set<string>>(new Set());
  const [completedFields, setCompletedFields] = useState<Set<string>>(new Set());
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [showSummary, setShowSummary] = useState(false);

  // Load data from localStorage on mount
  useEffect(() => {
    const savedVisited = localStorage.getItem('visitedCategories');
    const savedCompletedCat = localStorage.getItem('completedCategories');
    const savedCompletedFields = localStorage.getItem('completedFields');
    
    if (savedVisited) {
      setVisitedCategories(new Set(JSON.parse(savedVisited)));
    }
    if (savedCompletedCat) {
      setCompletedCategories(new Set(JSON.parse(savedCompletedCat)));
    }
    if (savedCompletedFields) {
      setCompletedFields(new Set(JSON.parse(savedCompletedFields)));
    }
  }, []);

  // Save data to localStorage
  useEffect(() => {
    localStorage.setItem('visitedCategories', JSON.stringify([...visitedCategories]));
  }, [visitedCategories]);

  useEffect(() => {
    localStorage.setItem('completedCategories', JSON.stringify([...completedCategories]));
  }, [completedCategories]);

  useEffect(() => {
    localStorage.setItem('completedFields', JSON.stringify([...completedFields]));
  }, [completedFields]);

  const toggleCategory = (categoryName: string) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(categoryName)) {
      newExpanded.delete(categoryName);
    } else {
      newExpanded.add(categoryName);
    }
    setExpandedCategories(newExpanded);
  };

  const handleCategoryClick = (categoryName: string) => {
    setActiveCategory(categoryName);
    setVisitedCategories(new Set(visitedCategories).add(categoryName));
    if (onNavigate) {
      onNavigate(categoryName);
    }
    // Close mobile menu after navigation
    if (onCloseMobileMenu) {
      onCloseMobileMenu();
    }
  };

  const handleFieldClick = (categoryName: string, fieldName: string, path?: string) => {
    setActiveCategory(categoryName);
    setVisitedCategories(new Set(visitedCategories).add(categoryName));
    
    // Navigate using Next.js router if path is provided
    if (path) {
      router.push(path);
    }
    
    if (onNavigate) {
      onNavigate(categoryName, fieldName);
    }
    // Close mobile menu after navigation
    if (onCloseMobileMenu) {
      onCloseMobileMenu();
    }
  };

  const isVisited = (categoryName: string) => {
    return visitedCategories.has(categoryName);
  };

  const toggleCategoryCompletion = (categoryName: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const newCompleted = new Set(completedCategories);
    if (newCompleted.has(categoryName)) {
      newCompleted.delete(categoryName);
    } else {
      newCompleted.add(categoryName);
    }
    setCompletedCategories(newCompleted);
  };

  const toggleFieldCompletion = (categoryName: string, fieldName: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const fieldKey = `${categoryName}::${fieldName}`;
    const newCompleted = new Set(completedFields);
    if (newCompleted.has(fieldKey)) {
      newCompleted.delete(fieldKey);
    } else {
      newCompleted.add(fieldKey);
    }
    setCompletedFields(newCompleted);
  };

  const isFieldCompleted = (categoryName: string, fieldName: string) => {
    return completedFields.has(`${categoryName}::${fieldName}`);
  };

  const getCategoryFieldsCompletionCount = (category: Category) => {
    const completed = category.fields.filter(field => 
      isFieldCompleted(category.name, field.name)
    ).length;
    return { completed, total: category.fields.length };
  };

  const clearVisitedCategories = () => {
    setVisitedCategories(new Set());
    setCompletedCategories(new Set());
    setCompletedFields(new Set());
    localStorage.removeItem('visitedCategories');
    localStorage.removeItem('completedCategories');
    localStorage.removeItem('completedFields');
  };

  const totalFields = categories.reduce((sum, cat) => sum + cat.fields.length, 0);
  const completedFieldsCount = completedFields.size;

  return (
    <div className={`category-navigation ${isMobileMenuOpen ? 'mobile-open' : ''}`}>
      {/* Navigation Container */}
      <nav className="nav-container">
        <div className="nav-header">
          <h2>City Prosperity Index</h2>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button 
              className="summary-btn"
              onClick={() => setShowSummary(!showSummary)}
              title="View Summary"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '8px 12px',
                background: showSummary ? '#667eea' : '#f1f5f9',
                color: showSummary ? 'white' : '#64748b',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '13px',
                fontWeight: '500',
                transition: 'all 0.2s'
              }}
            >
              <List size={16} />
              Summary
            </button>
            <button 
              className="clear-visits-btn"
              onClick={clearVisitedCategories}
              title="Clear all visited indicators"
            >
              Reset Progress
            </button>
          </div>
        </div>

        {/* Summary View */}
        {showSummary && (
          <div className="summary-panel" style={{
            margin: '16px 0',
            padding: '16px',
            background: '#f8fafc',
            borderRadius: '12px',
            border: '1px solid #e2e8f0'
          }}>
            <h3 style={{ margin: '0 0 12px 0', fontSize: '16px', color: '#334155' }}>
              Completion Summary
            </h3>
            <div style={{ marginBottom: '16px' }}>
              <div style={{ fontSize: '14px', color: '#64748b', marginBottom: '8px' }}>
                Categories: {completedCategories.size} / {categories.length}
              </div>
              <div style={{ fontSize: '14px', color: '#64748b' }}>
                Fields: {completedFieldsCount} / {totalFields}
              </div>
            </div>
            <div style={{ maxHeight: '200px', overflowY: 'auto' }}>
              {categories.map(category => {
                const { completed, total } = getCategoryFieldsCompletionCount(category);
                const isCatCompleted = completedCategories.has(category.name);
                
                if (!isCatCompleted && completed === 0) return null;
                
                return (
                  <div key={category.name} style={{
                    padding: '8px',
                    marginBottom: '8px',
                    background: 'white',
                    borderRadius: '8px',
                    border: '1px solid #e2e8f0'
                  }}>
                    <div style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: '8px',
                      fontSize: '13px',
                      color: '#334155',
                      fontWeight: '500'
                    }}>
                      {isCatCompleted && <Check size={14} style={{ color: '#10b981' }} />}
                      <span>{category.name}</span>
                      {completed > 0 && (
                        <span style={{ 
                          marginLeft: 'auto', 
                          fontSize: '12px', 
                          color: '#64748b' 
                        }}>
                          {completed}/{total}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        <div className="categories-list">
          {categories.map((category) => {
            const isExpanded = expandedCategories.has(category.name);
            const visited = isVisited(category.name);
            const isActive = activeCategory === category.name;
            const isCategoryCompleted = completedCategories.has(category.name);
            const { completed: fieldsCompleted, total: fieldsTotal } = getCategoryFieldsCompletionCount(category);

            return (
              <div 
                key={category.name} 
                className={`category-item ${isActive ? 'active' : ''} ${isCategoryCompleted ? 'completed' : ''}`}
              >
                <div className="category-header">
                  <button
                    className="category-toggle"
                    onClick={() => toggleCategory(category.name)}
                    aria-expanded={isExpanded}
                  >
                    {isExpanded ? (
                      <ChevronDown size={20} />
                    ) : (
                      <ChevronRight size={20} />
                    )}
                  </button>

                  <button
                    className="category-checkbox"
                    onClick={(e) => toggleCategoryCompletion(category.name, e)}
                    title={isCategoryCompleted ? "Mark as incomplete" : "Mark as complete"}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      padding: '4px',
                      background: 'transparent',
                      border: 'none',
                      cursor: 'pointer',
                      color: isCategoryCompleted ? '#10b981' : '#94a3b8',
                      transition: 'color 0.2s'
                    }}
                  >
                    {isCategoryCompleted ? (
                      <CheckSquare size={20} />
                    ) : (
                      <Square size={20} />
                    )}
                  </button>

                  <button
                    className="category-link"
                    onClick={() => handleCategoryClick(category.name)}
                    style={{ flex: 1 }}
                  >
                    <span className="category-name">{category.name}</span>
                    {fieldsCompleted > 0 && (
                      <span style={{ 
                        fontSize: '11px', 
                        color: '#64748b',
                        marginLeft: '8px'
                      }}>
                        ({fieldsCompleted}/{fieldsTotal})
                      </span>
                    )}
                    {visited && (
                      <span className="visited-indicator" title="Visited and calculated">
                        <Check size={16} />
                      </span>
                    )}
                  </button>
                </div>

                {isExpanded && (
                  <div className="fields-list">
                    {category.fields.map((field) => {
                      const isCompleted = isFieldCompleted(category.name, field.name);
                      
                      return (
                        <div
                          key={field.name}
                          className={`field-item-wrapper ${isCompleted ? 'completed' : ''}`}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            padding: '8px 12px',
                            marginBottom: '4px',
                            borderRadius: '6px',
                            background: isCompleted ? '#f0fdf4' : 'transparent',
                            transition: 'background 0.2s'
                          }}
                        >
                          <button
                            className="field-checkbox"
                            onClick={(e) => toggleFieldCompletion(category.name, field.name, e)}
                            title={isCompleted ? "Mark as incomplete" : "Mark as complete"}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              padding: '2px',
                              background: 'transparent',
                              border: 'none',
                              cursor: 'pointer',
                              color: isCompleted ? '#10b981' : '#94a3b8',
                              transition: 'color 0.2s'
                            }}
                          >
                            {isCompleted ? (
                              <CheckSquare size={16} />
                            ) : (
                              <Square size={16} />
                            )}
                          </button>
                          <button
                            className="field-item"
                            onClick={() => handleFieldClick(category.name, field.name, field.path)}
                            title={field.description}
                            style={{
                              flex: 1,
                              textAlign: 'left',
                              background: 'transparent',
                              border: 'none',
                              padding: 0,
                              cursor: 'pointer',
                              textDecoration: isCompleted ? 'line-through' : 'none',
                              opacity: isCompleted ? 0.7 : 1
                            }}
                          >
                            <span className="field-name">{field.description}</span>
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Progress Indicator */}
        <div className="progress-indicator">
          <div className="progress-text">
            Progress: {visitedCategories.size} / {categories.length} categories
          </div>
          <div className="progress-bar">
            <div 
              className="progress-fill" 
              style={{ 
                width: `${(visitedCategories.size / categories.length) * 100}%` 
              }}
            />
          </div>
          <div className="progress-text" style={{ marginTop: '8px', fontSize: '12px' }}>
            Completed: {completedFieldsCount} / {totalFields} fields
          </div>
          <div className="progress-bar">
            <div 
              className="progress-fill" 
              style={{ 
                width: `${(completedFieldsCount / totalFields) * 100}%`,
                background: 'linear-gradient(90deg, #10b981 0%, #059669 100%)'
              }}
            />
          </div>
        </div>
      </nav>
    </div>
  );
};

export default CategoryNavigation;