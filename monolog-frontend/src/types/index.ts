export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt?: string;
  category?: string;
  cover_image_url?: string;
  is_published: boolean;
  published_at?: string;
  created_at: string;
  updated_at: string;
  view_count: number;
  views?: number; // Legacy alias used in some components
  // SEO fields
  seo_title?: string;
  seo_description?: string;
  seo_keywords?: string;
  // Relationship fields
  series_id?: string;
  series_slug?: string;
  series_title?: string;
  series_order?: number;
  series_nav?: {
    prev?: { id: string; title: string; slug: string } | null;
    next?: { id: string; title: string; slug: string } | null;
    all?: Array<{ id: string; title: string; slug: string }>;
  };
  author?: string;
  comments?: number;
}

export interface Series {
  id: string;
  title: string;
  slug: string;
  description?: string;
  cover_image_url?: string;
  created_at: string;
  updated_at: string;
  posts?: BlogPost[];
}

export interface Comment {
  id: string;
  post_id: string;
  author_name: string;
  content: string;
  is_approved: boolean;
  created_at: string;
  post_title?: string;
  post_slug?: string;
}

export interface Reaction {
  reaction_type: 'like' | 'heart' | 'clap';
  count: number;
}

export interface AnalyticsStats {
  totalPosts: number;
  totalViews: number;
  pendingComments: number;
}

export interface PaginatedResponse<T> {
  posts?: T[]; // For the general articles list
  comments?: T[]; // For the moderation queue
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
