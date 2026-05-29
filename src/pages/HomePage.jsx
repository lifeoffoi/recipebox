import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  advanceFeaturedRecipe,
  fetchRecipes,
  fetchSaved,
  selectAllRecipes,
  selectFeaturedRecipe,
  selectSavedStatus,
  selectStatus,
} from '../redux/recipesSlice';
import { useAuth } from '../context/AuthContext';
import RecipeRow from '../components/RecipeRow';

const CATEGORIES = ['Italian', 'Asian', 'Desserts', 'Quick Meals'];

const HomePage = () => {
  const dispatch    = useDispatch();
  const { user }    = useAuth();
  const recipes     = useSelector(selectAllRecipes);
  const featured    = useSelector(selectFeaturedRecipe);
  const status      = useSelector(selectStatus);
  const savedStatus = useSelector(selectSavedStatus);
  const [search, setSearch] = useState('');

  useEffect(() => {
    if (status === 'idle')      dispatch(fetchRecipes());
    if (savedStatus === 'idle') dispatch(fetchSaved(user.id));
  }, [dispatch, user.id, status, savedStatus]);

  useEffect(() => {
    if (recipes.length < 2) return undefined;

    const intervalId = setInterval(() => {
      dispatch(advanceFeaturedRecipe());
    }, 5000);

    return () => clearInterval(intervalId);
  }, [dispatch, recipes.length]);

  const filtered = search
    ? recipes.filter(r => r.title.toLowerCase().includes(search.toLowerCase()))
    : recipes;

  return (
    <div>
      {/* Hero banner — mirrors movies-app Banner component */}
      {featured && (
        <div className="hero">
          <span className="hero-tag">Featured Recipe</span>
          <h2>{featured.title}</h2>
          <p>{featured.description}</p>
          <p className="hero-meta">{featured.cookTime} &bull; {featured.servings} servings</p>
        </div>
      )}

      {/* Search */}
      <div className="search-bar">
        <input
          placeholder="Search recipes..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      {status === 'loading' && <p className="loading-text">Loading recipes...</p>}
      {status === 'failed'  && <p className="error-banner">Failed to load recipes. Is the API running?</p>}

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
