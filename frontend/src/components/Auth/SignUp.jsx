import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authService } from '../../services/auth';
import './Auth.css';

const SignUp = () => {
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
            const data = await authService.signup(username, password);

            if (data.mes === false) {
                setMessageColor('red');
                setMessage('User already exists');
            } else {
                setMessageColor('green');
                setMessage('Sign-up successful!');

                setTimeout(() => {
                    navigate('/login');
                }, 2000);
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
                <h2>Sign Up</h2>
                <form onSubmit={handleSubmit}>
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
                        {isLoading ? 'Signing up...' : 'Sign Up'}
                    </button>
                </form>

                <p className="auth-link">
                    Already have an account? <Link to="/login">Sign In</Link>
                </p>
            </div>
        </div>
    );
};

export default SignUp;
