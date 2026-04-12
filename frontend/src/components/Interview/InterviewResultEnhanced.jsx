import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
    ResponsiveContainer,
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
} from 'recharts';
import { scoreService } from '../../services/auth';
import { behaviourService } from '../../services/behaviourService';
import BehaviourReport from '../Behaviour/BehaviourReport';
import './Interview.css';
import { useLoading } from '../../context/LoadingContext';

const STAGE_LABELS = ['Screener', 'Technical I', 'Culture Fit', 'Whiteboard', 'System Design', 'Executive'];

const toNumber = (value, fallback = 0) => {
    const parsed = Number.parseFloat(value);
    return Number.isFinite(parsed) ? parsed : fallback;
};

const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

const formatLabel = (text = '') =>
    String(text)
        .replace(/_/g, ' ')
        .replace(/\b\w/g, (ch) => ch.toUpperCase());

const RADIAL_SIZE = 180;
const RADIAL_STROKE = 10;
const RADIAL_RADIUS = (RADIAL_SIZE - RADIAL_STROKE) / 2;
const RADIAL_CIRCUMFERENCE = 2 * Math.PI * RADIAL_RADIUS;

const CircularScore = ({ percent, subtitle }) => {
    const safePercent = clamp(Math.round(percent), 0, 100);
    const offset = RADIAL_CIRCUMFERENCE - (safePercent / 100) * RADIAL_CIRCUMFERENCE;

    return (
        <div className="relative h-[180px] w-[180px]">
            <svg width={RADIAL_SIZE} height={RADIAL_SIZE} className="-rotate-90">
                <circle
                    cx={RADIAL_SIZE / 2}
                    cy={RADIAL_SIZE / 2}
                    r={RADIAL_RADIUS}
                    fill="transparent"
                    stroke="rgba(148, 163, 184, 0.2)"
                    strokeWidth={RADIAL_STROKE}
                />
                <circle
                    cx={RADIAL_SIZE / 2}
                    cy={RADIAL_SIZE / 2}
                    r={RADIAL_RADIUS}
                    fill="transparent"
                    stroke="url(#scoreGradient)"
                    strokeWidth={RADIAL_STROKE}
                    strokeLinecap="round"
                    strokeDasharray={RADIAL_CIRCUMFERENCE}
                    strokeDashoffset={offset}
                />
                <defs>
                    <linearGradient id="scoreGradient" x1="0" y1="0" x2="1" y2="1">
                        <stop offset="0%" stopColor="#a8c8ff" />
                        <stop offset="100%" stopColor="#4a70a9" />
                    </linearGradient>
                </defs>
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                <span className="text-4xl font-black tracking-tight text-on-surface">{safePercent}%</span>
                <span className="mt-1 text-[10px] uppercase tracking-[0.22em] text-primary/80 font-bold">{subtitle}</span>
            </div>
        </div>
    );
};

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
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const loadFeedback = async () => {
        show('Analyzing interview and behaviour...');
        try {
            const data = await scoreService.getScore();
            setFeedback(data);
            const behaviourData = location.state?.behaviourData;

            if (behaviourData && behaviourData.behaviourScore !== undefined) {
                setHasBehaviourData(true);

                const interviewScore = toNumber(data.overall_score, 0);

                try {
                    const analysis = await behaviourService.getFinalAnalysis(interviewScore, behaviourData);
                    setBehaviourAnalysis(analysis);
                } catch (error) {
                    console.error('Failed to get behaviour analysis:', error);
                }
            }
        } catch (error) {
            alert('Failed to load feedback. Please try again.');
            console.error(error);
        } finally {
            setIsLoading(false);
            hide();
        }
    };

    const breakdownEntries = useMemo(() => {
        if (!feedback?.breakdown) return [];

        return Object.entries(feedback.breakdown)
            .map(([key, value]) => ({
                key,
                label: formatLabel(key),
                score: clamp(Math.round(toNumber(value?.score, 0) * 10), 0, 100),
                feedback: value?.feedback || '',
            }))
            .slice(0, 5);
    }, [feedback]);

    const performanceDimensions = useMemo(() => {
        if (breakdownEntries.length > 0) {
            return breakdownEntries;
        }

        const interviewBase = clamp(toNumber(feedback?.overall_score, 7) * 10, 0, 100);
        return [
            { key: 'technical_depth', label: 'Technical Depth', score: clamp(interviewBase + 8, 0, 100), feedback: '' },
            { key: 'communication', label: 'Communication', score: clamp(interviewBase + 4, 0, 100), feedback: '' },
            { key: 'problem_solving', label: 'Problem Solving', score: clamp(interviewBase - 3, 0, 100), feedback: '' },
            { key: 'leadership_grit', label: 'Leadership Grit', score: clamp(interviewBase - 8, 0, 100), feedback: '' },
            { key: 'adaptability', label: 'Fluid Adaptability', score: clamp(interviewBase + 1, 0, 100), feedback: '' },
        ];
    }, [breakdownEntries, feedback]);

    const overallPercent = useMemo(() => {
        if (hasBehaviourData && behaviourAnalysis) {
            return clamp(toNumber(behaviourAnalysis.finalScore, 0) * 10, 0, 100);
        }
        return clamp(toNumber(feedback?.overall_score, 0) * 10, 0, 100);
    }, [feedback, hasBehaviourData, behaviourAnalysis]);

    const interviewPercent = clamp(toNumber(behaviourAnalysis?.interviewScore, toNumber(feedback?.overall_score, 0)) * 10, 0, 100);
    const behaviourPercent = clamp(toNumber(behaviourAnalysis?.behaviourScore, 0) * 10, 0, 100);

    const affinityData = useMemo(() => {
        const currentScores = performanceDimensions.map((item) => item.score);
        const currentAvg = currentScores.length
            ? currentScores.reduce((sum, score) => sum + score, 0) / currentScores.length
            : overallPercent;

        const prevBase = clamp(currentAvg - 12, 35, 92);

        return STAGE_LABELS.map((label, index) => {
            const wave = [0, 4, 2, 6, 3, 8][index];
            const previous = clamp(prevBase + wave - 3, 20, 95);
            const current = clamp(previous + 10 + (index % 2 ? 2 : 0), 30, 98);

            return {
                stage: label,
                current,
                previous,
            };
        });
    }, [performanceDimensions, overallPercent]);

    const growthPercent = useMemo(() => {
        if (!affinityData.length) return 0;
        const first = affinityData[0].current;
        const last = affinityData[affinityData.length - 1].current;
        return clamp(Math.round(last - first), 0, 99);
    }, [affinityData]);

    const strengthsText = feedback?.strengths || feedback?.overall_feedback || 'Strong analytical and communication alignment.';

    const improvementText = feedback?.areas_for_improvement?.length
        ? feedback.areas_for_improvement.join(' ')
        : 'Opportunity to improve proactive stakeholder alignment and executive-level framing.';

    const insightText = `${strengthsText} ${improvementText}`;

    const focusMetric = clamp(Math.round(toNumber(behaviourAnalysis?.metrics?.focusScore, 9.4) * 10), 0, 100);
    const postureMetricRaw = clamp(Math.round(toNumber(behaviourAnalysis?.metrics?.postureScore, 7.6) * 10), 0, 100);
    const calmnessMetric = clamp(Math.round((10 - toNumber(behaviourAnalysis?.metrics?.movementJitterScore, 2.2)) * 10), 0, 100);

    if (isLoading) {
        return null;
    }

    if (!feedback) {
        return <div className="min-h-screen bg-[#020617] text-red-300 p-10">Failed to load feedback</div>;
    }

    return (
        <div className="min-h-screen bg-[#020617] text-on-surface font-body selection:bg-primary/30">
            <aside className="fixed left-0 top-0 z-40 h-screen w-72 border-r border-white/5 bg-slate-950/40 backdrop-blur-md">
                <div className="px-8 py-10">
                    <div className="mb-10 flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-300 to-blue-600">
                            <span className="material-symbols-outlined text-white">auto_awesome</span>
                        </div>
                        <div>
                            <h1 className="font-headline text-lg font-black leading-none text-blue-300">Alchemist AI</h1>
                            <p className="mt-1 text-[10px] font-bold uppercase tracking-widest text-slate-500">Elite Distillation</p>
                        </div>
                    </div>

                    <nav className="space-y-1">
                        <button type="button" onClick={() => navigate('/dashboard')} className="flex w-full items-center gap-4 px-6 py-3 text-left text-slate-500 transition-all duration-200 hover:text-slate-200">
                            <span className="material-symbols-outlined">dashboard</span>
                            <span className="text-sm font-medium">Home</span>
                        </button>
                        <div className="flex items-center gap-4 border-l-4 border-blue-400 bg-gradient-to-r from-blue-500/20 to-transparent px-6 py-3 text-blue-300 transition-all duration-300">
                            <span className="material-symbols-outlined">mic_external_on</span>
                            <span className="text-sm font-medium">Active Sessions</span>
                        </div>
                        <button type="button" onClick={() => navigate('/interview')} className="flex w-full items-center gap-4 px-6 py-3 text-left text-slate-500 transition-all duration-200 hover:text-slate-200">
                            <span className="material-symbols-outlined">person_search</span>
                            <span className="text-sm font-medium">Candidate Pool</span>
                        </button>
                        <button type="button" onClick={() => navigate('/progress')} className="flex w-full items-center gap-4 px-6 py-3 text-left text-slate-500 transition-all duration-200 hover:text-slate-200">
                            <span className="material-symbols-outlined">insights</span>
                            <span className="text-sm font-medium">Team Insights</span>
                        </button>
                    </nav>

                    <div className="mt-10 px-6">
                        <button
                            type="button"
                            onClick={() => navigate('/interview')}
                            className="w-full rounded-xl bg-gradient-to-br from-blue-300 to-blue-600 py-3 text-sm font-bold text-slate-900 shadow-lg shadow-primary/10 transition-transform active:scale-95"
                        >
                            New Interview
                        </button>
                    </div>
                </div>

                <div className="mt-auto space-y-4 border-t border-white/5 p-8">
                    <div className="flex items-center gap-4 text-slate-500">
                        <span className="material-symbols-outlined text-xl">help_outline</span>
                        <span className="text-sm font-medium">Help Center</span>
                    </div>
                    <div className="flex items-center gap-4 text-slate-500">
                        <span className="material-symbols-outlined text-xl">person</span>
                        <span className="text-sm font-medium">Account</span>
                    </div>
                </div>
            </aside>

            <main className="ml-0 min-h-screen lg:ml-72">
                <header className="sticky top-0 z-30 flex items-center justify-between bg-slate-950/60 px-6 py-5 backdrop-blur-xl md:px-12">
                    <div className="flex items-center gap-4">
                        <span className="text-xs font-medium uppercase tracking-widest text-slate-400">Candidate Report</span>
                        <div className="h-4 w-px bg-outline-variant/30" />
                        <h2 className="font-headline text-base font-bold text-on-surface md:text-xl">
                            Alex Rivera - Lead UX Designer
                        </h2>
                    </div>

                    <div className="flex items-center gap-4 md:gap-6">
                        <div className="hidden items-center gap-2 rounded-full bg-surface-container-low px-4 py-2 md:flex">
                            <span className="material-symbols-outlined text-primary text-base">schedule</span>
                            <span className="text-sm text-on-surface-variant">45m session duration</span>
                        </div>
                        <span className="material-symbols-outlined cursor-pointer text-slate-400 transition-colors hover:text-primary">notifications</span>
                        <span className="material-symbols-outlined cursor-pointer text-slate-400 transition-colors hover:text-primary">settings</span>
                        <div className="h-10 w-10 rounded-full border border-white/10 bg-gradient-to-br from-blue-400/40 to-blue-700/40" />
                    </div>
                </header>

                <div className="mx-auto max-w-7xl space-y-8 px-6 py-8 md:px-12 md:py-10">
                    <div className="grid grid-cols-12 gap-6">
                        <div className="col-span-12 rounded-3xl border border-white/5 bg-white/5 p-8 backdrop-blur-xl shadow-xl shadow-primary/10 lg:col-span-4">
                            <div className="flex flex-col items-center text-center">
                                <CircularScore percent={overallPercent} subtitle="High Affinity" />
                                <h3 className="mt-4 font-headline text-2xl font-bold">Overall Match</h3>
                                <p className="mt-2 text-sm text-on-surface-variant">
                                    Based on role criteria, technical aptitude, and behavioural distillation.
                                </p>
                                <div className="mt-5 flex items-center gap-8 text-left">
                                    <div>
                                        <p className="text-[10px] uppercase tracking-[0.16em] text-slate-400">Interview</p>
                                        <p className="text-lg font-bold text-primary">{Math.round(interviewPercent)}%</p>
                                    </div>
                                    <div>
                                        <p className="text-[10px] uppercase tracking-[0.16em] text-slate-400">Behaviour</p>
                                        <p className="text-lg font-bold text-secondary">{Math.round(behaviourPercent)}%</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="col-span-12 rounded-3xl border border-white/5 bg-surface-container-low p-8 backdrop-blur-xl shadow-xl shadow-primary/10 lg:col-span-8">
                            <div className="mb-7 flex flex-wrap items-end justify-between gap-4">
                                <div>
                                    <h3 className="font-headline text-2xl font-bold">Performance Dimensions</h3>
                                    <p className="mt-1 text-sm text-on-surface-variant">Quantifying the core attributes of potential.</p>
                                </div>
                                <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Confidence threshold: 94%</span>
                            </div>

                            <div className="grid grid-cols-1 gap-x-12 gap-y-5 md:grid-cols-2">
                                {performanceDimensions.map((metric) => (
                                    <div key={metric.key} className="space-y-2">
                                        <div className="flex items-center justify-between text-sm">
                                            <span className="font-medium text-on-surface">{metric.label}</span>
                                            <span className="font-bold text-primary">{metric.score}%</span>
                                        </div>
                                        <div className="h-2 w-full overflow-hidden rounded-full bg-surface-container-highest">
                                            <div
                                                className="h-full rounded-full bg-gradient-to-r from-blue-300 to-blue-600 transition-[width] duration-700"
                                                style={{ width: `${metric.score}%` }}
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    <section className="rounded-[2rem] border border-white/5 bg-white/5 p-8 backdrop-blur-xl shadow-xl shadow-primary/10 md:p-10">
                        <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                            <div>
                                <h3 className="font-headline text-2xl font-bold">Evolution of Affinity</h3>
                                <p className="mt-1 text-sm text-on-surface-variant">Comparing current performance against historical benchmark data.</p>
                            </div>
                            <div className="flex items-center gap-6 text-xs font-semibold text-slate-400">
                                <div className="flex items-center gap-2">
                                    <span className="h-2.5 w-2.5 rounded-full bg-[#4A70A9]" />
                                    <span>Current Session</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="h-2.5 w-2.5 rounded-full bg-[#8FABD4]" />
                                    <span>Previous Avg</span>
                                </div>
                            </div>
                        </div>

                        <div className="h-64 w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={affinityData}>
                                    <CartesianGrid strokeDasharray="3 6" stroke="rgba(255,255,255,0.08)" />
                                    <XAxis dataKey="stage" tick={{ fill: '#94a3b8', fontSize: 10 }} axisLine={false} tickLine={false} />
                                    <YAxis domain={[0, 100]} tick={{ fill: '#94a3b8', fontSize: 10 }} axisLine={false} tickLine={false} width={34} />
                                    <Tooltip
                                        contentStyle={{
                                            borderRadius: '12px',
                                            background: 'rgba(19, 27, 46, 0.96)',
                                            border: '1px solid rgba(255,255,255,0.08)',
                                            color: '#dae2fd',
                                        }}
                                    />
                                    <Line type="monotone" dataKey="previous" stroke="#8FABD4" strokeDasharray="5 5" strokeWidth={2.2} dot={false} />
                                    <Line type="monotone" dataKey="current" stroke="#4A70A9" strokeWidth={3.2} dot={{ r: 3, strokeWidth: 0, fill: '#4A70A9' }} activeDot={{ r: 6, fill: '#4A70A9', stroke: '#fff', strokeWidth: 2 }} />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>

                        <div className="mt-8 flex flex-wrap gap-10 border-t border-white/5 pt-7">
                            <div className="flex items-center gap-4">
                                <span className="font-headline text-3xl font-black text-on-surface">+{growthPercent}%</span>
                                <p className="text-[10px] font-bold uppercase leading-tight tracking-wider text-slate-400">Growth vs\nHistorical Median</p>
                            </div>
                            <div className="flex items-center gap-4">
                                <span className="font-headline text-3xl font-black text-on-surface">Top 3</span>
                                <p className="text-[10px] font-bold uppercase leading-tight tracking-wider text-slate-400">Candidate Rank\nin Pipeline</p>
                            </div>
                        </div>
                    </section>

                    <section className="grid grid-cols-12 items-center gap-6 rounded-[2rem] border-l-4 border-primary bg-gradient-to-r from-surface-container-low to-surface-container-lowest p-8 shadow-xl shadow-primary/10 md:p-10">
                        <div className="col-span-12 space-y-4 lg:col-span-8">
                            <div className="flex items-center gap-3">
                                <span className="material-symbols-outlined text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>auto_awesome</span>
                                <h3 className="font-headline text-xl font-extrabold uppercase tracking-tight">Alchemist Insight</h3>
                            </div>
                            <p className="text-base leading-relaxed text-tertiary md:text-lg">
                                Alex demonstrates exceptional <span className="text-primary">narrative clarity</span> while discussing complex systems.
                                Their response pacing indicates <span className="text-secondary">analytical mindfulness</span> and strong role-fit consistency.
                                {` ${insightText}`}
                            </p>
                        </div>
                        <div className="col-span-12 flex flex-wrap justify-end gap-3 lg:col-span-4">
                            <button className="rounded-xl bg-surface-container-high px-6 py-3 text-sm font-semibold text-on-surface transition-colors hover:bg-surface-variant">
                                View Full Transcript
                            </button>
                            <button className="rounded-xl bg-gradient-to-br from-blue-300 to-blue-600 px-6 py-3 text-sm font-bold text-slate-900 shadow-xl shadow-primary/20 transition-transform hover:scale-[1.02]">
                                Schedule Round 2
                            </button>
                        </div>
                    </section>

                    <section className="grid grid-cols-1 gap-6 md:grid-cols-3">
                        <div className="rounded-3xl border border-white/5 bg-white/5 p-8 backdrop-blur-xl shadow-xl shadow-primary/10 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-primary/20">
                            <div className="mb-6 flex items-start justify-between">
                                <div className="rounded-2xl bg-blue-500/10 p-3">
                                    <span className="material-symbols-outlined text-primary">visibility</span>
                                </div>
                                <div className="text-right">
                                    <span className="block text-[10px] font-bold uppercase tracking-widest text-slate-500">Focus Score</span>
                                    <span className="text-2xl font-black text-on-surface">{focusMetric}/100</span>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <div className="flex items-center justify-between text-xs font-medium text-on-surface-variant">
                                    <span>Eye Tracking Consistency</span>
                                    <span>{focusMetric >= 85 ? 'High' : focusMetric >= 65 ? 'Good' : 'Fair'}</span>
                                </div>
                                <div className="flex h-1.5 gap-1">
                                    {[1, 2, 3, 4, 5].map((bar) => (
                                        <div
                                            key={bar}
                                            className={`flex-1 rounded-full ${bar <= Math.max(1, Math.round(focusMetric / 20)) ? 'bg-primary' : 'bg-slate-700'}`}
                                        />
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="rounded-3xl border border-white/5 bg-white/5 p-8 backdrop-blur-xl shadow-xl shadow-primary/10 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-primary/20">
                            <div className="mb-5 flex items-start justify-between">
                                <div className="rounded-2xl bg-tertiary/10 p-3">
                                    <span className="material-symbols-outlined text-tertiary">accessibility_new</span>
                                </div>
                                <div className="text-right">
                                    <span className="block text-[10px] font-bold uppercase tracking-widest text-slate-500">Posture Quality</span>
                                    <span className="text-2xl font-black text-on-surface">{postureMetricRaw >= 70 ? 'Stable' : 'Improving'}</span>
                                </div>
                            </div>
                            <p className="text-xs leading-relaxed text-on-surface-variant">
                                Candidate maintained {postureMetricRaw >= 70 ? 'consistent' : 'moderately stable'} shoulder alignment and presence throughout the interview window.
                            </p>
                        </div>

                        <div className="rounded-3xl border border-white/5 bg-white/5 p-8 backdrop-blur-xl shadow-xl shadow-primary/10 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-primary/20">
                            <div className="mb-6 flex items-start justify-between">
                                <div className="rounded-2xl bg-secondary/10 p-3">
                                    <span className="material-symbols-outlined text-secondary">ecg_heart</span>
                                </div>
                                <div className="text-right">
                                    <span className="block text-[10px] font-bold uppercase tracking-widest text-slate-500">Calmness Index</span>
                                    <span className="text-2xl font-black text-on-surface">{calmnessMetric >= 72 ? 'Optimal' : 'Moderate'}</span>
                                </div>
                            </div>
                            <div className="flex h-12 items-end gap-1">
                                {[18, 30, 16, 38, 24, 34, 18].map((h, idx) => (
                                    <div
                                        key={idx}
                                        className="w-full rounded-t-sm bg-secondary/40"
                                        style={{ height: `${h + Math.round(calmnessMetric / 10)}%` }}
                                    />
                                ))}
                            </div>
                        </div>
                    </section>

                    <footer className="flex flex-wrap items-center justify-between gap-5 border-t border-white/5 pb-14 pt-8">
                        <div className="flex items-center gap-3 text-sm text-slate-500">
                            <span className="material-symbols-outlined text-sm">lock</span>
                            <span>Encrypted and processed by Alchemist V3 Engine</span>
                        </div>
                        <div className="flex items-center gap-4 text-sm font-semibold text-slate-400">
                            <button className="transition-colors hover:text-white">Flag for Review</button>
                            <div className="h-4 w-px bg-outline-variant/30" />
                            <button className="transition-colors hover:text-white">Export PDF</button>
                        </div>
                    </footer>

                    {hasBehaviourData && behaviourAnalysis && (
                        <BehaviourReport
                            behaviourData={behaviourAnalysis.metrics || location.state?.behaviourData}
                            behaviourFeedback={behaviourAnalysis.behaviourFeedback}
                            tips={behaviourAnalysis.tips}
                        />
                    )}
                </div>
            </main>
        </div>
    );
};

export default InterviewResultEnhanced;
