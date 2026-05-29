import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchRecipes, fetchSaved, selectAllRecipes, selectStatus } from '../redux/recipesSlice';
import { useAuth } from '../context/AuthContext';
import RecipeRow from '../components/RecipeRow';

const CATEGORIES = ['Italian', 'Asian', 'Desserts', 'Quick Meals'];

const HomePage = () => {
  const dispatch = useDispatch();
  const { user }  = useAuth();
  const recipes   = useSelector(selectAllRecipes);
  const status    = useSelector(selectStatus);
  const [search, setSearch] = useState('');

  useEffect(() => {
    if (status === 'idle') dispatch(fetchRecipes());
    dispatch(fetchSaved(user.id));
  }, [dispatch, status, user.id]);

  const featured = recipes.find(r => r.featured);

  const filtered = search
    ? recipes.filter(r => r.title.toLowerCase().includes(search.toLowerCase()))
    : recipes;

  return (
    <div style={{ padding: '1rem' }}>
      {/* Hero banner — mirrors movies-app Banner component */}
      {featured && (
        <div style={{ background: '#1a1a2e', color: '#fff', padding: '2rem', borderRadius: 8, marginBottom: '2rem' }}>
          <h2>{featured.title}</h2>
          <p style={{ maxWidth: 500, color: '#ccc' }}>{featured.description}</p>
          <p style={{ color: '#aaa', fontSize: 14 }}>{featured.cookTime} • {featured.servings} servings</p>
        </div>
      )}

      {/* Search */}
      <input
        placeholder="Search recipes..."
        value={search}
        onChange={e => setSearch(e.target.value)}
        style={{ padding: '0.5rem', width: '100%', maxWidth: 400, marginBottom: '1.5rem', border: '1px solid #ccc', borderRadius: 6 }}
      />

      {status === 'loading' && <p>Loading recipes...</p>}

      {/* Category rows — mirrors movies-app Row component structure */}
      {search
        ? <RecipeRow title={`Results for "${search}"`} recipes={filtered} />
        : CATEGORIES.map(cat => (
            <RecipeRow
              key={cat}
              title={cat}
              recipes={recipes.filter(r => r.category === cat)}
            />
          ))
      }
    </div>
  );
};

export default HomePage;
