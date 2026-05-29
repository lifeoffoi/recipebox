import { useNavigate } from 'react-router-dom';

const RecipeCard = ({ recipe }) => {
  const navigate = useNavigate();

  return (
    <div
      onClick={() => navigate(`/recipe/${recipe.id}`)}
      style={{ border: '1px solid #ccc', padding: '1rem', borderRadius: 8, cursor: 'pointer', width: 200, flexShrink: 0 }}
    >
      <h4 style={{ margin: '0 0 0.5rem' }}>{recipe.title}</h4>
      <p style={{ fontSize: 13, color: '#666', margin: 0 }}>{recipe.cookTime}</p>
      <p style={{ fontSize: 13, color: '#666', margin: 0 }}>{recipe.servings} servings</p>
    </div>
  );
};

export default RecipeCard;
