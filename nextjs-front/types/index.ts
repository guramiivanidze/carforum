export interface User {
  id: number;
  username: string;
  email: string;
  date_joined: string;
  first_name?: string;
  last_name?: string;
  points?: number;
  user_image_url?: string | null;
}

export interface UserProfile {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  points: number;
  bio: string;
  skills: string;
  date_joined: string;
  user_image: string | null;
  user_image_url: string | null;
  topics_count: number;
  replies_count: number;
  likes_given: number;
  likes_received: number;
  followers_count: number;
  following_count: number;
  is_following: boolean;
  facebook_url?: string;
  linkedin_url?: string;
  tiktok_url?: string;
}

export interface CategoryRule {
  id: number;
  title: string;
  description: string;
  order: number;
  is_active: boolean;
  created_at: string;
}

export interface Category {
  id: number;
  title?: string;  // Backend uses 'title'
  name?: string;   // Some endpoints use 'name'
  description: string;
  slug?: string;
  icon?: string;
  topics_count?: number;
  replies_count?: number;
  latest_topic?: Topic | null;
  rules?: CategoryRule[];
  created_at: string;
}

export interface Topic {
  id: number;
  title: string;
  content: string;
  category: Category;
  author: User;
  created_at: string;
  updated_at: string;
  views: number;
  likes_count: number;
  replies_count: number;
  is_pinned?: boolean;
  is_locked?: boolean;
  tags: string[];
  user_has_liked?: boolean;  // Backend uses this
  is_liked?: boolean;        // Keep for compatibility
  user_has_bookmarked?: boolean;  // Backend uses this
  is_bookmarked?: boolean;   // Keep for compatibility
  bookmarks_count?: number;
  replies?: Reply[];  // Backend includes replies in detail view
  images?: TopicImage[];
  poll?: Poll;
}

export interface TopicImage {
  id: number;
  image: string;
  image_url?: string;
  caption?: string;
  order: number;
  created_at: string;
}

export interface Poll {
  id: number;
  question: string;
  options: PollOption[];
  total_votes: number;
  ends_at: string | null;
  user_vote: number | null;
}

export interface PollOption {
  id: number;
  text: string;
  votes_count: number;
  percentage: number;
}

export interface Reply {
  id: number;
  content: string;
  author: User;
  topic: number;
  parent: number | null;
  parent_author?: { id: number; username: string } | null;
  created_at: string;
  updated_at: string;
  likes_count: number;
  user_has_liked?: boolean;  // Backend uses this
  is_liked?: boolean;        // Keep for compatibility
  is_hidden: boolean;
  child_replies?: Reply[];   // Backend uses this for nested replies
  replies?: Reply[];         // Keep for compatibility
  replies_count?: number;
  resolved_report?: any;
  images?: ReplyImage[];
}

export interface ReplyImage {
  id: number;
  image: string;
  image_url: string;
  caption: string;
  order: number;
  created_at: string;
}

export interface Tag {
  name: string;
  usage_count: number;
}

export interface Bookmark {
  id: number;
  topic: Topic;
  created_at: string;
}

export interface AdBanner {
  id: number;
  title: string;
  image: string | null;
  video: string | null;
  link: string;
  locations: string[];
  is_active: boolean;
  start_date: string | null;
  end_date: string | null;
  impressions: number;
  clicks: number;
}

export interface Badge {
  id: number;
  name: string;
  description: string;
  icon: string;
  category: string;
  requirement: number;
  points: number;
}

export interface UserBadge {
  id: number;
  badge: Badge;
  earned_at: string;
}

export interface UserLevel {
  level: number;
  experience: number;
  next_level_experience: number;
  title: string;
}

export interface UserStreak {
  current_streak: number;
  longest_streak: number;
  last_activity: string;
}

export interface GamificationData {
  level: UserLevel;
  badges: UserBadge[];
  streak: UserStreak;
  total_points: number;
}

export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

export interface SearchResults {
  topics: Topic[];
  users: UserProfile[];
  categories: Category[];
}

export interface ReportReason {
  id: number;
  title: string;
  description: string;
  is_active: boolean;
}

export interface Report {
  id: number;
  reply: number;
  reporter: User;
  reason: number;
  reason_details: ReportReason;
  additional_info: string;
  status: 'pending' | 'resolved' | 'dismissed';
  created_at: string;
}
