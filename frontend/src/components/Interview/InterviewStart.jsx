import { useState, useRef } from 'react';
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
    const [isRecording, setIsRecording] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    
    const mediaRecorderRef = useRef(null);
    const audioChunksRef = useRef([]);
    const navigate = useNavigate();

    const speakText = (text) => {
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'en-US';
        const voices = speechSynthesis.getVoices();
        if (voices.length) {
            utterance.voice = voices.find(voice => voice.name === 'Google UK English Male') || voices[2];
        }
        speechSynthesis.speak(utterance);
    };

    const handleStart = async () => {
        if (step === 0) {
            const text = "Enter the number of questions you want me to give:";
            setCurrentQuestion(text);
            speakText(text);
            setStep(1);
        } else if (step === 1) {
            const text = "So, what domain are you looking for?";
            setCurrentQuestion(text);
            speakText(text);
            setStep(2);
        } else if (step === 2) {
            setIsLoading(true);
            try {
                const data = await interviewService.generateQuestion(domain, numberOfQuestions);
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
            setDomain(answer);
            setAnswer('');
            handleStart();
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
                <h2>AI Interview Session</h2>
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
