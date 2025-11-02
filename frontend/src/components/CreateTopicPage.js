import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link, useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getCategories, createTopic, getTopic, updateTopic, getPopularTags } from '../services/api';
import MDEditor from '@uiw/react-md-editor';
import '../styles/CreateTopicPage.css';

function CreateTopicPage() {
  const navigate = useNavigate();
  const { id } = useParams(); // For edit mode
  const { isAuthenticated, user } = useAuth();
  const fileInputRef = useRef(null);
  
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const isEditMode = Boolean(id);
  
  // Form state
  const [formData, setFormData] = useState({
    title: '',
    category: '',
    content: '',
    tags: []
  });
  
  const [tagInput, setTagInput] = useState('');
  const [errors, setErrors] = useState({});
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [availableTags, setAvailableTags] = useState([]);
  const [tagSuggestions, setTagSuggestions] = useState([]);
  const [showTagSuggestions, setShowTagSuggestions] = useState(false);
  
  // New enhanced features
  const [uploadedImages, setUploadedImages] = useState([]);
  const [showPoll, setShowPoll] = useState(false);
  const [pollQuestion, setPollQuestion] = useState('');
  const [pollOptions, setPollOptions] = useState(['', '']);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);

  // Character limits
  const TITLE_MAX = 100;
  const CONTENT_MIN = 10;

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Check authentication
        if (!isAuthenticated) {
          setShowLoginModal(true);
          setLoading(false);
          return;
        }

        // Fetch categories and tags
        const [categoriesData, tagsData] = await Promise.all([
          getCategories(),
          getPopularTags()
        ]);
        
        setCategories(categoriesData.results || categoriesData);
        setAvailableTags(tagsData.map(tag => tag.name));

        // If edit mode, fetch topic data
        if (isEditMode) {
          const topicData = await getTopic(id);
          
          // Check if user is the author
          if (topicData.author.id !== user.id) {
            navigate(`/topic/${id}`);
            return;
          }

          setFormData({
            title: topicData.title,
            category: topicData.category.id || topicData.category,
            content: topicData.content,
            tags: topicData.tags || []
          });
          
          const category = (categoriesData.results || categoriesData).find(cat => cat.id === (topicData.category.id || topicData.category));
          setSelectedCategory(category);

          // Load existing images
          if (topicData.images && topicData.images.length > 0) {
            const existingImages = topicData.images.map(img => ({
              id: img.id,
              file: null, // No file object for existing images
              preview: img.image_url,
              caption: img.caption || '',
              existing: true // Flag to identify existing images
            }));
            setUploadedImages(existingImages);
          }

          // Load existing poll
          if (topicData.poll) {
            setShowPoll(true);
            setPollQuestion(topicData.poll.question);
            setPollOptions(topicData.poll.options.map(opt => opt.text));
          }
        }

        setLoading(false);
      } catch (error) {
        console.error('Error fetching data:', error);
        setLoading(false);
      }
    };

    fetchData();
  }, [id, isEditMode, isAuthenticated, user, navigate]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Update selected category
    if (name === 'category') {
      const category = categories.find(cat => cat.id === parseInt(value));
      setSelectedCategory(category);
    }
    
    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleAddTag = (e) => {
    if (e.key === 'Enter' && tagInput.trim()) {
      e.preventDefault();
      const trimmedTag = tagInput.trim();
      
      // Validate tag length (max 50 characters)
      if (trimmedTag.length > 50) {
        setErrors(prev => ({ ...prev, tags: 'Tag must be 50 characters or less' }));
        return;
      }
      
      if (formData.tags.length < 5 && !formData.tags.includes(trimmedTag)) {
        setFormData(prev => ({
          ...prev,
          tags: [...prev.tags, trimmedTag]
        }));
        setTagInput('');
        setShowTagSuggestions(false);
        setErrors(prev => ({ ...prev, tags: '' }));
      }
    }
  };

  const handleTagInputChange = (value) => {
    // Limit input to 50 characters
    const limitedValue = value.slice(0, 50);
    setTagInput(limitedValue);
    
    if (limitedValue.trim().length > 0) {
      // Filter available tags based on input
      const filtered = availableTags.filter(tag => 
        tag.toLowerCase().includes(limitedValue.toLowerCase()) && 
        !formData.tags.includes(tag)
      );
      setTagSuggestions(filtered);
      setShowTagSuggestions(filtered.length > 0);
    } else {
      setShowTagSuggestions(false);
      setTagSuggestions([]);
    }
    
    // Clear tag error when user starts typing
    if (errors.tags) {
      setErrors(prev => ({ ...prev, tags: '' }));
    }
  };

  const handleSelectTag = (tag) => {
    if (formData.tags.length < 5 && !formData.tags.includes(tag)) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, tag]
      }));
      setTagInput('');
      setShowTagSuggestions(false);
      setTagSuggestions([]);
    }
  };

  const handleRemoveTag = (tagToRemove) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  // Image upload handlers
  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    const imageFiles = files.filter(file => file.type.startsWith('image/'));
    
    imageFiles.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setUploadedImages(prev => [...prev, {
          id: Date.now() + Math.random(),
          file,
          preview: reader.result,
          name: file.name
        }]);
      };
      reader.readAsDataURL(file);
    });
    
    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleRemoveImage = (imageId) => {
    setUploadedImages(prev => prev.filter(img => img.id !== imageId));
  };

  // Poll handlers
  const handlePollOptionChange = (index, value) => {
    const newOptions = [...pollOptions];
    newOptions[index] = value;
    setPollOptions(newOptions);
  };

  const handleAddPollOption = () => {
    if (pollOptions.length < 10) {
      setPollOptions([...pollOptions, '']);
    }
  };

  const handleRemovePollOption = (index) => {
    if (pollOptions.length > 2) {
      setPollOptions(pollOptions.filter((_, i) => i !== index));
    }
  };

  // Validation
  const validateForm = () => {
    const newErrors = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Please enter a title for your topic';
    } else if (formData.title.length > TITLE_MAX) {
      newErrors.title = `Title must be ${TITLE_MAX} characters or less`;
    }

    if (!formData.category) {
      newErrors.category = 'Please select a category';
    }

    if (!formData.content || formData.content.trim().length < CONTENT_MIN) {
      newErrors.content = `Content must be at least ${CONTENT_MIN} characters`;
    }

    if (showPoll) {
      if (!pollQuestion.trim()) {
        newErrors.poll = 'Please enter a poll question';
      }
      
      const validOptions = pollOptions.filter(opt => opt.trim());
      if (validOptions.length < 2) {
        newErrors.poll = 'Poll must have at least 2 options';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setSubmitting(true);
    setErrors({});

    try {
      // Determine if we need FormData (for images) or can use JSON
      const hasImages = uploadedImages.length > 0;
      const hasPoll = showPoll && pollQuestion.trim();
      
      console.log('Submitting topic with:');
      console.log('- Has images:', hasImages, 'Count:', uploadedImages.length);
      console.log('- Has poll:', hasPoll);
      console.log('- Uploaded images:', uploadedImages);
      
      let dataToSend;

      if (hasImages || hasPoll) {
        // Use FormData if we have images OR poll (to keep consistent format)
        console.log('Using FormData');
        const formDataToSend = new FormData();
        formDataToSend.append('title', formData.title);
        formDataToSend.append('category', typeof formData.category === 'object' ? formData.category.id : formData.category);
        formDataToSend.append('content', formData.content.trim());

        // Add tags if any
        if (formData.tags && formData.tags.length > 0) {
          formData.tags.forEach(tag => {
            formDataToSend.append('tags', tag);
          });
        }

        // Add images if any
        if (hasImages) {
          uploadedImages.forEach((imageData, index) => {
            formDataToSend.append('images', imageData.file);
            formDataToSend.append('image_captions', imageData.caption || '');
            formDataToSend.append('image_orders', index);
          });
        }

        // Add poll data if poll is enabled
        if (hasPoll) {
          formDataToSend.append('poll_question', pollQuestion);
          const validOptions = pollOptions.filter(opt => opt.trim());
          validOptions.forEach((option, index) => {
            formDataToSend.append('poll_options', option);
            formDataToSend.append('poll_option_orders', index);
          });
        }

        dataToSend = formDataToSend;
      } else {
        // Use JSON for simple topics
        console.log('Using JSON');
        const jsonData = {
          title: formData.title,
          category: typeof formData.category === 'object' ? formData.category.id : formData.category,
          content: formData.content.trim()
        };

        // Add tags if any
        if (formData.tags && formData.tags.length > 0) {
          jsonData.tags = formData.tags;
        }

        dataToSend = jsonData;
      }

      let response;
      if (isEditMode) {
        response = await updateTopic(id, dataToSend);
      } else {
        response = await createTopic(dataToSend);
      }

      // Show success toast
      const toast = document.createElement('div');
      toast.className = 'success-toast';
      toast.innerHTML = isEditMode ? '✅ Topic updated successfully!' : '✅ Topic posted successfully!';
      document.body.appendChild(toast);
      setTimeout(() => toast.remove(), 3000);

      // Redirect to the topic
      console.log('Topic created/updated:', response);
      if (response && response.id) {
        navigate(`/topic/${response.id}`);
      } else {
        console.error('No topic ID in response:', response);
        setErrors({ submit: 'Topic created but failed to redirect. Please check your topics list.' });
        setSubmitting(false);
      }
    } catch (err) {
      console.error(`Error ${isEditMode ? 'updating' : 'creating'} topic:`, err);
      console.error('Error details:', err.response?.data);
      if (err.response?.status === 429) {
        setErrors({ submit: '⏱ Please wait before posting again.' });
      } else if (err.response?.data) {
        // Show specific error messages from backend
        const errorMessages = Object.entries(err.response.data)
          .map(([key, value]) => `${key}: ${Array.isArray(value) ? value.join(', ') : value}`)
          .join('; ');
        setErrors({ submit: errorMessages || `Failed to ${isEditMode ? 'update' : 'create'} topic.` });
      } else {
        setErrors({ submit: `Failed to ${isEditMode ? 'update' : 'create'} topic. Please try again.` });
      }
      setSubmitting(false);
    }
  };

  const renderPreviewModal = () => {
    if (!showPreviewModal) return null;

    return (
      <div className="preview-modal-overlay" onClick={() => setShowPreviewModal(false)}>
        <div className="preview-modal" onClick={(e) => e.stopPropagation()}>
          <div className="preview-modal-header">
            <h2>👁️ Preview</h2>
            <button onClick={() => setShowPreviewModal(false)} className="close-btn">×</button>
          </div>
          
          <div className="preview-modal-content">
            <div className="preview-topic-header">
              <h1 className="preview-title">{formData.title || 'Untitled Topic'}</h1>
              <div className="preview-meta">
                <span className="preview-author">
                  <img 
                    src={user?.avatar || `https://ui-avatars.com/api/?name=${user?.username || 'User'}&background=667eea&color=fff`} 
                    alt={user?.username}
                  />
                  {user?.username}
                </span>
                {selectedCategory && (
                  <span className="preview-category">
                    {selectedCategory.icon} {selectedCategory.title}
                  </span>
                )}
              </div>
            </div>

            <div className="preview-content">
              <MDEditor.Markdown source={formData.content || '*No content yet*'} />
            </div>

            {uploadedImages.length > 0 && (
              <div className="preview-images">
                <h3>🖼️ Attached Images</h3>
                <div className="preview-images-grid">
                  {uploadedImages.map(img => (
                    <img key={img.id} src={img.preview} alt={img.name} />
                  ))}
                </div>
              </div>
            )}

            {showPoll && pollQuestion && (
              <div className="preview-poll">
                <h3>📊 {pollQuestion}</h3>
                <div className="preview-poll-options">
                  {pollOptions.filter(opt => opt.trim()).map((option, idx) => (
                    <div key={idx} className="preview-poll-option">
                      <input type="radio" disabled />
                      <span>{option}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {formData.tags.length > 0 && (
              <div className="preview-tags">
                {formData.tags.map(tag => (
                  <span key={tag} className="preview-tag">🏷️ {tag}</span>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  if (showLoginModal) {
    return (
      <div className="login-modal-overlay">
        <div className="login-modal">
          <h2>🔒 Authentication Required</h2>
          <p>You must be logged in to create a topic.</p>
          <div className="login-modal-actions">
            <Link to="/login" className="btn-primary">Login</Link>
            <Link to="/register" className="btn-secondary">Register</Link>
            <button onClick={() => navigate('/')} className="btn-text">Go Home</button>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="create-topic-page">
        <div className="loading">
          <div className="spinner"></div>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="create-topic-page">
      <div className="create-topic-container">
        {/* Breadcrumb */}
        <nav className="breadcrumb">
          <Link to="/">🏠 Home</Link>
          <span className="separator">›</span>
          {selectedCategory ? (
            <>
              <Link to={`/category/${selectedCategory.id}`}>
                {selectedCategory.icon} {selectedCategory.title}
              </Link>
              <span className="separator">›</span>
            </>
          ) : (
            <>
              <span>Categories</span>
              <span className="separator">›</span>
            </>
          )}
          <span className="current">{isEditMode ? 'Edit Topic' : 'Create New Topic'}</span>
        </nav>

        {/* User Info */}
        <div className="author-info">
          <img 
            src={user?.avatar || `https://ui-avatars.com/api/?name=${user?.username || 'User'}&background=667eea&color=fff`} 
            alt={user?.username}
            className="author-avatar"
          />
          <div className="author-details">
            <h3>{user?.username}</h3>
            <p>{isEditMode ? 'Editing your topic' : 'Starting a new discussion'}</p>
          </div>
        </div>

        {/* Page Header */}
        <div className="page-header">
          <h1>{isEditMode ? '✏️ Edit Your Discussion' : '✨ Start a New Discussion'}</h1>
          <p className="page-subtitle">{isEditMode ? 'Update your topic to reflect new information or clarify your question.' : 'Share your question, idea, or topic with the community.'}</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="create-topic-form">
          {/* Category Selection */}
          <div className="form-group">
            <label htmlFor="category" className="form-label">
              📁 Category <span className="required">*</span>
            </label>
            <select
              id="category"
              name="category"
              value={formData.category}
              onChange={handleInputChange}
              className={`form-select ${errors.category ? 'error' : ''}`}
              disabled={isEditMode}
            >
              <option value="">Select a category...</option>
              {categories.map(cat => (
                <option key={cat.id} value={cat.id}>
                  {cat.icon} {cat.title}
                </option>
              ))}
            </select>
            {errors.category && <span className="error-message">❌ {errors.category}</span>}
            {selectedCategory && selectedCategory.description && (
              <div className="category-info">
                <span className="info-icon">💡</span>
                <span className="info-text">{selectedCategory.description}</span>
              </div>
            )}
          </div>

          {/* Title */}
          <div className="form-group">
            <label htmlFor="title" className="form-label">
              📝 Title <span className="required">*</span>
              <span className="char-counter">{formData.title.length}/{TITLE_MAX}</span>
            </label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              placeholder="Enter a clear and descriptive title..."
              className={`form-input ${errors.title ? 'error' : ''}`}
              maxLength={TITLE_MAX}
            />
            {!errors.title && formData.title.length === 0 && (
              <span className="field-tip">
                💡 Good titles are specific and descriptive
              </span>
            )}
            {errors.title && <span className="error-message">❌ {errors.title}</span>}
          </div>

          {/* Content Editor */}
          <div className="form-group editor-group">
            <label className="form-label">
              📄 Content <span className="required">*</span>
            </label>
            
            <MDEditor
              value={formData.content}
              onChange={(value) => {
                setFormData(prev => ({ ...prev, content: value || '' }));
                if (errors.content) {
                  setErrors(prev => ({ ...prev, content: '' }));
                }
              }}
              preview="live"
              height={400}
              textareaProps={{
                placeholder: 'Write your content here... Use markdown for formatting!\n\n**Bold** *Italic* [Link](url) `code`'
              }}
            />
            
            {errors.content && <span className="error-message">❌ {errors.content}</span>}
            {!errors.content && formData.content && (
              <span className="field-tip">
                ✅ {formData.content.length} characters
              </span>
            )}
          </div>

          {/* Image Upload */}
          <div className="form-group">
            <label className="form-label">
              🖼️ Images <span className="optional">(optional)</span>
            </label>
            <div className="image-upload-area">
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleImageUpload}
                accept="image/*"
                multiple
                style={{ display: 'none' }}
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="btn-upload-image"
              >
                📎 Choose Files
              </button>
              <span className="upload-hint">PNG, JPG, GIF up to 10MB each</span>
            </div>
            
            {uploadedImages.length > 0 && (
              <div className="uploaded-images">
                {uploadedImages.map(img => (
                  <div key={img.id} className="uploaded-image-item">
                    <img src={img.preview} alt={img.name} />
                    <button
                      type="button"
                      onClick={() => handleRemoveImage(img.id)}
                      className="remove-image-btn"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Poll Section */}
          <div className="form-group">
            <div className="poll-toggle">
              <button
                type="button"
                onClick={() => setShowPoll(!showPoll)}
                className={`btn-toggle-poll ${showPoll ? 'active' : ''}`}
              >
                📊 {showPoll ? 'Remove Poll' : 'Add Poll'}
              </button>
            </div>

            {showPoll && (
              <div className="poll-creator">
                <input
                  type="text"
                  value={pollQuestion}
                  onChange={(e) => setPollQuestion(e.target.value)}
                  placeholder="What's your poll question?"
                  className="poll-question-input"
                />
                
                <div className="poll-options">
                  {pollOptions.map((option, index) => (
                    <div key={index} className="poll-option-item">
                      <input
                        type="text"
                        value={option}
                        onChange={(e) => handlePollOptionChange(index, e.target.value)}
                        placeholder={`Option ${index + 1}`}
                        className="poll-option-input"
                      />
                      {pollOptions.length > 2 && (
                        <button
                          type="button"
                          onClick={() => handleRemovePollOption(index)}
                          className="remove-poll-option"
                        >
                          ×
                        </button>
                      )}
                    </div>
                  ))}
                </div>

                {pollOptions.length < 10 && (
                  <button
                    type="button"
                    onClick={handleAddPollOption}
                    className="btn-add-poll-option"
                  >
                    + Add Option
                  </button>
                )}
                
                {errors.poll && <span className="error-message">❌ {errors.poll}</span>}
              </div>
            )}
          </div>

          {/* Tags */}
          <div className="form-group">
            <label htmlFor="tags" className="form-label">
              🏷️ Tags <span className="optional">(optional, up to 5, max 50 characters each)</span>
            </label>
            <div className="tags-container">
              {formData.tags.map(tag => (
                <span key={tag} className="tag-chip">
                  {tag}
                  <button type="button" onClick={() => handleRemoveTag(tag)} className="tag-remove">
                    ×
                  </button>
                </span>
              ))}
              {formData.tags.length < 5 && (
                <div className="tag-input-wrapper">
                  <input
                    type="text"
                    value={tagInput}
                    onChange={(e) => handleTagInputChange(e.target.value)}
                    onKeyDown={handleAddTag}
                    onFocus={() => {
                      if (tagInput.trim().length > 0 && tagSuggestions.length > 0) {
                        setShowTagSuggestions(true);
                      }
                    }}
                    onBlur={() => {
                      // Delay to allow clicking on suggestions
                      setTimeout(() => setShowTagSuggestions(false), 200);
                    }}
                    placeholder="Type and press Enter..."
                    className="tag-input"
                    maxLength={50}
                  />
                  {showTagSuggestions && tagSuggestions.length > 0 && (
                    <div className="tag-suggestions">
                      {tagSuggestions.slice(0, 5).map(tag => (
                        <div
                          key={tag}
                          className="tag-suggestion-item"
                          onClick={() => handleSelectTag(tag)}
                        >
                          🏷️ {tag}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
            {tagInput.length > 0 && (
              <span className={`char-counter ${tagInput.length >= 50 ? 'limit-reached' : ''}`}>
                {tagInput.length}/50 characters
              </span>
            )}
            {errors.tags && <span className="error-message">❌ {errors.tags}</span>}
            {formData.tags.length === 0 && !errors.tags && (
              <span className="field-tip">💡 Tags help others find your post (e.g., "maintenance", "repair", "diy")</span>
            )}
          </div>

          {/* Submit Error */}
          {errors.submit && (
            <div className="submit-error">
              ❌ {errors.submit}
            </div>
          )}

          {/* Submit Bar */}
          <div className="submit-bar">
            <div className="left-actions">
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="btn-cancel"
                disabled={submitting}
              >
                ← Cancel
              </button>
              <button
                type="button"
                onClick={() => setShowPreviewModal(true)}
                className="btn-preview"
                disabled={submitting}
              >
                👁️ Preview
              </button>
            </div>
            <button
              type="submit"
              className="btn-publish"
              disabled={submitting}
            >
              {submitting ? (
                <>
                  <span className="spinner-small"></span>
                  {isEditMode ? 'Updating...' : 'Publishing...'}
                </>
              ) : (
                <>
                  {isEditMode ? '✅ Update Topic' : '🚀 Publish Topic'}
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Preview Modal */}
      {renderPreviewModal()}
    </div>
  );
}

export default CreateTopicPage;
