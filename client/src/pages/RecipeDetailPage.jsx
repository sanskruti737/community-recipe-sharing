import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { api } from '../services/api.js';
import { useToast } from '../components/Toast.jsx';
import { ClockIcon, EditIcon, HeartIcon, StarIcon, TrashIcon, UsersIcon } from '../components/Icons.jsx';

const RecipeDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const notify = useToast();
  const [recipe, setRecipe] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = () => {
    setLoading(true);
    api.getRecipe(id)
      .then(setRecipe)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  };

  useEffect(load, [id]);

  const react = async (kind) => {
    try {
      const result = kind === 'like' ? await api.toggleLike(id) : await api.toggleFavorite(id);
      setRecipe((current) => ({
        ...current,
        likedByMe: kind === 'like' ? result.active : current.likedByMe,
        likes: kind === 'like' ? result.count : current.likes,
        favoritedByMe: kind === 'favorite' ? result.active : current.favoritedByMe,
        favorites: kind === 'favorite' ? result.count : current.favorites
      }));
      notify(result.active ? (kind === 'like' ? 'Liked!' : 'Saved to favorites!') : 'Update removed.');
    } catch (err) {
      notify(err.message, 'error');
    }
  };

  const remove = async () => {
    if (!window.confirm(`Delete "${recipe.title}"? This cannot be undone.`)) return;
    try {
      await api.deleteRecipe(id);
      notify('Recipe deleted.');
      navigate('/');
    } catch (err) {
      notify(err.message, 'error');
    }
  };

  if (loading) return <div className="container page-section"><div className="detail-skeleton" /></div>;
  if (error || !recipe) {
    return (
      <section className="container page-section empty-state">
        <span>🍽️</span>
        <h3>Recipe unavailable</h3>
        <p>{error || 'We could not find that recipe.'}</p>
        <Link to="/" className="button button--primary">Back to recipes</Link>
      </section>
    );
  }

  return (
    <article className="container page-section detail-page">
      <Link to="/" className="back-link">← Back to recipes</Link>
      <header className="detail-header">
        <div>
          <span className={`badge badge--${recipe.category.toLowerCase()}`}>{recipe.category}</span>
          <h1>{recipe.title}</h1>
          <p className="detail-header__description">{recipe.description}</p>
          <div className="detail-header__meta">
            <span><UsersIcon /> By {recipe.author}</span>
            <span><ClockIcon /> {recipe.prepTime} min prep</span>
            <span className={`difficulty difficulty--${recipe.difficulty.toLowerCase()}`}>{recipe.difficulty}</span>
          </div>
        </div>
        <div className="detail-actions">
          <button type="button" className={`button button--outline ${recipe.likedByMe ? 'is-like' : ''}`} onClick={() => react('like')} aria-pressed={recipe.likedByMe}>
            <HeartIcon filled={recipe.likedByMe} /> {recipe.likes} Likes
          </button>
          <button type="button" className={`button button--outline ${recipe.favoritedByMe ? 'is-favorite' : ''}`} onClick={() => react('favorite')} aria-pressed={recipe.favoritedByMe}>
            <StarIcon filled={recipe.favoritedByMe} /> {recipe.favoritedByMe ? 'Saved' : 'Save'}
          </button>
          <Link to={`/recipes/${recipe.id}/edit`} className="button button--outline"><EditIcon /> Edit</Link>
          <button type="button" className="button button--danger" onClick={remove}><TrashIcon /> Delete</button>
        </div>
      </header>

      <div className="detail-image">
        {recipe.image ? <img src={recipe.image} alt={recipe.title} /> : <div className="recipe-card__placeholder">🍽️</div>}
      </div>

      <div className="detail-content">
        <section className="detail-panel">
          <span className="detail-panel__number">01</span>
          <h2>Ingredients</h2>
          <ul className="ingredient-list">
            {recipe.ingredients.map((ingredient, index) => <li key={`${ingredient}-${index}`}>{ingredient}</li>)}
          </ul>
        </section>
        <section className="detail-panel">
          <span className="detail-panel__number">02</span>
          <h2>Cooking instructions</h2>
          <ol className="instruction-list">
            {recipe.instructions.map((instruction, index) => (
              <li key={`${instruction}-${index}`}>
                <span>{String(index + 1).padStart(2, '0')}</span>
                <p>{instruction}</p>
              </li>
            ))}
          </ol>
        </section>
      </div>
    </article>
  );
};

export default RecipeDetailPage;
