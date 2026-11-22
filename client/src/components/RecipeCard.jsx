import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ClockIcon, EditIcon, HeartIcon, StarIcon, TrashIcon, UsersIcon } from './Icons.jsx';

const categoryClass = (category) => `badge badge--${category.toLowerCase()}`;

const RecipeCard = ({ recipe, onLike, onFavorite, onDelete, showOwnerActions = false }) => {
  const [imageFailed, setImageFailed] = useState(false);

  return (
    <article className="recipe-card">
      <div className="recipe-card__media">
        <Link to={`/recipes/${recipe.id}`} aria-label={`View ${recipe.title}`}>
          {recipe.image && !imageFailed ? (
            <img src={recipe.image} alt={recipe.title} loading="lazy" onError={() => setImageFailed(true)} />
          ) : (
            <div className="recipe-card__placeholder">🍽️</div>
          )}
        </Link>
        <span className={categoryClass(recipe.category)}>{recipe.category}</span>
        <div className="recipe-card__actions">
          <button
            type="button"
            className={`icon-button ${recipe.likedByMe ? 'is-active is-like' : ''}`}
            onClick={() => onLike(recipe)}
            aria-pressed={recipe.likedByMe}
            aria-label={recipe.likedByMe ? 'Unlike recipe' : 'Like recipe'}
            title={recipe.likedByMe ? 'Unlike' : 'Like'}
          >
            <HeartIcon filled={recipe.likedByMe} />
          </button>
          <button
            type="button"
            className={`icon-button ${recipe.favoritedByMe ? 'is-active is-favorite' : ''}`}
            onClick={() => onFavorite(recipe)}
            aria-pressed={recipe.favoritedByMe}
            aria-label={recipe.favoritedByMe ? 'Remove from favorites' : 'Add to favorites'}
            title={recipe.favoritedByMe ? 'Remove favorite' : 'Save recipe'}
          >
            <StarIcon filled={recipe.favoritedByMe} />
          </button>
        </div>
      </div>

      <div className="recipe-card__body">
        <p className="recipe-card__author"><UsersIcon /> {recipe.author}</p>
        <h3><Link to={`/recipes/${recipe.id}`}>{recipe.title}</Link></h3>
        <p className="recipe-card__description">{recipe.description}</p>
        <div className="recipe-card__meta">
          <span><ClockIcon /> {recipe.prepTime} min</span>
          <span className={`difficulty difficulty--${recipe.difficulty.toLowerCase()}`}>{recipe.difficulty}</span>
          <span><HeartIcon filled /> {recipe.likes}</span>
          <span><StarIcon filled /> {recipe.favorites}</span>
        </div>
        {showOwnerActions && (
          <div className="recipe-card__owner">
            <Link className="text-button" to={`/recipes/${recipe.id}/edit`}><EditIcon /> Edit</Link>
            <button type="button" className="text-button text-button--danger" onClick={() => onDelete(recipe)}><TrashIcon /> Delete</button>
          </div>
        )}
      </div>
    </article>
  );
};

export default RecipeCard;
