import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authService } from '../../services/auth';
import './Auth.css';

const SignIn = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [message, setMessage] = useState('');
    const [messageColor, setMessageColor] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (username.trim() === '' || password.trim() === '') {
            setMessageColor('red');
            setMessage('All fields are required!');
            return;
        }

        setIsLoading(true);
        setMessage('');

        try {
            const data = await authService.signin(username, password);
            
            if (data.mes === "true") {
                setMessageColor('green');
                setMessage('Login successful! Redirecting...');
                
                setTimeout(() => {
                    navigate('/dashboard');
                }, 1500);
            } else {
                setMessageColor('red');
                setMessage('Invalid username or password!');
            }
        } catch (error) {
            setMessageColor('red');
            setMessage('Error connecting to server!');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="auth-container">
            <div className="auth-box">
                <h2>Sign In</h2>
                <form id="signin-form" onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label htmlFor="username">Username</label>
                        <input
                            type="text"
                            id="username"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            placeholder="Enter username"
                            required
                        />
                    </div>
                    
                    <div className="form-group">
                        <label htmlFor="password">Password</label>
                        <input
                            type="password"
                            id="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Enter password"
                            required
                        />
                    </div>

                    {message && (
                        <p id="message" style={{ color: messageColor }}>
                            {message}
                        </p>
                    )}

                    <button type="submit" disabled={isLoading}>
                        {isLoading ? 'Signing in...' : 'Sign In'}
                    </button>
                </form>

                <p className="auth-link">
                    Don't have an account? <Link to="/register">Sign Up</Link>
                </p>
            </div>
        </div>
    );
};

export default SignIn;
