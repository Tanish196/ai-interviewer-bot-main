import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { scoreService } from '../../services/auth';
import { Chart, registerables } from 'chart.js';
import LiquidEther from '../LiquidEther';
import './Interview.css';
import { useLoading } from '../../context/LoadingContext';

Chart.register(...registerables);

const InterviewProgress = () => {
    const [scores, setScores] = useState([]);
    const [suggestion, setSuggestion] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const navigate = useNavigate();
    const { show, hide } = useLoading();

    useEffect(() => {
        loadScoreHistory();
    }, []);

    const loadScoreHistory = async () => {
        show('Loading progress…');
        try {
            const data = await scoreService.checkScoreHistory();

            if (!data.validUser) {
                alert('Not a valid user');
                navigate('/login');
                return;
            }

            if (data.array.length === 0) {
                setSuggestion('You have given less than 5 interviews!');
            } else {
                setScores(data.array);
                setSuggestion(data.suggestion);
                
                // Draw chart
                setTimeout(() => drawChart(data.array), 100);
            }
        } catch (error) {
            setSuggestion('Error connecting to server!');
            console.error(error);
        } finally {
            setIsLoading(false);
            hide();
        }
    };

    const drawChart = (scoreData) => {
        const ctx = document.getElementById('progressChart');
        if (!ctx) return;

        const labels = scoreData.map((_, idx) => `Test ${idx + 1}`);

        // Pull palette colors from CSS variables
        const styles = getComputedStyle(document.documentElement);
        const fg = styles.getPropertyValue('--color-foreground').trim() || 'rgb(239,236,227)';
        const fgRgb = styles.getPropertyValue('--color-foreground-rgb').trim() || '239,236,227';
        const borderColor = fg;
        const bgColor = `rgba(${fgRgb}, 0.18)`;

        new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Progress',
                    data: scoreData,
                    borderColor: borderColor,
                    backgroundColor: bgColor,
                    borderWidth: 2,
                    pointBackgroundColor: borderColor,
                    pointRadius: 4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true,
                        max: 10,
                        ticks: {
                            color: borderColor,
                            font: { size: 14 }
                        }
                    },
                    x: {
                        ticks: {
                            color: borderColor,
                            font: { size: 14 }
                        }
                    }
                },
                plugins: {
                    legend: {
                        labels: {
                            color: borderColor,
                            font: { size: 16 }
                        }
                    }
                }
            }
        });
    };

    const renderContent = () => {
        if (isLoading) {
            // Global loader (LoadingContext) is shown while data loads — no local placeholder needed
            return null;
        }

        return (
            <div className="progress-container">
                <div className="progress-header">
                    <button onClick={() => navigate('/dashboard')} className="home-btn">
                        Home
                    </button>
                    <h2>Your Interview Progress</h2>
                </div>

                <div className="progress-content">
                    <div className="chart-container">
                        <canvas id="progressChart"></canvas>
                    </div>

                    <div className="progress-text">
                        <h3>Analysis</h3>
                        <p>{suggestion}</p>
                    </div>

                    <div className="action-buttons">
                        <button onClick={() => navigate('/interview')} className="start-btn">
                            Start New Interview
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

export default InterviewProgress;
