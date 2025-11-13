import { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { interviewService } from '../../services/auth';
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
    const [availableVoices, setAvailableVoices] = useState([]);
    const videoRef = useRef(null);
    const cameraStreamRef = useRef(null);
    
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

    const handleSpeechToggle = () => {
        setIsSpeechEnabled((prev) => {
            const next = !prev;
            if (!next && typeof window !== 'undefined' && window.speechSynthesis) {
                window.speechSynthesis.cancel();
            }
            return next;
        });
    };

    const handleStart = async (domainArg) => {
        if (step === 0) {
            const text = "Enter the number of questions you want me to give:";
            setCurrentQuestion(text);
            speakText(text);
            setStep(1);
            setShowCameraPrompt(false);
            setCameraPrompt('');
        } else if (step === 1) {
            const text = "Great! For a more realistic experience, please turn on your camera using the camera button below when you're ready. What domain are you looking for?";
            setCurrentQuestion(text);
            speakText(text);
            setShowCameraPrompt(true);
            setCameraPrompt('Tip: Toggle the camera button whenever you are ready so the AI can assess your body language.');
            setStep(2);
        } else if (step === 2) {
            // Use explicit domainArg if provided to avoid React state update race
            const domainToUse = (domainArg && domainArg.trim()) || domain;
            if (!domainToUse || domainToUse.length === 0) {
                alert('Please provide a domain.');
                return;
            }

            setIsLoading(true);
            try {
                const data = await interviewService.generateQuestion(domainToUse, numberOfQuestions);
                setQno(data.qno);
                setCurrentQuestion(data.question);
                speakText(data.question);
                setStep(3);
            } catch (error) {
                alert('Failed to fetch question. Please try again.');
                console.error(error);
            } finally {
                setIsLoading(false);
            }
        }
    };

    const handleSubmitAnswer = async () => {
        if (!answer.trim()) {
            alert('Please enter your answer.');
            return;
        }

        if (step === 1) {
            const num = parseInt(answer);
            if (isNaN(num) || num <= 0) {
                alert('Please enter a valid number of questions.');
                return;
            }
            setNumberOfQuestions(num);
            setAnswer('');
            handleStart();
        } else if (step === 2) {
            // Use the provided answer as domain immediately to avoid setState race
            const domainValue = answer.trim();
            if (!domainValue) {
                alert('Please enter a domain.');
                return;
            }
            setDomain(domainValue);
            setAnswer('');
            // Pass domainValue directly to handleStart so we don't rely on state being updated
            await handleStart(domainValue);
        } else {
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
                    navigate('/feedback');
                }
            } catch (error) {
                alert('Failed to submit answer. Please try again.');
                console.error(error);
            } finally {
                setIsLoading(false);
            }
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
                    await videoRef.current.play().catch(() => {});
                }
                setIsCameraOn(true);
                setShowCameraPrompt(false);
                setCameraPrompt('');
            } catch (err) {
                console.error('Camera access error:', err);
                alert('Please allow camera permissions.');
            }
        } else {
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
                <div className="start-section">
                    <button onClick={handleStart} className="start-btn">
                        Start Interview
                    </button>
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
        </div>
    );
};

export default InterviewStart;
