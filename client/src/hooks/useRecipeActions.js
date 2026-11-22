import { useCallback } from 'react';
import { api } from '../services/api.js';
import { useToast } from '../components/Toast.jsx';

export const useRecipeActions = (setRecipes) => {
  const notify = useToast();

  const patchRecipe = useCallback((id, changes) => {
    setRecipes((current) => current.map((recipe) => (
      recipe.id === id ? { ...recipe, ...changes } : recipe
    )));
  }, [setRecipes]);

  const handleLike = useCallback(async (recipe) => {
    try {
      const result = await api.toggleLike(recipe.id);
      patchRecipe(recipe.id, { likedByMe: result.active, likes: result.count });
      notify(result.active ? 'Added to likes.' : 'Removed from likes.');
    } catch (error) {
      notify(error.message, 'error');
    }
  }, [notify, patchRecipe]);

  const handleFavorite = useCallback(async (recipe) => {
    try {
      const result = await api.toggleFavorite(recipe.id);
      patchRecipe(recipe.id, { favoritedByMe: result.active, favorites: result.count });
      notify(result.active ? 'Saved to favorites.' : 'Removed from favorites.');
    } catch (error) {
      notify(error.message, 'error');
    }
  }, [notify, patchRecipe]);

  const handleDelete = useCallback(async (recipe, afterDelete) => {
    if (!window.confirm(`Delete "${recipe.title}"? This cannot be undone.`)) return;
    try {
      await api.deleteRecipe(recipe.id);
      setRecipes((current) => current.filter((item) => item.id !== recipe.id));
      notify('Recipe deleted.');
      afterDelete?.();
    } catch (error) {
      notify(error.message, 'error');
    }
  }, [notify, setRecipes]);

  return { handleLike, handleFavorite, handleDelete };
};
