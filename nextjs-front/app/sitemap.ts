import { MetadataRoute } from 'next';
import { getSiteSettings } from '@/lib/siteSettings';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Get site URL from admin settings
  const settings = await getSiteSettings();
  const baseUrl = settings.site_url || process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

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
    const categoriesRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/categories/`, {
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
    const topicsRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/topics/?page_size=1000`, {
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
