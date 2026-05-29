import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../utils/axios';

export const fetchRecipes = createAsyncThunk('recipes/fetchAll', async () => {
  const res = await api.get('/recipes');
  return res.data;
});

export const addRecipe = createAsyncThunk('recipes/add', async (recipe) => {
  const res = await api.post('/recipes', { ...recipe, id: String(Date.now()) });
  return res.data;
});

export const deleteRecipe = createAsyncThunk('recipes/delete', async (id) => {
  await api.delete(`/recipes/${id}`);
  return id;
});

export const fetchSaved = createAsyncThunk('recipes/fetchSaved', async (userId) => {
  const res = await api.get(`/saved?userId=${userId}`);
  return res.data.filter(s => String(s.userId) === String(userId));
});

export const saveRecipe = createAsyncThunk('recipes/save', async ({ userId, recipeId }) => {
  const res = await api.post('/saved', { id: String(Date.now()), userId, recipeId });
  return res.data;
});

export const unsaveRecipe = createAsyncThunk('recipes/unsave', async (savedId) => {
  await api.delete(`/saved/${savedId}`);
  return savedId;
});

const recipesSlice = createSlice({
  name: 'recipes',
  initialState: {
    items: [],
    saved: [],
    featuredIndex: 0,
    status: 'idle',
    savedStatus: 'idle',
    error: null,
  },
  reducers: {
    advanceFeaturedRecipe: (state) => {
      if (state.items.length === 0) return;
      state.featuredIndex = (state.featuredIndex + 1) % state.items.length;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchRecipes.pending,   (state) => { state.status = 'loading'; })
      .addCase(fetchRecipes.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.items = action.payload;
        state.featuredIndex = 0;
      })
      .addCase(fetchRecipes.rejected,  (state, action) => { state.status = 'failed'; state.error = action.error.message; })
      .addCase(addRecipe.fulfilled,    (state, action) => { state.items.push(action.payload); })
      .addCase(deleteRecipe.fulfilled, (state, action) => { state.items = state.items.filter(r => r.id !== action.payload); })
      .addCase(fetchSaved.pending,     (state) => { state.savedStatus = 'loading'; })
      .addCase(fetchSaved.fulfilled,   (state, action) => { state.savedStatus = 'succeeded'; state.saved = action.payload; })
      .addCase(fetchSaved.rejected,    (state) => { state.savedStatus = 'failed'; })
      .addCase(saveRecipe.fulfilled,   (state, action) => { state.saved.push(action.payload); })
      .addCase(unsaveRecipe.fulfilled, (state, action) => { state.saved = state.saved.filter(s => s.id !== action.payload); });
  },
});

export const { advanceFeaturedRecipe } = recipesSlice.actions;

export default recipesSlice.reducer;

// Selectors
export const selectAllRecipes  = (state) => state.recipes.items;
export const selectSaved       = (state) => state.recipes.saved;
export const selectRecipeById  = (id)    => (state) => state.recipes.items.find(r => r.id === id);
export const selectFeaturedRecipe = (state) => {
  const recipes = state.recipes.items;
  if (recipes.length === 0) return null;
  return recipes[state.recipes.featuredIndex % recipes.length];
};
export const selectStatus      = (state) => state.recipes.status;
export const selectSavedStatus = (state) => state.recipes.savedStatus;
