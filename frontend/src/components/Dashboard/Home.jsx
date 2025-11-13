import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { profileService, authService } from '../../services/auth';
import Sidebar from './Sidebar';
import LiquidEther from '../LiquidEther';
import './Dashboard.css';
import { useLoading } from '../../context/LoadingContext';

const Home = () => {
    const [username, setUsername] = useState('');
    const [profileImage, setProfileImage] = useState(null);
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const navigate = useNavigate();
    const { show } = useLoading();

    useEffect(() => {
        const storedUsername = authService.getCurrentUser() || 'DemoUser';
        setUsername(storedUsername);

        loadProfileImage();
    }, []);

    const loadProfileImage = async () => {
        try {
            const cachedImage = localStorage.getItem('profileImage');
            if (cachedImage) {
                setProfileImage(cachedImage);
            }

            const result = await profileService.getImage();
            if (result.image) {
                setProfileImage(result.image);
                localStorage.setItem('profileImage', result.image);
            }
        } catch (error) {
            console.error('Error fetching image:', error);
        }
    };

    const handleSignOut = () => {
        authService.signout();
        alert('Signed out!');
        navigate('/');
    };

    const initials = useMemo(() => {
        if (!username) return '?';
        const parts = username.split(/\s+/).filter(Boolean);
        if (parts.length === 1) {
            return parts[0].slice(0, 2).toUpperCase();
        }
        return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
    }, [username]);

    return (
        <div className="page-with-liquid">
            <div className="liquid-ether-layer">
                <LiquidEther
                    className="liquid-ether-canvas z-[-1]"
                    colors={['#4A70A9', '#8FABD4', '#EFECE3']}
                    mouseForce={18}
                    cursorSize={110}
                    isViscous={false}
                    viscous={30}
                    iterationsViscous={32}
                    iterationsPoisson={32}
                    resolution={0.55}
                    isBounce={false}
                    autoDemo
                    autoSpeed={0.6}
                    autoIntensity={2.4}
                    takeoverDuration={0.25}
                    autoResumeDelay={2800}
                    autoRampDuration={0.55}
                />
            </div>

            <div className="dashboard-container page-content">
                <Sidebar
                    isOpen={sidebarOpen}
                    onClose={() => setSidebarOpen(false)}
                    onSignOut={handleSignOut}
                    username={username}
                    profileImage={profileImage}
                />

                <div className={`overlay ${sidebarOpen ? 'show' : ''}`} onClick={() => setSidebarOpen(false)} />

                <div className="main-content">
                    <div className="header">
                        <button 
                            id="openSidebar" 
                            className="sidebar-toggle"
                            onClick={() => setSidebarOpen(true)}
                        >
                            ☰
                        </button>
                        <div className="user-info">
                            <div className="avatar">
                                {profileImage ? (
                                    <img
                                        id="profileImage"
                                        src={profileImage}
                                        alt="Profile"
                                    />
                                ) : (
                                    <span className="avatar-initials" aria-hidden="true">{initials}</span>
                                )}
                            </div>
                            <div className="user-meta">
                                <span className="user-name" id="username-display">{username}</span>
                                <button
                                    type="button"
                                    className="profile-link"
                                    onClick={() => navigate('/profile')}
                                >
                                    Profile Settings
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="dashboard-content">
                        <h1>Welcome to AI Interviewer Bot</h1>
                        
                        <div className="action-cards">
                            <div className="card" onClick={() => { show('Preparing interview…'); navigate('/interview'); }}>
                                <h3>Start Interview</h3>
                                <p>Begin your AI-powered interview session</p>
                            </div>

                            <div className="card" onClick={() => { show('Loading progress…'); navigate('/progress'); }}>
                                <h3>Check Progress</h3>
                                <p>View your interview history and scores</p>
                            </div>

                            <div className="card" onClick={() => { show('Loading resume tools…'); navigate('/resume'); }}>
                                <h3>Check Resume</h3>
                                <p>Get AI feedback on your resume</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Home;
