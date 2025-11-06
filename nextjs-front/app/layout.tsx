import type { Metadata } from "next";
import { Inter } from "next/font/google";
// @ts-ignore: missing type declarations for side-effect CSS import
import "./globals.css";
import { AuthProvider } from "@/contexts/AuthContext";
import { CategoriesProvider } from "@/contexts/CategoriesContext";
import { BannersProvider } from "@/contexts/BannersContext";
import { SettingsProvider } from "@/contexts/SettingsContext";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import AnnouncementBanner from "@/components/AnnouncementBanner";
import { getSiteSettings } from "@/lib/siteSettings";

const inter = Inter({ subsets: ["latin"] });

// Force dynamic rendering (no static generation)
export const dynamic = 'force-dynamic';
export const revalidate = 0;

// Generate metadata dynamically from site settings
export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSiteSettings();
  
  return {
    metadataBase: new URL(settings.site_url || process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'),
    title: {
      default: settings.site_title,
      template: `%s | ${settings.site_title.split(' - ')[0] || 'ავტოფორუმი'}`
    },
    description: settings.site_description,
    keywords: settings.keywords_list,
    authors: [{ name: 'ავტოფორუმის გუნდი' }],
    creator: 'ავტოფორუმი',
    publisher: 'ავტოფორუმი',
    formatDetection: {
      email: false,
      address: false,
      telephone: false,
    },
    openGraph: {
      type: 'website',
      locale: 'en_US',
      url: '/',
      siteName: settings.site_title.split(' - ')[0] || 'ავტოფორუმი',
      title: settings.site_title,
      description: settings.site_description,
      images: settings.og_image_url ? [
        {
          url: settings.og_image_url,
          width: 1200,
          height: 630,
          alt: settings.site_title,
        },
      ] : [
        {
          url: '/og-image.jpg',
          width: 1200,
          height: 630,
          alt: settings.site_title,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: settings.site_title,
      description: settings.site_description,
      images: settings.og_image_url ? [settings.og_image_url] : ['/twitter-image.jpg'],
      creator: settings.twitter_handle ? `@${settings.twitter_handle}` : '@carforum',
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
    verification: {
      google: undefined, // Will be added in head section
      yandex: undefined, // Will be added in head section
    },
  };
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Fetch settings for verification codes and canonical URL
  const settings = await getSiteSettings();
  
  return (
    <html lang="en">
      <head>
        <link rel="canonical" href={settings.site_url || process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'} />
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <meta name="theme-color" content="#2563eb" />
        
        {/* Search Engine Verification Codes from Admin Panel */}
        {settings.site_title && <meta name="application-name" content={settings.site_title.split(' - ')[0] || 'CarForum'} />}
      </head>
      <body className={inter.className}>
        <SettingsProvider initialSettings={settings}>
          <AuthProvider>
            <CategoriesProvider>
              <BannersProvider>
                {/* Dynamic Announcement Banner from Admin Panel */}
                <AnnouncementBanner
                  show={settings.show_announcement}
                  text={settings.announcement_text}
                  type={settings.announcement_type}
                  link={settings.announcement_link}
                  linkText={settings.announcement_link_text}
                />
                <div className="flex flex-col min-h-screen">
                  <Header />
                  <main className="flex-grow">{children}</main>
                  <Footer />
                </div>
              </BannersProvider>
            </CategoriesProvider>
          </AuthProvider>
        </SettingsProvider>
      </body>
    </html>
  );
}
