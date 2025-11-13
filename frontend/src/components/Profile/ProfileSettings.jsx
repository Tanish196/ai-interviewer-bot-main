import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Camera, UploadCloud, ArrowLeftCircle } from 'lucide-react';
import { profileService, authService } from '../../services/auth';
import './Profile.css';

const MAX_FILE_SIZE = 2 * 1024 * 1024; 

const ProfileSettings = () => {
    const [username, setUsername] = useState('');
    const [profileImage, setProfileImage] = useState(null);
    const [statusMessage, setStatusMessage] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const [isUploading, setIsUploading] = useState(false);
    const fileInputRef = useRef(null);
    const navigate = useNavigate();

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
            console.error('Failed to load profile image:', error);
        }
    };

    const initials = useMemo(() => {
        if (!username) return '?';
        const parts = username.split(/\s+/).filter(Boolean);
        if (parts.length === 1) {
            return parts[0].slice(0, 2).toUpperCase();
        }
        return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
    }, [username]);

    const toBase64 = (file) => new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = (err) => reject(err);
        reader.readAsDataURL(file);
    });

    const handleFileChange = async (event) => {
        const file = event.target.files?.[0];
        if (!file) return;

        if (file.size > MAX_FILE_SIZE) {
            setErrorMessage('Please choose an image smaller than 2MB.');
            return;
        }

        setErrorMessage('');
        setStatusMessage('Uploading photo...');
        setIsUploading(true);

        try {
            const base64Image = await toBase64(file);
            await profileService.addImage(base64Image);
            setProfileImage(base64Image);
            localStorage.setItem('profileImage', base64Image);
            setStatusMessage('Profile photo updated successfully.');
        } catch (error) {
            console.error('Image upload failed:', error);
            setErrorMessage('Something went wrong while uploading. Please try again.');
            setStatusMessage('');
        } finally {
            setIsUploading(false);
        }
    };

    const handleManualUploadTrigger = () => {
        fileInputRef.current?.click();
    };

    const handleBack = () => {
        navigate('/dashboard');
    };

    return (
        <div className="profile-settings">
            <div className="profile-card">
                <button type="button" className="back-button" onClick={handleBack}>
                    <ArrowLeftCircle size={20} />
                    <span>Back to Dashboard</span>
                </button>

                <div className="profile-hero">
                    <div className="avatar large">
                        {profileImage ? (
                            <img src={profileImage} alt="Profile" />
                        ) : (
                            <span className="avatar-initials" aria-hidden="true">{initials}</span>
                        )}
                    </div>
                    <div className="upload-actions">
                        <button
                            type="button"
                            className="upload-btn"
                            onClick={handleManualUploadTrigger}
                            disabled={isUploading}
                        >
                            <Camera size={18} />
                            <span>{isUploading ? 'Uploading...' : 'Change Photo'}</span>
                        </button>
                        <p className="upload-hint">JPG or PNG, up to 2MB.</p>
                    </div>
                    <input
                        type="file"
                        ref={fileInputRef}
                        accept="image/*"
                        onChange={handleFileChange}
                        style={{ display: 'none' }}
                    />
                </div>

                {(statusMessage || errorMessage) && (
                    <div className="profile-status" role="status">
                        {statusMessage && (
                            <span className="status success">
                                <UploadCloud size={16} />
                                {statusMessage}
                            </span>
                        )}
                        {errorMessage && <span className="status error">{errorMessage}</span>}
                    </div>
                )}

                <section className="credentials">
                    <h2>Account Details</h2>
                    <div className="credential-row">
                        <span className="label">Username</span>
                        <span className="value">{username}</span>
                    </div>
                    <div className="credential-row">
                        <span className="label">Email</span>
                        <span className="value muted">Not provided</span>
                    </div>
                    <div className="credential-row">
                        <span className="label">Member Since</span>
                        <span className="value muted">Coming soon</span>
                    </div>
                </section>
            </div>
        </div>
    );
};

export default ProfileSettings;
