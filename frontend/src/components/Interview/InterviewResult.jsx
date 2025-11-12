import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { scoreService } from '../../services/auth';
import './Interview.css';

const InterviewResult = () => {
    const [feedback, setFeedback] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        loadFeedback();
    }, []);

    const loadFeedback = async () => {
        try {
            const data = await scoreService.getScore();
            setFeedback(data);
        } catch (error) {
            alert('Failed to load feedback. Please try again.');
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    if (isLoading) {
        return <div className="loader">Analyzing your interview...</div>;
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

export default InterviewResult;
