import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { authService } from './services/auth';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Interview from './pages/Interview';
import Progress from './pages/Progress';
import Resume from './pages/Resume';
import Feedback from './pages/Feedback';
import './index.css';

// Protected Route Component
const ProtectedRoute = ({ children }) => {
    const isAuthenticated = authService.isAuthenticated();
    return isAuthenticated ? children : <Navigate to="/login" />;
};

function App() {
    return (
        <Router>
            <Routes>
                {/* Public Routes */}
                <Route path="/" element={<Landing />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />

                {/* Protected Routes */}
                <Route
                    path="/dashboard"
                    element={
                        <ProtectedRoute>
                            <Dashboard />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/interview"
                    element={
                        <ProtectedRoute>
                            <Interview />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/progress"
                    element={
                        <ProtectedRoute>
                            <Progress />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/resume"
                    element={
                        <ProtectedRoute>
                            <Resume />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/feedback"
                    element={
                        <ProtectedRoute>
                            <Feedback />
                        </ProtectedRoute>
                    }
                />

                {/* Redirect unknown routes */}
                <Route path="*" element={<Navigate to="/" />} />
            </Routes>
        </Router>
    );
}

export default App;
