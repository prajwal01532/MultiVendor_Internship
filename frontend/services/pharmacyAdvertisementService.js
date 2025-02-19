import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

const advertisementService = {
    // Get all stores
    getStores: async () => {
        try {
            const response = await axios.get(`${API_URL}/api/pharmacystores`, {
                params: {
                    status: 'active',
                    limit: 100,
                    sortField: 'name',
                    sortOrder: 'asc'
                },
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`
                }
            });
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    // Get all advertisements with pagination and filters
    getAdvertisements: async (page = 1, limit = 10, filters = {}) => {
        try {
            const response = await axios.get(`${API_URL}/api/pharmacybannerandad/advertisements`, {
                params: {
                    page,
                    limit,
                    ...filters
                },
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`
                }
            });
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    // Create new advertisement
    createAdvertisement: async (formData) => {
        try {
            const response = await axios.post(`${API_URL}/api/pharmacybannerandad/advertisements`, formData, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`,
                    'Content-Type': 'multipart/form-data'
                }
            });
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    // Update advertisement
    updateAdvertisement: async (id, formData) => {
        try {
            const response = await axios.put(`${API_URL}/api/pharmacybannerandad/advertisements/${id}`, formData, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`,
                    'Content-Type': 'multipart/form-data'
                }
            });
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    // Delete advertisement
    deleteAdvertisement: async (id) => {
        try {
            const response = await axios.delete(`${API_URL}/api/pharmacybannerandad/advertisements/${id}`, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`
                }
            });
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    // Track advertisement impression
    trackImpression: async (id) => {
        try {
            const response = await axios.post(`${API_URL}/api/pharmacybannerandad/advertisements/${id}/impression`);
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    // Track advertisement click
    trackClick: async (id) => {
        try {
            const response = await axios.post(`${API_URL}/api/pharmacybannerandad/advertisements/${id}/click`);
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    }
};

export default advertisementService; 