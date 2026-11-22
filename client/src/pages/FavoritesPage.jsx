import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../services/api.js';
import { useRecipeActions } from '../hooks/useRecipeActions.js';
import RecipeCard from '../components/RecipeCard.jsx';
import { StarIcon } from '../components/Icons.jsx';

const FavoritesPage = () => {
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { handleLike, handleFavorite, handleDelete } = useRecipeActions(setRecipes);

  useEffect(() => {
    api.getRecipes()
      .then((data) => setRecipes(data.recipes))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const favorites = recipes.filter((recipe) => recipe.favoritedByMe);

  return (
    <section className="container page-section">
      <div className="page-heading">
        <span className="eyebrow"><StarIcon /> Your cooking book</span>
        <h1>My Favorites</h1>
        <p>All the recipes you saved, in one place. Tap the star again to remove one.</p>
      </div>

      {error && <div className="alert alert--error" role="alert">{error}</div>}
      {loading ? (
        <div className="recipe-grid">
          {[1, 2, 3].map((item) => <div key={item} className="skeleton-card" />)}
        </div>
      ) : favorites.length === 0 ? (
        <div className="empty-state">
          <span>⭐</span>
          <h3>No favorites yet</h3>
          <p>Explore the feed and tap the star on recipes you want to cook again.</p>
          <Link to="/" className="button button--primary">Explore recipes</Link>
        </div>
      ) : (
        <div className="recipe-grid">
          {favorites.map((recipe) => (
            <RecipeCard
              key={recipe.id}
              recipe={recipe}
              onLike={handleLike}
              onFavorite={handleFavorite}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}
    </section>
  );
};

export default FavoritesPage;
