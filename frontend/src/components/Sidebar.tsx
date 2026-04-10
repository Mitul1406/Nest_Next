'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';

const NavIcon = ({ path }: { path: string }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    {path === 'dashboard' && <>
      <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
      <rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>
    </>}
    {path === 'expenses' && (
  <>
    <path d="M4 4h12" />
    <path d="M4 8h12" />
    <path d="M6 4c4 0 6 2 6 4s-2 4-6 4h-2" />
    <path d="M6 12l6 8" />
  </>
)}
    {path === 'budgets' && <>
      <circle cx="12" cy="12" r="10"/>
      <path d="M12 6v6l4 2"/>
    </>}
    {path === 'reports' && <>
      <line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/>
      <line x1="6" y1="20" x2="6" y2="14"/>
    </>}
  </svg>
);

const LogoutIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
    <polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>
  </svg>
);

export default function Sidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  const navItems = [
    { href: '/dashboard', label: 'Dashboard', icon: 'dashboard' },
    { href: '/expenses', label: 'Expenses', icon: 'expenses' },
    { href: '/budgets', label: 'Budgets', icon: 'budgets' },
    { href: '/reports', label: 'Reports', icon: 'reports' },
  ];

  const initials = user?.name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || 'U';

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <h1>Expen<span>sio</span></h1>
        <p>Finance Tracker</p>
      </div>

      <nav className="sidebar-nav">
        <div className="nav-section-label">Menu</div>
        {navItems.map(item => (
          <Link
            key={item.href}
            href={item.href}
            className={`nav-item ${pathname.startsWith(item.href) ? 'active' : ''}`}
          >
            <NavIcon path={item.icon} />
            {item.label}
          </Link>
        ))}
      </nav>

      <div className="sidebar-user">
        <div className="user-card">
          <div className="user-avatar">{initials}</div>
          <div className="user-info">
            <div className="user-name">{user?.name || 'User'}</div>
            <div className="user-email">{user?.email || ''}</div>
          </div>
          <button className="logout-btn" onClick={logout} title="Sign out">
            <LogoutIcon />
          </button>
        </div>
      </div>
    </aside>
  );
}
