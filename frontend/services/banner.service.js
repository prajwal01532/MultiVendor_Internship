const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/foodbannerandad';

export const bannerService = {
    // Create a new banner
    createBanner: async (formData) => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                throw new Error('No authentication token found');
            }

            // For debugging
            console.log('Creating banner with data:', {
                title: formData.get('title'),
                link: formData.get('link'),
                store: formData.get('store'),
                zone: formData.get('zone'),
                type: formData.get('type'),
                hasImage: formData.has('image')
            });

            const response = await fetch(`${API_URL}/banners`, {
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
                throw new Error(data.message || `Failed to create banner: ${response.status} ${response.statusText}`);
            }

            return data;
        } catch (error) {
            console.error('Error in createBanner:', error);
            throw error;
        }
    },

    // List all banners
    listBanners: async (params = {}) => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                throw new Error('No authentication token found');
            }

            const queryString = new URLSearchParams(params).toString();
            console.log('Fetching banners with params:', params);
            const response = await fetch(`${API_URL}/banners?${queryString}`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Accept': 'application/json'
                },
                credentials: 'include',
                mode: 'cors'
            });

            const data = await response.json();
            console.log('List banners response:', data);
            
            if (!response.ok) {
                throw new Error(data.message || 'Failed to fetch banners');
            }

            return data;
        } catch (error) {
            console.error('Error listing banners:', error);
            throw error;
        }
    },

    // Update a banner
    updateBanner: async (id, data) => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                throw new Error('No authentication token found');
            }

            const headers = {
                'Authorization': `Bearer ${token}`
            };

            // If data is not FormData, set Content-Type to application/json
            if (!(data instanceof FormData)) {
                headers['Content-Type'] = 'application/json';
                data = JSON.stringify(data);
            }

            const response = await fetch(`${API_URL}/banners/${id}`, {
                method: 'PUT',
                headers,
                body: data,
                credentials: 'include',
                mode: 'cors'
            });

            const responseData = await response.json();
            
            if (!response.ok) {
                throw new Error(responseData.message || 'Failed to update banner');
            }

            return responseData;
        } catch (error) {
            console.error('Error updating banner:', error);
            throw error;
        }
    },

    // Delete a banner
    deleteBanner: async (id) => {
        try {
            const response = await fetch(`${API_URL}/banners/${id}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                    'Accept': 'application/json'
                },
                credentials: 'include',
                mode: 'cors'
            });

            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.message || 'Failed to delete banner');
            }

            return data;
        } catch (error) {
            console.error('Error deleting banner:', error);
            throw error;
        }
    },

    // Create advertisement
    createAdvertisement: async (formData) => {
        try {
            const response = await fetch(`${API_URL}/advertisements`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: formData
            });
            return await response.json();
        } catch (error) {
            console.error('Error creating advertisement:', error);
            throw error;
        }
    },

    // List advertisements
    listAdvertisements: async (params = {}) => {
        try {
            const queryString = new URLSearchParams(params).toString();
            const response = await fetch(`${API_URL}/advertisements?${queryString}`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
            return await response.json();
        } catch (error) {
            console.error('Error listing advertisements:', error);
            throw error;
        }
    },

    // Create other banner (bottom, reviewed sections)
    createOtherBanner: async (formData) => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                throw new Error('No authentication token found');
            }

            // For debugging
            console.log('Creating other banner with data:', {
                title: formData.get('title'),
                type: formData.get('type'),
                hasImage: formData.has('image')
            });

            // Add default values for non-required fields
            formData.append('store', '000000000000000000000000'); // Dummy ID
            formData.append('zone', 'other');

            const response = await fetch(`${API_URL}/banners`, {
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
                throw new Error(data.message || `Failed to create banner: ${response.status} ${response.statusText}`);
            }

            return data;
        } catch (error) {
            console.error('Error in createOtherBanner:', error);
            throw error;
        }
    }
}; 