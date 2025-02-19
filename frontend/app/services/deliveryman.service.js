import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

// Helper function to get auth token
const getAuthToken = () => {
    if (typeof window !== 'undefined') {
        return localStorage.getItem('token');
    }
    return null;
};

export const deliverymanService = {
    // Create new delivery man
    createDeliveryMan: async (formData) => {
        try {
            const token = getAuthToken();
            if (!token) {
                throw new Error('No token, authorization denied');
            }

            // Ensure formData is properly formatted
            if (!(formData instanceof FormData)) {
                throw new Error('Invalid form data format');
            }

            const response = await axios.post(`${API_URL}/deliveryman`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    'x-auth-token': token
                }
            });
            return response.data;
        } catch (error) {
            // Handle axios error responses
            if (error.response?.data) {
                // If the error has a message property, throw that
                if (error.response.data.message) {
                    throw { message: error.response.data.message };
                }
                // If the error has validation errors, format them
                if (error.response.data.errors) {
                    const errorMessages = error.response.data.errors
                        .map(err => err.msg)
                        .join(', ');
                    throw { message: errorMessages };
                }
                // If the error has a generic error message
                if (error.response.data.error) {
                    throw { message: error.response.data.error };
                }
            }
            // Handle network errors or other issues
            throw { message: error.message || 'An error occurred while creating the delivery man' };
        }
    },

    // Get all delivery men
    getAllDeliveryMen: async () => {
        try {
            const token = getAuthToken();
            const response = await axios.get(`${API_URL}/deliveryman`, {
                headers: {
                    'x-auth-token': token
                }
            });
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    // Get single delivery man
    getDeliveryMan: async (id) => {
        try {
            const token = getAuthToken();
            const response = await axios.get(`${API_URL}/deliveryman/${id}`, {
                headers: {
                    'x-auth-token': token
                }
            });
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    // Update delivery man
    updateDeliveryMan: async (id, formData) => {
        try {
            const token = getAuthToken();
            const response = await axios.put(`${API_URL}/deliveryman/${id}`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    'x-auth-token': token
                }
            });
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    // Delete delivery man
    deleteDeliveryMan: async (id) => {
        try {
            const token = getAuthToken();
            const response = await axios.delete(`${API_URL}/deliveryman/${id}`, {
                headers: {
                    'x-auth-token': token
                }
            });
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    }
}; 