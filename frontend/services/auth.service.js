const API_URL = 'http://localhost:5000/api/auth';

export const authService = {
    // Register admin
    registerAdmin: async (userData) => {
        try {
            console.log('Making registration request to:', `${API_URL}/register/admin`);
            const response = await fetch(`${API_URL}/register/admin`, {
                method: 'POST',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify(userData)
            });

            const data = await response.json();
            console.log('Registration API response:', data);

            if (!response.ok) {
                throw new Error(data.message || 'Registration failed');
            }

            return data;
        } catch (error) {
            console.error('Error in registerAdmin:', error);
            throw error;
        }
    },

    // Login admin
    loginAdmin: async (credentials) => {
        try {
            console.log('Making login request to:', `${API_URL}/login`);
            const response = await fetch(`${API_URL}/login`, {
                method: 'POST',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify(credentials)
            });

            const data = await response.json();
            console.log('Login API response:', data);

            if (!response.ok) {
                throw new Error(data.message || 'Login failed');
            }

            if (data.success && data.token) {
                localStorage.setItem('token', data.token);
                localStorage.setItem('user', JSON.stringify(data.user));
            }
            
            return data;
        } catch (error) {
            console.error('Error in loginAdmin:', error);
            throw error;
        }
    },

    // Get current user
    getCurrentUser: () => {
        try {
            const userStr = localStorage.getItem('user');
            return userStr ? JSON.parse(userStr) : null;
        } catch (error) {
            console.error('Error getting current user:', error);
            return null;
        }
    },

    // Get auth token
    getToken: () => {
        try {
            return localStorage.getItem('token');
        } catch (error) {
            console.error('Error getting token:', error);
            return null;
        }
    },

    // Logout
    logout: () => {
        try {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            window.location.href = '/auth/login';
        } catch (error) {
            console.error('Error during logout:', error);
        }
    },

    // Check if user is authenticated
    isAuthenticated: () => {
        try {
            const token = localStorage.getItem('token');
            return !!token;
        } catch (error) {
            console.error('Error checking authentication:', error);
            return false;
        }
    }
};