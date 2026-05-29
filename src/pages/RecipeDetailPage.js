import { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchRecipes, saveRecipe, unsaveRecipe, deleteRecipe, selectRecipeById, selectSaved } from '../redux/recipesSlice';
import { useAuth } from '../context/AuthContext';

const RecipeDetailPage = () => {
  const { id }    = useParams();
  const dispatch  = useDispatch();
  const navigate  = useNavigate();
  const { user }  = useAuth();
  const recipe    = useSelector(selectRecipeById(id));
  const saved     = useSelector(selectSaved);

  useEffect(() => {
    dispatch(fetchRecipes());
  }, [dispatch]);

  if (!recipe) return <p style={{ padding: '1rem' }}>Loading...</p>;

  const savedEntry = saved.find(s => s.recipeId === id && s.userId === user.id);
  const isSaved    = !!savedEntry;

  const handleSave = () => {
    if (isSaved) {
      dispatch(unsaveRecipe(savedEntry.id));
    } else {
      dispatch(saveRecipe({ userId: user.id, recipeId: id }));
    }
  };

  const handleDelete = async () => {
    await dispatch(deleteRecipe(id));
    navigate('/');
  };

  return (
    <div style={{ padding: '1rem', maxWidth: 700 }}>
      <button onClick={() => navigate('/')} style={{ marginBottom: '1rem' }}>Back</button>

      <h2>{recipe.title}</h2>
      <p style={{ color: '#666' }}>{recipe.description}</p>
      <p><strong>Cook time:</strong> {recipe.cookTime} | <strong>Servings:</strong> {recipe.servings}</p>

      <div style={{ display: 'flex', gap: '0.5rem', margin: '1rem 0' }}>
        <button onClick={handleSave}>
          {isSaved ? 'Remove from Cookbook' : 'Save to Cookbook'}
        </button>
        {recipe.addedBy === user.id && (
          <button onClick={handleDelete} style={{ background: 'red', color: 'white' }}>
            Delete Recipe
          </button>
        )}
      </div>

      <h3>Ingredients</h3>
      <ul>
        {recipe.ingredients.map((ing, i) => <li key={i}>{ing}</li>)}
      </ul>

      <h3>Steps</h3>
      <ol>
        {recipe.steps.map((step, i) => <li key={i} style={{ marginBottom: '0.5rem' }}>{step}</li>)}
      </ol>
    </div>
  );
};

export default RecipeDetailPage;
