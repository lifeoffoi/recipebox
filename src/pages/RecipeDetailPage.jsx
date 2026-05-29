import { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchRecipes, fetchSaved, saveRecipe, unsaveRecipe, deleteRecipe, selectRecipeById, selectSaved, selectStatus } from '../redux/recipesSlice';
import { useAuth } from '../context/AuthContext';

const RecipeDetailPage = () => {
  const { id }    = useParams();
  const dispatch  = useDispatch();
  const navigate  = useNavigate();
  const { user }  = useAuth();
  const recipe    = useSelector(selectRecipeById(id));
  const saved     = useSelector(selectSaved);
  const status    = useSelector(selectStatus);

  useEffect(() => {
    if (status === 'idle') dispatch(fetchRecipes());
  }, [dispatch, status]);

  useEffect(() => {
    dispatch(fetchSaved(user.id));
  }, [dispatch, user.id]);

  if (!recipe) return <p className="loading-text">Loading...</p>;

  const savedEntry = saved.find(s => s.recipeId === id && s.userId === user.id);
  const isSaved    = !!savedEntry;

  const handleSave = () => {
    if (isSaved) dispatch(unsaveRecipe(savedEntry.id));
    else         dispatch(saveRecipe({ userId: user.id, recipeId: id }));
  };

  const handleDelete = async () => {
    await dispatch(deleteRecipe(id));
    navigate('/');
  };

  return (
    <div className="detail-page">
      <button className="back-btn" onClick={() => navigate('/')}>Back</button>

      <h2 className="detail-title">{recipe.title}</h2>
      <p className="detail-desc">{recipe.description}</p>
      <p className="detail-meta"><strong>Cook time:</strong> {recipe.cookTime} &nbsp;|&nbsp; <strong>Servings:</strong> {recipe.servings}</p>

      <div className="detail-actions">
        <button className="btn-secondary" onClick={handleSave}>
          {isSaved ? 'Remove from Cookbook' : 'Save to Cookbook'}
        </button>
        {recipe.addedBy === user.id && (
          <button className="btn-danger" onClick={handleDelete}>Delete Recipe</button>
        )}
      </div>

      <div className="detail-section">
        <h3>Ingredients</h3>
        <ul>{recipe.ingredients.map((ing, i) => <li key={i}>{ing}</li>)}</ul>
      </div>

      <div className="detail-section">
        <h3>Steps</h3>
        <ol>{recipe.steps.map((step, i) => <li key={i}>{step}</li>)}</ol>
      </div>
    </div>
  );
};

export default RecipeDetailPage;
