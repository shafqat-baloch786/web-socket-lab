import axios from 'axios';

const API_URL = 'http://localhost:4000/api/users';

export const getAllUsers = async (token) => {
    const response = await axios.get(`${API_URL}/all`, {
        headers: { Authorization: `Bearer ${token}` }
    });
    return response.data.users;
};