import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../services/api.js';
import { useRecipeActions } from '../hooks/useRecipeActions.js';
import RecipeCard from '../components/RecipeCard.jsx';
import SearchFilters from '../components/SearchFilters.jsx';
import { ArrowIcon, PlusIcon, SparkleIcon } from '../components/Icons.jsx';

const initialFilters = { search: '', ingredient: '', category: '', sort: 'newest' };

const HomePage = () => {
  const [filters, setFilters] = useState(initialFilters);
  const [recipes, setRecipes] = useState([]);
  const [stats, setStats] = useState({ recipes: 0, likes: 0, favorites: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { handleLike, handleFavorite, handleDelete } = useRecipeActions(setRecipes);

  useEffect(() => {
    api.getStats().then(setStats).catch(() => {});
  }, []);

  useEffect(() => {
    let ignore = false;
    const timer = setTimeout(() => {
      setLoading(true);
      api.getRecipes(filters)
        .then((data) => {
          if (!ignore) {
            setRecipes(data.recipes);
            setError('');
          }
        })
        .catch((err) => {
          if (!ignore) setError(err.message);
        })
        .finally(() => {
          if (!ignore) setLoading(false);
        });
    }, 220);

    return () => {
      ignore = true;
      clearTimeout(timer);
    };
  }, [filters]);

  return (
    <>
      <section className="hero">
        <div className="container hero__inner">
          <div className="hero__content">
            <span className="eyebrow"><SparkleIcon /> Cook together, share together</span>
            <h1>Recipes worth <em>passing around.</em></h1>
            <p>Discover honest recipes from home cooks, save the ones you love, and share your own kitchen creations with a community that cares about good food.</p>
            <div className="hero__buttons">
              <Link to="/recipes/new" className="button button--primary"><PlusIcon /> Share your recipe</Link>
              <a href="#explore" className="button button--ghost">Explore recipes <ArrowIcon /></a>
            </div>
            <div className="hero__stats">
              <div><strong>{stats.recipes}</strong><span>recipes shared</span></div>
              <div><strong>{stats.likes}</strong><span>hearts given</span></div>
              <div><strong>{stats.favorites}</strong><span>recipes saved</span></div>
            </div>
          </div>
          <div className="hero__art" aria-hidden="true">
            <div className="hero__plate">🍳</div>
            <div className="hero__floating hero__floating--one">🥑</div>
            <div className="hero__floating hero__floating--two">🍅</div>
            <div className="hero__floating hero__floating--three">🧄</div>
            <div className="hero__floating hero__floating--four">🥖</div>
          </div>
        </div>
      </section>

      <section className="container explore-section" id="explore">
        <div className="section-heading">
          <div>
            <span className="eyebrow">Explore the kitchen</span>
            <h2>Find your next favourite</h2>
          </div>
          <p>{loading ? 'Searching...' : `${recipes.length} ${recipes.length === 1 ? 'recipe' : 'recipes'} to explore`}</p>
        </div>

        <SearchFilters
          filters={filters}
          onChange={setFilters}
          onClear={() => setFilters(initialFilters)}
        />

        {error && <div className="alert alert--error" role="alert">{error}</div>}

        {loading ? (
          <div className="recipe-grid">
            {[1, 2, 3, 4, 5, 6].map((item) => <div key={item} className="skeleton-card" />)}
          </div>
        ) : recipes.length === 0 ? (
          <div className="empty-state">
            <span>🔎</span>
            <h3>No recipes found</h3>
            <p>Try another search or be the first to share a recipe in this category.</p>
            <div className="empty-state__actions">
              <button type="button" className="button button--ghost" onClick={() => setFilters(initialFilters)}>Clear filters</button>
              <Link to="/recipes/new" className="button button--primary">Add a recipe</Link>
            </div>
          </div>
        ) : (
          <div className="recipe-grid">
            {recipes.map((recipe) => (
              <RecipeCard
                key={recipe.id}
                recipe={recipe}
                onLike={handleLike}
                onFavorite={handleFavorite}
                onDelete={handleDelete}
                showOwnerActions
              />
            ))}
          </div>
        )}
      </section>
    </>
  );
};

export default HomePage;
