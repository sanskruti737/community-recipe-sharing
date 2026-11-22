import { Link, Route, Routes, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import Header from './components/Header.jsx';
import Footer from './components/Footer.jsx';
import { ToastProvider } from './components/Toast.jsx';
import HomePage from './pages/HomePage.jsx';
import FavoritesPage from './pages/FavoritesPage.jsx';
import RecipeDetailPage from './pages/RecipeDetailPage.jsx';
import RecipeFormPage from './pages/RecipeFormPage.jsx';

const ScrollToTop = () => {
  const { pathname } = useLocation();
  useEffect(() => window.scrollTo(0, 0), [pathname]);
  return null;
};

const NotFoundPage = () => (
  <section className="container page-section empty-state">
    <span>🧭</span>
    <h3>Page not found</h3>
    <p>That page wandered out of the kitchen. Let's get you back to the recipes.</p>
    <Link to="/" className="button button--primary">Back to explore</Link>
  </section>
);

const App = () => (
  <ToastProvider>
    <ScrollToTop />
    <Header />
    <main>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/favorites" element={<FavoritesPage />} />
        <Route path="/recipes/new" element={<RecipeFormPage />} />
        <Route path="/recipes/:id" element={<RecipeDetailPage />} />
        <Route path="/recipes/:id/edit" element={<RecipeFormPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </main>
    <Footer />
  </ToastProvider>
);

export default App;
