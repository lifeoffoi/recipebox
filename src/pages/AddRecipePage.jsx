import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { addRecipe } from '../redux/recipesSlice';
import { useAuth } from '../context/AuthContext';

const CATEGORIES = ['Italian', 'Asian', 'Desserts', 'Quick Meals'];

const AddRecipePage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [form, setForm] = useState({
    title: '', category: 'Italian', description: '',
    cookTime: '', servings: '', ingredients: '', steps: '',
  });

  const field = (key) => (e) => setForm(f => ({ ...f, [key]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    const recipe = {
      ...form,
      servings:    Number(form.servings),
      ingredients: form.ingredients.split('\n').filter(Boolean),
      steps:       form.steps.split('\n').filter(Boolean),
      featured:    false,
      addedBy:     user.id,
    };
    await dispatch(addRecipe(recipe));
    navigate('/');
  };

  return (
    <div className="form-page">
      <h2>Add a Recipe</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Title</label>
          <input placeholder="e.g. Spaghetti Carbonara" value={form.title} onChange={field('title')} required />
        </div>
        <div className="form-group">
          <label>Category</label>
          <select value={form.category} onChange={field('category')}>
            {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <div className="form-group">
          <label>Description</label>
          <textarea placeholder="Short description of the recipe" value={form.description} onChange={field('description')} rows={3} />
        </div>
        <div className="form-group">
          <label>Cook Time</label>
          <input placeholder="e.g. 30 mins" value={form.cookTime} onChange={field('cookTime')} required />
        </div>
        <div className="form-group">
          <label>Servings</label>
          <input type="number" placeholder="e.g. 4" value={form.servings} onChange={field('servings')} required />
        </div>
        <div className="form-group">
          <label>Ingredients (one per line)</label>
          <textarea value={form.ingredients} onChange={field('ingredients')} rows={5} required />
        </div>
        <div className="form-group">
          <label>Steps (one per line)</label>
          <textarea value={form.steps} onChange={field('steps')} rows={6} required />
        </div>
        <div className="form-actions">
          <button type="submit">Add Recipe</button>
        </div>
      </form>
    </div>
  );
};

export default AddRecipePage;
