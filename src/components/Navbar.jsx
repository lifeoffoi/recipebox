import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <Link to="/" className="navbar-brand">RecipeBox</Link>
      {user && (
        <>
          <Link to="/">Home</Link>
          <Link to="/saved">My Cookbook</Link>
          <Link to="/add">Add Recipe</Link>
          <span className="navbar-user" style={{ marginLeft: 'auto' }}>Hello, {user.name}</span>
          <button onClick={handleLogout}>Logout</button>
        </>
      )}
    </nav>
  );
};

export default Navbar;
