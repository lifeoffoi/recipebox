import { Link } from 'react-router-dom';

const NotFoundPage = () => (
  <div className="not-found">
    <h2>404 — Page not found</h2>
    <p>The page you are looking for does not exist.</p>
    <Link to="/">Go back home</Link>
  </div>
);

export default NotFoundPage;
