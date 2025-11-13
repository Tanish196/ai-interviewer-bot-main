import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { scoreService } from '../../services/auth';
import { behaviourService } from '../../services/behaviourService';
import BehaviourReport from '../Behaviour/BehaviourReport';
import './Interview.css';
import { useLoading } from '../../context/LoadingContext';

const InterviewResultEnhanced = () => {
    const [feedback, setFeedback] = useState(null);
    const [behaviourAnalysis, setBehaviourAnalysis] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [hasBehaviourData, setHasBehaviourData] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();
    const { show, hide } = useLoading();

    useEffect(() => {
        loadFeedback();
    }, []);

    const loadFeedback = async () => {
        show('Analyzing interview and behaviour…');
        try {
            const data = await scoreService.getScore();
            setFeedback(data);
            const behaviourData = location.state?.behaviourData;
            
            console.log('📊 Behaviour Data received:', behaviourData);
            
            if (behaviourData && behaviourData.behaviourScore !== undefined) {
                console.log('✅ Behaviour data valid, fetching analysis...');
                setHasBehaviourData(true);
                
                const interviewScore = parseFloat(data.overall_score) || 0;
                
                try {
                    const analysis = await behaviourService.getFinalAnalysis(
                        interviewScore,
                        behaviourData
                    );
                    console.log('✅ Behaviour analysis received:', analysis);
                    setBehaviourAnalysis(analysis);
                } catch (error) {
                    console.error('❌ Failed to get behaviour analysis:', error);
                }
            } else {
                console.log('❌ No behaviour data or invalid behaviour score');
            }
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
            return null;
        }

        if (!feedback) {
            return <div className="error">Failed to load feedback</div>;
        }

        return (
            <>
                {/* Original Interview Feedback */}
                <div className="result-container">
                    <div className="result-header">
                        <button onClick={() => navigate('/dashboard')} className="home-btn">
                            Home
                        </button>
                        <h2>Interview Feedback</h2>
                    </div>

                    <div className="result-content">
                        <div className="overall-score">
                            <h3>
                                {hasBehaviourData && behaviourAnalysis 
                                    ? 'Interview Content Score' 
                                    : 'Overall Score'}
                            </h3>
                            <p className="score-big">{feedback.overall_score}</p>
                            <p className="feedback-text">{feedback.overall_feedback}</p>
                            <p className="date-text">{feedback.date}</p>
                        </div>

                        {hasBehaviourData && behaviourAnalysis && (
                            <div className="overall-score" style={{ marginTop: '2rem' }}>
                                <h3>🎯 Final Combined Score</h3>
                                <p className="score-big">{behaviourAnalysis.finalScore}</p>
                                <p className="feedback-text">
                                    70% Interview Content + 30% Behaviour & Body Language
                                </p>
                                <div style={{ 
                                    display: 'flex', 
                                    gap: '1.5rem', 
                                    justifyContent: 'center',
                                    marginTop: '1rem',
                                    flexWrap: 'wrap'
                                }}>
                                    <div style={{ textAlign: 'center' }}>
                                        <div style={{ fontSize: '0.9rem', opacity: 0.7 }}>Interview</div>
                                        <div style={{ fontSize: '1.5rem', fontWeight: 700 }}>
                                            {behaviourAnalysis.interviewScore}/10
                                        </div>
                                    </div>
                                    <div style={{ textAlign: 'center' }}>
                                        <div style={{ fontSize: '0.9rem', opacity: 0.7 }}>Behaviour</div>
                                        <div style={{ fontSize: '1.5rem', fontWeight: 700 }}>
                                            {behaviourAnalysis.behaviourScore}/10
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

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

                {/* Behaviour Report*/}
                {hasBehaviourData && behaviourAnalysis && (
                    <BehaviourReport
                        behaviourData={behaviourAnalysis.metrics || location.state.behaviourData}
                        behaviourFeedback={behaviourAnalysis.behaviourFeedback}
                        tips={behaviourAnalysis.tips}
                    />
                )}
            </>
        );
    };

    return (
        <div className="page-with-liquid">
            <div className="page-content">
                {renderContent()}
            </div>
        </div>
    );
};

export default InterviewResultEnhanced;
