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
    <div style={{ padding: '1rem', maxWidth: 600 }}>
      <h2>Add a Recipe</h2>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        <input placeholder="Title" value={form.title} onChange={field('title')} required />

        <select value={form.category} onChange={field('category')}>
          {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
        </select>

        <textarea placeholder="Description" value={form.description} onChange={field('description')} rows={3} />

        <input placeholder="Cook time (e.g. 30 mins)" value={form.cookTime} onChange={field('cookTime')} required />

        <input type="number" placeholder="Servings" value={form.servings} onChange={field('servings')} required />

        <textarea
          placeholder="Ingredients (one per line)"
          value={form.ingredients}
          onChange={field('ingredients')}
          rows={5}
          required
        />

        <textarea
          placeholder="Steps (one per line)"
          value={form.steps}
          onChange={field('steps')}
          rows={6}
          required
        />

        <button type="submit">Add Recipe</button>
      </form>
    </div>
  );
};

export default AddRecipePage;
