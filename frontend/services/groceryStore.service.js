const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/grocerystores';

export const storeService = {
    // Create a new store
    createStore: async (formData) => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                throw new Error('No authentication token found');
            }

            // For debugging
            console.log('Creating store with data:', {
                name: formData.get('name'),
                address: formData.get('address'),
                zone: formData.get('zone'),
                vatNumber: formData.get('vatNumber'),
                hasLogo: formData.has('logo'),
                hasCoverImage: formData.has('coverImage'),
                ownerFirstName: formData.get('owner[firstName]'),
                ownerLastName: formData.get('owner[lastName]')
            });

            const response = await fetch(`${API_URL}`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                body: formData,
                credentials: 'include',
                mode: 'cors'
            });

            // For debugging
            console.log('Response status:', response.status);
            console.log('Response headers:', Object.fromEntries([...response.headers]));

            // Try to get the response text first
            const responseText = await response.text();
            console.log('Raw response:', responseText);

            // Try to parse as JSON if possible
            let data;
            try {
                data = JSON.parse(responseText);
            } catch (e) {
                console.error('Failed to parse response as JSON:', e);
                throw new Error('Server returned invalid JSON. Raw response: ' + responseText);
            }

            if (!response.ok) {
                throw new Error(data.message || `Failed to create store: ${response.status} ${response.statusText}`);
            }

            return data;
        } catch (error) {
            console.error('Error in createStore:', error);
            throw error;
        }
    },

    // List all stores
    listStores: async (params = {}) => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                throw new Error('No authentication token found');
            }

            const queryString = new URLSearchParams(params).toString();
            const response = await fetch(`${API_URL}?${queryString}`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Accept': 'application/json'
                },
                credentials: 'include',
                mode: 'cors'
            });

            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.message || 'Failed to fetch stores');
            }

            return data;
        } catch (error) {
            console.error('Error listing stores:', error);
            throw error;
        }
    },

    // Get store details
    getStoreDetails: async (id) => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                throw new Error('No authentication token found');
            }

            const response = await fetch(`${API_URL}/${id}`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Accept': 'application/json'
                },
                credentials: 'include',
                mode: 'cors'
            });

            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.message || 'Failed to fetch store details');
            }

            return data;
        } catch (error) {
            console.error('Error getting store details:', error);
            throw error;
        }
    },

    // Update store
    updateStore: async (id, formData) => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                throw new Error('No authentication token found');
            }

            const response = await fetch(`${API_URL}/${id}`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                body: formData,
                credentials: 'include',
                mode: 'cors'
            });

            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.message || 'Failed to update store');
            }

            return data;
        } catch (error) {
            console.error('Error updating store:', error);
            throw error;
        }
    },

    // Delete store
    deleteStore: async (id) => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                throw new Error('No authentication token found');
            }

            const response = await fetch(`${API_URL}/${id}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Accept': 'application/json'
                },
                credentials: 'include',
                mode: 'cors'
            });

            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.message || 'Failed to delete store');
            }

            return data;
        } catch (error) {
            console.error('Error deleting store:', error);
            throw error;
        }
    },

    // Update store status
    updateStoreStatus: async (id, status) => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                throw new Error('No authentication token found');
            }

            const response = await fetch(`${API_URL}/${id}/status`, {
                method: 'PATCH',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ status }),
                credentials: 'include',
                mode: 'cors'
            });

            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.message || 'Failed to update store status');
            }

            return data;
        } catch (error) {
            console.error('Error updating store status:', error);
            throw error;
        }
    },

    getStoreStatistics: async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) throw new Error('No authentication token found');

            const response = await fetch(`${API_URL}/statistics`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Accept': 'application/json'
                },
                credentials: 'include',
                mode: 'cors'
            });

            const data = await response.json();
            console.log("API Response:", data); // Debugging log

            if (!response.ok) throw new Error(data.message || 'Failed to fetch store statistics');

            return data; // Make sure this returns the entire object
        } catch (error) {
            console.error('Error getting store statistics:', error);
            throw error;
        }
    },

    toggleFeatured: async (storeId) => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                throw new Error('No authentication token found');
            }

            const response = await fetch(`${API_URL}/${storeId}/toggle-featured`, {
                method: 'PATCH',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                credentials: 'include',
                mode: 'cors'
            });

            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.message || 'Failed to toggle recommended status');
            }

            return data;
        } catch (error) {
            console.error('Error toggling recommended status:', error);
            throw error;
        }
    },


    listRecommendedStores: async (params = {}) => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                throw new Error('No authentication token found');
            }
            const query = new URLSearchParams(params).toString();
            const response = await fetch(`${API_URL}/list/recommended?${query}`, {
                method: "GET",
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                credentials: "include",
                mode: "cors",
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || "Failed to fetch recommended stores");
            }

            return data;
        } catch (error) {
            console.error("Error fetching recommended stores:", error);
            throw error;
        }
    },

    toggleRecommendedStatus: async (storeId) => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                throw new Error('No authentication token found');
            }
    
            const response = await fetch(`${API_URL}/${storeId}/toggle-recommended`, {
                method: "PATCH",  // Adjust method if needed (PATCH or PUT)
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                credentials: "include",
                mode: "cors",
            });
    
            const data = await response.json();
    
            if (!response.ok) {
                throw new Error(data.message || "Failed to toggle recommended status");
            }
    
            return data;
        } catch (error) {
            console.error("Error toggling recommended status:", error);
            throw error;
        }
    },
    
    // Add method to toggle store status
    toggleStoreStatus: async (id) => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                throw new Error('No authentication token found');
            }

            const response = await fetch(`${API_URL}/${id}/toggle-status`, {
                method: 'PATCH',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                credentials: 'include',
                mode: 'cors'
            });

            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.message || 'Failed to toggle store status');
            }

            return data;
        } catch (error) {
            console.error('Error toggling store status:', error);
            throw error;
        }
    }
}


