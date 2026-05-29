import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Provider } from 'react-redux';
import { store } from './redux/store';
import { AuthProvider } from './context/AuthContext';
import Navbar       from './components/Navbar';
import PrivateRoute from './components/PrivateRoute';
import PublicRoute  from './components/PublicRoute';
import LoginPage       from './pages/LoginPage';
import RegisterPage    from './pages/RegisterPage';
import HomePage        from './pages/HomePage';
import RecipeDetailPage from './pages/RecipeDetailPage';
import AddRecipePage   from './pages/AddRecipePage';
import SavedPage       from './pages/SavedPage';
import NotFoundPage    from './pages/NotFoundPage';

function App() {
  return (
    <Provider store={store}>
      <AuthProvider>
        <BrowserRouter>
          <Navbar />
          <Routes>
            {/* Public routes — redirect to / if already logged in */}
            <Route element={<PublicRoute />}>
              <Route path="/login"    element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
            </Route>

            {/* Private routes — redirect to /login if not logged in */}
            <Route element={<PrivateRoute />}>
              <Route path="/"             element={<HomePage />} />
              <Route path="/recipe/:id"   element={<RecipeDetailPage />} />
              <Route path="/add"          element={<AddRecipePage />} />
              <Route path="/saved"        element={<SavedPage />} />
            </Route>
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </Provider>
  );
}

export default App;
