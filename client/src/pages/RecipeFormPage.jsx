import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { api } from '../services/api.js';
import { useToast } from '../components/Toast.jsx';
import { PlusIcon, TrashIcon } from '../components/Icons.jsx';
import { categories } from '../components/SearchFilters.jsx';

const emptyForm = {
  title: '',
  description: '',
  author: '',
  prepTime: '',
  difficulty: 'Easy',
  category: 'Breakfast',
  ingredients: [''],
  instructions: [''],
  imageFile: null
};

const RecipeFormPage = () => {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const notify = useToast();
  const [form, setForm] = useState(emptyForm);
  const [preview, setPreview] = useState('');
  const [errors, setErrors] = useState({});
  const [generalError, setGeneralError] = useState('');
  const [loading, setLoading] = useState(isEdit);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!isEdit) return undefined;
    let ignore = false;
    api.getRecipe(id)
      .then((recipe) => {
        if (ignore) return;
        setForm({
          title: recipe.title,
          description: recipe.description,
          author: recipe.author,
          prepTime: String(recipe.prepTime),
          difficulty: recipe.difficulty,
          category: recipe.category,
          ingredients: recipe.ingredients,
          instructions: recipe.instructions,
          imageFile: null
        });
        setPreview(recipe.image || '');
      })
      .catch((error) => setGeneralError(error.message))
      .finally(() => {
        if (!ignore) setLoading(false);
      });
    return () => { ignore = true; };
  }, [id, isEdit]);

  useEffect(() => () => {
    if (preview.startsWith('blob:')) URL.revokeObjectURL(preview);
  }, [preview]);

  const update = (field, value) => {
    setForm((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: undefined }));
  };

  const updateListItem = (field, index, value) => {
    setForm((current) => ({
      ...current,
      [field]: current[field].map((item, itemIndex) => (itemIndex === index ? value : item))
    }));
  };

  const addListItem = (field) => {
    setForm((current) => ({ ...current, [field]: [...current[field], ''] }));
  };

  const removeListItem = (field, index) => {
    setForm((current) => ({
      ...current,
      [field]: current[field].filter((_item, itemIndex) => itemIndex !== index)
    }));
  };

  const handleImage = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!['image/jpeg', 'image/png', 'image/gif', 'image/webp'].includes(file.type)) {
      setErrors((current) => ({ ...current, image: 'Choose a JPEG, PNG, GIF or WebP image.' }));
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setErrors((current) => ({ ...current, image: 'Image must be 5 MB or smaller.' }));
      return;
    }
    update('imageFile', file);
    setPreview(URL.createObjectURL(file));
  };

  const submit = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    setGeneralError('');
    setErrors({});

    const payload = {
      ...form,
      ingredients: form.ingredients.map((item) => item.trim()).filter(Boolean),
      instructions: form.instructions.map((item) => item.trim()).filter(Boolean)
    };

    try {
      const saved = isEdit ? await api.updateRecipe(id, payload) : await api.createRecipe(payload);
      notify(isEdit ? 'Recipe updated!' : 'Recipe shared with the community!');
      navigate(`/recipes/${saved.id}`);
    } catch (error) {
      setGeneralError(error.message);
      const nextErrors = {};
      (error.details || []).forEach((detail) => { nextErrors[detail.field] = detail.message; });
      setErrors(nextErrors);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="container page-section"><div className="detail-skeleton" /></div>;

  return (
    <section className="container page-section form-page">
      <div className="page-heading">
        <span className="eyebrow">From your kitchen</span>
        <h1>{isEdit ? 'Edit your recipe' : 'Share a recipe'}</h1>
        <p>Give the community the details they need to cook it beautifully.</p>
      </div>

      <form className="recipe-form" onSubmit={submit} noValidate>
        {generalError && <div className="alert alert--error" role="alert">{generalError}</div>}

        <div className="form-grid">
          <div className="form-main">
            <div className="form-group">
              <label htmlFor="title">Recipe title <span>*</span></label>
              <input id="title" type="text" value={form.title} onChange={(event) => update('title', event.target.value)} placeholder="e.g. Grandma's tomato soup" />
              {errors.title && <small className="field-error">{errors.title}</small>}
            </div>

            <div className="form-group">
              <label htmlFor="description">Description <span>*</span></label>
              <textarea id="description" rows="4" value={form.description} onChange={(event) => update('description', event.target.value)} placeholder="Tell us why this recipe is special..." />
              {errors.description && <small className="field-error">{errors.description}</small>}
            </div>

            <div className="form-group">
              <div className="list-heading">
                <label>Ingredients <span>*</span></label>
                <button type="button" className="add-row" onClick={() => addListItem('ingredients')}><PlusIcon /> Add ingredient</button>
              </div>
              {form.ingredients.map((ingredient, index) => (
                <div className="list-row" key={`ingredient-${index}`}>
                  <input
                    aria-label={`Ingredient ${index + 1}`}
                    value={ingredient}
                    onChange={(event) => updateListItem('ingredients', index, event.target.value)}
                    placeholder="e.g. 2 cups of flour"
                  />
                  <button type="button" className="remove-row" onClick={() => removeListItem('ingredients', index)} aria-label={`Remove ingredient ${index + 1}`} disabled={form.ingredients.length === 1}><TrashIcon /></button>
                </div>
              ))}
              {errors.ingredients && <small className="field-error">{errors.ingredients}</small>}
            </div>

            <div className="form-group">
              <div className="list-heading">
                <label>Cooking instructions <span>*</span></label>
                <button type="button" className="add-row" onClick={() => addListItem('instructions')}><PlusIcon /> Add step</button>
              </div>
              {form.instructions.map((instruction, index) => (
                <div className="list-row" key={`instruction-${index}`}>
                  <span className="step-number">{index + 1}</span>
                  <textarea
                    aria-label={`Instruction ${index + 1}`}
                    rows="2"
                    value={instruction}
                    onChange={(event) => updateListItem('instructions', index, event.target.value)}
                    placeholder="Describe this step..."
                  />
                  <button type="button" className="remove-row" onClick={() => removeListItem('instructions', index)} aria-label={`Remove instruction ${index + 1}`} disabled={form.instructions.length === 1}><TrashIcon /></button>
                </div>
              ))}
              {errors.instructions && <small className="field-error">{errors.instructions}</small>}
            </div>
          </div>

          <aside className="form-side">
            <div className="form-group">
              <label htmlFor="author">Your name</label>
              <input id="author" type="text" value={form.author} onChange={(event) => update('author', event.target.value)} placeholder="Anonymous" />
              {errors.author && <small className="field-error">{errors.author}</small>}
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="prepTime">Prep time (min) <span>*</span></label>
                <input id="prepTime" type="number" min="1" max="10080" value={form.prepTime} onChange={(event) => update('prepTime', event.target.value)} placeholder="30" />
                {errors.prepTime && <small className="field-error">{errors.prepTime}</small>}
              </div>
              <div className="form-group">
                <label htmlFor="difficulty">Difficulty <span>*</span></label>
                <select id="difficulty" value={form.difficulty} onChange={(event) => update('difficulty', event.target.value)}>
                  <option>Easy</option>
                  <option>Medium</option>
                  <option>Hard</option>
                </select>
                {errors.difficulty && <small className="field-error">{errors.difficulty}</small>}
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="category">Category <span>*</span></label>
              <select id="category" value={form.category} onChange={(event) => update('category', event.target.value)}>
                {categories.map((category) => <option key={category}>{category}</option>)}
              </select>
              {errors.category && <small className="field-error">{errors.category}</small>}
            </div>

            <div className="form-group">
              <label htmlFor="image">Recipe image</label>
              <label className="image-drop" htmlFor="image">
                {preview ? <img src={preview} alt="Recipe preview" /> : <span>📷<small>Click to upload an image</small></span>}
              </label>
              <input id="image" type="file" accept="image/jpeg,image/png,image/gif,image/webp" onChange={handleImage} />
              {errors.image && <small className="field-error">{errors.image}</small>}
              <small className="field-hint">JPEG, PNG, GIF or WebP · max 5 MB</small>
            </div>

            <div className="form-actions">
              <button type="submit" className="button button--primary" disabled={submitting}>{submitting ? 'Saving...' : isEdit ? 'Save changes' : 'Publish recipe'}</button>
              <Link to={isEdit ? `/recipes/${id}` : '/'} className="button button--ghost">Cancel</Link>
            </div>
          </aside>
        </div>
      </form>
    </section>
  );
};

export default RecipeFormPage;
