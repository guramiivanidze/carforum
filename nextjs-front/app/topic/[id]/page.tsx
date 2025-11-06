'use client';

import { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { getTopic, getReplies, createReply, likeTopic, likeReply, addBookmark, removeBookmark, getCategoryTopics, getTopicParticipants } from '@/lib/api';
import { Topic, Reply, User, ReplyImage } from '@/types';
import Link from 'next/link';
import AdBannerComponent from '@/components/AdBanner';
import ReportModal from '@/components/ReportModal';
import ImageModal from '@/components/ImageModal';
import RichTextEditor from '@/components/RichTextEditor';
import { FaThumbsUp, FaBookmark, FaReply, FaClock, FaEye, FaUser, FaArrowLeft, FaShare, FaFlag } from 'react-icons/fa';

// Recursive Reply Component
interface ReplyItemProps {
  reply: Reply;
  onLike: (replyId: number) => void;
  onReplyClick: (replyId: number) => void;
  onReportClick: (replyId: number) => void;
  formatDate: (date: string) => string;
  currentUserId?: number;
  level?: number;
  onImageClick?: (images: ReplyImage[], index: number) => void;
}

const ReplyItem: React.FC<ReplyItemProps> = ({ reply, onLike, onReplyClick, onReportClick, formatDate, currentUserId, level = 0, onImageClick }) => {
  return (
    <div
      className={`bg-white rounded-xl border p-4 mb-2.5 transition-all duration-200 ${
        reply.is_hidden 
          ? 'border-gray-200 bg-gray-50/50' 
          : 'border-gray-200 hover:border-blue-300 hover:shadow-lg'
      } ${level > 0 ? 'ml-6 md:ml-10 border-l-4 border-l-blue-400 bg-gradient-to-r from-blue-50/30 to-transparent' : ''}`}
    >
      {/* Author Header */}
      <div className="flex items-start justify-between mb-2.5">
        <div className="flex items-start gap-2.5 flex-1">
          {/* User Avatar */}
          <Link href={`/profile/${reply.author.id}`} className="flex-shrink-0">
            {reply.author.user_image_url ? (
              <img
                src={reply.author.user_image_url}
                alt={reply.author.username}
                className="w-9 h-9 rounded-full object-cover ring-2 ring-blue-100 hover:ring-blue-300 transition"
              />
            ) : (
              <div className="w-9 h-9 bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-full flex items-center justify-center font-bold text-base ring-2 ring-blue-100 hover:ring-blue-300 transition">
                {reply.author.username.charAt(0).toUpperCase()}
              </div>
            )}
          </Link>

          {/* User Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-0.5">
              <Link
                href={`/profile/${reply.author.id}`}
                className="font-semibold text-gray-900 hover:text-blue-600 transition text-sm"
              >
                {reply.author.username}
              </Link>
              {reply.parent_author && (
                <>
                  <span className="text-gray-300">→</span>
                  <span className="text-xs text-blue-600 font-medium">
                    @{reply.parent_author.username}
                  </span>
                </>
              )}
            </div>
            <div className="flex items-center gap-1 text-xs text-gray-400">
              <FaClock className="text-[9px]" />
              {formatDate(reply.created_at)}
              {reply.updated_at !== reply.created_at && (
                <span className="italic ml-1" title={`Updated: ${new Date(reply.updated_at).toLocaleString()}`}>
                  (edited)
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {reply.is_hidden ? (
        <p className="text-gray-400 italic text-sm">This reply has been hidden.</p>
      ) : (
        <>
          <div
            className="tiptap-editor text-gray-700 text-sm leading-relaxed mb-2.5"
            dangerouslySetInnerHTML={{ __html: reply.content }}
          />

          {/* Reply Images */}
          {reply.images && reply.images.length > 0 && (
            <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2 mb-3">
              {reply.images.map((image, idx) => (
                <div key={image.id} className="relative group">
                  <img
                    src={image.image_url || image.image}
                    alt={image.caption || "Reply image"}
                    className="w-full h-20 object-cover rounded-lg shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer group-hover:scale-105"
                    onClick={() => onImageClick && onImageClick(reply.images!, idx)}
                  />
                  {image.caption && (
                    <p className="mt-1 text-xs text-gray-500 italic line-clamp-2">{image.caption}</p>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex items-center gap-1.5 pt-2.5 border-t border-gray-100">
            <button
              onClick={() => onLike(reply.id)}
              disabled={currentUserId === reply.author.id}
              className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                currentUserId === reply.author.id
                  ? 'text-gray-300 cursor-not-allowed bg-gray-50'
                  : (reply.user_has_liked || reply.is_liked)
                  ? 'text-blue-600 bg-blue-50 hover:bg-blue-100'
                  : 'text-gray-500 hover:text-blue-600 hover:bg-blue-50'
              }`}
              title={currentUserId === reply.author.id ? 'You cannot like your own reply' : ''}
            >
              <FaThumbsUp className="text-[10px]" />
              <span>{reply.likes_count}</span>
            </button>
            <button
              onClick={() => onReplyClick(reply.id)}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium text-gray-500 hover:text-green-600 hover:bg-green-50 transition-all"
            >
              <FaReply className="text-[10px]" />
              <span>Reply</span>
            </button>
            {currentUserId && currentUserId !== reply.author.id && (
              <button
                onClick={() => onReportClick(reply.id)}
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium text-gray-500 hover:text-red-600 hover:bg-red-50 transition-all"
                title="Report this reply"
              >
                <FaFlag className="text-[10px]" />
                <span>Report</span>
              </button>
            )}
          </div>
        </>
      )}
      
      {/* Nested Replies */}
      {reply.child_replies && reply.child_replies.length > 0 && (
        <div className="mt-2.5">
          {reply.child_replies.map((childReply) => (
            <ReplyItem
              key={childReply.id}
              reply={childReply}
              onLike={onLike}
              onReplyClick={onReplyClick}
              onReportClick={onReportClick}
              formatDate={formatDate}
              currentUserId={currentUserId}
              level={level + 1}
              onImageClick={onImageClick}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default function TopicDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const [topic, setTopic] = useState<Topic | null>(null);
  const [replies, setReplies] = useState<Reply[]>([]);
  const [loading, setLoading] = useState(true);
  const [replyContent, setReplyContent] = useState('');
  const [replyingTo, setReplyingTo] = useState<number | null>(null);
  const [replyingToUser, setReplyingToUser] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [reportingReplyId, setReportingReplyId] = useState<number | null>(null);
  const [imageModalOpen, setImageModalOpen] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [showReplySuccess, setShowReplySuccess] = useState(false);
  const [editorKey, setEditorKey] = useState(0);
  const [similarTopics, setSimilarTopics] = useState<Topic[]>([]);
  const [participants, setParticipants] = useState<User[]>([]);
  const [replyImages, setReplyImages] = useState<File[]>([]);
  const [replyImagePreviews, setReplyImagePreviews] = useState<string[]>([]);
  const [replyCaptions, setReplyCaptions] = useState<string[]>([]);
  const [replyImageModalOpen, setReplyImageModalOpen] = useState(false);
  const [replyImageModalImages, setReplyImageModalImages] = useState<ReplyImage[]>([]);
  const [replyImageModalIndex, setReplyImageModalIndex] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const replyFormRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchData = async () => {
      if (!params.id) return;

      try {
        setLoading(true);
        
        // Fetch topic and replies separately
        const [topicData, repliesData] = await Promise.all([
          getTopic(params.id as string),
          getReplies(params.id as string)
        ]);
        
        setTopic(topicData);
        
        // Handle replies response (might be paginated or array)
        const repliesArray = Array.isArray(repliesData) ? repliesData : (repliesData.results || []);
        setReplies(repliesArray);

        // Fetch similar topics from the same category
        if (topicData.category?.id) {
          try {
            const categoryTopicsData = await getCategoryTopics(topicData.category.id, {
              page: 1,
              page_size: 5,
              ordering: '-created_at'
            });
            const categoryTopics = categoryTopicsData.results || categoryTopicsData;
            // Filter out current topic
            const similar = categoryTopics.filter((t: Topic) => t.id !== topicData.id);
            setSimilarTopics(similar.slice(0, 4));
          } catch (err) {
            console.error('Failed to fetch similar topics:', err);
          }
        }

        // Fetch participants
        try {
          const participantsData = await getTopicParticipants(params.id as string);
          setParticipants(participantsData);
        } catch (err) {
          console.error('Failed to fetch participants:', err);
        }
      } catch (error) {
        console.error('Failed to fetch topic:', error);
        setTopic(null);
        setReplies([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [params.id]);

  const handleLikeTopic = async () => {
    if (!topic || !user) {
      router.push('/login');
      return;
    }

    try {
      await likeTopic(topic.id);
      const isLiked = topic.user_has_liked || topic.is_liked || false;
      setTopic({
        ...topic,
        user_has_liked: !isLiked,
        is_liked: !isLiked,
        likes_count: isLiked ? topic.likes_count - 1 : topic.likes_count + 1,
      });
    } catch (error) {
      console.error('Failed to like topic:', error);
    }
  };

  const handleBookmark = async () => {
    if (!topic || !user) {
      router.push('/login');
      return;
    }

    try {
      const isBookmarked = topic.user_has_bookmarked || topic.is_bookmarked || false;
      if (isBookmarked) {
        await removeBookmark(topic.id);
        setTopic({ ...topic, user_has_bookmarked: false, is_bookmarked: false });
      } else {
        await addBookmark(topic.id);
        setTopic({ ...topic, user_has_bookmarked: true, is_bookmarked: true });
      }
    } catch (error) {
      console.error('Failed to bookmark topic:', error);
    }
  };

  const handleReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyContent.trim() || !user) {
      if (!user) router.push('/login');
      return;
    }

    try {
      setSubmitting(true);
      const newReply = await createReply(
        params.id as string, 
        replyContent, 
        replyingTo || undefined,
        replyImages,
        replyCaptions
      );
      
      if (replyingTo) {
        // Find the parent reply to determine where to add the new reply
        const findParentAndAdd = (replies: Reply[]): Reply[] => {
          return replies.map((reply) => {
            // If this is the direct parent (top-level reply)
            if (reply.id === replyingTo) {
              return {
                ...reply,
                child_replies: [...(reply.child_replies || []), newReply],
                replies_count: (reply.replies_count || 0) + 1,
              };
            }
            
            // If replying to a nested reply, find its parent and add as sibling
            if (reply.child_replies && reply.child_replies.length > 0) {
              const hasChild = reply.child_replies.some(child => child.id === replyingTo);
              if (hasChild) {
                // Add new reply as sibling to the nested reply (same level)
                return {
                  ...reply,
                  child_replies: [...reply.child_replies, newReply],
                  replies_count: (reply.replies_count || 0) + 1,
                };
              }
            }
            
            return reply;
          });
        };
        
        setReplies(findParentAndAdd(replies));
      } else {
        // Add as top-level reply
        setReplies([...replies, newReply]);
      }
      
      setReplyContent('');
      setReplyingTo(null);
      setEditorKey(prev => prev + 1); // Force editor to re-render
      setReplyImages([]);
      setReplyImagePreviews([]);
      setReplyCaptions([]);
      
      // Clear the file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      
      // Show success notification
      setShowReplySuccess(true);
      setTimeout(() => setShowReplySuccess(false), 3000);
      
      // Update reply count
      if (topic) {
        setTopic({ ...topic, replies_count: topic.replies_count + 1 });
      }
    } catch (error) {
      console.error('Failed to create reply:', error);
      alert('Failed to post reply. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleReplyImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const fileArray = Array.from(files);
    const maxImages = 5;

    if (replyImages.length + fileArray.length > maxImages) {
      alert(`You can only upload a maximum of ${maxImages} images`);
      return;
    }

    // Validate file sizes (max 5MB each)
    const maxSize = 5 * 1024 * 1024; // 5MB
    const validFiles = fileArray.filter(file => {
      if (file.size > maxSize) {
        alert(`${file.name} is too large. Maximum size is 5MB`);
        return false;
      }
      return true;
    });

    if (validFiles.length === 0) return;

    // Create previews
    const newPreviews: string[] = [];
    validFiles.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        newPreviews.push(reader.result as string);
        if (newPreviews.length === validFiles.length) {
          setReplyImagePreviews([...replyImagePreviews, ...newPreviews]);
        }
      };
      reader.readAsDataURL(file);
    });

    setReplyImages([...replyImages, ...validFiles]);
    setReplyCaptions([...replyCaptions, ...new Array(validFiles.length).fill('')]);
  };

  const handleRemoveReplyImage = (index: number) => {
    setReplyImages(replyImages.filter((_, i) => i !== index));
    setReplyImagePreviews(replyImagePreviews.filter((_, i) => i !== index));
    setReplyCaptions(replyCaptions.filter((_, i) => i !== index));
  };

  const handleReplyCaptionChange = (index: number, caption: string) => {
    const newCaptions = [...replyCaptions];
    newCaptions[index] = caption;
    setReplyCaptions(newCaptions);
  };

  const handleLikeReply = async (replyId: number) => {
    if (!user) {
      router.push('/login');
      return;
    }

    try {
      await likeReply(replyId);
      
      // Recursively update the reply in nested structure
      const updateReplyLike = (replies: Reply[]): Reply[] => {
        return replies.map((reply) => {
          if (reply.id === replyId) {
            const isLiked = reply.user_has_liked || reply.is_liked || false;
            return {
              ...reply,
              user_has_liked: !isLiked,
              is_liked: !isLiked,
              likes_count: isLiked ? reply.likes_count - 1 : reply.likes_count + 1,
            };
          }
          // Check child replies
          if (reply.child_replies && reply.child_replies.length > 0) {
            return {
              ...reply,
              child_replies: updateReplyLike(reply.child_replies),
            };
          }
          return reply;
        });
      };
      
      setReplies(updateReplyLike(replies));
    } catch (error) {
      console.error('Failed to like reply:', error);
    }
  };

  const handleReportClick = (replyId: number) => {
    if (!user) {
      router.push('/login');
      return;
    }
    setReportingReplyId(replyId);
    setReportModalOpen(true);
  };

  const handleReportSuccess = () => {
    // Optionally refresh replies or show success message
    console.log('Report submitted successfully');
  };

  const handleImageClick = (index: number) => {
    setSelectedImageIndex(index);
    setImageModalOpen(true);
  };

  const handleNextImage = () => {
    if (topic?.images && topic.images.length > 0) {
      setSelectedImageIndex((prev) => (prev + 1) % topic.images!.length);
    }
  };

  const handlePrevImage = () => {
    if (topic?.images && topic.images.length > 0) {
      setSelectedImageIndex((prev) => (prev - 1 + topic.images!.length) % topic.images!.length);
    }
  };

  const handleReplyImageClick = (images: ReplyImage[], index: number) => {
    setReplyImageModalImages(images);
    setReplyImageModalIndex(index);
    setReplyImageModalOpen(true);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    
    // Format: "Nov 6, 2025 at 14:30"
    const options: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    };
    
    return date.toLocaleString('en-US', options).replace(',', ' at');
  };

  const handleReplyClick = (replyId: number, username?: string) => {
    setReplyingTo(replyId);
    setReplyingToUser(username || null);
    // Scroll to reply form
    setTimeout(() => {
      if (replyFormRef.current) {
        replyFormRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }, 50);
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">Loading...</div>
      </div>
    );
  }

  if (!topic) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-md p-6 text-center">
          <h1 className="text-2xl font-bold mb-4">Topic Not Found</h1>
          <p className="text-gray-600 mb-4">The topic you're looking for doesn't exist.</p>
          <Link href="/" className="text-blue-600 hover:underline">
            Return to Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-gray-50 to-gray-100 min-h-screen">
      <div className="container mx-auto px-3 md:px-4 py-4 md:py-6">
        {/* Breadcrumb */}
        <div className="mb-3 flex items-center gap-2 text-xs md:text-sm bg-white px-3 py-2 rounded-lg shadow-sm">
          <Link href="/" className="text-blue-600 hover:text-blue-700 font-medium transition">
            Home
          </Link>
          <span className="text-gray-300">/</span>
          <Link href={`/category/${topic.category.id}`} className="text-blue-600 hover:text-blue-700 font-medium transition">
            {topic.category.name}
          </Link>
          <span className="text-gray-300">/</span>
          <span className="text-gray-600 truncate">{topic.title}</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 md:gap-6">
          {/* Main Content */}
          <div className="lg:col-span-3 space-y-4">
            {/* Top Banner */}
            <div>
              <AdBannerComponent location="topic_top" />
            </div>

            {/* Topic Content */}
            <div className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-200">
              {/* Back Button */}
              <button
                onClick={() => router.back()}
                className="flex items-center gap-2 text-gray-500 hover:text-blue-600 m-4 mb-0 text-sm font-medium transition-colors"
              >
                <FaArrowLeft className="text-xs" />
                Back
              </button>

              {/* Topic Header */}
              <div className="p-4 md:p-6 border-b border-gray-100">
                <div className="flex items-center gap-2 mb-2">
                  {topic.is_pinned && (
                    <span className="bg-gradient-to-r from-yellow-100 to-yellow-50 text-yellow-700 text-xs px-2.5 py-1 rounded-full font-medium border border-yellow-200">
                      📌 Pinned
                    </span>
                  )}
                  {topic.is_locked && (
                    <span className="bg-gradient-to-r from-gray-100 to-gray-50 text-gray-600 text-xs px-2.5 py-1 rounded-full font-medium border border-gray-200">
                      🔒 Locked
                    </span>
                  )}
                </div>
                <h1 className="text-2xl md:text-3xl font-bold mb-3 text-gray-900 leading-tight">{topic.title}</h1>

                {/* Meta Info */}
                <div className="flex items-center gap-3 md:gap-5 text-xs md:text-sm text-gray-500 flex-wrap">
                  <span className="flex items-center gap-1.5">
                    <FaUser className="text-blue-500" />
                    <Link href={`/profile/${topic.author.id}`} className="hover:text-blue-600 font-medium transition">
                      {topic.author.username}
                    </Link>
                  </span>
                  <span className="flex items-center gap-1.5">
                    <FaClock className="text-gray-400" />
                    {formatDate(topic.created_at)}
                    {topic.updated_at !== topic.created_at && (
                      <span className="italic text-gray-400 text-xs ml-1" title={`Updated: ${new Date(topic.updated_at).toLocaleString()}`}>
                        (edited)
                      </span>
                    )}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <FaEye className="text-green-500" />
                    {topic.views}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <FaReply className="text-purple-500" />
                    {topic.replies_count}
                  </span>
                </div>
              </div>

              {/* Topic Content */}
              <div
                className="tiptap-editor text-gray-700 leading-relaxed px-4 md:px-6 py-4 bg-gray-50 rounded-lg"
                dangerouslySetInnerHTML={{ __html: topic.content }}
              />

              {/* Images */}
              {topic.images && topic.images.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 md:gap-3 mt-4 px-4 md:px-6">
                  {topic.images.map((image, index) => (
                    <div key={image.id} className="relative group overflow-hidden rounded-lg shadow-sm hover:shadow-lg transition-all duration-200">
                      <img
                        src={image.image_url || image.image}
                        alt={image.caption || "Topic image"}
                        className="w-full h-28 md:h-32 object-cover cursor-pointer group-hover:scale-110 transition-transform duration-300"
                        onClick={() => handleImageClick(index)}
                      />
                      {image.caption && (
                        <p className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent text-white text-xs p-2 line-clamp-2">{image.caption}</p>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* Poll */}
              {topic.poll && (
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-4 md:p-5 mt-4 mx-4 md:mx-6 border border-blue-100">
                  <h3 className="font-bold text-lg mb-3 text-gray-900">📊 {topic.poll.question}</h3>
                  <div className="space-y-2">
                    {topic.poll.options.map((option) => (
                      <div key={option.id} className="relative overflow-hidden rounded-lg">
                        <div
                          className="absolute inset-0 bg-gradient-to-r from-blue-200 to-blue-100 rounded-lg transition-all duration-500"
                          style={{ width: `${option.percentage}%` }}
                        />
                        <button className="relative w-full text-left px-4 py-2.5 border border-blue-200 rounded-lg hover:border-blue-400 bg-white/50 backdrop-blur-sm transition-all">
                          <span className="font-semibold text-gray-900">{option.text}</span>
                          <span className="float-right text-blue-700 font-medium">
                            {option.votes_count} ({option.percentage}%)
                          </span>
                        </button>
                      </div>
                    ))}
                  </div>
                  <p className="text-xs text-gray-600 mt-3 font-medium">
                    📈 Total votes: {topic.poll.total_votes}
                  </p>
                </div>
              )}

              {/* Tags */}
              {topic.tags && topic.tags.length > 0 && (
                <div className="flex items-center gap-2 flex-wrap mt-4 px-4 md:px-6">
                  {topic.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="bg-gradient-to-r from-blue-100 to-blue-50 text-blue-700 text-xs px-3 py-1.5 rounded-full font-medium border border-blue-200 hover:shadow-md transition-all"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              )}

              {/* Actions */}
              <div className="flex items-center gap-2 md:gap-3 pt-4 mt-4 border-t border-gray-200 px-4 md:px-6 pb-4">
                <button
                  onClick={handleLikeTopic}
                  disabled={user?.id === topic.author.id}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-lg transition-all font-medium text-sm ${
                    user?.id === topic.author.id
                      ? 'bg-gray-50 text-gray-300 cursor-not-allowed'
                      : (topic.user_has_liked || topic.is_liked)
                      ? 'bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-md hover:shadow-lg'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200 hover:shadow-md'
                  }`}
                  title={user?.id === topic.author.id ? 'You cannot like your own topic' : ''}
                >
                  <FaThumbsUp className="text-xs" />
                  {topic.likes_count}
                </button>

                <button
                  onClick={handleBookmark}
                  disabled={user?.id === topic.author.id}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-lg transition-all font-medium text-sm ${
                    user?.id === topic.author.id
                      ? 'bg-gray-50 text-gray-300 cursor-not-allowed'
                      : (topic.user_has_bookmarked || topic.is_bookmarked)
                      ? 'bg-gradient-to-r from-yellow-100 to-yellow-50 text-yellow-800 border border-yellow-200 shadow-md'
                      : 'bg-gray-100 hover:bg-gray-200 text-gray-700 hover:shadow-md'
                  }`}
                  title={user?.id === topic.author.id ? 'You cannot bookmark your own topic' : ''}
                >
                  <FaBookmark className="text-xs" />
                  {(topic.user_has_bookmarked || topic.is_bookmarked) ? 'Saved' : 'Save'}
                </button>

                <button className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium text-sm transition-all hover:shadow-md">
                  <FaShare className="text-xs" />
                  Share
                </button>
              </div>
            </div>

            {/* Reply Form Section */}
            <div ref={replyFormRef} className="bg-white rounded-xl shadow-md p-4 md:p-6 border border-gray-200">
              <h2 className="text-lg md:text-xl font-bold mb-4 flex items-center gap-2">
                <span className="text-blue-600">💬</span>
                Add Your Reply
              </h2>

              {/* Success Notification */}
              {showReplySuccess && (
                <div className="mb-4 p-3 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg flex items-center gap-3 animate-fade-in shadow-sm">
                  <div className="flex-shrink-0">
                    <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-green-800 font-semibold text-sm">Reply posted successfully!</p>
                  </div>
                </div>
              )}

              {!topic.is_locked ? (
                <form onSubmit={handleReply}>
                  {replyingTo && (
                    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-3 rounded-lg mb-3 flex items-center justify-between border border-blue-200">
                      <span className="text-xs md:text-sm text-blue-700 font-medium">
                        💬 Replying to <span className="font-bold">{replyingToUser || 'a comment'}</span>
                      </span>
                      <button
                        type="button"
                        onClick={() => { setReplyingTo(null); setReplyingToUser(null); }}
                        className="text-blue-600 hover:text-blue-800 text-xs md:text-sm font-medium transition"
                      >
                        Cancel
                      </button>
                    </div>
                  )}
                  <div className="mb-3">
                    <RichTextEditor
                      key={editorKey}
                      content={replyContent}
                      onChange={setReplyContent}
                      placeholder={user ? "Write your reply..." : "Please login to reply"}
                    />
                  </div>

                  {/* Image Upload */}
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Images (Optional, max 5)
                    </label>
                    <input
                      ref={fileInputRef}
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={handleReplyImageChange}
                      disabled={replyImages.length >= 5}
                      className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 disabled:opacity-50"
                    />
                    {replyImages.length >= 5 && (
                      <p className="text-sm text-gray-500 mt-1">Maximum of 5 images reached</p>
                    )}
                  </div>

                  {/* Image Previews */}
                  {replyImagePreviews.length > 0 && (
                    <div className="mb-4 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                      {replyImagePreviews.map((preview, index) => (
                        <div key={index} className="relative">
                          <img
                            src={preview}
                            alt={`Preview ${index + 1}`}
                            className="w-full h-32 object-cover rounded-lg"
                          />
                          <button
                            type="button"
                            onClick={() => handleRemoveReplyImage(index)}
                            className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-red-600"
                          >
                            ×
                          </button>
                          <input
                            type="text"
                            placeholder="Caption (optional)"
                            value={replyCaptions[index] || ''}
                            onChange={(e) => handleReplyCaptionChange(index, e.target.value)}
                            className="mt-2 w-full text-xs px-2 py-1 border border-gray-300 rounded"
                          />
                        </div>
                      ))}
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={!user || submitting || !replyContent.trim() || replyContent === '<p></p>'}
                    className="bg-gradient-to-r from-blue-600 to-blue-500 text-white px-5 py-2.5 rounded-lg hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed font-semibold text-sm"
                  >
                    {submitting ? '⏳ Posting...' : '📤 Post Reply'}
                  </button>
                  {!user && (
                    <p className="text-xs md:text-sm text-gray-500 mt-2">
                      Please <Link href="/login" className="text-blue-600 hover:underline font-medium">login</Link> to reply
                    </p>
                  )}
                </form>
              ) : (
                <div className="bg-gradient-to-r from-gray-50 to-gray-100 p-4 rounded-lg text-center text-gray-600 border border-gray-200">
                  <p className="font-semibold">🔒 This topic is locked.</p>
                  <p className="text-sm mt-1">No new replies can be posted.</p>
                </div>
              )}
            </div>

            {/* Replies List Section */}
            <div className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-200">
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-4 md:px-6 py-4 border-b border-blue-100">
                <h2 className="text-lg md:text-xl font-bold flex items-center gap-2.5">
                  <span className="bg-gradient-to-r from-blue-600 to-blue-500 text-white px-2.5 py-1 rounded-full text-xs md:text-sm font-bold shadow-sm">
                    {replies.length}
                  </span>
                  <span className="text-gray-900">{replies.length === 1 ? 'Reply' : 'Replies'}</span>
                </h2>
              </div>

              <div className="p-3 md:p-4">
                {replies.length === 0 ? (
                  <p className="text-center text-gray-400 py-12 text-sm">
                    💬 No replies yet. Be the first to comment!
                  </p>
                ) : (
                  replies.map((reply) => (
                    <ReplyItem
                      key={reply.id}
                      reply={reply}
                      onLike={handleLikeReply}
                      onReplyClick={() => handleReplyClick(reply.id, reply.author?.username)}
                      onReportClick={handleReportClick}
                      formatDate={formatDate}
                      currentUserId={user?.id}
                      onImageClick={handleReplyImageClick}
                    />
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-4">
            {/* Similar Topics */}
            <div className="bg-white rounded-xl shadow-md p-4 md:p-5 border border-gray-200">
              <h3 className="text-base md:text-lg font-bold mb-3 flex items-center gap-2 text-gray-900">
                <span className="text-blue-600">🔗</span>
                Similar Topics
              </h3>
              {similarTopics.length > 0 ? (
                <div className="space-y-2.5">
                  {similarTopics.map((similarTopic) => (
                    <Link
                      key={similarTopic.id}
                      href={`/topic/${similarTopic.id}`}
                      className="block p-2.5 rounded-lg hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 transition-all border border-transparent hover:border-blue-200 hover:shadow-sm"
                    >
                      <h4 className="font-semibold text-sm text-gray-900 hover:text-blue-600 line-clamp-2 mb-2 leading-tight">
                        {similarTopic.title}
                      </h4>
                      <div className="flex items-center gap-2.5 text-xs text-gray-400">
                        <span className="flex items-center gap-1">
                          <FaEye className="text-[10px]" />
                          {similarTopic.views}
                        </span>
                        <span className="flex items-center gap-1">
                          <FaThumbsUp className="text-[10px]" />
                          {similarTopic.likes_count}
                        </span>
                        <span className="flex items-center gap-1">
                          <FaReply className="text-[10px]" />
                          {similarTopic.replies_count}
                        </span>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-gray-400 text-center py-3">No similar topics found.</p>
              )}
            </div>

            {/* Participants */}
            <div className="bg-white rounded-xl shadow-md p-4 md:p-5 border border-gray-200">
              <h3 className="text-base md:text-lg font-bold mb-3 flex items-center gap-2 text-gray-900">
                <span className="text-purple-600">👥</span>
                Participants
              </h3>
              {participants.length > 0 ? (
                <div className="space-y-2">
                  {participants.map((participant) => (
                    <Link
                      key={participant.id}
                      href={`/profile/${participant.id}`}
                      className="flex items-center gap-2.5 p-2 rounded-lg hover:bg-gradient-to-r hover:from-purple-50 hover:to-pink-50 transition-all border border-transparent hover:border-purple-200"
                    >
                      <div className="flex-shrink-0">
                        {participant.user_image_url ? (
                          <img
                            src={participant.user_image_url}
                            alt={participant.username}
                            className="w-9 h-9 rounded-full object-cover ring-2 ring-purple-100"
                          />
                        ) : (
                          <div className="w-9 h-9 bg-gradient-to-br from-purple-500 to-pink-500 text-white rounded-full flex items-center justify-center font-bold text-sm ring-2 ring-purple-100">
                            {participant.username.charAt(0).toUpperCase()}
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-sm text-gray-900 truncate">
                          {participant.username}
                        </p>
                        <p className="text-xs text-gray-400 truncate">
                          {participant.email}
                        </p>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-gray-400 text-center py-3">No participants yet.</p>
              )}
            </div>

            {/* Topic Stats */}
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl shadow-md p-4 md:p-5 border border-blue-100">
              <h3 className="text-base md:text-lg font-bold mb-3 flex items-center gap-2 text-gray-900">
                <span className="text-blue-600">📊</span>
                Stats
              </h3>
              <div className="space-y-2.5">
                <div className="flex justify-between items-center p-2 bg-white rounded-lg">
                  <span className="text-xs md:text-sm text-gray-600 font-medium">Views:</span>
                  <span className="text-sm md:text-base font-bold text-green-600">{topic.views}</span>
                </div>
                <div className="flex justify-between items-center p-2 bg-white rounded-lg">
                  <span className="text-xs md:text-sm text-gray-600 font-medium">Replies:</span>
                  <span className="text-sm md:text-base font-bold text-purple-600">{topic.replies_count}</span>
                </div>
                <div className="flex justify-between items-center p-2 bg-white rounded-lg">
                  <span className="text-xs md:text-sm text-gray-600 font-medium">Likes:</span>
                  <span className="text-sm md:text-base font-bold text-blue-600">{topic.likes_count}</span>
                </div>
                <div className="flex justify-between items-center p-2 bg-white rounded-lg">
                  <span className="text-xs md:text-sm text-gray-600 font-medium">Created:</span>
                  <span className="text-xs md:text-sm font-bold text-gray-700">
                    {new Date(topic.created_at).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Report Modal */}
      {reportingReplyId && (
        <ReportModal
          isOpen={reportModalOpen}
          onClose={() => {
            setReportModalOpen(false);
            setReportingReplyId(null);
          }}
          replyId={reportingReplyId}
          onReportSuccess={handleReportSuccess}
        />
      )}

      {/* Image Modal */}
      {imageModalOpen && topic?.images && topic.images.length > 0 && (
        <ImageModal
          images={topic.images}
          currentIndex={selectedImageIndex}
          onClose={() => setImageModalOpen(false)}
          onNext={handleNextImage}
          onPrev={handlePrevImage}
        />
      )}

      {/* Reply Image Modal */}
      {replyImageModalOpen && replyImageModalImages.length > 0 && (
        <ImageModal
          images={replyImageModalImages}
          currentIndex={replyImageModalIndex}
          onClose={() => setReplyImageModalOpen(false)}
          onNext={() => setReplyImageModalIndex((prev) => (prev + 1) % replyImageModalImages.length)}
          onPrev={() => setReplyImageModalIndex((prev) => (prev - 1 + replyImageModalImages.length) % replyImageModalImages.length)}
        />
      )}
    </div>
  );
}
