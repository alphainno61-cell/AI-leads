import { useState, useEffect } from 'react';
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
    const [subMenuOpen, setSubMenuOpen] = useState({});
    const location = useLocation();

    const navItems = [
        { path: '/', label: 'Dashboard', icon: Icons.Dashboard },
        { 
            path: '#', 
            label: 'Leads Management', 
            icon: Icons.Leads,
            subItems: [
                { path: '/leads/generate', label: 'Generate Leads', icon: '🔍' },
                { path: '/leads/all', label: 'All Leads', icon: '📋' }
            ]
        },
        { path: '/calls', label: 'Call Automation', icon: Icons.Calls },
        { path: '/appointments', label: 'Appointments', icon: Icons.Appointments },
        { path: '/analytics', label: 'Analytics', icon: Icons.Analytics },
        { path: '/settings', label: 'Settings', icon: Icons.Settings }
    ];

    const isActive = (path) => {
        return location.pathname === path;
    };

    const isSubActive = (parentPath) => {
        return location.pathname.startsWith(parentPath) && location.pathname !== parentPath;
    };

    const toggleSubMenu = (path) => {
        setSubMenuOpen(prev => ({
            ...prev,
            [path]: !prev[path]
        }));
    };

    // Auto-open sub-menu if we're on a sub-route
    useEffect(() => {
        navItems.forEach(item => {
            if (item.subItems && isSubActive(item.path)) {
                setSubMenuOpen(prev => ({
                    ...prev,
                    [item.path]: true
                }));
            }
        });
    }, [location.pathname]);

    return (
        <div className="layout">
            {/* Sidebar */}
            <aside className={`sidebar ${sidebarOpen ? 'open' : 'closed'}`}>
                <div className="sidebar-header">
                    <div className="logo">
                        <img src="/logo.png" alt="Alpha Leads Logo" className="logo-icon" />
                        {sidebarOpen && <span className="logo-text">Alpha Leads</span>}
                    </div>
                </div>

                <nav className="sidebar-nav">
                    {navItems.map((item) => (
                        <div key={item.path} className="nav-group">
                            {item.subItems ? (
                                <>
                                    <div
                                        className={`nav-item parent-nav ${isSubActive(item.path === '#' ? '/leads' : item.path) ? 'active' : ''}`}
                                        onClick={() => toggleSubMenu(item.path)}
                                        title={item.label}
                                    >
                                        {item.path === '#' ? (
                                            <div className="nav-link-no-route">
                                                <span className="nav-icon">{item.icon}</span>
                                                {sidebarOpen && <span className="nav-label">{item.label}</span>}
                                            </div>
                                        ) : (
                                            <Link to={item.path} className="nav-link">
                                                <span className="nav-icon">{item.icon}</span>
                                                {sidebarOpen && <span className="nav-label">{item.label}</span>}
                                            </Link>
                                        )}
                                        {sidebarOpen && (
                                            <span className={`submenu-arrow ${subMenuOpen[item.path] ? 'open' : ''}`}>
                                                ▼
                                            </span>
                                        )}
                                    </div>
                                    {sidebarOpen && subMenuOpen[item.path] && (
                                        <div className="submenu">
                                            {item.subItems.map((subItem) => (
                                                <Link
                                                    key={subItem.path}
                                                    to={subItem.path}
                                                    className={`nav-item sub-nav-item ${isActive(subItem.path) ? 'active' : ''}`}
                                                    title={subItem.label}
                                                >
                                                    <span className="nav-icon">{subItem.icon}</span>
                                                    <span className="nav-label">{subItem.label}</span>
                                                </Link>
                                            ))}
                                        </div>
                                    )}
                                </>
                            ) : (
                                <Link
                                    to={item.path}
                                    className={`nav-item ${isActive(item.path) ? 'active' : ''}`}
                                    title={item.label}
                                >
                                    <span className="nav-icon">{item.icon}</span>
                                    {sidebarOpen && <span className="nav-label">{item.label}</span>}
                                </Link>
                            )}
                        </div>
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
