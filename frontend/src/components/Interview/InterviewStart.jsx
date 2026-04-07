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
                <div className="interview-content">
                    <div className="question-box">
                        <h3>Question:</h3>
                        <p id="question">{currentQuestion}</p>
                    </div>

                    {showCameraPrompt && (
                        <div className="camera-prompt">
                            {cameraPrompt}
                        </div>
                    )}

                    {/* Camera preview - shown when camera is on */}
                    <div id="video-container" style={{ display: isCameraOn ? 'block' : 'none' }}>
                        <video
                            id="video"
                            ref={videoRef}
                            data-interview-video="true"
                            autoPlay
                            muted
                            playsInline
                            style={{ width: '100%', height: '100%' }}
                        />
                    </div>

                    <div className="answer-section">
                        <label htmlFor="answer">Your Answer:</label>
                        <textarea
                            id="answer"
                            value={answer}
                            onChange={(e) => setAnswer(e.target.value)}
                            rows="6"
                            placeholder="Type your answer here or use microphone..."
                        />

                        <div className="controls">
                            <button
                                onClick={handleSpeechToggle}
                                className={`voice-btn${isSpeechEnabled ? '' : ' muted'}`}
                                type="button"
                            >
                                {isSpeechEnabled ? '🔊 Voice On' : '🔇 Voice Off'}
                            </button>
                            <div id="cam">
                                <button onClick={handleCameraToggle} className="cam-btn">
                                    {isCameraOn ? '📷 Stop Camera' : '📷 Camera'}
                                </button>
                            </div>
                            <button
                                id="mic"
                                onClick={handleMicToggle}
                                className={isRecording ? 'recording' : ''}
                            >
                                {isRecording ? '🔴 Stop Recording' : '🎤 Record'}
                            </button>

                            <button
                                onClick={handleSubmitAnswer}
                                disabled={isLoading}
                                className="submit-btn"
                            >
                                {isLoading ? 'Submitting...' : 'Submit Answer'}
                            </button>
                        </div>
                    </div>

                    {qno > 0 && (
                        <div className="progress-info">
                            Question {qno} of {numberOfQuestions}
                        </div>
                    )}
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