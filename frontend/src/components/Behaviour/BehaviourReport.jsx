import { useEffect, useRef } from 'react';
import { Chart } from 'chart.js/auto';
import './BehaviourReport.css';

const BehaviourReport = ({ behaviourData, behaviourFeedback = [], tips = [] }) => {
  const chartRef = useRef(null);
  const chartInstanceRef = useRef(null);

  useEffect(() => {
    if (!behaviourData || !chartRef.current) return;

    const ctx = chartRef.current.getContext('2d');

    // Destroy existing chart
    if (chartInstanceRef.current) {
      chartInstanceRef.current.destroy();
    }

    const styles = getComputedStyle(document.documentElement);
    const fgRgb = styles.getPropertyValue('--color-foreground-rgb').trim() || '239,236,227';
    const accentColor = styles.getPropertyValue('--color-accent').trim() || 'rgb(143,171,212)';
    const primaryColor = styles.getPropertyValue('--color-primary').trim() || 'rgb(74,112,169)';
    const foregroundColor = styles.getPropertyValue('--color-foreground').trim() || 'rgb(239,236,227)';

    // Create bar chart
    chartInstanceRef.current = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: ['Focus Score', 'Posture Score', 'Calmness Score'],
        datasets: [{
          label: 'Behaviour Metrics',
          data: [
            behaviourData.focusScore || 0,
            behaviourData.postureScore || 0,
            Math.max(0, 10 - (behaviourData.movementJitterScore || 0))
          ],
          backgroundColor: [
            `rgba(${fgRgb}, 0.2)`,
            accentColor,
            primaryColor
          ],
          borderColor: [
            foregroundColor,
            accentColor,
            primaryColor
          ],
          borderWidth: 2
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
              color: foregroundColor,
              font: { size: 13 }
            },
            grid: {
              color: `rgba(${fgRgb}, 0.1)`
            }
          },
          x: {
            ticks: {
              color: foregroundColor,
              font: { size: 13 }
            },
            grid: {
              display: false
            }
          }
        },
        plugins: {
          legend: {
            display: false
          },
          tooltip: {
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            titleColor: foregroundColor,
            bodyColor: foregroundColor,
            borderColor: `rgba(${fgRgb}, 0.3)`,
            borderWidth: 1
          }
        }
      }
    });

    return () => {
      if (chartInstanceRef.current) {
        chartInstanceRef.current.destroy();
      }
    };
  }, [behaviourData]);

  if (!behaviourData) {
    return (
      <div className="behaviour-report-container">
        <div className="no-data">
          <p>No behaviour data available</p>
        </div>
      </div>
    );
  }

  const {
    behaviourScore = 0,
    focusScore = 0,
    postureScore = 0,
    movementJitterScore = 0,
    offScreenPercent = 0,
    badPosturePercent = 0,
    duration = 0
  } = behaviourData;

  // Nervousness indicator
  const calmnessScore = Math.max(0, 10 - movementJitterScore);
  const getNervousnessLevel = () => {
    if (calmnessScore >= 8) return { label: 'Calm', color: 'var(--color-accent)' };
    if (calmnessScore >= 6) return { label: 'Slightly Nervous', color: 'var(--color-primary)' };
    if (calmnessScore >= 4) return { label: 'Moderately Nervous', color: 'var(--color-foreground)' };
    return { label: 'Very Nervous', color: 'rgba(var(--color-foreground-rgb), 0.5)' };
  };

  const nervousnessLevel = getNervousnessLevel();

  return (
    <div className="behaviour-report-container">
      <div className="behaviour-header">
        <h2>Behaviour & Nervousness Analysis</h2>
        <p className="duration-text">Interview Duration: {Math.round(duration)}s</p>
      </div>

      {/* Overall Score */}
      <div className="overall-behaviour-score">
        <h3>Overall Behaviour Score</h3>
        <div className="score-circle">
          <span className="score-big">{behaviourScore}</span>
          <span className="score-max">/10</span>
        </div>
        <div className="nervousness-badge" style={{ borderColor: nervousnessLevel.color }}>
          <span style={{ color: nervousnessLevel.color }}>
            {nervousnessLevel.label}
          </span>
        </div>
      </div>

      <div className="metrics-section">
        <h3>Detailed Metrics</h3>
        <div className="metrics-grid">
          <div className="metric-card">
            <div className="metric-icon">👁️</div>
            <div className="metric-content">
              <h4>Focus Score</h4>
              <p className="metric-value">{focusScore}/10</p>
              <p className="metric-detail">Off-screen: {offScreenPercent}%</p>
            </div>
          </div>

          <div className="metric-card">
            <div className="metric-icon">🧍</div>
            <div className="metric-content">
              <h4>Posture Score</h4>
              <p className="metric-value">{postureScore}/10</p>
              <p className="metric-detail">Bad posture: {badPosturePercent}%</p>
            </div>
          </div>

          <div className="metric-card">
            <div className="metric-icon">🎯</div>
            <div className="metric-content">
              <h4>Calmness Score</h4>
              <p className="metric-value">{calmnessScore.toFixed(1)}/10</p>
              <p className="metric-detail">Jitter: {movementJitterScore.toFixed(1)}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="chart-section">
        <h3>Visual Breakdown</h3>
        <div className="chart-container-behaviour">
          <canvas ref={chartRef}></canvas>
        </div>
      </div>

      {behaviourFeedback && behaviourFeedback.length > 0 && (
        <div className="feedback-section">
          <h3>AI Behaviour Feedback</h3>
          <ul className="feedback-list">
            {behaviourFeedback.map((feedback, idx) => (
              <li key={idx}>{feedback}</li>
            ))}
          </ul>
        </div>
      )}

      {tips && tips.length > 0 && (
        <div className="tips-section">
          <h3>💡 Improvement Tips</h3>
          <ul className="tips-list">
            {tips.map((tip, idx) => (
              <li key={idx}>{tip}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default BehaviourReport;
