import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <header>
      <div className="nav">
        <Link to="/" className="logo"><span className="dot"></span>Thikana</Link>
        <div className="nav-actions">
          {user ? (
            <>
              {user.role?.includes('seller') && (
                <Link to="/dashboard" className="btn btn-outline">Dashboard</Link>
              )}
              {!user.role?.includes('seller') && (
                <Link to="/become-seller" className="btn btn-primary">+ Start selling</Link>
              )}
              <button className="btn btn-outline" onClick={() => { logout(); navigate('/'); }}>Log out</button>
            </>
          ) : (
            <>
              <Link to="/login" className="btn btn-outline">Log in</Link>
              <Link to="/register" className="btn btn-primary">Sign up</Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
