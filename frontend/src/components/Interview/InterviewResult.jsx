import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { scoreService } from '../../services/auth';
import LiquidEther from '../LiquidEther';
import './Interview.css';
import { useLoading } from '../../context/LoadingContext';

const InterviewResult = () => {
    const [feedback, setFeedback] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const navigate = useNavigate();
    const { show, hide } = useLoading();

    useEffect(() => {
        loadFeedback();
    }, []);

    const loadFeedback = async () => {
        show('Analyzing interview…');
        try {
            const data = await scoreService.getScore();
            setFeedback(data);
        } catch (error) {
            alert('Failed to load feedback. Please try again.');
            console.error(error);
        } finally {
            setIsLoading(false);
            hide();
        }
    };

    const renderContent = () => {
        if (isLoading) {
            // Global loader (LoadingContext) handles the overlay for analytics — skip local placeholder
            return null;
        }

        if (!feedback) {
            return <div className="error">Failed to load feedback</div>;
        }

        return (
            <div className="result-container">
                <div className="result-header">
                    <button onClick={() => navigate('/dashboard')} className="home-btn">
                        Home
                    </button>
                    <h2>Interview Feedback</h2>
                </div>

                <div className="result-content">
                    <div className="overall-score">
                        <h3>Overall Score</h3>
                        <p className="score-big">{feedback.overall_score}</p>
                        <p className="feedback-text">{feedback.overall_feedback}</p>
                        <p className="date-text">{feedback.date}</p>
                    </div>

                    <div className="breakdown-section">
                        <h3>Detailed Breakdown</h3>
                        {feedback.breakdown && Object.entries(feedback.breakdown).map(([key, value]) => (
                            <div key={key} className="breakdown-item">
                                <h4>{key}</h4>
                                <p className="score">{value.score}</p>
                                <p className="feedback">{value.feedback}</p>
                            </div>
                        ))}
                    </div>

                    <div className="strengths-section">
                        <h3>Strengths</h3>
                        <p>{feedback.strengths}</p>
                    </div>

                    <div className="improvement-section">
                        <h3>Areas for Improvement</h3>
                        <ul>
                            {feedback.areas_for_improvement?.map((item, idx) => (
                                <li key={idx}>{item}</li>
                            ))}
                        </ul>
                    </div>

                    <div className="action-buttons">
                        <button onClick={() => navigate('/interview')} className="start-btn">
                            Start Another Interview
                        </button>
                        <button onClick={() => navigate('/progress')} className="progress-btn">
                            View Progress
                        </button>
                    </div>
                </div>
            </div>
        );
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
                {renderContent()}
            </div>
        </div>
    );
};

export default InterviewResult;
