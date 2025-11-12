import './Dashboard.css';

const Sidebar = ({ isOpen, onClose, onSignOut }) => {
    return (
        <div className={`sidebar ${isOpen ? 'show' : ''}`}>
            <button className="close-btn" onClick={onClose}>×</button>
            
            <nav className="sidebar-nav">
                <a href="/dashboard">Home</a>
                <a href="/interview">Start Interview</a>
                <a href="/progress">Check Progress</a>
                <a href="/resume">Check Resume</a>
                <a href="#" onClick={onSignOut}>Sign Out</a>
            </nav>
        </div>
    );
};

export default Sidebar;
