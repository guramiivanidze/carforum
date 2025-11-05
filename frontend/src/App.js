import './App.css';
import React, { lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { BannersProvider } from './context/BannersContext';
import { CategoriesProvider } from './context/CategoriesContext';
import Header from './components/Header';
import Footer from './components/Footer';

// Lazy load pages
const HomePage = lazy(() => import('./components/HomePage'));
const CategoryPage = lazy(() => import('./components/CategoryPage'));
const TopicDetailPage = lazy(() => import('./components/TopicDetailPage'));
const UserProfilePage = lazy(() => import('./components/UserProfilePage'));
const AuthPage = lazy(() => import('./components/AuthPage'));
const CreateTopicPage = lazy(() => import('./components/CreateTopicPage'));
const SearchPage = lazy(() => import('./components/SearchPage'));

function App() {
  return (
    <AuthProvider>
      <CategoriesProvider>
        <BannersProvider>
          <Router>
            <div className="App">
              <Header />
              <Suspense fallback={<div style={{ padding: '2rem', textAlign: 'center' }}>Loading...</div>}>
                <Routes>
                  <Route path="/" element={<HomePage />} />
                  <Route path="/search" element={<SearchPage />} />
                  <Route path="/category/:id" element={<CategoryPage />} />
                  <Route path="/topic/:id" element={<TopicDetailPage />} />
                  <Route path="/create-topic" element={<CreateTopicPage />} />
                  <Route path="/edit-topic/:id" element={<CreateTopicPage />} />
                  <Route path="/profile/:id" element={<UserProfilePage />} />
                <Route path="/login" element={<AuthPage />} />
                <Route path="/register" element={<AuthPage />} />
              </Routes>
              </Suspense>
            <Footer />
          </div>
        </Router>
        </BannersProvider>
      </CategoriesProvider>
  </AuthProvider>
  );
}

export default App;
