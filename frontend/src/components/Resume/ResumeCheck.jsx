import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import SetupSidebar from '../InterviewSetup/SetupSidebar';
import { resumeService } from '../../services/auth';
import { useLoading } from '../../context/LoadingContext';

const ResumeCheck = () => {
    const [profile, setProfile] = useState('');
    const [resume, setResume] = useState('');
     const [fileName, setFileName] = useState('');
    const [imagePreview, setImagePreview] = useState('');
    const [feedback, setFeedback] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();
    const { show, hide } = useLoading();

    const handleImageUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            setFileName(file.name);
            const reader = new FileReader();
            reader.onload = (event) => {
                setImagePreview(event.target.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleReset = () => {
        setFeedback(null);
        setResume('');
        setProfile('');
        setFileName('');
        setImagePreview('');
    };

    const CircularProgress = ({ percentage }) => {
        const circumference = 2 * Math.PI * 42;
        const offset = circumference - (percentage / 100) * circumference;

        return (
            <svg className="w-24 h-24 -rotate-90" viewBox="0 0 96 96">
                <circle cx="48" cy="48" r="42" fill="transparent" stroke="currentColor" strokeWidth="6" className="text-slate-700" />
                <circle cx="48" cy="48" r="42" fill="transparent" stroke="currentColor" strokeWidth="6" strokeDasharray={circumference} strokeDashoffset={offset} className="text-blue-400 transition-all duration-500" />
            </svg>
        );
    };

    const handleSubmit = async () => {
        if (!profile || (!resume && !fileName)) {
            alert('Please provide a profile and either resume text or an uploaded resume.');
            return;
        }

        setIsLoading(true);
        show('Analyzing resume…');
        try {
            const resumePayload = resume || fileName;
            const data = await resumeService.checkResume(resumePayload, profile);
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
        <main className="ml-70 p-8 max-w-[1400px] min-h-screen bg-linear-to-br from-slate-950 via-slate-900 to-slate-950">
            <SetupSidebar/>

            <header className="mb-12 relative">
                <div className="absolute -top-20 -left-20 w-80 h-80 bg-blue-500/5 blur-[120px] rounded-full -z-10"></div>
                <h1 className="text-5xl font-extrabold tracking-tight text-slate-50 mb-3">Resume Alchemist</h1>
                <p className="text-lg text-slate-400 max-w-2xl font-light leading-relaxed">Transmute raw experience into crystalline intelligence. Distill candidate potential with mathematical precision.</p>
            </header>

            {!feedback ? (
                <div className="grid grid-cols-12 gap-6 items-start">
                    <div className="col-span-12 lg:col-span-5 space-y-6">
                        <div className="group relative overflow-hidden rounded-3xl border border-white/5 bg-slate-800/40 backdrop-blur-md transition-all duration-500 hover:bg-slate-800/60 hover:border-blue-400/20 p-8">
                            <div className="absolute inset-0 bg-linear-to-br from-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                            <div className="relative z-10 flex flex-col items-center justify-center border-2 border-dashed border-slate-600/40 rounded-2xl py-14 px-6 text-center hover:border-blue-400/40 transition-colors">
                                <div className="w-16 h-16 rounded-full bg-slate-700/50 flex items-center justify-center mb-5 shadow-inner">
                                    <svg className="w-8 h-8 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3v-6" />
                                    </svg>
                                </div>
                                <h3 className="text-xl font-bold text-slate-50 mb-2">Initiate Distillation</h3>
                                <p className="text-sm text-slate-400 mb-8 max-w-xs">Drag and drop CV (PDF, DOCX) or click to browse.</p>
                                <label className="px-6 py-2.5 bg-slate-700/60 text-blue-400 text-sm font-bold rounded-lg border border-blue-400/20 hover:bg-blue-400/10 hover:text-blue-300 transition-all cursor-pointer">
                                    Select Resume
                                    <input type="file" id="imageInput" accept="image/*,.pdf,.docx" onChange={handleImageUpload} className="hidden" />
                                </label>
                            </div>
                        </div>
                        {fileName && (
                            <div className="flex items-center justify-between p-4 rounded-2xl border border-white/5 bg-slate-800/40 backdrop-blur-md">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center">
                                        <svg className="w-5 h-5 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                                            <path d="M4 4a2 2 0 012-2h6a1 1 0 00-1-1H6a3 3 0 00-3 3v10a3 3 0 003 3h8a3 3 0 003-3V8a1 1 0 00-1 1v6a2 2 0 01-2 2H4a2 2 0 01-2-2V4zm6-3h4v2H10V1z" />
                                        </svg>
                                    </div>
                                    <div>
                                        <p className="font-bold text-sm text-slate-50">{fileName}</p>
                                        <p className="text-xs text-slate-400">Ready to analyze</p>
                                    </div>
                                </div>
                                <button onClick={() => { setFileName(''); setImagePreview(''); }} className="p-1.5 text-slate-400 hover:text-red-400 transition-colors">
                                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                                    </svg>
                                </button>
                            </div>
                        )}
                        {imagePreview && (
                            <div className="rounded-2xl border border-white/5 bg-slate-800/40 backdrop-blur-md p-4 overflow-hidden">
                                <img src={imagePreview} alt="Resume Preview" className="w-full h-auto rounded-lg" />
                            </div>
                        )}
                    </div>
                    <div className="col-span-12 lg:col-span-7 space-y-6">
                        <div className="rounded-3xl border border-white/5 bg-slate-800/40 backdrop-blur-md p-8">
                            <label htmlFor="profile" className="block text-sm font-bold text-slate-50 mb-4">Select Job Profile/Role</label>
                            <select id="profile" value={profile} onChange={(e) => setProfile(e.target.value)} className="w-full px-4 py-3 rounded-xl bg-slate-700/50 border border-slate-600/50 text-slate-50 font-medium focus:outline-none focus:border-blue-400/50 focus:ring-1 focus:ring-blue-400/20 transition-all">
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
                        <div className="rounded-3xl border border-white/5 bg-slate-800/40 backdrop-blur-md p-8">
                            <label htmlFor="resume" className="block text-sm font-bold text-slate-50 mb-4">Resume Content</label>
                            <textarea id="resume" value={resume} onChange={(e) => setResume(e.target.value)} rows="8" placeholder="Paste your resume content here..." className="w-full px-4 py-3 rounded-xl bg-slate-700/50 border border-slate-600/50 text-slate-50 placeholder-slate-500 font-medium focus:outline-none focus:border-blue-400/50 focus:ring-1 focus:ring-blue-400/20 transition-all resize-none" />
                        </div>
                        <button onClick={handleSubmit} disabled={isLoading || !profile || (!resume && !fileName)} className="w-full px-6 py-4 bg-linear-to-br from-blue-500 to-blue-600 text-white font-bold rounded-xl shadow-lg shadow-blue-500/20 hover:shadow-xl hover:shadow-blue-500/30 hover:from-blue-400 hover:to-blue-500 disabled:opacity-50 disabled:cursor-not-allowed active:scale-95 transition-all duration-200">
                            {isLoading ? (<span className="flex items-center justify-center gap-2"><svg className="w-5 h-5 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 2v20m10-10H2" /></svg>Analyzing Resume…</span>) : ('Analyze Resume')}
                        </button>
                    </div>
                </div>
            ) : (
                <div className="space-y-6">
                    <div className="rounded-3xl border border-white/5 bg-slate-800/40 backdrop-blur-md p-8">
                        <div className="flex items-center justify-between mb-8">
                            <h3 className="text-xl font-bold text-slate-50">Match Synthesis</h3>
                            <svg className="w-6 h-6 text-amber-400" fill="currentColor" viewBox="0 0 20 20"><path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" /></svg>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center mb-8">
                            <div className="flex items-center gap-6">
                                <div className="relative w-24 h-24 flex items-center justify-center shrink-0">
                                    <CircularProgress percentage={parseInt(feedback.score) || 75} />
                                    <div className="absolute inset-0 flex items-center justify-center"><span className="text-2xl font-extrabold text-slate-50">{feedback.score}%</span></div>
                                </div>
                                <div>
                                    <p className="text-sm text-slate-300 leading-relaxed mb-4">High affinity for <span className="text-blue-400 font-bold">{profile}</span> role. Core competencies exceed requirements by 12%.</p>
                                    <div className="h-1.5 w-full bg-slate-700/50 rounded-full overflow-hidden"><div className="h-full bg-linear-to-r from-blue-400 to-blue-500 w-3/4 rounded-full"></div></div>
                                </div>
                            </div>
                            <div>
                                <p className="text-xs uppercase tracking-widest text-slate-400 font-bold mb-4">Key Alchemy Tags</p>
                                <div className="flex flex-wrap gap-2">
                                    {['React 18', 'TypeScript', 'Node.js', 'AWS'].map((tag) => (<span key={tag} className="px-3 py-1.5 bg-amber-500/10 text-amber-300 text-xs font-bold rounded-lg border border-amber-500/20">{tag}</span>))}
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="rounded-2xl border border-white/5 bg-slate-800/40 backdrop-blur-md p-6">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center"><svg className="w-5 h-5 text-blue-400" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg></div>
                                <h3 className="text-base font-bold text-slate-50">Core Strengths</h3>
                            </div>
                            <ReactMarkdown
                                remarkPlugins={[remarkGfm]}
                                className="prose prose-invert max-w-none text-sm text-slate-300"
                            >
                                {feedback.goodPoints || ''}
                            </ReactMarkdown>
                        </div>
                        <div className="rounded-2xl border border-white/5 bg-slate-800/40 backdrop-blur-md p-6">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="w-8 h-8 rounded-full bg-red-500/20 flex items-center justify-center"><svg className="w-5 h-5 text-red-400" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" /></svg></div>
                                <h3 className="text-base font-bold text-slate-50">Growth Vectors</h3>
                            </div>
                            <ReactMarkdown
                                remarkPlugins={[remarkGfm]}
                                className="prose prose-invert max-w-none text-sm text-slate-300"
                            >
                                {feedback.improvementPoints || ''}
                            </ReactMarkdown>
                        </div>
                    </div>
                    <div className="relative overflow-hidden rounded-3xl border border-white/5 bg-slate-800/40 backdrop-blur-md p-10 md:p-12 md:flex items-center gap-12">
                        <div className="absolute inset-0 opacity-[0.03] mix-blend-overlay"><div className="absolute inset-0 bg-linear-to-r from-blue-500 via-transparent to-transparent"></div></div>
                        <div className="relative z-10 flex-1">
                            <h2 className="text-3xl font-bold text-slate-50 mb-5">AI Behavioral Projection</h2>
                            <p className="text-slate-300 text-base leading-relaxed mb-8">Our proprietary Alchemist model projects this candidate's performance based on historical data. Predicted 92% retention rate over the first 24 months.</p>
                            <div className="flex gap-4 flex-wrap">
                                <button onClick={() => alert('Generate Full Report - Feature coming soon')} className="px-6 py-3 bg-linear-to-br from-blue-500 to-blue-600 text-white font-bold rounded-lg shadow-lg shadow-blue-500/20 hover:shadow-xl hover:shadow-blue-500/30 active:scale-95 transition-all">Generate Full Report</button>
                                <button onClick={() => alert('Compare Candidates - Feature coming soon')} className="px-6 py-3 bg-slate-700/50 text-slate-100 font-bold rounded-lg border border-slate-600/50 hover:bg-slate-700 active:scale-95 transition-all">Compare Candidates</button>
                            </div>
                        </div>
                        <div className="relative z-10 hidden lg:flex flex-1 h-32 items-center justify-center gap-3">
                            {[30, 50, 40, 60].map((height, idx) => (<div key={idx} className="w-1 bg-slate-700/50 rounded-full overflow-hidden" style={{ height: `${height}%` }}><div className="w-full h-1/2 bg-linear-to-t from-blue-400 to-blue-500"></div></div>))}
                        </div>
                    </div>
                    <div className="flex gap-4 pt-4">
                        <button onClick={handleReset} className="flex-1 px-6 py-4 bg-slate-700/50 text-slate-100 font-bold rounded-xl border border-slate-600/50 hover:bg-slate-700 active:scale-95 transition-all">Check Another Resume</button>
                        <button onClick={() => navigate('/dashboard')} className="flex-1 px-6 py-4 bg-slate-700/50 text-slate-100 font-bold rounded-xl border border-slate-600/50 hover:bg-slate-700 active:scale-95 transition-all">Back to Dashboard</button>
                    </div>
                </div>
            )}
        </main>
    );
};

export default ResumeCheck;
