import type { Metadata } from "next";
import { Inter } from "next/font/google";
// @ts-ignore: missing type declarations for side-effect CSS import
import "./globals.css";
import { AuthProvider } from "@/contexts/AuthContext";
import { CategoriesProvider } from "@/contexts/CategoriesContext";
import { BannersProvider } from "@/contexts/BannersContext";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Car Forum - Community Discussion",
  description: "Join the car enthusiasts community. Discuss, share, and learn about cars.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthProvider>
          <CategoriesProvider>
            <BannersProvider>
              <div className="flex flex-col min-h-screen">
                <Header />
                <main className="flex-grow">{children}</main>
                <Footer />
              </div>
            </BannersProvider>
          </CategoriesProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
