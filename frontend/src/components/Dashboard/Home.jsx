import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { profileService, authService } from '../../services/auth';
import Sidebar from './Sidebar';
import './Dashboard.css';

const Home = () => {
    const [username, setUsername] = useState('');
    const [profileImage, setProfileImage] = useState('images.jpeg');
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const storedUsername = authService.getCurrentUser() || 'DemoUser';
        setUsername(storedUsername);

        // Load profile image
        loadProfileImage();
    }, []);

    const loadProfileImage = async () => {
        try {
            const result = await profileService.getImage();
            if (result.image) {
                setProfileImage(result.image);
            }
        } catch (error) {
            console.error('Error fetching image:', error);
        }
    };

    const handleImageUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        if (file.size > 2 * 1024 * 1024) {
            alert('Please upload an image smaller than 2MB.');
            return;
        }

        const reader = new FileReader();
        reader.onload = async (event) => {
            const base64Image = event.target.result;
            setProfileImage(base64Image);

            try {
                await profileService.addImage(base64Image);
                console.log('Image saved successfully');
            } catch (error) {
                console.error('Upload failed:', error);
            }
        };

        reader.readAsDataURL(file);
    };

    const handleSignOut = () => {
        authService.signout();
        alert('Signed out!');
        navigate('/');
    };

    return (
        <div className="dashboard-container">
            <Sidebar 
                isOpen={sidebarOpen}
                onClose={() => setSidebarOpen(false)}
                onSignOut={handleSignOut}
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
                        <span id="username-display">{username}</span>
                        <div className="profile-image-container">
                            <img 
                                id="profileImage" 
                                src={profileImage} 
                                alt="Profile" 
                                className="profile-img"
                            />
                            <input
                                type="file"
                                id="imageInput"
                                accept="image/*"
                                style={{ display: 'none' }}
                                onChange={handleImageUpload}
                            />
                            <label htmlFor="imageInput" className="upload-label">
                                Change Photo
                            </label>
                        </div>
                    </div>
                </div>

                <div className="dashboard-content">
                    <h1>Welcome to AI Interviewer Bot</h1>
                    
                    <div className="action-cards">
                        <div className="card" onClick={() => navigate('/interview')}>
                            <h3>Start Interview</h3>
                            <p>Begin your AI-powered interview session</p>
                        </div>

                        <div className="card" onClick={() => navigate('/progress')}>
                            <h3>Check Progress</h3>
                            <p>View your interview history and scores</p>
                        </div>

                        <div className="card" onClick={() => navigate('/resume')}>
                            <h3>Check Resume</h3>
                            <p>Get AI feedback on your resume</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Home;
