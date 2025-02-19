import axios from 'axios';

const API_URL = 'http://localhost:5000/api/vehicle-categories';

// Helper function to get auth token
const getAuthHeader = () => {
    const token = localStorage.getItem('token');
    if (!token) {
        throw new Error('No authentication token found. Please login first.');
    }
    return {
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        }
    };
};

// Create new vehicle category
export const createVehicleCategory = async (vehicleData) => {
    try {
        console.log('Sending data:', vehicleData); // Debug log
        const headers = getAuthHeader();
        console.log('Headers:', headers); // Debug log
        
        const response = await axios.post(API_URL, vehicleData, headers);
        return response.data;
    } catch (error) {
        console.error('Full error:', error); // Debug log
        if (error.response) {
            // The request was made and the server responded with a status code
            // that falls out of the range of 2xx
            console.error('Error response:', error.response.data);
            throw error.response.data;
        } else if (error.request) {
            // The request was made but no response was received
            console.error('Error request:', error.request);
            throw new Error('No response received from server');
        } else {
            // Something happened in setting up the request that triggered an Error
            console.error('Error message:', error.message);
            throw error;
        }
    }
};

// Get all vehicle categories
export const getAllVehicleCategories = async () => {
    try {
        const response = await axios.get(API_URL, getAuthHeader());
        return response.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};

// Get single vehicle category
export const getVehicleCategory = async (id) => {
    try {
        const response = await axios.get(`${API_URL}/${id}`, getAuthHeader());
        return response.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};

// Update vehicle category
export const updateVehicleCategory = async (id, updateData) => {
    try {
        const response = await axios.put(`${API_URL}/${id}`, updateData, getAuthHeader());
        return response.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};

// Delete vehicle category
export const deleteVehicleCategory = async (id) => {
    try {
        const response = await axios.delete(`${API_URL}/${id}`, getAuthHeader());
        return response.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
}; 