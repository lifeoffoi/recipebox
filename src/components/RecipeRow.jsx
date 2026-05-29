import RecipeCard from './RecipeCard';

// Mirrors the Row component from movies-app — shows a horizontal scrollable list per category
const RecipeRow = ({ title, recipes }) => {
  if (recipes.length === 0) return null;

  return (
    <div className="category-section">
      <h3 className="category-title">{title}</h3>
      <div className="recipe-row">
        {recipes.map(recipe => (
          <RecipeCard key={recipe.id} recipe={recipe} />
        ))}
      </div>
    </div>
  );
};

export default RecipeRow;
