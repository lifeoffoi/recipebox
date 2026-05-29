import RecipeCard from './RecipeCard';

// Mirrors the Row component from movies-app — shows a horizontal scrollable list per category
const RecipeRow = ({ title, recipes }) => {
  if (recipes.length === 0) return null;

  return (
    <div style={{ marginBottom: '2rem' }}>
      <h3 style={{ marginBottom: '0.5rem' }}>{title}</h3>
      <div style={{ display: 'flex', gap: '1rem', overflowX: 'auto', paddingBottom: '0.5rem' }}>
        {recipes.map(recipe => (
          <RecipeCard key={recipe.id} recipe={recipe} />
        ))}
      </div>
    </div>
  );
};

export default RecipeRow;
