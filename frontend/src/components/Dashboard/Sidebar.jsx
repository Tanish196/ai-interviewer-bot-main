import { useCallback, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { X, Home, PlayCircle, LineChart, FileText, UserCog, LogOut } from 'lucide-react';
import './Dashboard.css';

const navConfig = [
    { label: 'Dashboard', path: '/dashboard', Icon: Home },
    { label: 'Start Interview', path: '/interview', Icon: PlayCircle },
    { label: 'Progress', path: '/progress', Icon: LineChart },
    { label: 'Resume Review', path: '/resume', Icon: FileText },
    { label: 'Profile Settings', path: '/profile', Icon: UserCog }
];

const Sidebar = ({ isOpen, onClose, onSignOut, username, profileImage }) => {
    const navigate = useNavigate();
    const location = useLocation();

    const initials = useMemo(() => {
        if (!username) return '?';
        const parts = username.split(/\s+/).filter(Boolean);
        if (parts.length === 1) {
            return parts[0].slice(0, 2).toUpperCase();
        }
        return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
    }, [username]);

    const handleNavigate = useCallback((path) => {
        navigate(path);
        onClose();
    }, [navigate, onClose]);

    const handleSignOutClick = useCallback((event) => {
        event.preventDefault();
        onSignOut();
        onClose();
    }, [onClose, onSignOut]);

    return (
        <aside className={`sidebar ${isOpen ? 'show' : ''}`}>
            <div className="sidebar-header">
                <div className="avatar small">
                    {profileImage ? (
                        <img src={profileImage} alt="Profile" />
                    ) : (
                        <span className="avatar-initials" aria-hidden="true">{initials}</span>
                    )}
                </div>
                <div className="sidebar-user-meta">
                    <span className="sidebar-username">{username || 'Guest'}</span>
                    <span className="sidebar-tag">Ready to level up</span>
                </div>
                <button className="close-btn" onClick={onClose} aria-label="Close menu">
                    <X size={20} />
                </button>
            </div>

            <nav className="sidebar-nav">
                {navConfig.map(({ label, path, Icon }) => (
                    <button
                        key={path}
                        type="button"
                        className={`sidebar-nav-item ${location.pathname === path ? 'active' : ''}`}
                        onClick={() => handleNavigate(path)}
                    >
                        <Icon size={20} />
                        <span>{label}</span>
                    </button>
                ))}
            </nav>

            <button className="signout-button" onClick={handleSignOutClick}>
                <LogOut size={18} />
                <span>Sign Out</span>
            </button>
        </aside>
    );
};

export default Sidebar;
