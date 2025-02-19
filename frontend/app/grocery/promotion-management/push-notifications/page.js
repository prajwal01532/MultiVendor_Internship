"use client"
import React, { useState, useEffect } from 'react';
import { FaPencilAlt, FaTrash } from 'react-icons/fa';
import axios from 'axios';

// Create axios instance with base URL
const api = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api',
    headers: {
        'Content-Type': 'multipart/form-data',
    }
});

// Update the request interceptor to handle auth token
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            // Keep Content-Type as multipart/form-data for file uploads
            if (config.method === 'post' || config.method === 'put' || config.method === 'patch') {
                config.headers['Authorization'] = `Bearer ${token}`;
            } else {
                config.headers = {
                    ...config.headers,
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                };
            }
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Add response interceptor to handle errors
api.interceptors.response.use(
    (response) => response,
    (error) => {
        const message = error.response?.data?.message || 'Something went wrong';
        console.error('API Error:', message);
        return Promise.reject(message);
    }
);

const renderIcon = (iconPath, className) => (
  <img 
    src={iconPath} 
    alt="notification icon" 
    className={`w-7 h-8 ${className}`}
  />
);

const Page = () => {
    const [imagePreview, setImagePreview] = useState(null);
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        image: null,
        zone: 'all',
        target: ''
    });

    const [notificationStatus, setNotificationStatus] = useState({
        1: 'active',
        2: 'inactive'
    });

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState(null);

    // Fetch notifications
    const fetchNotifications = async () => {
        try {
            const response = await api.get('/grocerynotifications/notifications');
            setNotifications(response.data.data.docs || []);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching notifications:', error);
            setError('Failed to load notifications');
            setLoading(false);
        }
    };

    // Fetch notifications when component mounts
    useEffect(() => {
        fetchNotifications();
    }, []);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.size > 5 * 1024 * 1024) { // 5MB limit
                alert('Image size should be less than 5MB');
                return;
            }
            
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result);
                setFormData(prev => ({
                    ...prev,
                    image: file
                }));
            };
            reader.readAsDataURL(file);
        }
    };

    const handleEdit = (notification) => {
        setIsEditing(true);
        setEditingId(notification._id);
        setFormData({
            title: notification.title,
            description: notification.description,
            zone: notification.zone || 'all',
            target: notification.target,
            image: null
        });
        setImagePreview(notification.image);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError(null);
        
        try {
            // Validate required fields
            const requiredFields = {
                title: 'Title',
                description: 'Description',
                zone: 'Zone',
                target: 'Target Audience'
            };

            // Only require image for new notifications
            if (!isEditing) {
                requiredFields.image = 'Image';
            }

            const missingFields = Object.entries(requiredFields)
                .filter(([key]) => !formData[key])
                .map(([_, label]) => label);

            if (missingFields.length > 0) {
                throw new Error(`Please fill in the following required fields: ${missingFields.join(', ')}`);
            }

            // Create FormData object
            const submitData = new FormData();
            submitData.append('title', formData.title.trim());
            submitData.append('description', formData.description.trim());
            submitData.append('zone', formData.zone);
            submitData.append('target', formData.target.toLowerCase());
            
            if (formData.image) {
                submitData.append('image', formData.image);
            }

            let response;
            if (isEditing) {
                response = await api.patch(`/grocerynotifications/notifications/${editingId}`, submitData);
            } else {
                response = await api.post('/grocerynotifications/notifications', submitData);
            }
            
            if (response.data.success) {
                // Reset form after successful submission
                setFormData({
                    title: '',
                    description: '',
                    image: null,
                    zone: 'all',
                    target: ''
                });
                setImagePreview(null);
                setIsEditing(false);
                setEditingId(null);
                
                // Show success message and refresh list
                alert(isEditing ? 'Notification updated successfully!' : 'Notification created successfully!');
                fetchNotifications();
            }
        } catch (error) {
            console.error(isEditing ? 'Error updating notification:' : 'Error creating notification:', error);
            setError(error.response?.data?.message || error.message || (isEditing ? 'Failed to update notification' : 'Failed to create notification'));
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleReset = () => {
        setImagePreview(null);
        setFormData({
            title: '',
            description: '',
            image: null,
            zone: 'all',
            target: ''
        });
        setIsEditing(false);
        setEditingId(null);
    };

    const handleStatusChange = async (id) => {
        try {
            const response = await api.patch(`/grocerynotifications/notifications/${id}/toggle-status`);
            if (response.data.success) {
                fetchNotifications();
            }
        } catch (error) {
            console.error('Error updating notification status:', error);
            alert(error.response?.data?.message || 'Failed to update status');
        }
    };

    const handleDelete = async (id) => {
        if (!confirm('Are you sure you want to delete this notification?')) {
            return;
        }
        
        try {
            const response = await api.delete(`/grocerynotifications/notifications/${id}`);
            if (response.data.success) {
                alert('Notification deleted successfully!');
                fetchNotifications();
            }
        } catch (error) {
            console.error('Error deleting notification:', error);
            alert(error.response?.data?.message || 'Failed to delete notification');
        }
    };

    return (
        <div className="p-6 space-y-6">
            <h1 className="text-xl font-semibold mb-6 flex items-center">
                {renderIcon("/icons/notification.png", "mr-3")}
                {isEditing ? 'Edit Notification' : 'Create Notification'}
            </h1>
            <div className="bg-white rounded-xl shadow-sm p-6 border">
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-4">
                        <div className="flex flex-col space-y-2">
                            <label className="text-sm font-medium text-gray-700">
                                Title(Default)
                            </label>
                            <input
                                type="text"
                                name="title"
                                value={formData.title}
                                onChange={handleInputChange}
                                className="w-1/2 px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="Enter notification title"
                                required
                            />
                        </div>

                        <div className="flex flex-col space-y-2">
                            <label className="text-sm font-medium text-gray-700">
                                Target Audience
                            </label>
                            <select 
                                name="target"
                                value={formData.target}
                                onChange={handleInputChange}
                                className="w-1/2 px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                required
                            >
                                <option value="">Select target audience</option>
                                <option value="customer">Customer</option>
                                <option value="deliveryman">Delivery Man</option>
                                <option value="store">Store</option>
                            </select>
                        </div>

                        <div className="flex space-x-6">
                            <div className="w-1/2">
                                <label className="text-sm font-medium text-gray-700">
                                    Description
                                </label>
                                <textarea
                                    name="description"
                                    value={formData.description}
                                    onChange={handleInputChange}
                                    className="w-full bg-white mt-1 px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 h-24 resize-none"
                                    placeholder="Enter description"
                                    required
                                ></textarea>
                            </div>

                            <div className="w-1/2">
                                <label className="text-sm font-medium text-gray-700">
                                    Image
                                </label>
                                <div className="mt-2 flex flex-col space-y-2">
                                    {imagePreview && (
                                        <div className="relative w-32 h-32">
                                            <img
                                                src={imagePreview}
                                                alt="Preview"
                                                className="w-full h-full object-cover rounded-lg"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setImagePreview(null);
                                                    setFormData(prev => ({ ...prev, image: null }));
                                                }}
                                                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1"
                                            >
                                                ×
                                            </button>
                                        </div>
                                    )}
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={handleImageChange}
                                        className="w-full bg-white px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-end space-x-4">
                        <button
                            type="reset"
                            onClick={handleReset}
                            className="px-6 py-2 text-black bg-slate-100 rounded hover:bg-slate-200 transition-colors"
                        >
                            Reset
                        </button>
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className={`px-6 py-2 bg-teal-800 text-white rounded transition-all duration-200 ${
                                isSubmitting ? 'opacity-50 cursor-not-allowed' : 'hover:bg-teal-700'
                            }`}
                        >
                            {isSubmitting ? 'Submitting...' : 'Submit'}
                        </button>
                    </div>
                </form>
            </div>
            <div className="bg-white rounded-xl shadow-sm p-6 border mt-6">
                <h2 className="text-xl font-semibold mb-6">Notification List</h2>
                <table className="w-full">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Title</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Description</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Image</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Zone</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Target</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Action</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                        {loading ? (
                            <tr>
                                <td colSpan="7" className="px-4 py-3 text-center">Loading...</td>
                            </tr>
                        ) : notifications.length === 0 ? (
                            <tr>
                                <td colSpan="7" className="px-4 py-3 text-center">No notifications found</td>
                            </tr>
                        ) : (
                            notifications.map((notification) => (
                                <tr key={notification._id}>
                                    <td className="px-4 py-3">{notification.title}</td>
                                    <td className="px-4 py-3 max-w-xs truncate">{notification.description}</td>
                                    <td className="px-4 py-3">
                                        {notification.image && (
                                            <img 
                                                src={notification.image} 
                                                alt={notification.title} 
                                                className="h-10 w-10 rounded object-cover"
                                            />
                                        )}
                                    </td>
                                    <td className="px-4 py-3">{notification.zone?.name || 'N/A'}</td>
                                    <td className="px-4 py-3">{notification.target}</td>
                                    <td className="px-4 py-3">
                                        <label className="relative inline-flex items-center cursor-pointer">
                                            <input
                                                type="checkbox"
                                                className="sr-only peer"
                                                checked={notification.status === 'active'}
                                                onChange={() => handleStatusChange(notification._id)}
                                            />
                                            <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                                        </label>
                                    </td>
                                    <td className="px-4 py-3">
                                        <div className="flex space-x-2">
                                            <button 
                                                className="p-2 text-blue-600 hover:text-blue-800"
                                                onClick={() => handleEdit(notification)}
                                            >
                                                <FaPencilAlt className="w-4 h-4" />
                                            </button>
                                            <button 
                                                className="p-2 text-red-600 hover:text-red-800" 
                                                onClick={() => handleDelete(notification._id)}
                                            >
                                                <FaTrash className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
            {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
                    {error}
                    <button
                        className="absolute top-0 right-0 px-4 py-3"
                        onClick={() => setError(null)}
                    >
                        <span className="text-2xl">&times;</span>
                    </button>
                </div>
            )}
        </div>
    );
};

export default Page;
