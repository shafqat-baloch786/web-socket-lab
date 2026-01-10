import { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    // Initialize state directly from localStorage
    const [token, setToken] = useState(localStorage.getItem('token'));
    const [loading, setLoading] = useState(true);

    // 1. Persist token to localStorage whenever it changes
    useEffect(() => {
        if (token) {
            localStorage.setItem('token', token);
            // Optional: Set global axios header so you don't have to pass it manually
            axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        } else {
            localStorage.removeItem('token');
            delete axios.defaults.headers.common['Authorization'];
        }
    }, [token]);

    // 2. Load User Profile
    useEffect(() => {
        const loadUser = async () => {
            if (token) {
                try {
                    const res = await axios.get('http://localhost:4000/api/main/profile');

                    const userData = res.data.user;
                    setUser({
                        ...userData,
                        _id: userData.id || userData._id 
                    });
                } catch (err) {
                    console.error("Auth Error:", err);
                    // Only logout if the error is a 401/Unauthorized
                    if (err.response?.status === 401) {
                        logout();
                    }
                }
            } else {
                setUser(null);
            }
            setLoading(false);
        };
        loadUser();
    }, [token]);

    const logout = () => {
        setToken(null);
        setUser(null);
        localStorage.removeItem('token');
    };

    return (
        <AuthContext.Provider value={{ user, setUser, token, setToken, logout, loading }}>
            {!loading && children} 
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);