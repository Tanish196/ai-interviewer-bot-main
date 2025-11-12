import { Link } from 'react-router-dom';
import '../styles/landing.css';

const Landing = () => {
    return (
        <div className="landing-container">
            <div className="landing-content">
                <h1>AI Interviewer Bot</h1>
                <p className="tagline">Practice interviews with AI-powered feedback</p>
                
                <div className="features">
                    <div className="feature-card">
                        <h3>🎯 Smart Questions</h3>
                        <p>Domain-specific interview questions powered by AI</p>
                    </div>
                    <div className="feature-card">
                        <h3>📊 Detailed Feedback</h3>
                        <p>Get comprehensive analysis of your performance</p>
                    </div>
                    <div className="feature-card">
                        <h3>📈 Track Progress</h3>
                        <p>Monitor your improvement over time</p>
                    </div>
                    <div className="feature-card">
                        <h3>📄 Resume Analysis</h3>
                        <p>AI-powered resume review and suggestions</p>
                    </div>
                </div>

                <div className="cta-buttons">
                    <Link to="/register" className="cta-btn primary">
                        Get Started
                    </Link>
                    <Link to="/login" className="cta-btn secondary">
                        Sign In
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default Landing;
