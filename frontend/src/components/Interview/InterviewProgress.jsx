import { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { interviewService } from '../../services/auth';
import useBehaviourTracking from '../../hooks/useBehaviourTracking';
import './Interview.css';

const InterviewProgress = () => {
    const navigate = useNavigate();
    const location = useLocation();

    const [domain, setDomain] = useState('');
    const [difficulty, setDifficulty] = useState('');
    const [numberOfQuestions, setNumberOfQuestions] = useState(12);

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
    const hasAutoStartedRef = useRef(false);
    const mediaRecorderRef = useRef(null);
    const audioChunksRef = useRef([]);
    const voicesRef = useRef([]);
    const voiceListenerRef = useRef(null);
    const pendingSpeechRef = useRef(null);

    const { startTracking, stopTracking, getBehaviourData, isTracking } = useBehaviourTracking();

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
                    if (!updatedVoices.length) return;
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
        const preferredVoice = voices.find((voice) => voice.name === 'Google UK English Male');
        const fallbackVoice = voices.find((voice) => voice.lang && voice.lang.toLowerCase().startsWith('en'));
        utterance.voice = preferredVoice || fallbackVoice || voices[0];
        window.speechSynthesis.speak(utterance);
    }, [availableVoices.length, isSpeechEnabled]);

    useEffect(() => {
        if (typeof window === 'undefined' || !window.speechSynthesis) return;

        const updateVoices = () => {
            const voices = window.speechSynthesis.getVoices();
            if (voices && voices.length) {
                voicesRef.current = voices;
                setAvailableVoices(voices);
            }
        };

        updateVoices();
        window.speechSynthesis.addEventListener('voiceschanged', updateVoices);
        return () => window.speechSynthesis.removeEventListener('voiceschanged', updateVoices);
    }, []);

    useEffect(() => {
        if (isSpeechEnabled && typeof window !== 'undefined' && window.speechSynthesis) {
            window.speechSynthesis.resume?.();
        }
    }, [isSpeechEnabled]);

    useEffect(() => {
        if (qno > 0 && !isCameraOn && !hasPromptedForCameraRef.current) {
            hasPromptedForCameraRef.current = true;
            setShowCameraModal(true);
        }
    }, [qno, isCameraOn]);

    const startInterviewSession = useCallback(async (selectedDomain, selectedQuestionCount) => {
        setIsLoading(true);
        try {
            await interviewService.resetInterview();
            const data = await interviewService.generateQuestion(selectedDomain, selectedQuestionCount);
            setQno(data.qno);
            setCurrentQuestion(data.question);
        } catch (error) {
            alert('Failed to fetch question. Please try again.');
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        const setupState = location.state;

        if (!setupState?.fromSetup || !setupState?.domain || !setupState?.questionCount) {
            navigate('/interview');
            return;
        }

        if (hasAutoStartedRef.current) return;
        hasAutoStartedRef.current = true;

        setDomain(setupState.domain);
        setDifficulty(setupState.difficulty || 'junior');
        setNumberOfQuestions(setupState.questionCount);
        startInterviewSession(setupState.domain, setupState.questionCount);
    }, [location.state, navigate, startInterviewSession]);

    const handleSpeechToggle = () => {
        setIsSpeechEnabled((prev) => {
            const next = !prev;
            if (!next && typeof window !== 'undefined' && window.speechSynthesis) {
                window.speechSynthesis.cancel();
            }
            return next;
        });
    };

    const handleEnableCamera = async () => {
        setShowCameraModal(false);
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: true });
            cameraStreamRef.current = stream;
            if (videoRef.current) {
                videoRef.current.srcObject = stream;
                await videoRef.current.play().catch(() => {});
            }
            setIsCameraOn(true);
            setCameraRequestDenied(false);

            if (qno > 0 && !isTracking) {
                setTimeout(() => {
                    startTracking(videoRef);
                }, 1000);
            }

            if (currentQuestion) {
                setTimeout(() => speakText(currentQuestion), 500);
            }
        } catch (err) {
            console.error('Camera access error:', err);
            setCameraRequestDenied(true);
            alert('Camera access denied. You can enable it later using the camera button, or continue without it.');
            if (currentQuestion) {
                setTimeout(() => speakText(currentQuestion), 500);
            }
        }
    };

    const handleSkipCamera = () => {
        setShowCameraModal(false);
        setCameraRequestDenied(true);
        setShowCameraPrompt(true);
        setCameraPrompt('You can enable the camera anytime using the camera button below to help the AI assess your body language.');
        if (currentQuestion) {
            setTimeout(() => speakText(currentQuestion), 300);
        }
    };

    const handleCameraToggle = async () => {
        if (!isCameraOn) {
            try {
                const stream = await navigator.mediaDevices.getUserMedia({ video: true });
                cameraStreamRef.current = stream;
                if (videoRef.current) {
                    videoRef.current.srcObject = stream;
                    await videoRef.current.play().catch(() => {});
                }
                setIsCameraOn(true);
                setShowCameraPrompt(false);
                setCameraPrompt('');

                if (qno > 0 && !isTracking) {
                    setTimeout(() => {
                        startTracking(videoRef);
                    }, 1000);
                }
            } catch (err) {
                console.error('Camera access error:', err);
                alert('Please allow camera permissions.');
            }
        } else {
            if (isTracking) {
                await stopTracking();
            }
            try {
                const stream = cameraStreamRef.current;
                if (stream) stream.getTracks().forEach((track) => track.stop());
            } catch (e) {
                console.error('Error stopping camera:', e);
            }
            cameraStreamRef.current = null;
            if (videoRef.current) videoRef.current.srcObject = null;
            setIsCameraOn(false);
        }
    };

    useEffect(() => {
        return () => {
            if (isTracking) {
                stopTracking();
            }

            const stream = cameraStreamRef.current;
            if (stream) {
                stream.getTracks().forEach((track) => track.stop());
            }
            cameraStreamRef.current = null;

            if (typeof window !== 'undefined' && window.speechSynthesis) {
                if (voiceListenerRef.current) {
                    window.speechSynthesis.removeEventListener('voiceschanged', voiceListenerRef.current);
                    voiceListenerRef.current = null;
                }
                pendingSpeechRef.current = null;
                window.speechSynthesis.cancel();
            }
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

                    stream.getTracks().forEach((track) => track.stop());
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

    const handleSubmitAnswer = async () => {
        if (!answer.trim()) {
            alert('Please enter your answer.');
            return;
        }

        setIsLoading(true);
        try {
            await interviewService.submitAnswer(answer);
            setAnswer('');

            if (qno < numberOfQuestions) {
                const data = await interviewService.generateQuestion(domain, numberOfQuestions);
                setQno(data.qno);
                setCurrentQuestion(data.question);
                speakText(data.question);
            } else {
                let behaviourData = null;
                if (isTracking) {
                    await stopTracking();
                    behaviourData = getBehaviourData();
                }

                if (isCameraOn && cameraStreamRef.current) {
                    try {
                        await new Promise((resolve) => setTimeout(resolve, 500));
                        cameraStreamRef.current.getTracks().forEach((track) => track.stop());
                        cameraStreamRef.current = null;
                        if (videoRef.current) {
                            videoRef.current.srcObject = null;
                        }
                        setIsCameraOn(false);
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

    const handleHome = async () => {
        const confirmLeave = window.confirm('This interview will not be saved. Continue?');
        if (confirmLeave) {
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

    const progressPercent = Math.max(0, Math.min(100, Math.round(((qno || 1) / numberOfQuestions) * 100)));
    const confidencePercent = Math.min(95, 70 + Math.round(answer.length / 12));
    const clarityLevel = answer.length > 160 ? 'High' : answer.length > 70 ? 'Medium' : 'Building';
    const transcriptText = answer?.trim() || 'Your live transcript appears here. Use microphone or switch to text input.';
    const focusBars = [12, 24, 40, 18, 30];

    return (
        <div className="min-h-screen bg-[#0b1326] text-on-surface flex flex-col overflow-hidden">
            <div className="sticky top-0 z-50 border-b border-white/5 bg-[#0b1326]/80 backdrop-blur-xl">
                <div className="flex h-16 items-center justify-between px-4 md:px-8">
                    <div className="flex items-center gap-4 md:gap-6">
                        <span className="text-xl md:text-2xl font-bold tracking-tighter bg-gradient-to-br from-blue-300 to-blue-600 bg-clip-text text-transparent font-headline">
                            Alchemist AI
                        </span>
                        <nav className="hidden md:flex gap-6 ml-2">
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
                </div>
            </div>

            <main className="flex-1 min-h-0 overflow-hidden px-4 md:px-6 lg:px-8 py-4 md:py-6">
                <div className="h-full min-h-0 grid grid-cols-1 gap-4 md:gap-6 xl:grid-cols-[30%_1fr_25%]">
                    <aside className="min-h-0 flex flex-col gap-6 md:gap-8 rounded-3xl border border-white/5 bg-surface-container-low/95 p-5 md:p-7 xl:p-8 shadow-[0_20px_60px_rgba(0,0,0,0.24)] backdrop-blur-xl">
                        <div className="flex flex-col gap-2">
                            <span className="text-primary text-xs font-bold uppercase tracking-[0.2em] font-label">
                                Question {qno || 1} of {numberOfQuestions}
                            </span>
                            <h2 id="question" className="text-3xl xl:text-[2.4rem] font-headline font-extrabold leading-tight tracking-tight text-on-surface">
                                {currentQuestion || 'Preparing your first question...'}
                            </h2>
                        </div>


                        {showCameraPrompt && (
                            <div className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-on-surface-variant">
                                {cameraPrompt}
                            </div>
                        )}

                        {cameraRequestDenied && !showCameraPrompt && (
                            <div className="rounded-xl border border-amber-300/30 bg-amber-200/10 px-4 py-3 text-sm text-amber-100">
                                Camera access is currently denied. You can still continue and use text or voice response.
                            </div>
                        )}

                        <div className="mt-auto">
                            <div className="p-4 rounded-2xl border border-white/5 bg-surface-container-lowest/80 backdrop-blur-xl">
                                <div className="flex justify-between items-center mb-2">
                                    <span className="text-xs text-on-surface-variant font-medium">Session Progress</span>
                                    <span className="text-xs text-primary font-bold">{progressPercent}%</span>
                                </div>
                                <div className="w-full bg-white/5 h-1.5 rounded-full overflow-hidden">
                                    <div className="bg-gradient-to-r from-blue-300 to-blue-600 h-full rounded-full transition-all duration-300" style={{ width: `${progressPercent}%` }} />
                                </div>
                            </div>
                        </div>
                    </aside>

                    <section className="relative min-h-0 rounded-3xl border border-white/5 bg-surface flex items-center justify-center p-4 md:p-6 shadow-[0_20px_60px_rgba(0,0,0,0.24)]">
                        <div id="video-container" className="relative w-full max-w-5xl aspect-video overflow-hidden rounded-3xl border border-white/10 bg-surface-container-lowest shadow-[0_0_30px_rgba(168,200,255,0.2)]">
                            <video
                                id="video"
                                ref={videoRef}
                                data-interview-video="true"
                                autoPlay
                                muted
                                playsInline
                                className={`h-full w-full object-cover transition-opacity duration-300 ${isCameraOn ? 'opacity-100' : 'opacity-20'}`}
                            />
                            <div className="absolute inset-0 pointer-events-none p-4 md:p-6 flex flex-col justify-between">
                                <div className="flex justify-between items-start gap-3">
                                    <div className="glass-card px-4 py-2 rounded-full flex items-center gap-2 border border-white/10 shadow-[0_0_30px_rgba(168,200,255,0.12)]">
                                        <span className={`w-2 h-2 rounded-full ${isRecording ? 'bg-green-400 animate-pulse shadow-[0_0_14px_rgba(74,222,128,0.75)]' : 'bg-primary/70'}`} />
                                        <span className="text-xs md:text-sm font-medium tracking-[0.2em] uppercase text-white/90">Live Recording</span>
                                    </div>
                                    <div className="flex gap-2 md:gap-3">
                                        <div className="glass-card px-3 py-2 rounded-xl flex flex-col items-center min-w-[96px] border border-white/10">
                                            <span className="text-[10px] text-white/60 font-bold uppercase tracking-tighter">Eye Gaze</span>
                                            <span className={`font-bold text-xs md:text-sm ${isCameraOn ? 'text-primary' : 'text-slate-400'}`}>{isCameraOn ? 'Optimized' : 'Inactive'}</span>
                                        </div>
                                        <div className="glass-card px-3 py-2 rounded-xl flex flex-col items-center min-w-[96px] border border-white/10">
                                            <span className="text-[10px] text-white/60 font-bold uppercase tracking-tighter">Posture</span>
                                            <span className={`font-bold text-xs md:text-sm ${isCameraOn ? 'text-green-400' : 'text-slate-400'}`}>{isCameraOn ? 'Good' : 'Unknown'}</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex justify-center items-end gap-1 h-12 mb-1">
                                    {focusBars.map((barHeight, index) => (
                                        <div
                                            key={index}
                                            className={`w-1.5 rounded-full bg-gradient-to-t from-blue-400 to-blue-200 ${isRecording ? 'animate-pulse' : ''}`}
                                            style={{
                                                height: `${barHeight}px`,
                                                opacity: index === 2 ? 1 : 0.7,
                                            }}
                                        />
                                    ))}
                                </div>
                            </div>
                            {!isCameraOn && (
                                <div className="absolute inset-0 flex items-center justify-center bg-surface-container-lowest/70 backdrop-blur-sm">
                                    <span className="text-on-surface-variant text-sm px-4 text-center">Camera is off. Enable camera to continue behavior tracking.</span>
                                </div>
                            )}
                        </div>
                    </section>

                    <aside className="min-h-0 flex flex-col gap-4 md:gap-6 rounded-3xl border border-white/5 bg-surface-container-low/95 p-4 md:p-6 xl:p-7 shadow-[0_20px_60px_rgba(0,0,0,0.24)] backdrop-blur-xl">
                        <div className="flex items-center justify-between">
                            <span className="text-sm font-bold text-on-surface">Live Transcription</span>
                            <span className="material-symbols-outlined text-sm text-primary animate-pulse">mic</span>
                        </div>
                        <div className="flex-1 min-h-[220px] bg-surface-container-lowest/80 rounded-2xl p-4 md:p-5 overflow-y-auto border border-white/5 shadow-inner">
                            <p className="text-sm text-on-surface-variant leading-relaxed whitespace-pre-wrap">
                                {transcriptText}
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
                        <div className="glass-card p-4 rounded-2xl border border-white/10">
                            <div className="flex items-center justify-between mb-3">
                                <span className="text-xs font-bold text-on-surface/70 tracking-wide uppercase">Real-time Metrics</span>
                                <span className="material-symbols-outlined text-xs text-secondary">trending_up</span>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="flex flex-col">
                                    <span className="text-[10px] text-on-surface-variant uppercase tracking-tighter">Confidence</span>
                                    <span className="text-lg font-headline font-extrabold text-primary">{confidencePercent}%</span>
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-[10px] text-on-surface-variant uppercase tracking-tighter">Clarity</span>
                                    <span className="text-lg font-headline font-extrabold text-secondary">{clarityLevel}</span>
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

            <footer className="sticky bottom-0 z-40 h-20 md:h-24 bg-slate-950/90 backdrop-blur-xl px-4 md:px-10 flex items-center justify-between gap-4 border-t border-white/5 shadow-[0_-10px_30px_rgba(0,0,0,0.22)]">
                <div className=""></div>
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

            {showCameraModal && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/65 px-4">
                    <div className="w-full max-w-lg rounded-2xl border border-white/15 bg-[#131b2e]/95 p-6 shadow-[0_25px_80px_rgba(0,0,0,0.5)] backdrop-blur-xl">
                        <h3 className="text-xl font-bold mb-3">Enable Camera for Better Assessment</h3>
                        <p className="text-sm text-slate-300 mb-2">
                            The AI can analyze your body language, posture, and eye contact to provide comprehensive feedback.
                        </p>
                        <p className="text-sm text-slate-300 mb-5">
                            This helps improve your interview skills beyond just content quality.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-3 sm:justify-end">
                            <button onClick={handleSkipCamera} className="px-4 py-2 rounded-xl border border-white/20 bg-white/5 text-slate-100 hover:bg-white/10 transition-colors">
                                Continue Without Camera
                            </button>
                            <button onClick={handleEnableCamera} className="px-4 py-2 rounded-xl bg-gradient-to-br from-blue-300 to-blue-600 text-slate-900 font-semibold hover:brightness-110 transition-all">
                                Enable Camera
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default InterviewProgress;
