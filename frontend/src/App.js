import './App.css';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Header from './components/Header';
import Footer from './components/Footer';
import HomePage from './components/HomePage';
import CategoryPage from './components/CategoryPage';
import TopicDetailPage from './components/TopicDetailPage';
import UserProfilePage from './components/UserProfilePage';
import AuthPage from './components/AuthPage';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <Header />
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/category/:id" element={<CategoryPage />} />
            <Route path="/topic/:id" element={<TopicDetailPage />} />
            <Route path="/profile/:id" element={<UserProfilePage />} />
            <Route path="/login" element={<AuthPage />} />
            <Route path="/register" element={<AuthPage />} />
          </Routes>
          <Footer />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
