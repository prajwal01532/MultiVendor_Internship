"use client"
import React, { useState, useEffect } from 'react';
import { FaUpload } from 'react-icons/fa';
import advertisementService from '@/services/pharmacyAdvertisementService';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';

const Page = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [stores, setStores] = useState([]);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    store: '',
    priority: '',
    type: '',
    validity: '',
    showReviews: false,
    showRatings: false,
    file: null
  });

  const [filePreview, setFilePreview] = useState(null);

  // Fetch stores when component mounts
  useEffect(() => {
    const fetchStores = async () => {
      try {
        const response = await advertisementService.getStores();
        if (response.success) {
          setStores(response.data.docs || []);
        } else {
          console.error('Failed to fetch stores:', response);
          toast.error('Failed to load stores');
        }
      } catch (err) {
        console.error('Error fetching stores:', err);
        toast.error('Failed to fetch stores');
      }
    };
    fetchStores();
  }, []);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFilePreview(reader.result);
        setFormData(prev => ({ ...prev, file }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);

      // Validate required fields
      if (!formData.title || !formData.description || !formData.store || !formData.type || !formData.priority || !formData.validity || !formData.file) {
        throw new Error('Please fill in all required fields');
      }

      // Create FormData
      const submitData = new FormData();

      // Convert title and description to Map objects with language keys
      const titleMap = { en: formData.title };
      const descriptionMap = { en: formData.description };
      
      // Add title and description as stringified JSON
      submitData.append('title', JSON.stringify(titleMap));
      submitData.append('description', JSON.stringify(descriptionMap));
      
      // Basic fields
      submitData.append('store', formData.store);
      submitData.append('type', formData.type);
      submitData.append('priority', formData.priority.toString());
      
      // Dates
      const validityDate = new Date(formData.validity);
      if (isNaN(validityDate.getTime())) {
        throw new Error('Please select a valid date');
      }
      
      const startDate = new Date(validityDate);
      startDate.setHours(0, 0, 0, 0);
      const endDate = new Date(validityDate);
      endDate.setHours(23, 59, 59, 999);
      
      submitData.append('startDate', startDate.toISOString());
      submitData.append('endDate', endDate.toISOString());
      
      // Target audience structure
      const targetAudience = {
        ageRange: {
          min: 0,
          max: 100
        },
        gender: 'all',
        zones: []
      };
      
      // Add target audience as stringified JSON
      submitData.append('targetAudience', JSON.stringify(targetAudience));

      // Media file - must be named 'media' to match backend expectation
      if (formData.file) {
        submitData.append('media', formData.file);
      }

      const result = await advertisementService.createAdvertisement(submitData);
      
      if (result.success) {
        toast.success('Advertisement created successfully');
        router.push('/food/promotion-management/adslist');
      } else {
        throw new Error(result.message || 'Failed to create advertisement');
      }
    } catch (err) {
      console.error('Error creating advertisement:', err);
      if (err.response?.data?.errors) {
        // Log and display validation errors from backend
        console.log('Validation errors:', err.response.data.errors);
        const errorMessages = err.response.data.errors
          .map(e => `${e.path}: ${e.msg}`)
          .filter((msg, index, arr) => arr.indexOf(msg) === index)
          .join('\n');
        toast.error(errorMessages);
      } else {
        toast.error(err.message || 'Failed to create advertisement');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6">
      <h1 className='text-xl font-bold m-3'>Create Advertisement</h1>
      <div className="bg-white rounded-xl shadow-sm p-6 border flex">
        {/* Form Section */}
        <div className="w-2/3">
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Advertisement Title
              </label>
              <input
                type="text"
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Enter title"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Short Description
              </label>
              <textarea
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 h-24"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Enter description"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Select Store
                </label>
                <select 
                  className="w-full bg-white px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={formData.store}
                  onChange={(e) => setFormData(prev => ({ ...prev, store: e.target.value }))}
                  required
                >
                  <option value="">Select Store</option>
                  {stores.map(store => (
                    <option key={store._id} value={store._id}>
                      {store.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Select Priority
                </label>
                <select 
                  className="w-full bg-white px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={formData.priority}
                  onChange={(e) => setFormData(prev => ({ ...prev, priority: parseInt(e.target.value) }))}
                  required
                >
                  <option value="">Select Priority</option>
                  <option value="1">1 (Highest)</option>
                  <option value="2">2</option>
                  <option value="3">3</option>
                  <option value="4">4</option>
                  <option value="5">5 (Lowest)</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Advertisement Type
                </label>
                <select 
                  className="w-full bg-white px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={formData.type}
                  onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value }))}
                  required
                >
                  <option value="">Select Type</option>
                  <option value="banner">Banner</option>
                  <option value="popup">Pop-up</option>
                  <option value="video">Video</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Validity
                </label>
                <input
                  type="date"
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={formData.validity}
                  onChange={(e) => setFormData(prev => ({ ...prev, validity: e.target.value }))}
                  required
                />
              </div>
            </div>

            <div className="flex space-x-6">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={formData.showReviews}
                  onChange={(e) => setFormData(prev => ({ ...prev, showReviews: e.target.checked }))}
                  className="rounded text-blue-600"
                />
                <span className="text-sm text-gray-700">Show Reviews</span>
              </label>

              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={formData.showRatings}
                  onChange={(e) => setFormData(prev => ({ ...prev, showRatings: e.target.checked }))}
                  className="rounded text-blue-600"
                />
                <span className="text-sm text-gray-700">Show Ratings</span>
              </label>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Upload Files
              </label>
              <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-lg">
                <div className="space-y-1 text-center">
                  <FaUpload className="mx-auto h-12 w-12 text-gray-400" />
                  <div className="flex text-sm text-gray-600">
                    <label className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500">
                      <span>Upload a file</span>
                      <input 
                        type="file" 
                        className="sr-only" 
                        onChange={handleFileChange}
                        accept="image/*"
                        required
                      />
                    </label>
                  </div>
                </div>
              </div>
            </div>

            {/* Buttons at bottom */}
            <div className="flex justify-end space-x-4 mt-6">
              <button
                type="reset"
                className="px-6 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
              >
                Reset
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2 bg-teal-800 text-white rounded-lg hover:bg-teal-700 disabled:opacity-50"
              >
                {loading ? 'Saving...' : 'Submit'}
              </button>
            </div>
          </form>
        </div>

        {/* Preview Section */}
        <div className="w-1/3 pl-6 flex flex-col min-h-[600px]">
          <h2 className="text-lg font-semibold mb-6">Advertisement Preview</h2>
          <div className="flex-1 space-y-4 bg-slate-50">
            {formData.title && (
              <div>
                <h3 className="font-medium">Title</h3>
                <p className="text-gray-600">{formData.title}</p>
              </div>
            )}
            
            {formData.description && (
              <div>
                <h3 className="font-medium">Description</h3>
                <p className="text-gray-600">{formData.description}</p>
              </div>
            )}

            {formData.store && (
              <div>
                <h3 className="font-medium">Store</h3>
                <p className="text-gray-600">
                  {stores.find(s => s._id === formData.store)?.name || ''}
                </p>
              </div>
            )}

            {formData.priority && (
              <div>
                <h3 className="font-medium">Priority</h3>
                <p className="text-gray-600">{formData.priority}</p>
              </div>
            )}

            {formData.type && (
              <div>
                <h3 className="font-medium">Type</h3>
                <p className="text-gray-600">{formData.type}</p>
              </div>
            )}

            {formData.validity && (
              <div>
                <h3 className="font-medium">Validity</h3>
                <p className="text-gray-600">{formData.validity}</p>
              </div>
            )}

            {filePreview && (
              <div>
                <h3 className="font-medium">File Preview</h3>
                <div className="mt-2">
                  <img
                    src={filePreview}
                    alt="Preview"
                    className="max-w-full h-auto rounded-lg"
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Page;