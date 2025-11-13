import { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { interviewService } from '../../services/auth';
import useBehaviourTracking from '../../hooks/useBehaviourTracking';
import './Interview.css';

const InterviewStart = () => {
    const [step, setStep] = useState(0);
    const [domain, setDomain] = useState('');
    const [numberOfQuestions, setNumberOfQuestions] = useState(0);
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

    // Auto-prompt for camera when interview starts (step 1)
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

    const handleStart = async () => {
        // Validate inputs before starting
        if (!numberOfQuestions || numberOfQuestions <= 0) {
            alert('Please enter a valid number of questions.');
            return;
        }
        if (!domain || domain.trim().length === 0) {
            alert('Please enter a domain for the interview.');
            return;
        }

        setIsLoading(true);
        try {
            const data = await interviewService.generateQuestion(domain, numberOfQuestions);
            setQno(data.qno);
            setCurrentQuestion(data.question);
            speakText(data.question);
            setStep(1);
        } catch (error) {
            alert('Failed to fetch question. Please try again.');
            console.error(error);
        } finally {
            setIsLoading(false);
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
                    console.log('🎯 Stopping tracking and collecting behaviour data...');
                    stopTracking();
                    behaviourData = getBehaviourData();
                    console.log('📊 Behaviour data collected:', behaviourData);
                } else {
                    console.log('⚠️ Tracking was not active, no behaviour data to collect');
                }
                
                // Navigate to feedback with behaviour data
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
                await videoRef.current.play().catch(() => {});
            }
            setIsCameraOn(true);
            setCameraRequestDenied(false);
            
            // Start behaviour tracking
            if (step > 0 && !isTracking) {
                setTimeout(() => {
                    startTracking(videoRef);
                }, 1000);
            }
        } catch (err) {
            console.error('Camera access error:', err);
            setCameraRequestDenied(true);
            alert('Camera access denied. You can enable it later using the camera button, or continue without it.');
        }
    };

    // Handle camera modal - Skip Camera
    const handleSkipCamera = () => {
        setShowCameraModal(false);
        setCameraRequestDenied(true);
        setShowCameraPrompt(true);
        setCameraPrompt('You can enable the camera anytime using the camera button below to help the AI assess your body language.');
    };

    // Camera support: toggle camera preview and manage stream lifecycle
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
            // Stop behaviour tracking if active
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
            const s = cameraStreamRef.current;
            if (s) s.getTracks().forEach(t => t.stop());
            if (typeof window !== 'undefined' && window.speechSynthesis) {
                if (voiceListenerRef.current) {
                    window.speechSynthesis.removeEventListener('voiceschanged', voiceListenerRef.current);
                    voiceListenerRef.current = null;
                }
                pendingSpeechRef.current = null;
                window.speechSynthesis.cancel();
            }
        };
    }, []);

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
                            setAnswer(currentText + '\n❌ Failed to transcribe.');
                        }
                    } catch (err) {
                        console.error(err);
                        setAnswer(currentText + `\n❌ Error: ${err.message}`);
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
            <div className="interview-header">
                <button onClick={handleHome} className="home-btn">Home</button>
                <h2 className="interview-title">AI Interview Session</h2>
            </div>

            {step === 0 && (
                <div className="start-section mt-20">
                    <div className="interview-setup">
                        <h2>Setup Your Interview</h2>
                        
                        <div className="form-group">
                            <label htmlFor="numberOfQuestions">Number of Questions:</label>
                            <input
                                type="number"
                                id="numberOfQuestions"
                                value={numberOfQuestions || ''}
                                onChange={(e) => setNumberOfQuestions(parseInt(e.target.value) || 0)}
                                placeholder="e.g., 5"
                                min="1"
                                max="20"
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="domain">Interview Domain/Field:</label>
                            <input
                                type="text"
                                id="domain"
                                value={domain}
                                onChange={(e) => setDomain(e.target.value)}
                                placeholder="e.g., JavaScript, React, Node.js"
                            />
                        </div>

                        <button 
                            onClick={handleStart} 
                            className="start-btn"
                            disabled={isLoading}
                        >
                            {isLoading ? 'Starting...' : 'Start Interview'}
                        </button>
                    </div>
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
                        <video id="video" ref={videoRef} autoPlay muted playsInline style={{ width: '100%', height: '100%' }} />
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
