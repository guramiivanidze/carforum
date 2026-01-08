'use client';

import { useState, useEffect } from 'react';
import { getFAQs } from '@/lib/api';
import { FAQ } from '@/types';
import Link from 'next/link';
import { FaHome, FaQuestionCircle, FaChevronDown, FaChevronUp } from 'react-icons/fa';

export default function FAQPage() {
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [loading, setLoading] = useState(true);
  const [openItems, setOpenItems] = useState<number[]>([]);

  useEffect(() => {
    const fetchFAQs = async () => {
      try {
        setLoading(true);
        const data = await getFAQs();
        setFaqs(data);
      } catch (error) {
        console.error('Failed to fetch FAQs:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchFAQs();
  }, []);

  const toggleItem = (id: number) => {
    setOpenItems(prev =>
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const categories = Array.from(new Set(faqs.map(faq => faq.category_name)));

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading FAQs...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="container mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <div className="mb-6 flex items-center gap-2 text-sm bg-white px-4 py-3 rounded-lg shadow-sm">
          <Link href="/" className="text-blue-600 hover:text-blue-700 font-medium transition flex items-center gap-1">
            <FaHome className="text-xs" />
            Home
          </Link>
          <span className="text-gray-300">/</span>
          <span className="text-gray-600 flex items-center gap-1">
            <FaQuestionCircle className="text-xs" />
            ხშირად დასმული კითხვები
          </span>
        </div>

        {/* Header */}
        <div className="bg-white rounded-xl shadow-lg p-8 mb-8 border border-gray-200">
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white p-3 rounded-xl">
              <FaQuestionCircle className="text-2xl" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">ხშირად დასმული კითხვები</h1>
              <p className="text-gray-600 mt-1">იპოვეთ პასუხები ყველაზე ხშირ კითხვებზე</p>
            </div>
          </div>
        </div>

        {/* FAQ by Category */}
        <div className="space-y-6">
          {categories.length === 0 ? (
            <div className="bg-white rounded-xl shadow-md p-8 text-center">
              <p className="text-gray-600">No FAQs available yet.</p>
            </div>
          ) : (
            categories.map((category) => (
              <div key={category} className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-200">
                {/* Category Header */}
                <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-6 py-4">
                  <h2 className="text-xl font-bold">{category}</h2>
                </div>

                {/* FAQ Items */}
                <div className="divide-y divide-gray-200">
                  {faqs
                    .filter(faq => faq.category_name === category)
                    .map((faq) => (
                      <div key={faq.id} className="transition-all duration-200">
                        <button
                          onClick={() => toggleItem(faq.id)}
                          className="w-full px-6 py-4 flex items-start justify-between gap-4 hover:bg-gray-50 transition-colors text-left"
                        >
                          <div className="flex-1">
                            <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                              <FaQuestionCircle className="text-blue-600 flex-shrink-0" />
                              {faq.question}
                            </h3>
                          </div>
                          <div className="flex-shrink-0 text-gray-400">
                            {openItems.includes(faq.id) ? (
                              <FaChevronUp />
                            ) : (
                              <FaChevronDown />
                            )}
                          </div>
                        </button>
                        {openItems.includes(faq.id) && (
                          <div className="px-6 pb-4 pt-2 bg-gradient-to-r from-blue-50/30 to-transparent">
                            <p className="text-gray-700 leading-relaxed pl-7">{faq.answer}</p>
                          </div>
                        )}
                      </div>
                    ))}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Contact Section */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <div className="flex gap-3">
            <span className="text-2xl">💬</span>
            <div>
              <h3 className="font-semibold text-blue-900 mb-2">ვერ იპოვეთ პასუხი?</h3>
              <p className="text-blue-800 text-sm mb-3">
                თუ თქვენი კითხვა არ არის ზემოთ ჩამოთვლილ კითხვებში, შეგიძლიათ შექმნათ ახალი თემა ზოგადი კატეგორიაში ან დაუკავშირდეთ მოდერატორებს.
              </p>
              <Link 
                href="/create-topic"
                className="inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition text-sm font-medium"
              >
                <FaQuestionCircle />
                დასვით კითხვა
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
