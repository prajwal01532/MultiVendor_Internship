"use client"
import React, { useState, useEffect } from 'react';
import { FaUpload, FaPencilAlt, FaTrash } from 'react-icons/fa';
import { fetchCategories, createCategory, updateCategory, deleteCategory } from '@/services/pharmacyProductService';   
import { toast, Toaster } from 'react-hot-toast';
import Image from 'next/image';

const renderIcon = (iconPath, className) => (
    <img 
        src={iconPath} 
        alt="category icon" 
        className={`w-6 h-6 ${className}`}
    />
);

const Page = () => {
    const [formData, setFormData] = useState({
        name: '',
        image: null,
        priority: 1
    });
    const [imagePreview, setImagePreview] = useState(null);
    const [loading, setLoading] = useState(false);
    const [categories, setCategories] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [editingCategory, setEditingCategory] = useState(null);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState(null);

    // Fetch categories on component mount  
    useEffect(() => {
        loadCategories();
    }, []);

    const loadCategories = async () => {
        try {
            console.log('Fetching categories...');
            const response = await fetchCategories();
            console.log('Categories response:', response);
            
            if (response && response.success) {
                setCategories(response.data);
            } else {
                throw new Error(response?.message || 'Failed to load categories');
            }
        } catch (error) {
            toast.error(error.message || 'Failed to load categories');
            console.error('Error loading categories:', error);
            setCategories([]);
        }   
    };

    const handleEdit = (category) => {
        setEditingCategory(category);
        setFormData({
            name: category.name.en,
            priority: category.priority || 1,
            image: null
        }); 
        setImagePreview(category.image);
    };

    const handleCancelEdit = () => {
        setEditingCategory(null);
        setFormData({
            name: '',
            image: null,
            priority: 1
        });
        setImagePreview(null);  
    };

    const handleDelete = (category) => {
        setSelectedCategory(category);
        setShowDeleteConfirm(true);
    };

    const handleConfirmDelete = async () => {
        if (!selectedCategory) return;

        const loadingToast = toast.loading('Deleting category...');
        try {
            const response = await deleteCategory(selectedCategory._id);
            if (response.success) {
                toast.success(response.message || 'Category deleted successfully');
                await loadCategories(); // Reload the list
            } else {
                throw new Error(response.message || 'Failed to delete category');
            }
        } catch (error) {
            toast.error(error.message || 'Failed to delete category');
            console.error('Error deleting category:', error);
        } finally {
            toast.dismiss(loadingToast);    
            setShowDeleteConfirm(false);
            setSelectedCategory(null);
        }
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.size > 5 * 1024 * 1024) { // 5MB limit
                toast.error('Image size should be less than 5MB');
                return;
            }
            
            if (!file.type.startsWith('image/')) {
                toast.error('Please upload an image file');
                return;
            }

            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result);
                setFormData(prev => ({ ...prev, image: file }));
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!formData.name) {
            toast.error('Please enter category name');
            return;
        }

        if (!formData.image && !editingCategory) {
            toast.error('Please upload a category image');
            return;
        }

        setLoading(true);
        const loadingToast = toast.loading(editingCategory ? 'Updating category...' : 'Creating category...');

        try {
            let response;
            if (editingCategory) {
                response = await updateCategory(editingCategory._id, formData);
            } else {
                response = await createCategory(formData);
            }
            
            if (response && response.success) {
                toast.success(response.message || `Category ${editingCategory ? 'updated' : 'created'} successfully`);
                
                // Reset form and editing state
                setFormData({
                    name: '',
                    image: null,
                    priority: 1
                });
                setImagePreview(null);
                setEditingCategory(null);
                
                // Reload categories
                await loadCategories();
            } else {
                throw new Error(response?.message || `Failed to ${editingCategory ? 'update' : 'create'} category`);
            }
        } catch (error) {
            toast.error(error.message || `Failed to ${editingCategory ? 'update' : 'create'} category`);
            console.error(`Error ${editingCategory ? 'updating' : 'creating'} category:`, error);
        } finally {
            setLoading(false);
            toast.dismiss(loadingToast);
        }
    };

    const handleReset = () => {
        setFormData({
            name: '',
            image: null,
            priority: 1
        });
        setImagePreview(null);
    };

    const filteredCategories = Array.isArray(categories) ? categories.filter(category => 
        category?.name?.en?.toLowerCase().includes(searchTerm.toLowerCase())
    ) : [];

    return (
        <div className="p-6 space-y-6">
            <Toaster position="top-right" />
            
            <h2 className="text-xl font-semibold mb-6 flex items-center">
                {renderIcon("/icons/category.png", "mr-3")}
                {editingCategory ? 'Edit Category' : 'Add New Category'}
            </h2>

            {/* Form Section */}
            <div className="bg-white rounded-xl shadow-sm p-6 border">
                <form className="space-y-6" onSubmit={handleSubmit}>
                    <div className="grid grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Category Name <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                value={formData.name}
                                onChange={(e) => setFormData(prev => ({
                                    ...prev,
                                    name: e.target.value
                                }))}
                                placeholder="Enter category name"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Priority
                            </label>
                            <input
                                type="number"
                                min="1"
                                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                value={formData.priority}
                                onChange={(e) => setFormData(prev => ({
                                    ...prev,
                                    priority: parseInt(e.target.value)
                                }))}
                            />
                        </div>

                        <div className="col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Category Image <span className="text-red-500">*</span>
                            </label>
                            <div className="mt-1 flex items-center space-x-4">
                                <div className="w-32 h-32 border-2 border-gray-300 border-dashed rounded-lg overflow-hidden relative">
                                    {imagePreview ? (
                                        <img
                                            src={imagePreview}
                                            alt="Category preview"
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <div className="flex items-center justify-center h-full">
                                            <FaUpload className="w-8 h-8 text-gray-400" />
                                        </div>
                                    )}
                                    <input
                                        type="file"
                                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                        onChange={handleImageChange}
                                        accept="image/*"
                                    />
                                </div>
                                <div className="text-sm text-gray-500">
                                    Click to upload or drag and drop<br />
                                    PNG, JPG up to 5MB
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Form Actions */}
                    <div className="flex justify-end space-x-4">
                        <button
                            type="button"
                            onClick={handleReset}
                            disabled={loading}
                            className="px-6 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 disabled:opacity-50"
                        >
                            Reset
                        </button>
                        {editingCategory && (
                            <button
                                type="button"
                                onClick={handleCancelEdit}
                                className="px-6 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
                            >
                                Cancel Edit
                            </button>
                        )}
                        <button
                            type="submit"
                            disabled={loading}
                            className="px-6 py-2 bg-teal-800 text-white rounded-lg hover:bg-teal-700 disabled:opacity-50 flex items-center"
                        >
                            {loading ? (
                                <>
                                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    {editingCategory ? 'Updating...' : 'Creating...'}
                                </>
                            ) : (editingCategory ? 'Update Category' : 'Add Category')}
                        </button>
                    </div>
                </form>
            </div>

            {/* Category List Section */}
            <div className="bg-white rounded-xl shadow-sm p-6 border">
                <h2 className="text-xl font-semibold mb-6">Category List</h2>
                <div className="flex justify-end mb-4">
                    <div className="relative">
                        <input
                            type="text"
                            className="w-64 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Search categories..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                        <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-4.35-4.35m1.35-5.65a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                            </svg>
                        </div>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Sl</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Image</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Priority</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {filteredCategories.map((category, index) => (
                                <tr key={category._id}>
                                    <td className="px-4 py-3">{index + 1}</td>
                                    <td className="px-4 py-3">
                                        <div className="w-12 h-12 relative">
                                            <Image
                                                src={category.image || '/placeholder.png'}
                                                alt={category.name?.en || 'Category image'}
                                                layout="fill"
                                                objectFit="cover"
                                                className="rounded-lg"
                                            />
                                        </div>
                                    </td>
                                    <td className="px-4 py-3">{category.name?.en}</td>
                                    <td className="px-4 py-3">{category.priority || 1}</td>
                                    <td className="px-4 py-3">
                                        <div className="flex space-x-2">
                                            <button 
                                                className="p-2 text-blue-600 hover:text-blue-800"
                                                onClick={() => handleEdit(category)}
                                            >
                                                <FaPencilAlt className="w-4 h-4" />
                                            </button>
                                            <button 
                                                className="p-2 text-red-600 hover:text-red-800"
                                                onClick={() => handleDelete(category)}
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

            {/* Delete Confirmation Modal */}
            {showDeleteConfirm && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white p-6 rounded-lg shadow-lg max-w-sm w-full">
                        <h3 className="text-lg font-semibold mb-4">Confirm Delete</h3>
                        <p className="mb-6">Are you sure you want to delete this category? This action cannot be undone.</p>
                        <div className="flex justify-end space-x-4">
                            <button
                                onClick={() => setShowDeleteConfirm(false)}
                                className="px-4 py-2 text-gray-600 hover:text-gray-800"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleConfirmDelete}
                                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Page;

