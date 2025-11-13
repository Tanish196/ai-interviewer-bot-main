import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { scoreService } from '../../services/auth';
import { Chart, registerables } from 'chart.js';
import './Interview.css';

Chart.register(...registerables);

const InterviewProgress = () => {
    const [scores, setScores] = useState([]);
    const [suggestion, setSuggestion] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        loadScoreHistory();
    }, []);

    const loadScoreHistory = async () => {
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

    return (
        <div className="progress-container">
            <div className="progress-header">
                <button onClick={() => navigate('/dashboard')} className="home-btn">
                    Home
                </button>
                <h2>Your Interview Progress</h2>
            </div>

            {isLoading ? (
                <div className="loader">Loading...</div>
            ) : (
                <div className="progress-content">
                    <div className="chart-container">
                        <canvas id="progressChart"></canvas>
                    </div>

                    <div className="progress-text">
                        <h3>Analysis:</h3>
                        <p>{suggestion}</p>
                    </div>

                    <div className="action-buttons">
                        <button onClick={() => navigate('/interview')} className="start-btn">
                            Start New Interview
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default InterviewProgress;
