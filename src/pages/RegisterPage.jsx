import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const RegisterPage = () => {
  const [name, setName]         = useState('');
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const { register, status, error } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const ok = await register(name, email, password);
    if (ok) navigate('/');
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2>Create Account</h2>
        {error && <p className="error-text">{error}</p>}
        <form onSubmit={handleSubmit} className="auth-form">
          <input type="text"     placeholder="Name"     value={name}     onChange={e => setName(e.target.value)}     required />
          <input type="email"    placeholder="Email"    value={email}    onChange={e => setEmail(e.target.value)}    required />
          <input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} required />
          <button type="submit" disabled={status === 'loading'}>
            {status === 'loading' ? 'Creating...' : 'Create Account'}
          </button>
        </form>
        <p className="auth-switch">Have an account? <Link to="/login">Sign in</Link></p>
      </div>
    </div>
  );
};

export default RegisterPage;
