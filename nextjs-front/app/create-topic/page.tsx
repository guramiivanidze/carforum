'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useCategories } from '@/contexts/CategoriesContext';
import { createTopic } from '@/lib/api';
import RichTextEditor from '@/components/RichTextEditor';
import { FaTimes, FaImage, FaTrash } from 'react-icons/fa';

interface ImagePreview {
  file: File;
  preview: string;
  caption: string;
}

export default function CreateTopicPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const { categories, loading: categoriesLoading } = useCategories();
  
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    category: '',
    tags: [] as string[],
  });
  
  const [tagInput, setTagInput] = useState('');
  const [images, setImages] = useState<ImagePreview[]>([]);

  useEffect(() => {
    // Redirect if not authenticated
    if (!authLoading && !user) {
      router.push('/login');
      return;
    }
  }, [user, authLoading, router]);

  const handleAddTag = () => {
    const trimmedTag = tagInput.trim().toLowerCase();
    if (trimmedTag && !formData.tags.includes(trimmedTag)) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, trimmedTag]
      }));
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const maxImages = 5;
    const currentCount = images.length;
    const remainingSlots = maxImages - currentCount;

    if (remainingSlots <= 0) {
      setError(`You can only upload up to ${maxImages} images`);
      return;
    }

    const newImages: ImagePreview[] = [];
    const filesToAdd = Math.min(files.length, remainingSlots);

    for (let i = 0; i < filesToAdd; i++) {
      const file = files[i];
      
      // Validate file type
      if (!file.type.startsWith('image/')) {
        setError('Please select only image files');
        continue;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setError('Each image must be less than 5MB');
        continue;
      }

      newImages.push({
        file,
        preview: URL.createObjectURL(file),
        caption: ''
      });
    }

    setImages(prev => [...prev, ...newImages]);
    setError(null);
    
    // Reset input
    e.target.value = '';
  };

  const handleRemoveImage = (index: number) => {
    setImages(prev => {
      const newImages = [...prev];
      // Revoke the object URL to free memory
      URL.revokeObjectURL(newImages[index].preview);
      newImages.splice(index, 1);
      return newImages;
    });
  };

  const handleImageCaptionChange = (index: number, caption: string) => {
    setImages(prev => {
      const newImages = [...prev];
      newImages[index].caption = caption;
      return newImages;
    });
  };

  useEffect(() => {
    // Cleanup object URLs on unmount
    return () => {
      images.forEach(img => URL.revokeObjectURL(img.preview));
    };
  }, [images]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title.trim()) {
      setError('Please enter a title');
      return;
    }
    
    if (!formData.category) {
      setError('Please select a category');
      return;
    }
    
    if (!formData.content.trim() || formData.content === '<p></p>') {
      setError('Please enter some content');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      // Use FormData for image uploads
      const formDataToSend = new FormData();
      formDataToSend.append('title', formData.title);
      formDataToSend.append('content', formData.content);
      formDataToSend.append('category', formData.category);
      
      // Add tags
      formData.tags.forEach(tag => {
        formDataToSend.append('tags', tag);
      });
      
      // Add images
      images.forEach((img, index) => {
        formDataToSend.append('images', img.file);
        formDataToSend.append('image_captions', img.caption || '');
        formDataToSend.append('image_orders', index.toString());
      });

      const newTopic = await createTopic(formDataToSend);
      router.push(`/topic/${newTopic.id}`);
    } catch (err: any) {
      console.error('Error creating topic:', err);
      setError(err.response?.data?.detail || 'Failed to create topic. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (authLoading || categoriesLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">Create New Topic</h1>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Title */}
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                Title *
              </label>
              <input
                type="text"
                id="title"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter a descriptive title..."
                maxLength={200}
              />
              <p className="mt-1 text-sm text-gray-500">{formData.title.length}/200 characters</p>
            </div>

            {/* Category */}
            <div>
              <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
                Category *
              </label>
              <select
                id="category"
                value={formData.category}
                onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Select a category...</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.icon} {category.title || category.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Tags */}
            <div>
              <label htmlFor="tags" className="block text-sm font-medium text-gray-700 mb-2">
                Tags (optional)
              </label>
              <div className="flex gap-2 mb-2">
                <input
                  type="text"
                  id="tags"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddTag();
                    }
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Add tags (press Enter to add)..."
                />
                <button
                  type="button"
                  onClick={handleAddTag}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition"
                >
                  Add Tag
                </button>
              </div>
              
              {/* Display tags */}
              {formData.tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {formData.tags.map((tag) => (
                    <span
                      key={tag}
                      className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm"
                    >
                      {tag}
                      <button
                        type="button"
                        onClick={() => handleRemoveTag(tag)}
                        className="hover:text-blue-900"
                      >
                        <FaTimes size={12} />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Content - Rich Text Editor */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Content *
              </label>
              <RichTextEditor
                content={formData.content}
                onChange={(html) => setFormData(prev => ({ ...prev, content: html }))}
                placeholder="Share your thoughts, questions, or information..."
              />
            </div>

            {/* Images Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Images (optional)
              </label>
              <p className="text-sm text-gray-500 mb-3">
                Upload up to 5 images (max 5MB each)
              </p>
              
              {/* Upload Button */}
              <div className="mb-4">
                <label
                  htmlFor="image-upload"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 border border-blue-200 rounded-lg hover:bg-blue-100 cursor-pointer transition"
                >
                  <FaImage />
                  <span>Choose Images</span>
                  <input
                    type="file"
                    id="image-upload"
                    accept="image/*"
                    multiple
                    onChange={handleImageSelect}
                    className="hidden"
                    disabled={images.length >= 5}
                  />
                </label>
                <span className="ml-3 text-sm text-gray-500">
                  {images.length}/5 images
                </span>
              </div>

              {/* Image Previews */}
              {images.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {images.map((img, index) => (
                    <div key={index} className="relative border border-gray-200 rounded-lg p-3 bg-gray-50">
                      <div className="relative mb-2">
                        <img
                          src={img.preview}
                          alt={`Preview ${index + 1}`}
                          className="w-full h-48 object-cover rounded-lg"
                        />
                        <button
                          type="button"
                          onClick={() => handleRemoveImage(index)}
                          className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition shadow-lg"
                          title="Remove image"
                        >
                          <FaTrash size={14} />
                        </button>
                      </div>
                      <input
                        type="text"
                        placeholder="Add caption (optional)"
                        value={img.caption}
                        onChange={(e) => handleImageCaptionChange(index, e.target.value)}
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        maxLength={200}
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Submit Buttons */}
            <div className="flex gap-4 pt-4">
              <button
                type="submit"
                disabled={submitting}
                className="flex-1 bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed font-medium"
              >
                {submitting ? 'Creating...' : 'Create Topic'}
              </button>
              
              <button
                type="button"
                onClick={() => router.back()}
                disabled={submitting}
                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
