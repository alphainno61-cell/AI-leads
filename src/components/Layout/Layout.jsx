import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import './Layout.css';

// Import icons (using Unicode symbols for now, can be replaced with icon library)
const Icons = {
    Dashboard: '📊',
    Leads: '👥',
    Calls: '📞',
    Appointments: '📅',
    Analytics: '📈',
    Settings: '⚙️',
    Menu: '☰',
    Close: '✕',
    Logout: '🚪',
    User: '👤',
    Notification: '🔔'
};

function Layout({ children }) {
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const location = useLocation();

    const navItems = [
        { path: '/', label: 'Dashboard', icon: Icons.Dashboard },
        { path: '/leads', label: 'Lead Collection', icon: Icons.Leads },
        { path: '/calls', label: 'Call Automation', icon: Icons.Calls },
        { path: '/appointments', label: 'Appointments', icon: Icons.Appointments },
        { path: '/analytics', label: 'Analytics', icon: Icons.Analytics },
        { path: '/settings', label: 'Settings', icon: Icons.Settings }
    ];

    const isActive = (path) => {
        return location.pathname === path;
    };

    return (
        <div className="layout">
            {/* Sidebar */}
            <aside className={`sidebar ${sidebarOpen ? 'open' : 'closed'}`}>
                <div className="sidebar-header">
                    <div className="logo">
                        <div className="logo-icon">🤖</div>
                        {sidebarOpen && <span className="logo-text">Alpha Leads</span>}
                    </div>
                </div>

                <nav className="sidebar-nav">
                    {navItems.map((item) => (
                        <Link
                            key={item.path}
                            to={item.path}
                            className={`nav-item ${isActive(item.path) ? 'active' : ''}`}
                            title={item.label}
                        >
                            <span className="nav-icon">{item.icon}</span>
                            {sidebarOpen && <span className="nav-label">{item.label}</span>}
                        </Link>
                    ))}
                </nav>

                <div className="sidebar-footer">
                    <button className="nav-item" title="Logout">
                        <span className="nav-icon">{Icons.Logout}</span>
                        {sidebarOpen && <span className="nav-label">Logout</span>}
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <div className="main-wrapper">
                {/* Top Navigation */}
                <header className="topbar">
                    <div className="topbar-left">
                        <button
                            className="btn-icon sidebar-toggle"
                            onClick={() => setSidebarOpen(!sidebarOpen)}
                            aria-label="Toggle Sidebar"
                        >
                            {sidebarOpen ? Icons.Close : Icons.Menu}
                        </button>
                        <h1 className="page-title">
                            {navItems.find(item => item.path === location.pathname)?.label || 'Dashboard'}
                        </h1>
                    </div>

                    <div className="topbar-right">
                        <button className="btn-icon notification-btn" aria-label="Notifications">
                            {Icons.Notification}
                            <span className="notification-badge">3</span>
                        </button>
                        <div className="user-menu">
                            <button className="user-avatar" aria-label="User Menu">
                                {Icons.User}
                            </button>
                            <div className="user-info">
                                <span className="user-name">Admin User</span>
                                <span className="user-role">Business Owner</span>
                            </div>
                        </div>
                    </div>
                </header>

                {/* Page Content */}
                <main className="main-content">
                    {children}
                </main>
            </div>
        </div>
    );
}

export default Layout;
