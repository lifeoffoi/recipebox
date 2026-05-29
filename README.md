# RecipeBox — React Exam Prep Reference

A recipe discovery app built with Create React App, Redux Toolkit, Context API, and React Router.
Mirrors the professor's movies-app patterns applied to a new domain.

---

## Table of Contents

1. [How to Run](#how-to-run)
2. [Project Structure](#project-structure)
3. [Test Accounts](#test-accounts)
4. [Context API + useReducer (Auth)](#context-api--usereducer-auth)
5. [Redux — createSlice + createAsyncThunk](#redux--createslice--createasyncthunk)
6. [useSelector + useDispatch in a Component](#useselector--usedispatch-in-a-component)
7. [React Router — PrivateRoute + PublicRoute with Outlet](#react-router--privateroute--publicroute-with-outlet)
8. [Selectors](#selectors)
9. [Controlled Forms](#controlled-forms)
10. [useEffect Patterns](#useeffect-patterns)
11. [Conditional Rendering](#conditional-rendering)
12. [Key Files Quick Reference](#key-files-quick-reference)

---

## How to Run

```bash
# Terminal 1 — API
npm run api       # json-server on port 3001

# Terminal 2 — App
npm start         # React app on port 3000
```

---

## Project Structure

```
src/
  context/
    AuthContext.js      # Context API + useReducer — login, register, logout
  redux/
    store.js            # configureStore
    recipesSlice.js     # createSlice, createAsyncThunk, selectors
  components/
    Navbar.js           # useAuth + useNavigate
    RecipeCard.js       # Clickable card, useNavigate to detail page
    RecipeRow.js        # Horizontal scroll row per category (like movies-app Row)
    PrivateRoute.js     # Outlet — redirects to /login if not logged in
    PublicRoute.js      # Outlet — redirects to / if already logged in
  pages/
    LoginPage.js        # Controlled form, calls login() from context
    RegisterPage.js     # Controlled form, calls register() from context
    HomePage.js         # Hero banner + category rows + search
    RecipeDetailPage.js # useParams, save/unsave, delete, ingredients, steps
    AddRecipePage.js    # Controlled form, dispatches addRecipe thunk
    SavedPage.js        # Filters Redux state to show only saved recipes
    NotFoundPage.js     # Catch-all 404 page
  utils/
    axios.js            # Axios instance with baseURL
db.json                 # Mock database — users, recipes, saved
```

---

## Test Accounts

| Email | Password |
|---|---|
| janice@email.com | password123 |
| spencer@email.com | password123 |

---

## Context API + useReducer (Auth)

This is the professor's pattern from movies-app — Context for auth, Redux for data.

```js
// 1. Reducer — handles state transitions
function authReducer(state, action) {
  switch (action.type) {
    case 'LOADING':
      return { ...state, status: 'loading', error: null };
    case 'LOGIN':
      localStorage.setItem('rb_user', JSON.stringify(action.payload));
      return { ...state, user: action.payload, status: 'succeeded' };
    case 'LOGOUT':
      localStorage.removeItem('rb_user');
      return { ...state, user: null, status: 'idle' };
    case 'ERROR':
      return { ...state, status: 'failed', error: action.payload };
    default:
      return state;
  }
}

// 2. Provider — wraps the app, exposes login/register/logout functions
export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  const login = async (email, password) => {
    dispatch({ type: 'LOADING' });
    try {
      const res = await api.get(`/users?email=${email}&password=${password}`);
      if (res.data.length === 0) throw new Error('Invalid email or password');
      dispatch({ type: 'LOGIN', payload: res.data[0] });
      return true;
    } catch (err) {
      dispatch({ type: 'ERROR', payload: err.message });
      return false;
    }
  };

  const logout = () => dispatch({ type: 'LOGOUT' });

  return (
    <AuthContext.Provider value={{ ...state, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

// 3. Custom hook — consume context anywhere
export const useAuth = () => useContext(AuthContext);

// 4. Usage in a component
const { user, login, logout, status, error } = useAuth();
```

---

## Redux — createSlice + createAsyncThunk

```js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

// Async thunk — handles API call, auto-dispatches pending/fulfilled/rejected
export const fetchRecipes = createAsyncThunk('recipes/fetchAll', async () => {
  const res = await api.get('/recipes');
  return res.data; // becomes action.payload in fulfilled
});

export const addRecipe = createAsyncThunk('recipes/add', async (recipe) => {
  const res = await api.post('/recipes', recipe);
  return res.data;
});

const recipesSlice = createSlice({
  name: 'recipes',
  initialState: { items: [], saved: [], status: 'idle', error: null },
  reducers: {}, // sync actions go here
  extraReducers: (builder) => {
    builder
      .addCase(fetchRecipes.pending,   (state) => { state.status = 'loading'; })
      .addCase(fetchRecipes.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.items  = action.payload;
      })
      .addCase(fetchRecipes.rejected,  (state, action) => {
        state.status = 'failed';
        state.error  = action.error.message;
      })
      .addCase(addRecipe.fulfilled, (state, action) => {
        state.items.push(action.payload);
      });
  },
});

export default recipesSlice.reducer;
```

Store setup:
```js
import { configureStore } from '@reduxjs/toolkit';
import recipesReducer from './recipesSlice';

export const store = configureStore({
  reducer: { recipes: recipesReducer },
});
```

Provider in index.js / App.js:
```jsx
<Provider store={store}>
  <App />
</Provider>
```

---

## useSelector + useDispatch in a Component

```jsx
import { useDispatch, useSelector } from 'react-redux';
import { fetchRecipes, selectAllRecipes, selectStatus } from '../redux/recipesSlice';

const HomePage = () => {
  const dispatch = useDispatch();
  const recipes  = useSelector(selectAllRecipes); // reads from Redux state
  const status   = useSelector(selectStatus);

  useEffect(() => {
    if (status === 'idle') dispatch(fetchRecipes()); // only fetch if not already loaded
  }, [dispatch, status]);
};
```

---

## React Router — PrivateRoute + PublicRoute with Outlet

**App.js — route setup:**
```jsx
<BrowserRouter>
  <Navbar />
  <Routes>
    <Route element={<PublicRoute />}>
      <Route path="/login"    element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
    </Route>

    <Route element={<PrivateRoute />}>
      <Route path="/"           element={<HomePage />} />
      <Route path="/recipe/:id" element={<RecipeDetailPage />} />
    </Route>

    <Route path="*" element={<NotFoundPage />} />
  </Routes>
</BrowserRouter>
```

**PrivateRoute.js:**
```jsx
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const PrivateRoute = () => {
  const { user } = useAuth();
  return user ? <Outlet /> : <Navigate to="/login" replace />;
};
```

**PublicRoute.js:**
```jsx
const PublicRoute = () => {
  const { user } = useAuth();
  return user ? <Navigate to="/" replace /> : <Outlet />;
};
```

**useNavigate and useParams:**
```jsx
const navigate = useNavigate();
navigate('/');                 // go to home
navigate(`/recipe/${id}`);    // go to detail page

const { id } = useParams();   // read :id from the URL
```

---

## Selectors

Defined in the slice, used with useSelector:

```js
// Simple selectors — plain functions
export const selectAllRecipes = (state) => state.recipes.items;
export const selectSaved      = (state) => state.recipes.saved;
export const selectStatus     = (state) => state.recipes.status;

// Factory selector — returns a function (used when you need a parameter)
export const selectRecipeById = (id) => (state) =>
  state.recipes.items.find(r => r.id === id);

// Usage
const recipes = useSelector(selectAllRecipes);
const recipe  = useSelector(selectRecipeById(id));
```

---

## Controlled Forms

Every input is driven by state. onChange updates state on every keystroke.

```jsx
const [form, setForm] = useState({ title: '', category: 'Italian', description: '' });

// Generic field updater — avoids writing a separate handler for every field
const field = (key) => (e) => setForm(f => ({ ...f, [key]: e.target.value }));

const handleSubmit = async (e) => {
  e.preventDefault();
  await dispatch(addRecipe({ ...form, addedBy: user.id }));
  navigate('/');
};

<form onSubmit={handleSubmit}>
  <input value={form.title} onChange={field('title')} required />
  <select value={form.category} onChange={field('category')}>
    <option value="Italian">Italian</option>
    <option value="Asian">Asian</option>
  </select>
  <button type="submit">Add Recipe</button>
</form>
```

---

## useEffect Patterns

**Fetch once on mount (when status is idle):**
```jsx
useEffect(() => {
  if (status === 'idle') dispatch(fetchRecipes());
}, [dispatch, status]);
```

**Fetch when a value changes:**
```jsx
useEffect(() => {
  dispatch(fetchSaved(user.id));
}, [dispatch, user.id]);
```

**Two separate effects — do NOT combine unrelated fetches into one:**
```jsx
// Wrong — fetchSaved fires every time status changes
useEffect(() => {
  if (status === 'idle') dispatch(fetchRecipes());
  dispatch(fetchSaved(user.id));
}, [dispatch, status, user.id]);

// Correct — each effect has its own concern
useEffect(() => {
  if (status === 'idle') dispatch(fetchRecipes());
}, [dispatch, status]);

useEffect(() => {
  dispatch(fetchSaved(user.id));
}, [dispatch, user.id]);
```

---

## Conditional Rendering

```jsx
// Show loading text
{status === 'loading' && <p>Loading...</p>}

// Show error
{status === 'failed' && <p style={{ color: 'red' }}>Error loading recipes.</p>}

// Show component only if data exists
{featured && <Banner recipe={featured} />}

// Ternary — one of two things
{isSaved ? 'Remove from Cookbook' : 'Save to Cookbook'}

// Only show delete button to the recipe's author
{recipe.addedBy === user.id && (
  <button onClick={handleDelete}>Delete</button>
)}

// Search results vs category rows
{search
  ? <RecipeRow title="Results" recipes={filtered} />
  : CATEGORIES.map(cat => <RecipeRow key={cat} title={cat} recipes={...} />)
}
```

---

## Key Files Quick Reference

| File | What to look at |
|---|---|
| `src/context/AuthContext.js` | useReducer, LOGIN/LOGOUT/ERROR actions, localStorage, useContext |
| `src/redux/recipesSlice.js` | createAsyncThunk, extraReducers, all three status cases, selectors |
| `src/redux/store.js` | configureStore |
| `src/App.js` | Full routing setup, Provider, AuthProvider, PublicRoute, PrivateRoute |
| `src/components/PrivateRoute.js` | Outlet pattern — the professor's exact approach |
| `src/pages/HomePage.js` | Two separate useEffects, useSelector, hero banner, category rows, search |
| `src/pages/RecipeDetailPage.js` | useParams, derived state (isSaved), conditional delete button |
| `src/pages/AddRecipePage.js` | Controlled form with field helper, textarea split into array |

Good luck.
