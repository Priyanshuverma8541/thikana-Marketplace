import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Layout({ children }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="layout">
      <aside className="sidebar">
        <div className="logo"><span className="dot"></span>Thikana Admin</div>
        <nav>
          <NavLink to="/" end className={({ isActive }) => (isActive ? 'active' : '')}>Dashboard</NavLink>
          <NavLink to="/listings" className={({ isActive }) => (isActive ? 'active' : '')}>Listings</NavLink>
          <NavLink to="/users" className={({ isActive }) => (isActive ? 'active' : '')}>Users</NavLink>
          <NavLink to="/categories" className={({ isActive }) => (isActive ? 'active' : '')}>Categories</NavLink>
        </nav>
        <div className="logout">
          <p style={{ fontSize: 12, color: 'var(--paper-dim)', marginBottom: 10 }}>{user?.name}</p>
          <button className="btn btn-outline" style={{ width: '100%' }} onClick={() => { logout(); navigate('/login'); }}>Log out</button>
        </div>
      </aside>
      <main className="main">{children}</main>
    </div>
  );
}
