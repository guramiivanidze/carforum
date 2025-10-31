import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getCategories, createTopic, getTopic, updateTopic } from '../services/api';
import '../styles/CreateTopicPage.css';

function CreateTopicPage() {
  const navigate = useNavigate();
  const { id } = useParams(); // For edit mode
  const { isAuthenticated, user } = useAuth();
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

  useEffect(() => {
    if (!isAuthenticated) {
      setShowLoginModal(true);
      return;
    }

    const fetchData = async () => {
      try {
        const categoriesData = await getCategories();
        setCategories(categoriesData);

        // If edit mode, fetch the topic
        if (isEditMode) {
          const topicData = await getTopic(id);
          
          // Check if user is the author
          if (topicData.author.id !== user.id) {
            alert('You can only edit your own topics');
            navigate(`/topic/${id}`);
            return;
          }

          setFormData({
            title: topicData.title,
            category: topicData.category.id || topicData.category, // Extract ID if it's an object
            content: topicData.content,
            tags: []
          });
        }

        setLoading(false);
      } catch (err) {
        console.error('Error fetching data:', err);
        setLoading(false);
      }
    };

    fetchData();
  }, [isAuthenticated, isEditMode, id, user, navigate]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleAddTag = (e) => {
    if (e.key === 'Enter' && tagInput.trim()) {
      e.preventDefault();
      if (formData.tags.length < 5 && !formData.tags.includes(tagInput.trim())) {
        setFormData(prev => ({
          ...prev,
          tags: [...prev.tags, tagInput.trim()]
        }));
        setTagInput('');
      }
    }
  };

  const handleRemoveTag = (tagToRemove) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const insertFormatting = (format) => {
    const textarea = document.querySelector('.content-textarea');
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = formData.content.substring(start, end);
    let newText = '';

    switch (format) {
      case 'bold':
        newText = `**${selectedText || 'bold text'}**`;
        break;
      case 'italic':
        newText = `*${selectedText || 'italic text'}*`;
        break;
      case 'code':
        newText = `\`${selectedText || 'code'}\``;
        break;
      case 'codeblock':
        newText = `\n\`\`\`\n${selectedText || 'code block'}\n\`\`\`\n`;
        break;
      case 'link':
        newText = `[${selectedText || 'link text'}](url)`;
        break;
      case 'quote':
        newText = `\n> ${selectedText || 'quote'}\n`;
        break;
      case 'list':
        newText = `\n- ${selectedText || 'list item'}\n`;
        break;
      case 'numberedlist':
        newText = `\n1. ${selectedText || 'list item'}\n`;
        break;
      default:
        return;
    }

    const newContent = 
      formData.content.substring(0, start) + 
      newText + 
      formData.content.substring(end);

    setFormData(prev => ({ ...prev, content: newContent }));
    
    // Refocus textarea
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + newText.length, start + newText.length);
    }, 0);
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    } else if (formData.title.trim().length < 10) {
      newErrors.title = 'Title must be at least 10 characters';
    }
    
    if (!formData.category) {
      newErrors.category = 'Please select a category';
    }
    
    if (!formData.content.trim()) {
      newErrors.content = 'Content is required';
    } else if (formData.content.trim().split(/\s+/).length < 10) {
      newErrors.content = 'Content must be at least 10 words';
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
    try {
      const topicData = {
        title: formData.title.trim(),
        category: typeof formData.category === 'object' ? formData.category.id : formData.category,
        content: formData.content.trim()
      };

      let response;
      if (isEditMode) {
        response = await updateTopic(id, topicData);
      } else {
        response = await createTopic(topicData);
      }

      // Show success toast
      const toast = document.createElement('div');
      toast.className = 'success-toast';
      toast.innerHTML = isEditMode ? '✅ Topic updated successfully!' : '✅ Topic posted successfully!';
      document.body.appendChild(toast);
      setTimeout(() => toast.remove(), 3000);

      // Redirect to the topic
      navigate(`/topic/${response.id}`);
    } catch (err) {
      console.error(`Error ${isEditMode ? 'updating' : 'creating'} topic:`, err);
      if (err.response?.status === 429) {
        setErrors({ submit: '⏱ Please wait before posting again.' });
      } else {
        setErrors({ submit: `Failed to ${isEditMode ? 'update' : 'create'} topic. Please try again.` });
      }
      setSubmitting(false);
    }
  };

  const renderPreview = () => {
    // Simple markdown-like preview
    let preview = formData.content;
    
    // Bold
    preview = preview.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
    // Italic
    preview = preview.replace(/\*(.+?)\*/g, '<em>$1</em>');
    // Code inline
    preview = preview.replace(/`(.+?)`/g, '<code>$1</code>');
    // Code block
    preview = preview.replace(/```([\s\S]+?)```/g, '<pre><code>$1</code></pre>');
    // Quote
    preview = preview.replace(/^> (.+)$/gm, '<blockquote>$1</blockquote>');
    // Links
    preview = preview.replace(/\[(.+?)\]\((.+?)\)/g, '<a href="$2" target="_blank">$1</a>');
    // Line breaks
    preview = preview.replace(/\n/g, '<br>');
    
    return { __html: preview };
  };

  if (showLoginModal) {
    return (
      <div className="login-modal-overlay">
        <div className="login-modal">
          <h2>Authentication Required</h2>
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
        <div className="loading">Loading...</div>
      </div>
    );
  }

  return (
    <div className="create-topic-page">
      <div className="create-topic-container">
        {/* Breadcrumb */}
        <div className="breadcrumb">
          <Link to="/">Home</Link>
          <span className="separator">›</span>
          <Link to="/">Categories</Link>
          <span className="separator">›</span>
          <span className="current">{isEditMode ? 'Edit Topic' : 'Create Topic'}</span>
        </div>

        {/* Page Title */}
        <div className="page-header">
          <h1>{isEditMode ? 'Edit Your Discussion' : 'Start a New Discussion'}</h1>
          <p className="page-subtitle">{isEditMode ? 'Update your topic to reflect new information or clarify your question.' : 'Share your question, idea, or topic with the community.'}</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="create-topic-form">
          {/* Category Selection */}
          <div className="form-group">
            <label htmlFor="category" className="form-label">
              Category <span className="required">*</span>
            </label>
            <select
              id="category"
              name="category"
              value={formData.category}
              onChange={handleInputChange}
              className={`form-select ${errors.category ? 'error' : ''}`}
            >
              <option value="">Select a category...</option>
              {categories.map(cat => (
                <option key={cat.id} value={cat.id}>
                  {cat.icon} {cat.title}
                </option>
              ))}
            </select>
            {errors.category && <span className="error-message">{errors.category}</span>}
          </div>

          {/* Title */}
          <div className="form-group">
            <label htmlFor="title" className="form-label">
              Title <span className="required">*</span>
            </label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              placeholder="Enter a clear and descriptive title..."
              className={`form-input ${errors.title ? 'error' : ''}`}
              maxLength={200}
            />
            {!errors.title && (
              <span className="field-tip">💡 Good titles get faster answers</span>
            )}
            {errors.title && <span className="error-message">{errors.title}</span>}
          </div>

          {/* Content Editor */}
          <div className="form-group">
            <label className="form-label">
              Content <span className="required">*</span>
            </label>
            
            {/* Editor Tabs */}
            <div className="editor-tabs">
              <button
                type="button"
                className={`editor-tab ${!showPreview ? 'active' : ''}`}
                onClick={() => setShowPreview(false)}
              >
                ✏️ Write
              </button>
              <button
                type="button"
                className={`editor-tab ${showPreview ? 'active' : ''}`}
                onClick={() => setShowPreview(true)}
              >
                👁 Preview
              </button>
            </div>

            {/* Toolbar */}
            {!showPreview && (
              <div className="editor-toolbar">
                <button type="button" onClick={() => insertFormatting('bold')} title="Bold" className="toolbar-btn">
                  <strong>B</strong>
                </button>
                <button type="button" onClick={() => insertFormatting('italic')} title="Italic" className="toolbar-btn">
                  <em>I</em>
                </button>
                <div className="toolbar-divider"></div>
                <button type="button" onClick={() => insertFormatting('list')} title="Bullet List" className="toolbar-btn">
                  ≡
                </button>
                <button type="button" onClick={() => insertFormatting('numberedlist')} title="Numbered List" className="toolbar-btn">
                  ⒈
                </button>
                <div className="toolbar-divider"></div>
                <button type="button" onClick={() => insertFormatting('quote')} title="Quote" className="toolbar-btn">
                  "
                </button>
                <button type="button" onClick={() => insertFormatting('code')} title="Inline Code" className="toolbar-btn">
                  &lt;/&gt;
                </button>
                <button type="button" onClick={() => insertFormatting('codeblock')} title="Code Block" className="toolbar-btn">
                  { }
                </button>
                <button type="button" onClick={() => insertFormatting('link')} title="Insert Link" className="toolbar-btn">
                  🔗
                </button>
                <button type="button" className="toolbar-btn" title="Emoji">
                  🙂
                </button>
              </div>
            )}

            {/* Editor Area */}
            {!showPreview ? (
              <textarea
                name="content"
                value={formData.content}
                onChange={handleInputChange}
                placeholder="Describe your topic here...&#10;Include details, examples, or code snippets."
                className={`content-textarea ${errors.content ? 'error' : ''}`}
              />
            ) : (
              <div className="content-preview" dangerouslySetInnerHTML={renderPreview()} />
            )}
            
            {errors.content && <span className="error-message">{errors.content}</span>}
          </div>

          {/* Tags */}
          <div className="form-group">
            <label htmlFor="tags" className="form-label">
              Tags <span className="optional">(optional, up to 5)</span>
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
                <input
                  type="text"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={handleAddTag}
                  placeholder="Type and press Enter..."
                  className="tag-input"
                />
              )}
            </div>
            {formData.tags.length === 0 && (
              <span className="field-tip">💡 Tags help others find your post</span>
            )}
          </div>

          {/* Submit Error */}
          {errors.submit && (
            <div className="submit-error">
              {errors.submit}
            </div>
          )}

          {/* Submit Bar */}
          <div className="submit-bar">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="btn-cancel"
              disabled={submitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-publish"
              disabled={submitting}
            >
              {submitting ? (isEditMode ? 'Updating...' : 'Publishing...') : (isEditMode ? 'Update Topic' : 'Publish Topic')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default CreateTopicPage;
