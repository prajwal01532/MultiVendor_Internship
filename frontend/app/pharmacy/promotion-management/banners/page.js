"use client"
import React, { useState, useEffect } from 'react';
import { FaPencilAlt, FaTrash } from 'react-icons/fa';
import { bannerService } from '@/services/pharmacyBanner.service';
import { storeService } from '@/services/pharmacyStore.service';

const renderIcon = (iconPath, className) => (
    <img
        src={iconPath}
        alt="banner icon"   
        className={`w-7 h-8 ${className}`}
    />
)

const Page = () => {
    // State
    const [isClient, setIsClient] = useState(false);
    const [banners, setBanners] = useState([]);
    const [stores, setStores] = useState([]);
    const [formData, setFormData] = useState({
        title: '',
        zone: '',
        type: '',
        store: '',
        image: null
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const [editMode, setEditMode] = useState(false);
    const [editId, setEditId] = useState(null);

    // Set isClient to true when component mounts
    useEffect(() => {
        setIsClient(true);
    }, []);

    // Fetch banners and stores on component mount
    useEffect(() => {
        if (isClient) {
            fetchBanners();
            fetchStores();
        }
    }, [isClient]);

    const fetchStores = async () => {
        try {
            const response = await storeService.listStores();
            if (response.success) {
                setStores(response.data.docs || []);
            }
        } catch (err) {
            console.error('Error fetching stores:', err);
            setError('Failed to fetch stores');
        }
    };

    const fetchBanners = async () => {
        try {
            const response = await bannerService.listBanners();
            if (response.success) {
                setBanners(response.data.docs || []);
            }
        } catch (err) {
            setError('Failed to fetch banners');
            console.error(err);
        }
    };

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
            // Check file size (10MB = 10 * 1024 * 1024 bytes)
            if (file.size > 10 * 1024 * 1024) {
                setError('File size too large. Maximum size is 10MB');
                return;
            }
            
            setFormData(prev => ({
                ...prev,
                image: file
            }));
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleStatusChange = async (id, currentStatus) => {
        try {
            const response = await bannerService.updateBanner(id, {
                isVisible: !currentStatus
            });
            if (response.success) {
                await fetchBanners();
            } else {
                throw new Error(response.message || 'Failed to update banner status');
            }
        } catch (err) {
            setError('Failed to update banner status');
            console.error(err);
        }
    };

    const handleEdit = (banner) => {
        setEditMode(true);
        setEditId(banner._id);
        setFormData({
            title: banner.title,
            zone: banner.zone,
            type: banner.type || 'main',
            store: banner.store?._id || '',
            image: null
        });
        setImagePreview(banner.image);
    };

    const resetForm = () => {
        setFormData({
            title: '',
            zone: '',
            type: '',
            store: '',
            image: null
        });
        setImagePreview(null);
        setEditMode(false);
        setEditId(null);
        setError(null);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            // Validate form data
            if (!formData.title) {
                throw new Error('Title is required');
            }
            if (!formData.store) {
                throw new Error('Please select a store');
            }
            if (!formData.image && !editMode) {
                throw new Error('Image is required');
            }

            const form = new FormData();
            form.append('title', formData.title);
            form.append('link', '#'); // Adding default link
            if (formData.zone) form.append('zone', formData.zone);
            if (formData.type) form.append('type', formData.type || 'main');
            form.append('store', formData.store);
            if (formData.image) form.append('image', formData.image);
            form.append('isVisible', true);

            let response;
            if (editMode) {
                response = await bannerService.updateBanner(editId, form);
            } else {
                response = await bannerService.createBanner(form);
            }

            if (response.success) {
                // Reset form
                resetForm();
                
                // Show success message
                alert(`Banner ${editMode ? 'updated' : 'created'} successfully!`);
                
                // Fetch updated banners list
                await fetchBanners();
            } else {
                throw new Error(response.message || `Failed to ${editMode ? 'update' : 'create'} banner`);
            }
        } catch (err) {
            console.error(`Error ${editMode ? 'updating' : 'creating'} banner:`, err);
            setError(err.message || `Failed to ${editMode ? 'update' : 'create'} banner. Please try again.`);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this banner?')) {
            try {
                const response = await bannerService.deleteBanner(id);
                if (response.success) {
                    await fetchBanners();
                }
            } catch (err) {
                setError('Failed to delete banner');
                console.error(err);
            }
        }
    };

    if (!isClient) {
        return null; // or a loading spinner
    }

    return (
        <div className="p-2 space-y-6">
            <h2 className="text-xl font-semibold mb-6 mt-3 flex items-center">
                {renderIcon("/icons/banner.png", "mr-3")}
                {editMode ? 'Edit Banner' : 'Add New Banner'}
            </h2>
            {/* Banner Form Section */}
            <div className="bg-white rounded-xl shadow-sm p-6 border">
                {error && (
                    <div className="mb-4 p-4 bg-red-50 text-red-600 rounded-lg">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
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
                                placeholder="Enter banner title"
                            />
                        </div>

                        <div className="flex flex-col space-y-2">
                            <label className="text-sm font-medium text-gray-700">
                                Zone
                            </label>
                            <input 
                                type="text"
                                name="zone"
                                value={formData.zone}
                                onChange={handleInputChange}
                                className="w-1/2 bg-white px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="Enter zone name"
                                required
                            />
                        </div>

                        <div className="flex flex-col space-y-2">
                            <label className="text-sm font-medium text-gray-700">
                                Banner Type
                            </label>
                            <select 
                                name="type"
                                value={formData.type}
                                onChange={handleInputChange}
                                className="w-1/2 bg-white px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="">Select Type</option>
                                <option value="main">Main Banner</option>
                                <option value="popup">Pop-up Banner</option>
                            </select>
                        </div>

                        <div className="flex space-x-6">
                            <div className="w-1/2">
                                <label className="text-sm font-medium text-gray-700">
                                    Store
                                </label>
                                <select 
                                    name="store"
                                    value={formData.store}
                                    onChange={handleInputChange}
                                    className="w-full bg-white mt-1 px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value="">Select Store</option>
                                    {stores.map((store) => (
                                        <option key={store._id} value={store._id}>
                                            {store.name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="w-1/2">
                                <label className="text-sm font-medium text-gray-700">
                                    Banner Image
                                </label>
                                <div className="mt-1 flex flex-col space-y-2">
                                    {imagePreview && (
                                        <div className="relative w-32 h-32">
                                            <img
                                                src={imagePreview}
                                                alt="Preview"
                                                className="w-full h-full object-cover rounded-lg"
                                            />
                                        </div>
                                    )}
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={handleImageChange}
                                        className="w-full  bg-white px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-end space-x-4">
                        <button
                            type="button"
                            onClick={resetForm}
                            className="px-6 py-2 text-black bg-slate-100 rounded transition-colors"
                        >
                            {editMode ? 'Cancel' : 'Reset'}
                        </button>
                        <button 
                            type="submit"
                            disabled={loading}
                            className="px-6 py-2 bg-teal-800 text-white rounded hover:bg-teal-800 transition-all duration-200"
                        >
                            {loading ? 'Submitting...' : (editMode ? 'Update' : 'Submit')}
                        </button>
                    </div>
                </form>
            </div>

            {/* Banner List Section */}
            <div className="bg-white rounded-xl shadow-sm p-6 border">
                <h2 className="text-xl font-semibold mb-6">Banner List</h2>
                <table className="w-full">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Title</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Store</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Action</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                        {banners.map((banner) => (
                            <tr key={banner._id}>
                                <td className="px-4 py-3">{banner.title}</td>
                                <td className="px-4 py-3">{banner.type || 'Main'}</td>
                                <td className="px-4 py-3">
                                    {banner.store?.name || 'N/A'}
                                </td>
                                <td className="px-4 py-3">
                                    {isClient && (
                                        <label className="relative inline-flex items-center cursor-pointer">
                                            <input
                                                type="checkbox"
                                                className="sr-only peer"
                                                checked={banner.isVisible}
                                                onChange={() => handleStatusChange(banner._id, banner.isVisible)}
                                            />
                                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                                        </label>
                                    )}
                                </td>
                                <td className="px-4 py-3">
                                    <div className="flex space-x-2">
                                        <button 
                                            onClick={() => handleEdit(banner)}
                                            className="p-2 rounded-lg text-blue-600 border border-blue-600 hover:bg-blue-50"
                                        >
                                            <FaPencilAlt className="w-4 h-4" />
                                        </button>
                                        <button 
                                            onClick={() => handleDelete(banner._id)}
                                            className="p-2 rounded-lg text-red-600 border border-red-600 hover:bg-red-50"
                                        >
                                            <FaTrash className="w-4 h-4" />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default Page;
