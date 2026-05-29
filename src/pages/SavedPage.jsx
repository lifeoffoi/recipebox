import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchRecipes, fetchSaved, selectAllRecipes, selectSaved, selectStatus, selectSavedStatus } from '../redux/recipesSlice';
import { useAuth } from '../context/AuthContext';
import RecipeCard from '../components/RecipeCard';

const SavedPage = () => {
  const dispatch    = useDispatch();
  const { user }    = useAuth();
  const recipes     = useSelector(selectAllRecipes);
  const saved       = useSelector(selectSaved);
  const status      = useSelector(selectStatus);
  const savedStatus = useSelector(selectSavedStatus);

  useEffect(() => {
    if (status === 'idle')      dispatch(fetchRecipes());
    if (savedStatus === 'idle') dispatch(fetchSaved(user.id));
  }, [dispatch, user.id, status, savedStatus]);

  const isLoading = status === 'loading' || status === 'idle' || savedStatus === 'loading' || savedStatus === 'idle';

  const savedRecipes = recipes.filter(r =>
    saved.some(s => String(s.recipeId) === String(r.id) && String(s.userId) === String(user.id))
  );

  return (
    <div className="saved-page">
      <h2>My Cookbook</h2>
      {isLoading
        ? <p className="loading-text">Loading...</p>
        : status === 'failed'
          ? <p className="error-banner">Failed to load recipes. Is the API running?</p>
          : savedRecipes.length === 0
            ? <p className="empty-text">No saved recipes yet. Browse and save some!</p>
            : <div className="saved-grid">{savedRecipes.map(r => <RecipeCard key={r.id} recipe={r} />)}</div>
      }
    </div>
  );
};

export default SavedPage;
