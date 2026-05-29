import { act, render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { configureStore } from '@reduxjs/toolkit';
import App from './App';
import { store as appStore } from './redux/store';
import recipesReducer, {
  addRecipe,
  deleteRecipe,
  fetchRecipes,
  fetchSaved,
  resetRecipesState,
  saveRecipe,
  unsaveRecipe,
} from './redux/recipesSlice';
import api from './utils/axios';

jest.mock('./utils/axios', () => ({
  get: jest.fn(),
  post: jest.fn(),
  delete: jest.fn(),
}));

const user = {
  id: '1',
  name: 'Janice',
  email: 'janice@email.com',
  password: 'password123',
};

const recipes = [
  {
    id: '1',
    title: 'Spaghetti Carbonara',
    category: 'Italian',
    description: 'A classic Roman pasta dish.',
    cookTime: '30 mins',
    servings: 2,
    ingredients: ['spaghetti', 'eggs', 'parmesan'],
    steps: ['Cook pasta.', 'Mix sauce.'],
    featured: true,
    addedBy: '1',
  },
  {
    id: '2',
    title: 'Chicken Tikka Masala',
    category: 'Asian',
    description: 'Tender chicken in a creamy curry sauce.',
    cookTime: '45 mins',
    servings: 4,
    ingredients: ['chicken', 'yogurt', 'tomatoes'],
    steps: ['Marinate chicken.', 'Simmer sauce.'],
    featured: false,
    addedBy: '2',
  },
];

const saved = [{ id: 'saved-1', userId: '1', recipeId: '1' }];

function mockHappyApi() {
  api.get.mockImplementation((url) => {
    if (url === '/recipes') return Promise.resolve({ data: recipes });
    if (url === '/saved?userId=1') return Promise.resolve({ data: saved });
    if (url === '/users?email=janice@email.com&password=password123') {
      return Promise.resolve({ data: [user] });
    }
    if (url === '/users?email=new@email.com') return Promise.resolve({ data: [] });
    return Promise.resolve({ data: [] });
  });

  api.post.mockImplementation((url, body) => {
    if (url === '/users') return Promise.resolve({ data: { id: '3', ...body } });
    if (url === '/recipes') return Promise.resolve({ data: body });
    if (url === '/saved') return Promise.resolve({ data: body });
    return Promise.resolve({ data: body });
  });

  api.delete.mockResolvedValue({ data: {} });
}

function renderAppAt(path = '/') {
  window.history.pushState({}, 'Test page', path);
  return render(<App />);
}

async function clickAndFlush(element) {
  await act(async () => {
    userEvent.click(element);
  });
}

beforeEach(() => {
  jest.clearAllMocks();
  localStorage.clear();
  appStore.dispatch(resetRecipesState());
  mockHappyApi();
});

test('protects private routes, logs in, loads recipes, and searches recipes', async () => {
  renderAppAt('/');

  expect(await screen.findByRole('heading', { name: /sign in/i })).toBeInTheDocument();

  await userEvent.type(screen.getByPlaceholderText(/email/i), user.email);
  await userEvent.type(screen.getByPlaceholderText(/password/i), user.password);
  await clickAndFlush(screen.getByRole('button', { name: /sign in/i }));

  expect(await screen.findByText(/hello, janice/i)).toBeInTheDocument();
  expect(await screen.findByRole('heading', { name: 'Spaghetti Carbonara', level: 2 })).toBeInTheDocument();
  expect(screen.getByRole('heading', { name: /italian/i })).toBeInTheDocument();
  expect(screen.getByRole('heading', { name: /asian/i })).toBeInTheDocument();

  await userEvent.type(screen.getByPlaceholderText(/search recipes/i), 'tikka');

  expect(screen.getByRole('heading', { name: /results for "tikka"/i })).toBeInTheDocument();
  expect(screen.getByText('Chicken Tikka Masala')).toBeInTheDocument();
  expect(screen.queryByRole('heading', { name: 'Spaghetti Carbonara', level: 4 })).not.toBeInTheDocument();
  expect(api.get).toHaveBeenCalledWith('/users?email=janice@email.com&password=password123');
  expect(api.get).toHaveBeenCalledWith('/recipes');
  expect(api.get).toHaveBeenCalledWith('/saved?userId=1');
});

test('registers a new user through the users endpoint and shows the private home', async () => {
  renderAppAt('/register');

  await userEvent.type(screen.getByPlaceholderText(/name/i), 'New Cook');
  await userEvent.type(screen.getByPlaceholderText(/email/i), 'new@email.com');
  await userEvent.type(screen.getByPlaceholderText(/password/i), 'secret123');
  await clickAndFlush(screen.getByRole('button', { name: /create account/i }));

  expect(await screen.findByText(/hello, new cook/i)).toBeInTheDocument();
  expect(api.get).toHaveBeenCalledWith('/users?email=new@email.com');
  expect(api.post).toHaveBeenCalledWith('/users', {
    name: 'New Cook',
    email: 'new@email.com',
    password: 'secret123',
  });
});

test('shows login and registration errors from failed auth endpoint checks', async () => {
  api.get.mockResolvedValueOnce({ data: [] });
  const { unmount } = renderAppAt('/login');

  await userEvent.type(screen.getByPlaceholderText(/email/i), 'bad@email.com');
  await userEvent.type(screen.getByPlaceholderText(/password/i), 'wrong');
  await clickAndFlush(screen.getByRole('button', { name: /sign in/i }));

  expect(await screen.findByText(/invalid email or password/i)).toBeInTheDocument();
  unmount();

  api.get.mockResolvedValueOnce({ data: [user] });
  renderAppAt('/register');

  await userEvent.type(screen.getByPlaceholderText(/name/i), 'Janice');
  await userEvent.type(screen.getByPlaceholderText(/email/i), user.email);
  await userEvent.type(screen.getByPlaceholderText(/password/i), user.password);
  await clickAndFlush(screen.getByRole('button', { name: /create account/i }));

  expect(await screen.findByText(/email already exists/i)).toBeInTheDocument();
});

test('opens recipe details, saves, unsaves, deletes own recipes, and logs out', async () => {
  renderAppAt('/');

  await userEvent.type(await screen.findByPlaceholderText(/email/i), user.email);
  await userEvent.type(screen.getByPlaceholderText(/password/i), user.password);
  await clickAndFlush(screen.getByRole('button', { name: /sign in/i }));

  await userEvent.click(await screen.findByText('Chicken Tikka Masala'));

  expect(await screen.findByRole('heading', { name: 'Chicken Tikka Masala' })).toBeInTheDocument();
  expect(screen.getByText('chicken')).toBeInTheDocument();

  await userEvent.click(screen.getByRole('button', { name: /save to cookbook/i }));
  await waitFor(() => expect(api.post).toHaveBeenCalledWith('/saved', expect.objectContaining({
    userId: '1',
    recipeId: '2',
  })));

  await userEvent.click(await screen.findByRole('button', { name: /remove from cookbook/i }));
  await waitFor(() => expect(api.delete).toHaveBeenCalledWith(expect.stringMatching(/^\/saved\//)));

  await userEvent.click(screen.getByRole('button', { name: /back/i }));
  await userEvent.click(await screen.findByRole('heading', { name: 'Spaghetti Carbonara', level: 4 }));
  await userEvent.click(await screen.findByRole('button', { name: /delete recipe/i }));

  await waitFor(() => expect(api.delete).toHaveBeenCalledWith('/recipes/1'));
  expect(await screen.findByPlaceholderText(/search recipes/i)).toBeInTheDocument();

  await userEvent.click(screen.getByRole('button', { name: /logout/i }));
  expect(await screen.findByRole('heading', { name: /sign in/i })).toBeInTheDocument();
});

test('shows the saved cookbook page from saved and recipes endpoints', async () => {
  renderAppAt('/');

  await userEvent.type(await screen.findByPlaceholderText(/email/i), user.email);
  await userEvent.type(screen.getByPlaceholderText(/password/i), user.password);
  await clickAndFlush(screen.getByRole('button', { name: /sign in/i }));
  await userEvent.click(await screen.findByRole('link', { name: /my cookbook/i }));

  const savedPage = await screen.findByRole('heading', { name: /my cookbook/i });
  expect(savedPage).toBeInTheDocument();
  expect(screen.getByText('Spaghetti Carbonara')).toBeInTheDocument();
  expect(screen.queryByText('Chicken Tikka Masala')).not.toBeInTheDocument();
});

test('adds a recipe through the recipe endpoint from the controlled form', async () => {
  jest.spyOn(Date, 'now').mockReturnValue(123456);

  renderAppAt('/');

  await userEvent.type(await screen.findByPlaceholderText(/email/i), user.email);
  await userEvent.type(screen.getByPlaceholderText(/password/i), user.password);
  await clickAndFlush(screen.getByRole('button', { name: /sign in/i }));
  await userEvent.click(await screen.findByRole('link', { name: /add recipe/i }));

  await userEvent.type(screen.getByPlaceholderText(/spaghetti carbonara/i), 'Garlic Rice');
  await userEvent.type(screen.getByPlaceholderText(/short description/i), 'Buttery rice with garlic.');
  await userEvent.type(screen.getByPlaceholderText(/30 mins/i), '15 mins');
  await userEvent.type(screen.getByPlaceholderText(/4/i), '2');
  await userEvent.type(within(screen.getByText(/ingredients/i).closest('.form-group')).getByRole('textbox'), 'rice\ngarlic');
  await userEvent.type(within(screen.getByText(/steps/i).closest('.form-group')).getByRole('textbox'), 'Cook rice\nAdd garlic');
  await userEvent.click(screen.getByRole('button', { name: /add recipe/i }));

  await waitFor(() => expect(api.post).toHaveBeenCalledWith('/recipes', {
    id: '123456',
    title: 'Garlic Rice',
    category: 'Italian',
    description: 'Buttery rice with garlic.',
    cookTime: '15 mins',
    servings: 2,
    ingredients: ['rice', 'garlic'],
    steps: ['Cook rice', 'Add garlic'],
    featured: false,
    addedBy: '1',
  }));

  Date.now.mockRestore();
});

test('recipe thunks call every recipe and saved endpoint and update redux state', async () => {
  jest.spyOn(Date, 'now').mockReturnValue(999);
  const store = configureStore({ reducer: { recipes: recipesReducer } });
  const newRecipe = {
    title: 'Berry Tart',
    category: 'Desserts',
    description: 'Bright and sweet.',
    cookTime: '35 mins',
    servings: 8,
    ingredients: ['berries'],
    steps: ['Bake shell'],
    featured: false,
    addedBy: '1',
  };

  await store.dispatch(fetchRecipes());
  expect(api.get).toHaveBeenCalledWith('/recipes');
  expect(store.getState().recipes.items).toHaveLength(2);

  await store.dispatch(addRecipe(newRecipe));
  expect(api.post).toHaveBeenCalledWith('/recipes', { ...newRecipe, id: '999' });
  expect(store.getState().recipes.items).toEqual(expect.arrayContaining([
    expect.objectContaining({ title: 'Berry Tart' }),
  ]));

  await store.dispatch(deleteRecipe('999'));
  expect(api.delete).toHaveBeenCalledWith('/recipes/999');
  expect(store.getState().recipes.items).not.toEqual(expect.arrayContaining([
    expect.objectContaining({ id: '999' }),
  ]));

  await store.dispatch(fetchSaved('1'));
  expect(api.get).toHaveBeenCalledWith('/saved?userId=1');
  expect(store.getState().recipes.saved).toEqual(saved);

  await store.dispatch(saveRecipe({ userId: '1', recipeId: '2' }));
  expect(api.post).toHaveBeenCalledWith('/saved', { id: '999', userId: '1', recipeId: '2' });
  expect(store.getState().recipes.saved).toEqual(expect.arrayContaining([
    expect.objectContaining({ recipeId: '2' }),
  ]));

  await store.dispatch(unsaveRecipe('saved-1'));
  expect(api.delete).toHaveBeenCalledWith('/saved/saved-1');
  expect(store.getState().recipes.saved).not.toEqual(expect.arrayContaining([
    expect.objectContaining({ id: 'saved-1' }),
  ]));

  Date.now.mockRestore();
});
