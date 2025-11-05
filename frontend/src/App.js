import './App.css';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { BannersProvider } from './context/BannersContext';
import Header from './components/Header';
import Footer from './components/Footer';
import HomePage from './components/HomePage';
import CategoryPage from './components/CategoryPage';
import TopicDetailPage from './components/TopicDetailPage';
import UserProfilePage from './components/UserProfilePage';
import AuthPage from './components/AuthPage';
import CreateTopicPage from './components/CreateTopicPage';
import SearchPage from './components/SearchPage';

function App() {
  return (
    <AuthProvider>
      <BannersProvider>
        <Router>
          <div className="App">
            <Header />
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
        <Footer />
      </div>
    </Router>
      </BannersProvider>
  </AuthProvider>
  );
}

export default App;
