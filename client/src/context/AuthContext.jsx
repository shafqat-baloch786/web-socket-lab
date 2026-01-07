import { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(localStorage.getItem('token'));
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadUser = async () => {
            if (token) {
                try {
                    const res = await axios.get('http://localhost:4000/api/main/profile', {
                        headers: { Authorization: `Bearer ${token}` }
                    });

                    // BACKEND SENDS 'id', FRONTEND NEEDS '_id'
                    const userData = res.data.user;
                    setUser({
                        ...userData,
                        _id: userData.id || userData._id 
                    });
                } catch (err) {
                    console.error("Auth Error:", err);
                    logout();
                }
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