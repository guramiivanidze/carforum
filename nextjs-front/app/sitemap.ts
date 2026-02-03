import { MetadataRoute } from 'next';
import { getSiteSettings } from '@/lib/siteSettings';
import { buildApiUrl, getSiteUrl } from '@/lib/config';

// Set dynamic config for sitemap generation
export const dynamic = 'force-dynamic';
export const revalidate = 3600; // Revalidate every hour

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Get site URL from admin settings
  const settings = await getSiteSettings();
  const baseUrl = settings.site_url || getSiteUrl();

  // Static pages
  const staticPages = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 1,
    },
    {
      url: `${baseUrl}/login`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.5,
    },
    {
      url: `${baseUrl}/register`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.5,
    },
  ];

  // Fetch categories
  let categoryPages: MetadataRoute.Sitemap = [];
  try {
    const categoriesUrl = buildApiUrl('/categories/');
    
    console.log('Fetching categories from:', categoriesUrl);
    
    const categoriesRes = await fetch(categoriesUrl, {
      next: { revalidate: 3600 } // Revalidate every hour
    });
    if (categoriesRes.ok) {
      const categories = await categoriesRes.json();
      categoryPages = categories.map((category: any) => ({
        url: `${baseUrl}/category/${category.id}`,
        lastModified: new Date(),
        changeFrequency: 'daily' as const,
        priority: 0.8,
      }));
    }
  } catch (error) {
    console.error('Error fetching categories for sitemap:', error);
  }

  // Fetch topics (limit to recent 1000 for performance)
  let topicPages: MetadataRoute.Sitemap = [];
  try {
    const topicsUrl = buildApiUrl('/topics/?page_size=1000');
    
    console.log('Fetching topics from:', topicsUrl);
    
    const topicsRes = await fetch(topicsUrl, {
      next: { revalidate: 3600 }
    });
    if (topicsRes.ok) {
      const data = await topicsRes.json();
      const topics = data.results || data;
      topicPages = topics.map((topic: any) => ({
        url: `${baseUrl}/topic/${topic.id}`,
        lastModified: new Date(topic.updated_at || topic.created_at),
        changeFrequency: 'weekly' as const,
        priority: 0.7,
      }));
    }
  } catch (error) {
    console.error('Error fetching topics for sitemap:', error);
  }

  return [...staticPages, ...categoryPages, ...topicPages];
}
