const VISITOR_KEY = 'recipehaven-visitor-id';

const getVisitorId = () => {
  let id = localStorage.getItem(VISITOR_KEY);
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem(VISITOR_KEY, id);
  }
  return id;
};

const request = async (url, options = {}) => {
  const response = await fetch(url, {
    ...options,
    headers: {
      'x-visitor-id': getVisitorId(),
      ...(options.body instanceof FormData ? {} : { 'Content-Type': 'application/json' }),
      ...options.headers
    }
  });

  const data = response.status === 204 ? null : await response.json().catch(() => ({}));
  if (!response.ok) {
    const error = new Error(data?.error || 'Something went wrong. Please try again.');
    error.details = data?.details || [];
    throw error;
  }
  return data;
};

const toFormData = (recipe) => {
  const form = new FormData();
  form.append('title', recipe.title);
  form.append('description', recipe.description);
  form.append('ingredients', recipe.ingredients.join('\n'));
  form.append('instructions', recipe.instructions.join('\n'));
  form.append('prepTime', String(recipe.prepTime));
  form.append('difficulty', recipe.difficulty);
  form.append('category', recipe.category);
  form.append('author', recipe.author);
  if (recipe.imageFile) form.append('image', recipe.imageFile);
  return form;
};

export const api = {
  getRecipes: (filters = {}) => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value) params.set(key, value);
    });
    const query = params.toString();
    return request(`/api/recipes${query ? `?${query}` : ''}`);
  },
  getRecipe: (id) => request(`/api/recipes/${id}`),
  getStats: () => request('/api/stats'),
  createRecipe: (recipe) => request('/api/recipes', { method: 'POST', body: toFormData(recipe) }),
  updateRecipe: (id, recipe) => request(`/api/recipes/${id}`, { method: 'PUT', body: toFormData(recipe) }),
  deleteRecipe: (id) => request(`/api/recipes/${id}`, { method: 'DELETE' }),
  toggleLike: (id) => request(`/api/recipes/${id}/like`, { method: 'POST' }),
  toggleFavorite: (id) => request(`/api/recipes/${id}/favorite`, { method: 'POST' })
};
