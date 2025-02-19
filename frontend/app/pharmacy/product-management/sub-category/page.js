"use client"
import React, { useState, useEffect } from 'react';
import { FaPencilAlt, FaTrash, FaSearch, FaPlus } from 'react-icons/fa';
import { fetchCategories, fetchSubCategories, createSubCategory, updateSubCategory, deleteSubCategory } from '@/services/pharmacyProductService';
import { toast, Toaster } from 'react-hot-toast';
import Image from 'next/image';

const renderIcon = (iconPath, className) => (
    <img 
        src={iconPath} 
        alt="sub-category icon" 
        className={`w-6 h-6 ${className}`}
    />
);

const SubCategoryPage = () => {
    const [subCategories, setSubCategories] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [showAddModal, setShowAddModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [selectedSubCategory, setSelectedSubCategory] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        category: '',
        priority: 1
    });
    const [deleteLoading, setDeleteLoading] = useState(null);
    const [statusLoading, setStatusLoading] = useState(null);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [subCategoriesResponse, categoriesResponse] = await Promise.all([
                fetchSubCategories(),
                fetchCategories()
            ]);

            console.log('Subcategories response:', subCategoriesResponse);
            console.log('Categories response:', categoriesResponse);

            if (subCategoriesResponse.success) {
                setSubCategories(subCategoriesResponse.data.data || []);
            }

            if (categoriesResponse.success) {
                setCategories(categoriesResponse.data || []);
            }
        } catch (error) {
            console.error('Error fetching data:', error);
            toast.error('Failed to fetch data');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (!formData.name || !formData.category) {
                toast.error('Please fill in all required fields');
                return;
            }

            const response = showEditModal
                ? await updateSubCategory(selectedSubCategory._id, formData)
                : await createSubCategory(formData);

            if (response.success) {
                toast.success(showEditModal ? 'Sub-category updated successfully' : 'Sub-category created successfully');
                setShowAddModal(false);
                setShowEditModal(false);
                fetchData(); // Refresh the list
                setFormData({ name: '', category: '', priority: 1 });
            }
        } catch (error) {
            console.error('Error submitting sub-category:', error);
            // Only show error toast if it's a validation error
            if (!error.message.includes('Failed to')) {
                toast.error(error.message || 'Failed to submit sub-category');
            }
        }
    };

    const handleEdit = (subCategory) => {
        setSelectedSubCategory(subCategory);
        setFormData({
            name: subCategory.name.en,
            category: subCategory.category._id,
            priority: subCategory.priority || 1
        });
        setShowEditModal(true);
    };

    const handleDelete = async (id) => {
        if (!confirm('Are you sure you want to delete this sub-category?')) return;

        try {
            setDeleteLoading(id);
            const response = await deleteSubCategory(id);
            if (response.success) {
                toast.success('Sub-category deleted successfully');
                fetchData(); // Refresh the list
            } else {
                throw new Error(response.message);
            }
        } catch (error) {
            console.error('Error deleting sub-category:', error);
            toast.error(error.message || 'Failed to delete sub-category');
        } finally {
            setDeleteLoading(null);
        }
    };

    const handleStatusToggle = async (id, currentStatus) => {
        try {
            setStatusLoading(id);
            const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
            const response = await updateSubCategory(id, { status: newStatus });

            if (response.success) {
                toast.success(`Sub-category ${newStatus === 'active' ? 'activated' : 'deactivated'} successfully`);
                fetchData(); // Refresh the list
            } else {
                throw new Error(response.message);
            }
        } catch (error) {
            console.error('Error updating status:', error);
            toast.error(error.message || 'Failed to update status');
        } finally {
            setStatusLoading(null);
        }
    };

    const filteredSubCategories = subCategories.filter(subCategory => 
        subCategory.name?.en?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        subCategory.category?.name?.en?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="p-6">
            <Toaster />
                
            {/* Header */}
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-800 flex items-center">
                    <Image src="/icons/items.png" alt="Sub Categories" width={32} height={32} className="mr-2" />
                    Sub Categories
                </h1>
                <button
                    onClick={() => {
                        setFormData({ name: '', category: '', priority: 1 });
                        setShowAddModal(true);
                    }}
                    className="bg-teal-800 text-white px-4 py-2 rounded-lg hover:bg-teal-700 flex items-center"
                >
                    <FaPlus className="mr-2" />
                    Add New Sub Category
                </button>
            </div>

            {/* Search Bar */}
            <div className="bg-white p-4 rounded-lg shadow mb-6">
                <div className="relative">
                    <input
                        type="text"
                        placeholder="Search sub-categories..."
                        className="w-full pl-10 pr-4 py-2 border rounded-lg"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                    <FaSearch className="absolute left-3 top-3 text-gray-400" />
                </div>
            </div>

            {/* Sub Categories Table */}
            {loading ? (
                <div className="flex justify-center items-center h-32">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
                </div>
            ) : (
                <div className="bg-white rounded-lg shadow overflow-x-auto">
                    <table className="min-w-full">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Priority</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {filteredSubCategories.map((subCategory) => (
                                <tr key={subCategory._id}>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm font-medium text-gray-900">{subCategory.name?.en}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm text-gray-900">{subCategory.category?.name?.en}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm text-gray-900">{subCategory.priority || 1}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <button
                                            onClick={() => handleStatusToggle(subCategory._id, subCategory.status)}
                                            disabled={statusLoading === subCategory._id}
                                            className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                                                ${subCategory.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}
                                                ${statusLoading === subCategory._id ? 'opacity-50 cursor-wait' : 'cursor-pointer hover:opacity-80'}`}
                                        >
                                            {statusLoading === subCategory._id ? 'Updating...' : subCategory.status}
                                        </button>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                        <button
                                            onClick={() => handleEdit(subCategory)}
                                            className="text-blue-600 hover:text-blue-900 mr-4"
                                        >
                                            <FaPencilAlt className="w-5 h-5" />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(subCategory._id)}
                                            disabled={deleteLoading === subCategory._id}
                                            className={`text-red-600 hover:text-red-900 
                                                ${deleteLoading === subCategory._id ? 'opacity-50 cursor-wait' : ''}`}
                                        >
                                            {deleteLoading === subCategory._id ? (
                                                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-red-600"></div>
                                            ) : (
                                                <FaTrash className="w-5 h-5" />
                                            )}
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Add/Edit Modal */}
            {(showAddModal || showEditModal) && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-lg p-6 w-full max-w-md">
                        <h2 className="text-xl font-semibold mb-4">
                            {showEditModal ? 'Edit Sub Category' : 'Add New Sub Category'}
                        </h2>
                        <form onSubmit={handleSubmit}>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Name <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        className="w-full px-4 py-2 border rounded-lg"
                                        value={formData.name}
                                        onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Category <span className="text-red-500">*</span>
                                    </label>
                                    <select
                                        required
                                        className="w-full px-4 py-2 border rounded-lg"
                                        value={formData.category}
                                        onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                                    >
                                        <option value="">Select Category</option>
                                        {categories.map(category => (
                                            <option key={category._id} value={category._id}>
                                                {category.name.en}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Priority
                                    </label>
                                    <input
                                        type="number"
                                        className="w-full px-4 py-2 border rounded-lg"
                                        value={formData.priority}
                                        onChange={(e) => setFormData(prev => ({ ...prev, priority: parseInt(e.target.value) || 1 }))}
                                        min="1"
                                    />
                                </div>
                            </div>
                            <div className="mt-6 flex justify-end space-x-3">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowAddModal(false);
                                        setShowEditModal(false);
                                        setFormData({ name: '', category: '', priority: 1 });
                                    }}
                                    className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 bg-teal-800 text-white rounded-lg hover:bg-teal-700"
                                >
                                    {showEditModal ? 'Update' : 'Add'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SubCategoryPage;
