import { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { interviewService } from '../../services/auth';
import useBehaviourTracking from '../../hooks/useBehaviourTracking';
import SetupSidebar from '../InterviewSetup/SetupSidebar';
import SetupHeader from '../InterviewSetup/SetupHeader';
import DomainGrid from '../InterviewSetup/DomainGrid';
import ConfigurationPanel from '../InterviewSetup/ConfigurationPanel';
import SessionInsightCard from '../InterviewSetup/SessionInsightCard';
import './Interview.css';

const DOMAIN_OPTIONS = [
    {
        value: 'DSA',
        label: 'DSA & Problem Solving',
        description: 'Algorithm optimization, complex data structures, and computational complexity analysis.',
        icon: 'code',
        iconColor: 'text-primary',
        tags: ['Recursion', 'Dynamic Programming', 'Graph Theory'],
        badge: 'Most Popular',
        large: true,
    },
    {
        value: 'System Design',
        label: 'System Design',
        description: 'Distributed systems, scalability, and high-availability architecture.',
        icon: 'account_tree',
        iconColor: 'text-secondary',
    },
    {
        value: 'HR',
        label: 'HR & Behavioral',
        description: 'Soft skills, leadership, and culture-fit distillation.',
        icon: 'psychology',
        iconColor: 'text-tertiary',
    },
    {
        value: 'Frontend',
        label: 'Frontend Eng',
        description: 'Performance, accessibility, and modern framework mastery.',
        icon: 'web',
        iconColor: 'text-primary-fixed-dim',
    },
    {
        value: 'Backend',
        label: 'Backend & API',
        description: 'Security, concurrency, and persistent storage strategies.',
        icon: 'database',
        iconColor: 'text-on-secondary-container',
    },
];

const DIFFICULTY_OPTIONS = [
    { value: 'junior', label: 'Junior', icon: 'speed' },
    { value: 'senior', label: 'Senior', icon: 'bolt' },
    { value: 'expert', label: 'Expert', icon: 'local_fire_department' },
];

const InterviewStart = () => {
    const [step, setStep] = useState(0);
    const [domain, setDomain] = useState('');
    const [difficulty, setDifficulty] = useState('');
    const [numberOfQuestions, setNumberOfQuestions] = useState(12);
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [currentQuestion, setCurrentQuestion] = useState('');
    const [qno, setQno] = useState(0);
    const [answer, setAnswer] = useState('');
    const [isSpeechEnabled, setIsSpeechEnabled] = useState(true);
    const [isRecording, setIsRecording] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [isCameraOn, setIsCameraOn] = useState(false);
    const [showCameraPrompt, setShowCameraPrompt] = useState(false);
    const [cameraPrompt, setCameraPrompt] = useState('');
    const [showCameraModal, setShowCameraModal] = useState(false);
    const [cameraRequestDenied, setCameraRequestDenied] = useState(false);
    const [availableVoices, setAvailableVoices] = useState([]);
    const [textInputMode, setTextInputMode] = useState(false);
    const [isPaused, setIsPaused] = useState(false);
    const videoRef = useRef(null);
    const cameraStreamRef = useRef(null);
    const hasPromptedForCameraRef = useRef(false);
    const { startTracking, stopTracking, getBehaviourData, isTracking } = useBehaviourTracking();

    const mediaRecorderRef = useRef(null);
    const audioChunksRef = useRef([]);
    const voicesRef = useRef([]);
    const voiceListenerRef = useRef(null);
    const pendingSpeechRef = useRef(null);
    const navigate = useNavigate();
    const location = useLocation();
    const hasAutoStartedRef = useRef(false);

    const speakText = useCallback((text) => {
        if (!isSpeechEnabled || typeof window === 'undefined' || !window.speechSynthesis || typeof window.SpeechSynthesisUtterance === 'undefined') {
            return;
        }

        const ensureVoices = () => {
            const voices = window.speechSynthesis.getVoices();
            if (voices && voices.length) {
                voicesRef.current = voices;
                if (!availableVoices.length) {
                    setAvailableVoices(voices);
                }
            }
            return voicesRef.current;
        };

        let voices = voicesRef.current.length ? voicesRef.current : ensureVoices();

        if (!voices || voices.length === 0) {
            pendingSpeechRef.current = text;

            if (!voiceListenerRef.current) {
                const handleVoicesReady = () => {
                    window.speechSynthesis.removeEventListener('voiceschanged', handleVoicesReady);
                    voiceListenerRef.current = null;
                    const updatedVoices = window.speechSynthesis.getVoices() || [];
                    voicesRef.current = updatedVoices;
                    if (!updatedVoices.length) {
                        return;
                    }
                    setAvailableVoices(updatedVoices);
                    const pendingText = pendingSpeechRef.current;
                    pendingSpeechRef.current = null;
                    if (pendingText) {
                        speakText(pendingText);
                    }
                };

                voiceListenerRef.current = handleVoicesReady;
                window.speechSynthesis.addEventListener('voiceschanged', handleVoicesReady);
            }

            window.speechSynthesis.resume?.();
            return;
        }

        window.speechSynthesis.cancel();
        pendingSpeechRef.current = null;
        const utterance = new window.SpeechSynthesisUtterance(text);
        utterance.lang = 'en-US';
        const preferredVoice = voices.find(voice => voice.name === 'Google UK English Male');
        const fallbackVoice = voices.find(voice => voice.lang && voice.lang.toLowerCase().startsWith('en'));
        utterance.voice = preferredVoice || fallbackVoice || voices[0];
        window.speechSynthesis.speak(utterance);
    }, [availableVoices.length, isSpeechEnabled]);

    useEffect(() => {
        if (typeof window === 'undefined' || !window.speechSynthesis) {
            return;
        }

        const updateVoices = () => {
            const voices = window.speechSynthesis.getVoices();
            if (voices && voices.length) {
                voicesRef.current = voices;
                setAvailableVoices(voices);
            }
        };

        updateVoices();
        window.speechSynthesis.addEventListener('voiceschanged', updateVoices);

        return () => {
            window.speechSynthesis.removeEventListener('voiceschanged', updateVoices);
        };
    }, []);

    useEffect(() => {
        if (isSpeechEnabled && typeof window !== 'undefined' && window.speechSynthesis) {
            window.speechSynthesis.resume?.();
        }
    }, [isSpeechEnabled]);

    useEffect(() => {
        if (step === 1 && !isCameraOn && !hasPromptedForCameraRef.current) {
            hasPromptedForCameraRef.current = true;
            setShowCameraModal(true);
        }
    }, [step, isCameraOn]);

    const handleSpeechToggle = () => {
        setIsSpeechEnabled((prev) => {
            const next = !prev;
            if (!next && typeof window !== 'undefined' && window.speechSynthesis) {
                window.speechSynthesis.cancel();
            }
            return next;
        });
    };

    const startInterviewSession = useCallback(async (selectedDomain, selectedQuestionCount) => {
        if (!selectedQuestionCount || selectedQuestionCount <= 0) {
            alert('Please enter a valid number of questions.');
            return;
        }
        if (!selectedDomain || selectedDomain.trim().length === 0) {
            alert('Please enter a domain for the interview.');
            return;
        }

        setIsLoading(true);
        try {
            // Reset any previous interview session before starting
            await interviewService.resetInterview();

            const data = await interviewService.generateQuestion(selectedDomain, selectedQuestionCount);
            setQno(data.qno);
            setCurrentQuestion(data.question);
            setStep(1);
        } catch (error) {
            hasAutoStartedRef.current = false;
            alert('Failed to fetch question. Please try again.');
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    }, []);

    const handleSetupStart = () => {
        if (!numberOfQuestions || numberOfQuestions < 5) {
            alert('Please choose at least 5 questions.');
            return;
        }
        if (!domain) {
            alert('Please select an interview domain.');
            return;
        }
        if (!difficulty) {
            alert('Please select a difficulty level.');
            return;
        }

        navigate('/interview', {
            state: {
                domain,
                difficulty,
                questionCount: numberOfQuestions,
                fromSetup: true,
            },
        });
    };

    useEffect(() => {
        const setupState = location.state;
        if (
            step !== 0 ||
            !setupState?.fromSetup ||
            !setupState?.domain ||
            !setupState?.difficulty ||
            !setupState?.questionCount ||
            hasAutoStartedRef.current
        ) {
            return;
        }

        hasAutoStartedRef.current = true;
        setDomain(setupState.domain);
        setDifficulty(setupState.difficulty);
        setNumberOfQuestions(setupState.questionCount);
        startInterviewSession(setupState.domain, setupState.questionCount);
    }, [location.state, startInterviewSession, step]);

    const handleSubmitAnswer = async () => {
        if (!answer.trim()) {
            alert('Please enter your answer.');
            return;
        }

        setIsLoading(true);
        try {
            await interviewService.submitAnswer(answer);
            alert('Answer submitted!');
            setAnswer('');

            if (qno < numberOfQuestions) {
                const data = await interviewService.generateQuestion(domain, numberOfQuestions);
                setQno(data.qno);
                setCurrentQuestion(data.question);
                speakText(data.question);
            } else {
                // Interview complete - collect behaviour data if tracking was active
                let behaviourData = null;
                if (isTracking) {
                    console.log('Stopping tracking and collecting behaviour data...');
                    await stopTracking();
                    behaviourData = getBehaviourData();
                    console.log('Behaviour data collected:', behaviourData);
                } else {
                    console.log('Tracking was not active, no behaviour data to collect');
                }

                // Stop camera when interview ends - MUST happen after tracking stops
                if (isCameraOn && cameraStreamRef.current) {
                    console.log('📹 Stopping camera stream...');
                    try {
                        // Give WebGazer time to fully release camera
                        await new Promise(resolve => setTimeout(resolve, 500));

                        cameraStreamRef.current.getTracks().forEach(track => {
                            console.log('Stopping track:', track.kind, track.label);
                            track.stop();
                        });
                        cameraStreamRef.current = null;
                        if (videoRef.current) {
                            videoRef.current.srcObject = null;
                        }
                        setIsCameraOn(false);
                        console.log('Camera fully stopped');
                    } catch (e) {
                        console.error('Error stopping camera:', e);
                    }
                }

                navigate('/feedback', { state: { behaviourData } });
            }
        } catch (error) {
            alert('Failed to submit answer. Please try again.');
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    // Handle camera modal - Enable Camera
    const handleEnableCamera = async () => {
        setShowCameraModal(false);
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: true });
            cameraStreamRef.current = stream;
            if (videoRef.current) {
                videoRef.current.srcObject = stream;
                await videoRef.current.play().catch(() => { });
            }
            setIsCameraOn(true);
            setCameraRequestDenied(false);

            // Start behaviour tracking
            if (step > 0 && !isTracking) {
                setTimeout(() => {
                    startTracking(videoRef);
                }, 1000);
            }

            // Speak the question after camera is enabled
            if (currentQuestion) {
                setTimeout(() => speakText(currentQuestion), 500);
            }
        } catch (err) {
            console.error('Camera access error:', err);
            setCameraRequestDenied(true);
            alert('Camera access denied. You can enable it later using the camera button, or continue without it.');

            // Still speak the question even if camera fails
            if (currentQuestion) {
                setTimeout(() => speakText(currentQuestion), 500);
            }
        }
    };

    // Handle camera modal - Skip Camera
    const handleSkipCamera = () => {
        setShowCameraModal(false);
        setCameraRequestDenied(true);
        setShowCameraPrompt(true);
        setCameraPrompt('You can enable the camera anytime using the camera button below to help the AI assess your body language.');

        // Speak the question after modal is skipped
        if (currentQuestion) {
            setTimeout(() => speakText(currentQuestion), 300);
        }
    };

    // Camera support: toggle camera preview and manage stream lifecycle
    const handleCameraToggle = async () => {
        if (!isCameraOn) {
            try {
                const stream = await navigator.mediaDevices.getUserMedia({ video: true });
                cameraStreamRef.current = stream;
                if (videoRef.current) {
                    videoRef.current.srcObject = stream;
                    await videoRef.current.play().catch(() => { });
                }
                setIsCameraOn(true);
                setShowCameraPrompt(false);
                setCameraPrompt('');

                // Start behaviour tracking when camera is enabled during interview
                if (step > 0 && !isTracking) {
                    setTimeout(() => {
                        startTracking(videoRef);
                    }, 1000); // Small delay to ensure video is playing
                }
            } catch (err) {
                console.error('Camera access error:', err);
                alert('Please allow camera permissions.');
            }
        } else {
            if (isTracking) {
                stopTracking();
            }

            // Stop tracks
            try {
                const s = cameraStreamRef.current;
                if (s) s.getTracks().forEach(t => t.stop());
            } catch (e) {
                console.error('Error stopping camera:', e);
            }
            cameraStreamRef.current = null;
            if (videoRef.current) videoRef.current.srcObject = null;
            setIsCameraOn(false);
        }
    };

    // cleanup on unmount
    useEffect(() => {
        return () => {
            console.log('🧹 Cleaning up interview component...');

            // Stop tracking first
            if (isTracking) {
                stopTracking();
            }

            // Stop camera
            const s = cameraStreamRef.current;
            if (s) {
                s.getTracks().forEach(t => {
                    console.log('Unmount cleanup - stopping track:', t.kind);
                    t.stop();
                });
            }
            cameraStreamRef.current = null;

            // Cleanup speech
            if (typeof window !== 'undefined' && window.speechSynthesis) {
                if (voiceListenerRef.current) {
                    window.speechSynthesis.removeEventListener('voiceschanged', voiceListenerRef.current);
                    voiceListenerRef.current = null;
                }
                pendingSpeechRef.current = null;
                window.speechSynthesis.cancel();
            }

            console.log('Interview component cleanup complete');
        };
    }, [isTracking, stopTracking]);

    const handleMicToggle = async () => {
        if (!isRecording) {
            try {
                const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
                const mediaRecorder = new MediaRecorder(stream);
                mediaRecorderRef.current = mediaRecorder;
                audioChunksRef.current = [];

                mediaRecorder.ondataavailable = (e) => {
                    if (e.data.size > 0) audioChunksRef.current.push(e.data);
                };

                mediaRecorder.onstop = async () => {
                    const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
                    const currentText = answer;
                    setAnswer(currentText + '\n⌛ Transcribing...');

                    try {
                        const data = await interviewService.transcribeAudio(audioBlob);
                        if (data.text) {
                            setAnswer(currentText + ' ' + data.text);
                        } else {
                            setAnswer(currentText + '\n Failed to transcribe.');
                        }
                    } catch (err) {
                        console.error(err);
                        setAnswer(currentText + `\n Error: ${err.message}`);
                    }

                    stream.getTracks().forEach(track => track.stop());
                };

                mediaRecorder.start();
                setIsRecording(true);
            } catch (err) {
                console.error('Microphone access error:', err);
                alert('Please allow microphone permissions.');
            }
        } else {
            if (mediaRecorderRef.current) {
                mediaRecorderRef.current.stop();
                setIsRecording(false);
            }
        }
    };

    const handleHome = async () => {
        const confirm = window.confirm('This interview will not be saved. Continue?');
        if (confirm) {
            try {
                await interviewService.resetInterview();
                navigate('/dashboard');
            } catch (error) {
                alert('Failed to navigate. Please try again.');
            }
        }
    };

    const handlePauseSession = () => {
        setIsPaused((prev) => !prev);
    };

    return (
        <div className="interview-container">
            {step > 0 && (
                <div className="interview-header">
                    <button onClick={handleHome} className="home-btn">Home</button>
                    <h2 className="interview-title">AI Interview Session</h2>
                </div>
            )}

            {step === 0 && (
                <div className="relative min-h-screen bg-surface text-on-surface font-body selection:bg-primary/30">
                    <SetupSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
                    <main className="w-full min-h-screen md:pl-72">
                        <SetupHeader onOpenSidebar={() => setSidebarOpen(true)} />
                        <div className="w-full p-4 md:p-6 lg:p-10 xl:px-12">
                            <div className="mb-10 md:mb-12">
                                <span className="text-primary font-bold tracking-[0.2em] text-[10px] uppercase block mb-2">
                                    Phase 01 — Selection
                                </span>
                                <h3 className="text-3xl md:text-4xl lg:text-5xl font-extrabold tracking-tight font-headline text-on-surface mb-4">
                                    Choose Domain
                                </h3>
                                <p className="text-on-surface-variant max-w-2xl text-base md:text-lg">
                                    Distill technical competence through AI-driven evaluation. Select a domain to begin the configuration.
                                </p>
                            </div>

                            <DomainGrid domains={DOMAIN_OPTIONS} selectedDomain={domain} onSelectDomain={setDomain} />

                            <section
                                id="phase-2"
                                className="scroll-mt-28 pt-2 md:pt-4 grid grid-cols-1 xl:grid-cols-3 gap-8 md:gap-10"
                            >
                                <div className="lg:col-span-2 space-y-8 w-full">
                                    <div className="mb-8">
                                        <span className="text-primary font-bold tracking-[0.2em] text-[10px] uppercase block mb-2">
                                            Phase 02 — Parameters
                                        </span>
                                        <h3 className="text-2xl md:text-3xl font-bold font-headline">Fine-tune the Alchemist</h3>
                                    </div>
                                    <ConfigurationPanel
                                        questionCount={numberOfQuestions}
                                        onQuestionCountChange={setNumberOfQuestions}
                                        difficulty={difficulty}
                                        onDifficultyChange={setDifficulty}
                                        difficulties={DIFFICULTY_OPTIONS}
                                    />
                                </div>
                                <div className="xl:sticky xl:top-28 h-fit">
                                    <div className="w-full max-w-[380px]">
                                        <SessionInsightCard
                                            disabled={!domain || !difficulty || !numberOfQuestions}
                                            loading={isLoading}
                                            onStart={handleSetupStart}
                                        />
                                    </div>
                                </div>
                            </section>
                        </div>
                    </main>
                </div>
            )}

            {step > 0 && (
                <div className="min-h-screen bg-[#0b1326] text-on-surface flex flex-col">
                    <header className="w-full top-0 sticky bg-slate-950/60 backdrop-blur-xl flex justify-between items-center px-4 md:px-8 py-4 z-40 shadow-[0_20px_50px_rgba(11,19,38,0.3)]">
                        <div className="flex items-center gap-4 md:gap-6">
                            <span className="text-xl md:text-2xl font-bold tracking-tighter bg-gradient-to-br from-blue-300 to-blue-600 bg-clip-text text-transparent font-headline">
                                Alchemist AI
                            </span>
                            <nav className="hidden md:flex gap-6 ml-4">
                                <button type="button" onClick={handleHome} className="font-headline tracking-tight text-slate-400 hover:text-slate-200 transition-colors">Dashboard</button>
                                <span className="font-headline tracking-tight text-blue-400 border-b-2 border-blue-400 pb-1">Interviews</span>
                                <span className="font-headline tracking-tight text-slate-400">Analytics</span>
                                <span className="font-headline tracking-tight text-slate-400">Library</span>
                            </nav>
                        </div>
                        <div className="flex items-center gap-2 md:gap-4">
                            <button type="button" onClick={handleSpeechToggle} className="p-2 rounded-lg text-slate-400 hover:bg-white/5 transition-all active:scale-90">
                                <span className="material-symbols-outlined">{isSpeechEnabled ? 'volume_up' : 'volume_off'}</span>
                            </button>
                            <button type="button" onClick={handleCameraToggle} className="p-2 rounded-lg text-slate-400 hover:bg-white/5 transition-all active:scale-90">
                                <span className="material-symbols-outlined">{isCameraOn ? 'videocam' : 'videocam_off'}</span>
                            </button>
                            <button type="button" onClick={handleMicToggle} className={`p-2 rounded-lg transition-all active:scale-90 ${isRecording ? 'text-red-400 bg-red-500/10' : 'text-slate-400 hover:bg-white/5'}`}>
                                <span className="material-symbols-outlined">mic</span>
                            </button>
                        </div>
                    </header>

                    <main className="flex-1 overflow-hidden">
                        <div className="h-full grid grid-cols-1 xl:grid-cols-[30%_1fr_25%]">
                            <aside className="p-5 md:p-8 xl:p-10 flex flex-col gap-6 md:gap-8 bg-surface-container-low border-r border-white/5">
                                <div className="flex flex-col gap-2">
                                    <span className="text-primary text-xs font-bold uppercase tracking-widest font-label">
                                        Question {qno || 1} of {numberOfQuestions}
                                    </span>
                                    <h2 id="question" className="text-2xl md:text-3xl font-headline font-extrabold leading-tight tracking-tight text-on-surface">
                                        {currentQuestion}
                                    </h2>
                                </div>

                                <div className="glass-card setup-card-gradient p-5 md:p-6 rounded-2xl flex flex-col gap-4 border border-white/10">
                                    <div className="flex items-center gap-3">
                                        <span className="material-symbols-outlined text-tertiary">psychology</span>
                                        <span className="text-tertiary-fixed text-sm font-label font-medium uppercase tracking-wider">AI Distillation Hints</span>
                                    </div>
                                    <p className="text-on-surface-variant text-sm leading-relaxed">
                                        Focus on the specific analytical tools you used and the quantifiable outcome for the stakeholders.
                                    </p>
                                    <div className="flex flex-wrap gap-2 mt-1">
                                        <span className="bg-tertiary-container/30 text-on-tertiary-container px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-tighter">Strategic Depth</span>
                                        <span className="bg-tertiary-container/30 text-on-tertiary-container px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-tighter">Data Literacy</span>
                                    </div>
                                </div>

                                {showCameraPrompt && (
                                    <div className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-on-surface-variant">
                                        {cameraPrompt}
                                    </div>
                                )}

                                <div className="mt-auto">
                                    <div className="p-4 rounded-xl border border-white/5 bg-surface-container-lowest">
                                        <div className="flex justify-between items-center mb-2">
                                            <span className="text-xs text-on-surface-variant font-medium">Session Progress</span>
                                            <span className="text-xs text-primary font-bold">
                                                {Math.round(((qno || 1) / numberOfQuestions) * 100)}%
                                            </span>
                                        </div>
                                        <div className="w-full bg-white/5 h-1.5 rounded-full overflow-hidden">
                                            <div className="bg-primary h-full rounded-full transition-all duration-300" style={{ width: `${Math.round(((qno || 1) / numberOfQuestions) * 100)}%` }} />
                                        </div>
                                    </div>
                                </div>
                            </aside>

                            <section className="relative p-4 md:p-6 bg-surface flex items-center justify-center border-r border-white/5">
                                <div id="video-container" className="w-full max-w-5xl aspect-video rounded-2xl overflow-hidden relative shadow-[0_0_30px_rgba(168,200,255,0.2)] bg-surface-container-lowest">
                                    <video
                                        id="video"
                                        ref={videoRef}
                                        data-interview-video="true"
                                        autoPlay
                                        muted
                                        playsInline
                                        className={`w-full h-full object-cover ${isCameraOn ? 'opacity-100' : 'opacity-20'}`}
                                    />
                                    <div className="absolute inset-0 pointer-events-none p-4 md:p-6 flex flex-col justify-between">
                                        <div className="flex justify-between items-start gap-3">
                                            <div className="glass-card px-4 py-2 rounded-full flex items-center gap-2 border border-white/10">
                                                <span className={`w-2 h-2 rounded-full ${isRecording ? 'bg-green-500 animate-pulse' : 'bg-primary/70'}`} />
                                                <span className="text-xs md:text-sm font-medium tracking-tight text-white/90">LIVE RECORDING</span>
                                            </div>
                                            <div className="flex gap-2 md:gap-3">
                                                <div className="glass-card px-3 py-2 rounded-xl flex flex-col items-center min-w-[90px]">
                                                    <span className="text-[10px] text-white/60 font-bold uppercase tracking-tighter">Eye Gaze</span>
                                                    <span className={`font-bold text-xs md:text-sm ${isCameraOn ? 'text-primary' : 'text-slate-400'}`}>{isCameraOn ? 'Optimized' : 'Inactive'}</span>
                                                </div>
                                                <div className="glass-card px-3 py-2 rounded-xl flex flex-col items-center min-w-[90px]">
                                                    <span className="text-[10px] text-white/60 font-bold uppercase tracking-tighter">Posture</span>
                                                    <span className={`font-bold text-xs md:text-sm ${isCameraOn ? 'text-green-400' : 'text-slate-400'}`}>{isCameraOn ? 'Good' : 'Unknown'}</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex justify-center items-end gap-1 h-10 md:h-12 mb-1">
                                            <div className={`w-1.5 bg-primary rounded-full opacity-40 ${isRecording ? 'h-4 animate-pulse' : 'h-2'}`} />
                                            <div className={`w-1.5 bg-primary rounded-full opacity-60 ${isRecording ? 'h-8 animate-pulse' : 'h-3'}`} />
                                            <div className={`w-1.5 bg-primary rounded-full ${isRecording ? 'h-12 animate-pulse' : 'h-4'}`} />
                                            <div className={`w-1.5 bg-primary rounded-full opacity-80 ${isRecording ? 'h-6 animate-pulse' : 'h-3'}`} />
                                            <div className={`w-1.5 bg-primary rounded-full ${isRecording ? 'h-10 animate-pulse' : 'h-3'}`} />
                                        </div>
                                    </div>
                                    {!isCameraOn && (
                                        <div className="absolute inset-0 flex items-center justify-center bg-surface-container-lowest/70">
                                            <span className="text-on-surface-variant text-sm">Camera is off. Enable camera to continue behavior tracking.</span>
                                        </div>
                                    )}
                                </div>
                            </section>

                            <aside className="p-4 md:p-6 xl:p-8 flex flex-col gap-4 md:gap-6 bg-surface-container-low">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm font-bold text-on-surface">Live Transcription</span>
                                    <span className="material-symbols-outlined text-sm text-primary">mic</span>
                                </div>
                                <div className="flex-1 min-h-[220px] bg-surface-container-lowest rounded-xl p-4 md:p-5 overflow-y-auto border border-white/5">
                                    <p className="text-sm text-on-surface-variant leading-relaxed whitespace-pre-wrap">
                                        {answer?.trim() || 'Your live transcript appears here. Use microphone or switch to text input.'}
                                        <span className="w-1 h-4 bg-primary inline-block align-middle ml-1 animate-pulse" />
                                    </p>
                                </div>
                                {textInputMode && (
                                    <textarea
                                        id="answer"
                                        value={answer}
                                        onChange={(e) => setAnswer(e.target.value)}
                                        rows="5"
                                        placeholder="Type your answer here..."
                                        className="w-full bg-surface-container-lowest rounded-xl p-4 border border-white/10 text-sm text-on-surface placeholder:text-on-surface-variant/70 focus:outline-none focus:ring-2 focus:ring-primary/30"
                                    />
                                )}
                                <div className="glass-card p-4 rounded-xl">
                                    <div className="flex items-center justify-between mb-3">
                                        <span className="text-xs font-bold text-on-surface/70 tracking-wide uppercase">Real-time Metrics</span>
                                        <span className="material-symbols-outlined text-xs text-secondary">trending_up</span>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="flex flex-col">
                                            <span className="text-[10px] text-on-surface-variant uppercase tracking-tighter">Confidence</span>
                                            <span className="text-lg font-headline font-extrabold text-primary">{Math.min(95, 70 + Math.round(answer.length / 12))}%</span>
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="text-[10px] text-on-surface-variant uppercase tracking-tighter">Clarity</span>
                                            <span className="text-lg font-headline font-extrabold text-secondary">{answer.length > 120 ? 'High' : 'Medium'}</span>
                                        </div>
                                    </div>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setTextInputMode((prev) => !prev)}
                                    className="w-full glass-card py-3 rounded-full text-on-surface font-headline font-bold text-sm tracking-tight border border-white/10 hover:bg-white/5 transition-all active:scale-95"
                                >
                                    {textInputMode ? 'Hide Text Input' : 'Switch to Text Input'}
                                </button>
                            </aside>
                        </div>
                    </main>

                    <footer className="h-20 md:h-24 bg-slate-950 px-4 md:px-10 flex items-center justify-between gap-4 z-30 border-t border-white/5">
                        <div className="flex gap-6 md:gap-10 items-center">
                            <div className="flex flex-col">
                                <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-1">Focus Level</span>
                                <div className="flex items-center gap-3">
                                    <div className="flex gap-1">
                                        <div className="w-1.5 h-3 bg-blue-400/80 rounded-full" />
                                        <div className="w-1.5 h-3 bg-blue-400/80 rounded-full" />
                                        <div className="w-1.5 h-3 bg-blue-400/80 rounded-full" />
                                        <div className="w-1.5 h-3 bg-blue-400/80 rounded-full" />
                                        <div className="w-1.5 h-3 bg-slate-700 rounded-full" />
                                    </div>
                                    <span className="text-xs text-blue-300 font-bold">{isPaused ? 'PAUSED' : 'STABLE'}</span>
                                </div>
                            </div>
                            <div className="hidden md:flex flex-col">
                                <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-1">Heart Rate (Est.)</span>
                                <div className="flex items-center gap-2">
                                    <span className="material-symbols-outlined text-xs text-red-400 animate-pulse">favorite</span>
                                    <span className="text-xs text-slate-300 font-bold">74 BPM</span>
                                </div>
                            </div>
                        </div>
                        <div className="flex items-center gap-3 md:gap-6">
                            <button type="button" onClick={handlePauseSession} className="text-slate-400 hover:text-white transition-colors text-xs md:text-sm font-bold uppercase tracking-widest px-3 md:px-6 py-2">
                                {isPaused ? 'Resume Session' : 'Pause Session'}
                            </button>
                            <button
                                type="button"
                                onClick={handleSubmitAnswer}
                                disabled={isLoading}
                                className="bg-gradient-to-br from-blue-300 to-blue-600 text-on-primary-fixed px-6 md:px-10 py-3 md:py-4 rounded-full font-headline font-extrabold tracking-tight flex items-center gap-2 md:gap-3 shadow-[0_0_30px_rgba(168,200,255,0.2)] transition-transform hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isLoading ? 'Submitting...' : 'Next Question'}
                                <span className="material-symbols-outlined text-lg">arrow_forward</span>
                            </button>
                        </div>
                    </footer>
                </div>
            )}

            {/* Camera Permission Modal */}
            {showCameraModal && (
                <div className="camera-modal-overlay">
                    <div className="camera-modal">
                        <h3>Enable Camera for Better Assessment</h3>
                        <p>
                            The AI can analyze your body language, posture, and eye contact to provide comprehensive feedback.
                        </p>
                        <p className="camera-modal-note">
                            This helps improve your interview skills beyond just content quality.
                        </p>
                        <div className="camera-modal-actions">
                            <button onClick={handleEnableCamera} className="btn-enable-camera">
                                Enable Camera
                            </button>
                            <button onClick={handleSkipCamera} className="btn-skip-camera">
                                Continue Without Camera
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default InterviewStart;