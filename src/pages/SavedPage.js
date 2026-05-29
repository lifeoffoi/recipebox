import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchRecipes, fetchSaved, selectAllRecipes, selectSaved } from '../redux/recipesSlice';
import { useAuth } from '../context/AuthContext';
import RecipeCard from '../components/RecipeCard';

const SavedPage = () => {
  const dispatch  = useDispatch();
  const { user }  = useAuth();
  const recipes   = useSelector(selectAllRecipes);
  const saved     = useSelector(selectSaved);

  useEffect(() => {
    dispatch(fetchRecipes());
    dispatch(fetchSaved(user.id));
  }, [dispatch, user.id]);

  const savedRecipes = recipes.filter(r =>
    saved.some(s => s.recipeId === r.id && s.userId === user.id)
  );

  return (
    <div style={{ padding: '1rem' }}>
      <h2>My Cookbook</h2>
      {savedRecipes.length === 0
        ? <p style={{ color: '#888' }}>No saved recipes yet. Browse and save some!</p>
        : (
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginTop: '1rem' }}>
            {savedRecipes.map(r => <RecipeCard key={r.id} recipe={r} />)}
          </div>
        )
      }
    </div>
  );
};

export default SavedPage;
