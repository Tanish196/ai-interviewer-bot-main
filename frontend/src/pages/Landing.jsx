import { Link } from 'react-router-dom';
import { Target, BarChart2, TrendingUp, FileText } from 'lucide-react';
import LiquidEther from '../components/LiquidEther';
import '../styles/landing.css';

const Landing = () => {
    return (
        <div className="page-with-liquid">
            <div className="liquid-ether-layer">
                <LiquidEther
                    className="liquid-ether-canvas"
                    colors={['#4A70A9', '#8FABD4', '#EFECE3']}
                    mouseForce={20}
                    cursorSize={100}
                    isViscous={false}
                    viscous={30}
                    iterationsViscous={32}
                    iterationsPoisson={32}
                    resolution={0.5}
                    isBounce={false}
                    autoDemo
                    autoSpeed={0.5}
                    autoIntensity={2.2}
                    takeoverDuration={0.25}
                    autoResumeDelay={3000}
                    autoRampDuration={0.6}
                />
            </div>

            <div className="landing-container page-content">
                <div className="landing-content">
                    <div className="hero">
                        <h1>AI Interviewer Bot</h1>
                        <p className="tagline">Practice interviews with AI-powered feedback</p>

                        <div className="features">
                            <div className="feature-card">
                                <div className="feature-icon"><Target size={20} /></div>
                                <div className="feature-body">
                                    <h3>Smart Questions</h3>
                                    <p>Domain-specific interview questions powered by AI</p>
                                </div>
                            </div>

                            <div className="feature-card">
                                <div className="feature-icon"><BarChart2 size={20} /></div>
                                <div className="feature-body">
                                    <h3>Detailed Feedback</h3>
                                    <p>Get comprehensive analysis of your performance</p>
                                </div>
                            </div>

                            <div className="feature-card">
                                <div className="feature-icon"><TrendingUp size={20} /></div>
                                <div className="feature-body">
                                    <h3>Track Progress</h3>
                                    <p>Monitor your improvement over time</p>
                                </div>
                            </div>

                            <div className="feature-card">
                                <div className="feature-icon"><FileText size={20} /></div>
                                <div className="feature-body">
                                    <h3>Resume Analysis</h3>
                                    <p>AI-powered resume review and suggestions</p>
                                </div>
                            </div>
                        </div>

                        <div className="cta-row" role="region" aria-label="Get started">
                            <Link to="/register" className="cta-btn primary">
                                Get Started
                            </Link>
                            <Link to="/login" className="cta-btn secondary">
                                Sign In
                            </Link>
                        </div>
                    </div>

                    <div className="promo">
                        <div className="promo-card">
                            <h4>Boost your interview skills</h4>
                            <p className="muted">Receive instant feedback, practice common patterns, and refine answers with AI coaching. Try a mock interview or analyze your resume in seconds.</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Landing;
