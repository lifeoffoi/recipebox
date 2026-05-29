import { useNavigate } from 'react-router-dom';

const RecipeCard = ({ recipe }) => {
  const navigate = useNavigate();

  return (
    <div className="recipe-card" onClick={() => navigate(`/recipe/${recipe.id}`)}>
      <h4>{recipe.title}</h4>
      <div className="recipe-card-meta">
        <span>{recipe.cookTime}</span>
        <span>{recipe.servings} servings</span>
      </div>
    </div>
  );
};

export default RecipeCard;
