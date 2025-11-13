import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { resumeService } from '../../services/auth';
import LiquidEther from '../LiquidEther';
import './Resume.css';
import { useLoading } from '../../context/LoadingContext';

const ResumeCheck = () => {
    const [profile, setProfile] = useState('');
    const [resume, setResume] = useState('');
    const [imagePreview, setImagePreview] = useState('');
    const [feedback, setFeedback] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();
    const { show, hide } = useLoading();

    const handleImageUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
                setImagePreview(event.target.result);
                // In a real app, you'd use OCR here to extract text
                // For now, we'll ask user to paste resume text
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = async () => {
        if (!resume || !profile) {
            alert('Please provide both resume text and profile/job role.');
            return;
        }

        setIsLoading(true);
        show('Analyzing resume…');
        try {
            const data = await resumeService.checkResume(resume, profile);
            setFeedback(data);
        } catch (error) {
            alert('Failed to analyze resume. Please try again.');
            console.error(error);
        } finally {
            setIsLoading(false);
            hide();
        }
    };

    return (
        <div className="page-with-liquid">
            {/* <div className="liquid-ether-layer">
                <LiquidEther
                    className="liquid-ether-canvas"
                    colors={['#4A70A9', '#8FABD4', '#EFECE3']}
                    mouseForce={16}
                    cursorSize={95}
                    isViscous={false}
                    viscous={30}
                    iterationsViscous={32}
                    iterationsPoisson={32}
                    resolution={0.6}
                    isBounce={false}
                    autoDemo
                    autoSpeed={0.55}
                    autoIntensity={2.1}
                    takeoverDuration={0.25}
                    autoResumeDelay={2500}
                    autoRampDuration={0.5}
                />
            </div> */}

            <div className="page-content">
                <div className="resume-container">
                    <div className="resume-header">
                        <button onClick={() => navigate('/dashboard')} className="home-btn">
                            Home
                        </button>
                        <h2>Resume Analysis</h2>
                    </div>

                    {!feedback ? (
                        <div className="resume-form">
                            <div className="form-group">
                                <label htmlFor="profile">Job Profile/Role:</label>
                                <select 
                                    id="profile" 
                                    value={profile}
                                    onChange={(e) => setProfile(e.target.value)}
                                >
                                    <option value="">Select a profile</option>
                                    <option value="Software Engineer">Software Engineer</option>
                                    <option value="Data Scientist">Data Scientist</option>
                                    <option value="Product Manager">Product Manager</option>
                                    <option value="UI/UX Designer">UI/UX Designer</option>
                                    <option value="DevOps Engineer">DevOps Engineer</option>
                                    <option value="Business Analyst">Business Analyst</option>
                                    <option value="Full Stack Developer">Full Stack Developer</option>
                                </select>
                            </div>

                            <div className="form-group">
                                <label htmlFor="imageInput">Upload Resume Image (Optional):</label>
                                <input
                                    type="file"
                                    id="imageInput"
                                    accept="image/*"
                                    onChange={handleImageUpload}
                                />
                                {imagePreview && (
                                    <img 
                                        id="previewImage" 
                                        src={imagePreview} 
                                        alt="Resume Preview" 
                                        className="resume-preview"
                                    />
                                )}
                            </div>

                            <div className="form-group">
                                <label htmlFor="resume">Resume Text:</label>
                                <textarea
                                    id="resume"
                                    value={resume}
                                    onChange={(e) => setResume(e.target.value)}
                                    rows="10"
                                    placeholder="Paste your resume content here..."
                                />
                            </div>

                            <button 
                                onClick={handleSubmit} 
                                disabled={isLoading}
                                className="analyze-btn"
                            >
                                {isLoading ? 'Analyzing...' : 'Analyze Resume'}
                            </button>
                        </div>
                    ) : (
                        <div className="resume-feedback">
                            <div className="feedback-section">
                                <h3>Resume Score</h3>
                                <p className="score-text">{feedback.score}</p>
                            </div>

                            <div className="feedback-section">
                                <h3>Good Points ✓</h3>
                                <div className="feedback-content" dangerouslySetInnerHTML={{ __html: feedback.goodPoints }} />
                            </div>

                            <div className="feedback-section">
                                <h3>Areas to Improve 📈</h3>
                                <div className="feedback-content" dangerouslySetInnerHTML={{ __html: feedback.improvementPoints }} />
                            </div>

                            <div className="action-buttons">
                                <button onClick={() => setFeedback(null)} className="retry-btn">
                                    Check Another Resume
                                </button>
                                <button onClick={() => navigate('/dashboard')} className="home-btn">
                                    Back to Dashboard
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ResumeCheck;
