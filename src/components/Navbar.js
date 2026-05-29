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
    <nav style={{ display: 'flex', gap: '1rem', padding: '1rem', background: '#1a1a2e', color: '#fff', alignItems: 'center' }}>
      <Link to="/" style={{ color: '#e50914', fontWeight: 'bold', fontSize: '1.2rem', textDecoration: 'none' }}>RecipeBox</Link>
      {user && (
        <>
          <Link to="/" style={{ color: '#fff', textDecoration: 'none' }}>Home</Link>
          <Link to="/saved" style={{ color: '#fff', textDecoration: 'none' }}>My Cookbook</Link>
          <Link to="/add" style={{ color: '#fff', textDecoration: 'none' }}>Add Recipe</Link>
          <span style={{ marginLeft: 'auto' }}>Hello, {user.name}</span>
          <button onClick={handleLogout}>Logout</button>
        </>
      )}
    </nav>
  );
};

export default Navbar;
