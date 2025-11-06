import Script from 'next/script';

interface JsonLdProps {
  data: any;
}

export default function JsonLd({ data }: JsonLdProps) {
  return (
    <Script
      id="json-ld"
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

// Organization Schema
export const organizationSchema = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'CarForum',
  url: process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000',
  logo: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/logo.png`,
  description: 'The ultimate car enthusiast community for automotive discussion and advice',
  sameAs: [
    'https://facebook.com/carforum',
    'https://twitter.com/carforum',
    'https://instagram.com/carforum',
  ],
};

// WebSite Schema
export const websiteSchema = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: 'CarForum',
  url: process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000',
  description: 'Join thousands of car enthusiasts to discuss automotive topics',
  potentialAction: {
    '@type': 'SearchAction',
    target: {
      '@type': 'EntryPoint',
      urlTemplate: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/search?q={search_term_string}`,
    },
    'query-input': 'required name=search_term_string',
  },
};

// BreadcrumbList Schema Generator
export const generateBreadcrumbSchema = (items: { name: string; url: string }[]) => ({
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: items.map((item, index) => ({
    '@type': 'ListItem',
    position: index + 1,
    name: item.name,
    item: item.url,
  })),
});

// Topic/Discussion Schema Generator
export const generateDiscussionSchema = (topic: any) => ({
  '@context': 'https://schema.org',
  '@type': 'DiscussionForumPosting',
  headline: topic.title,
  text: topic.content,
  datePublished: topic.created_at,
  dateModified: topic.updated_at || topic.created_at,
  author: {
    '@type': 'Person',
    name: topic.author?.username || 'Anonymous',
  },
  interactionStatistic: [
    {
      '@type': 'InteractionCounter',
      interactionType: 'https://schema.org/CommentAction',
      userInteractionCount: topic.replies_count || 0,
    },
    {
      '@type': 'InteractionCounter',
      interactionType: 'https://schema.org/LikeAction',
      userInteractionCount: topic.likes_count || 0,
    },
  ],
});

// FAQ Schema Generator
export const generateFAQSchema = (questions: { question: string; answer: string }[]) => ({
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: questions.map((q) => ({
    '@type': 'Question',
    name: q.question,
    acceptedAnswer: {
      '@type': 'Answer',
      text: q.answer,
    },
  })),
});
