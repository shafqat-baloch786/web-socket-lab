import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children }) => {
    const { token } = useAuth();

    if (!token) {
        // Redirect to login if there is no token
        return <Navigate to="/login" replace />;
    }

    return children;
};

export default ProtectedRoute;