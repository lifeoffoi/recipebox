# RecipeBox

RecipeBox is a recipe discovery and cookbook app built with React, Redux Toolkit, React Router, Context API, and a `json-server` mock API. It is also a React exam reference project: each feature is intentionally tied to a common React concept you may need to recognize, explain, or rebuild.

The app lets users log in, browse recipes by category, search recipes, view recipe details, save recipes to a personal cookbook, add new recipes, and delete recipes they created.

## How to Run

Start the mock API:

```bash
npm run api
```

Start the React app in another terminal:

```bash
npm start
```

The API runs on `http://localhost:3001`. The React app usually runs on `http://localhost:3000`.

## Test Accounts

| Email | Password |
|---|---|
| `janice@email.com` | `password123` |
| `spencer@email.com` | `password123` |

## What the App Does

| Feature | What happens | Main files |
|---|---|---|
| Authentication | Users can log in, register, stay logged in through `localStorage`, and log out. | `src/context/AuthContext.jsx`, `src/pages/LoginPage.jsx`, `src/pages/RegisterPage.jsx`, `src/components/Navbar.jsx` |
| Protected pages | Logged-out users are redirected to `/login`; logged-in users are redirected away from public auth pages. | `src/components/PrivateRoute.jsx`, `src/components/PublicRoute.jsx`, `src/App.jsx` |
| Recipe loading | Recipes are fetched from `db.json` through the mock API and stored in Redux. | `src/redux/recipesSlice.js`, `src/pages/HomePage.jsx`, `src/utils/axios.js` |
| Home page browsing | Recipes are shown in category rows, with a featured banner and search input. | `src/pages/HomePage.jsx`, `src/components/RecipeRow.jsx`, `src/components/RecipeCard.jsx` |
| Recipe details | The app reads the recipe id from the URL, finds that recipe in Redux, and shows ingredients, steps, save/delete actions. | `src/pages/RecipeDetailPage.jsx`, `src/redux/recipesSlice.js` |
| Saved cookbook | Users can save and unsave recipes, then see their saved recipes on a dedicated page. | `src/pages/SavedPage.jsx`, `src/pages/RecipeDetailPage.jsx`, `src/redux/recipesSlice.js` |
| Add recipe | A controlled form collects recipe data, converts multi-line text into arrays, dispatches a Redux thunk, and navigates home. | `src/pages/AddRecipePage.jsx`, `src/redux/recipesSlice.js` |
| Styling | Global classes style pages, cards, buttons, forms, rows, loading messages, and errors. | `src/index.css` |

## Core React Concepts Covered

### Components and Props

React components split the UI into reusable pieces.

Used in:

| File | How it is used |
|---|---|
| `src/components/RecipeCard.jsx` | Receives a `recipe` prop and renders one clickable card. |
| `src/components/RecipeRow.jsx` | Receives `title` and `recipes` props, then maps recipes into `RecipeCard` components. |
| `src/components/Navbar.jsx` | Renders different nav links depending on whether a user exists. |

Key pattern:

```jsx
const RecipeRow = ({ title, recipes }) => {
  return recipes.map(recipe => (
    <RecipeCard key={recipe.id} recipe={recipe} />
  ));
};
```

### State with `useState`

`useState` stores local component state: values that belong to one component, not the whole app.

Used in:

| File | State |
|---|---|
| `src/pages/HomePage.jsx` | `search` stores the current search input. |
| `src/pages/AddRecipePage.jsx` | `form` stores all add-recipe form values. |
| `src/pages/LoginPage.jsx` | Form state for email/password. |
| `src/pages/RegisterPage.jsx` | Form state for name/email/password. |
| `src/pages/RecipeDetailPage.jsx` | `isSaving` prevents duplicate save/unsave clicks. |

Key pattern:

```jsx
const [search, setSearch] = useState('');

<input
  value={search}
  onChange={e => setSearch(e.target.value)}
/>
```

### Controlled Forms

A controlled form means the input value comes from React state, and every change updates that state.

Used in:

| File | How it is used |
|---|---|
| `src/pages/LoginPage.jsx` | User enters email and password, then calls `login`. |
| `src/pages/RegisterPage.jsx` | User enters account details, then calls `register`. |
| `src/pages/AddRecipePage.jsx` | User creates a recipe; ingredients and steps are split by new lines. |

Key pattern from `AddRecipePage.jsx`:

```jsx
const [form, setForm] = useState({
  title: '',
  category: 'Italian',
  description: '',
  cookTime: '',
  servings: '',
  ingredients: '',
  steps: '',
});

const field = (key) => (e) =>
  setForm(f => ({ ...f, [key]: e.target.value }));
```

### Side Effects with `useEffect`

`useEffect` runs code after render. In this app, it is mainly used for fetching data and starting/stopping the featured banner timer.

Used in:

| File | Effect |
|---|---|
| `src/pages/HomePage.jsx` | Fetches recipes and saved recipes when the page loads. |
| `src/pages/HomePage.jsx` | Advances the featured recipe on an interval. |
| `src/pages/RecipeDetailPage.jsx` | Fetches recipes/saved recipes if the user opens a detail page first. |
| `src/pages/SavedPage.jsx` | Fetches recipes/saved recipes before building the saved cookbook list. |

Common fetch pattern:

```jsx
useEffect(() => {
  if (status === 'idle') dispatch(fetchRecipes());
}, [dispatch, status]);
```

Timer cleanup pattern:

```jsx
useEffect(() => {
  const intervalId = setInterval(() => {
    dispatch(advanceFeaturedRecipe());
  }, 5000);

  return () => clearInterval(intervalId);
}, [dispatch]);
```

### Context API and `useReducer`

Context is used for authentication because many components need the current user, login, logout, and register functions.

Used in:

| File | How it is used |
|---|---|
| `src/context/AuthContext.jsx` | Creates `AuthContext`, stores auth state with `useReducer`, exposes `useAuth`. |
| `src/components/Navbar.jsx` | Reads `user` and `logout`. |
| `src/components/PrivateRoute.jsx` | Reads `user` to protect private routes. |
| `src/components/PublicRoute.jsx` | Reads `user` to redirect logged-in users away from login/register. |
| `src/pages/LoginPage.jsx` | Calls `login`. |
| `src/pages/RegisterPage.jsx` | Calls `register`. |

Reducer actions:

| Action | Meaning |
|---|---|
| `LOADING` | Auth request started. |
| `LOGIN` | User successfully logged in or registered. |
| `LOGOUT` | User logged out and `localStorage` is cleared. |
| `ERROR` | Login/register failed. |

Key pattern:

```jsx
const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);
```

### Redux Toolkit

Redux stores shared recipe data that multiple pages need: all recipes, saved recipes, loading statuses, and featured banner state.

Used in:

| File | How it is used |
|---|---|
| `src/redux/store.js` | Creates the Redux store with `configureStore`. |
| `src/redux/recipesSlice.js` | Defines async thunks, reducers, extra reducers, and selectors. |
| `src/App.jsx` | Wraps the app in Redux `Provider`. |
| `src/pages/HomePage.jsx` | Reads recipes/status and dispatches fetch/banner actions. |
| `src/pages/RecipeDetailPage.jsx` | Reads one recipe, saved entries, and dispatches save/delete actions. |
| `src/pages/SavedPage.jsx` | Reads recipes and saved entries to derive saved recipes. |
| `src/pages/AddRecipePage.jsx` | Dispatches `addRecipe`. |

Main thunks in `src/redux/recipesSlice.js`:

| Thunk | API action |
|---|---|
| `fetchRecipes` | `GET /recipes` |
| `addRecipe` | `POST /recipes` |
| `deleteRecipe` | `DELETE /recipes/:id` |
| `fetchSaved` | `GET /saved?userId=:userId` |
| `saveRecipe` | `POST /saved` |
| `unsaveRecipe` | `DELETE /saved/:id` |

Key Redux Toolkit pattern:

```js
export const fetchRecipes = createAsyncThunk('recipes/fetchAll', async () => {
  const res = await api.get('/recipes');
  return res.data;
});

const recipesSlice = createSlice({
  name: 'recipes',
  initialState,
  reducers: {
    advanceFeaturedRecipe: (state) => {
      state.featuredIndex = (state.featuredIndex + 1) % state.items.length;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchRecipes.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchRecipes.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.items = action.payload;
      })
      .addCase(fetchRecipes.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message;
      });
  },
});
```

### `useSelector` and `useDispatch`

React components connect to Redux with `useSelector` and `useDispatch`.

Used in:

| File | How it is used |
|---|---|
| `src/pages/HomePage.jsx` | Selects recipes/status/featured recipe and dispatches fetch + banner actions. |
| `src/pages/RecipeDetailPage.jsx` | Selects one recipe by id and dispatches save/unsave/delete. |
| `src/pages/SavedPage.jsx` | Selects recipes and saved entries. |
| `src/pages/AddRecipePage.jsx` | Dispatches `addRecipe`. |

Key pattern:

```jsx
const dispatch = useDispatch();
const recipes = useSelector(selectAllRecipes);

useEffect(() => {
  if (status === 'idle') dispatch(fetchRecipes());
}, [dispatch, status]);
```

### Selectors

Selectors are small functions that read data from Redux state. They keep components cleaner.

Defined in:

| Selector | Purpose |
|---|---|
| `selectAllRecipes` | Returns all recipes. |
| `selectSaved` | Returns saved recipe records. |
| `selectRecipeById` | Returns one recipe by URL id. |
| `selectFeaturedRecipe` | Returns the recipe currently shown in the banner. |
| `selectStatus` | Returns recipe loading status. |
| `selectSavedStatus` | Returns saved-recipes loading status. |

Factory selector pattern:

```js
export const selectRecipeById = (id) => (state) =>
  state.recipes.items.find(r => r.id === id);
```

Usage:

```jsx
const { id } = useParams();
const recipe = useSelector(selectRecipeById(id));
```

### React Router

React Router controls which page is shown for each URL.

Used in:

| File | How it is used |
|---|---|
| `src/App.jsx` | Defines all routes. |
| `src/components/PrivateRoute.jsx` | Uses `Outlet` and `Navigate` for protected routes. |
| `src/components/PublicRoute.jsx` | Uses `Outlet` and `Navigate` for login/register routes. |
| `src/components/Navbar.jsx` | Uses `Link` for navigation and `useNavigate` after logout. |
| `src/components/RecipeCard.jsx` | Uses `useNavigate` to open a recipe detail page. |
| `src/pages/RecipeDetailPage.jsx` | Uses `useParams` to read `:id` and `useNavigate` to go back/home. |
| `src/pages/AddRecipePage.jsx` | Uses `useNavigate` after adding a recipe. |

Protected route pattern:

```jsx
const PrivateRoute = () => {
  const { user } = useAuth();
  return user ? <Outlet /> : <Navigate to="/login" replace />;
};
```

Route setup pattern:

```jsx
<Route element={<PrivateRoute />}>
  <Route path="/" element={<HomePage />} />
  <Route path="/recipe/:id" element={<RecipeDetailPage />} />
  <Route path="/add" element={<AddRecipePage />} />
  <Route path="/saved" element={<SavedPage />} />
</Route>
```

### Conditional Rendering

Conditional rendering shows different UI based on data or state.

Used in:

| File | Example |
|---|---|
| `src/components/Navbar.jsx` | Only shows private nav links when `user` exists. |
| `src/pages/HomePage.jsx` | Shows loading/error states and search results vs category rows. |
| `src/pages/RecipeDetailPage.jsx` | Shows Save or Remove button text, and only shows Delete for the recipe owner. |
| `src/pages/SavedPage.jsx` | Shows loading, error, empty state, or saved recipe grid. |
| `src/components/RecipeRow.jsx` | Returns `null` if a category has no recipes. |

Examples:

```jsx
{status === 'loading' && <p>Loading...</p>}

{recipe.addedBy === user.id && (
  <button onClick={handleDelete}>Delete Recipe</button>
)}

{isSaved ? 'Remove from Cookbook' : 'Save to Cookbook'}
```

### Derived Data

Derived data is calculated from existing state instead of stored separately.

Used in:

| File | Derived value |
|---|---|
| `src/pages/HomePage.jsx` | `filtered` recipes are derived from `recipes` and `search`. |
| `src/pages/RecipeDetailPage.jsx` | `savedEntry` and `isSaved` are derived from `saved`, `id`, and `user.id`. |
| `src/pages/SavedPage.jsx` | `savedRecipes` is derived from all recipes plus saved records. |

Example:

```jsx
const savedRecipes = recipes.filter(recipe =>
  saved.some(entry => String(entry.recipeId) === String(recipe.id))
);
```

## API and Data Model

The mock database is `db.json`.

Main collections:

| Collection | Purpose |
|---|---|
| `users` | Login/register data. |
| `recipes` | Recipe cards, details, categories, ownership, featured flag. |
| `saved` | Join records connecting a `userId` to a `recipeId`. |

Axios is configured in `src/utils/axios.js`, so API calls can use short paths:

```js
api.get('/recipes');
api.post('/saved', { userId, recipeId });
```

## Exam Quick Reference

| Need to remember | Look at |
|---|---|
| `createSlice`, `createAsyncThunk`, `extraReducers` | `src/redux/recipesSlice.js` |
| Redux store setup | `src/redux/store.js` |
| Redux `Provider` | `src/App.jsx` |
| Context provider and custom hook | `src/context/AuthContext.jsx` |
| Protected routes with `Outlet` | `src/components/PrivateRoute.jsx`, `src/components/PublicRoute.jsx` |
| `useParams` | `src/pages/RecipeDetailPage.jsx` |
| `useNavigate` | `src/components/Navbar.jsx`, `src/components/RecipeCard.jsx`, `src/pages/AddRecipePage.jsx` |
| Controlled forms | `src/pages/LoginPage.jsx`, `src/pages/RegisterPage.jsx`, `src/pages/AddRecipePage.jsx` |
| Fetch-on-load `useEffect` | `src/pages/HomePage.jsx`, `src/pages/SavedPage.jsx`, `src/pages/RecipeDetailPage.jsx` |
| Conditional rendering | `src/pages/SavedPage.jsx`, `src/pages/RecipeDetailPage.jsx`, `src/components/Navbar.jsx` |
| Mapping arrays into components | `src/components/RecipeRow.jsx`, `src/pages/HomePage.jsx` |

## Useful Commands

```bash
npm start
npm run api
npm test
npm run build
```

## Study Notes

- Use Context for auth because the current user and auth functions are needed across the app.
- Use Redux for recipe data because recipes and saved entries are shared across multiple pages.
- Use `useState` for local form/search/button state.
- Use `useEffect` for API fetching and cleanup work like timers.
- Use selectors to keep components from knowing too much about the Redux state shape.
- Use React Router hooks when the URL or navigation matters: `useParams`, `useNavigate`, `Link`, `Navigate`, and `Outlet`.
- Keep derived data derived. For example, `isSaved` can be calculated from `saved`, `id`, and `user.id`; it does not need its own Redux field.
