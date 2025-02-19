"use client"
import React, { useState, useEffect, useCallback } from 'react';
import { FaCar } from 'react-icons/fa';
import { toast } from 'react-hot-toast';
import { createVehicleCategory, getVehicleCategory, updateVehicleCategory } from '@/app/services/vehicleCategoryService';
import { useRouter, useSearchParams } from 'next/navigation';

const AddVehicleCategory = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const categoryId = searchParams.get('id');
  const isEdit = !!categoryId;

  const [formData, setFormData] = useState({
    vehicleType: '',
    extraCharges: '',
    startingCoverage: '',
    maxCoverage: ''
  });
  const [loading, setLoading] = useState(false);
  const [initialLoad, setInitialLoad] = useState(true);

  // Memoized form update handler
  const handleInputChange = useCallback((e) => {
    const { id, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [id]: value
    }));
  }, []);

  // Fetch category data if in edit mode
  useEffect(() => {
    const fetchCategoryData = async () => {
      if (!categoryId) {
        setInitialLoad(false);
        return;
      }

      try {
        const response = await getVehicleCategory(categoryId);
        if (response.success) {
          const { vehicleType, extraCharges, startingCoverage, maxCoverage } = response.data;
          setFormData({
            vehicleType,
            extraCharges: extraCharges?.toString() || '',
            startingCoverage: startingCoverage?.toString() || '',
            maxCoverage: maxCoverage?.toString() || ''
          });
        }
      } catch (error) {
        toast.error('Failed to fetch category data');
        console.error('Error fetching category:', error);
      } finally {
        setInitialLoad(false);
      }
    };

    fetchCategoryData();
  }, [categoryId]);

  // Check for authentication on component mount
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      toast.error('Please login to access this page');
      router.push('/login');
    }
  }, [router]);

  const validateForm = useCallback(() => {
    const { vehicleType, extraCharges, startingCoverage, maxCoverage } = formData;

    if (!vehicleType.trim()) {
      toast.error('Vehicle type is required');
      return false;
    }

    const extraChargesNum = Number(extraCharges) || 0;
    const startingCoverageNum = Number(startingCoverage) || 0;
    const maxCoverageNum = Number(maxCoverage) || 0;

    if (extraChargesNum < 0) {
      toast.error('Extra charges must be a non-negative number');
      return false;
    }

    if (startingCoverageNum < 0) {
      toast.error('Starting coverage must be a non-negative number');
      return false;
    }

    if (maxCoverageNum < 0) {
      toast.error('Maximum coverage must be a non-negative number');
      return false;
    }

    if (maxCoverageNum < startingCoverageNum) {
      toast.error('Maximum coverage must be greater than or equal to starting coverage');
      return false;
    }

    return true;
  }, [formData]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    try {
      setLoading(true);
      const toastId = 'categoryOperation';
      toast.loading(isEdit ? 'Updating vehicle category...' : 'Creating vehicle category...', { id: toastId });
      
      const categoryData = {
        vehicleType: formData.vehicleType.trim(),
        extraCharges: Number(formData.extraCharges) || 0,
        startingCoverage: Number(formData.startingCoverage) || 0,
        maxCoverage: Number(formData.maxCoverage) || 0
      };

      const response = isEdit 
        ? await updateVehicleCategory(categoryId, categoryData)
        : await createVehicleCategory(categoryData);

      if (response.success) {
        toast.success(isEdit ? 'Vehicle category updated successfully' : 'Vehicle category created successfully', { id: toastId });
        router.push('/modulesection/vehicles-category');
      }
    } catch (error) {
      console.error('Error:', error);
      const errorMessage = error.errors 
        ? error.errors.map(err => err.msg).join(', ')
        : error.message || `Failed to ${isEdit ? 'update' : 'create'} vehicle category`;
      toast.error(errorMessage, { id: 'categoryOperation' });
    } finally {
      setLoading(false);
    }
  };

  const handleReset = useCallback(() => {
    setFormData({
      vehicleType: '',
      extraCharges: '',
      startingCoverage: '',
      maxCoverage: ''
    });
  }, []);

  if (initialLoad) {
    return (
      <div className="p-4 flex justify-center items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-700"></div>
      </div>
    );
  }

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4 flex items-center">
        <FaCar className="mr-2" />
        {isEdit ? 'Edit Vehicle Category' : 'Add Vehicle Category'}
      </h1>
      <div className="border p-4 rounded-lg">
        <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4">
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="vehicleType">
              Vehicle Type (Default) *
            </label>
            <input
              type="text"
              id="vehicleType"
              value={formData.vehicleType}
              onChange={handleInputChange}
              className="appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="extraCharges">
              Extra Charges ($)
            </label>
            <input
              type="number"
              id="extraCharges"
              value={formData.extraCharges}
              onChange={handleInputChange}
              className="appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="startingCoverage">
              Starting Coverage Area (Km)
            </label>
            <input
              type="number"
              id="startingCoverage"
              value={formData.startingCoverage}
              onChange={handleInputChange}
              className="appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="maxCoverage">
              Maximum Coverage Area (Km)
            </label>
            <input
              type="number"
              id="maxCoverage"
              value={formData.maxCoverage}
              onChange={handleInputChange}
              className="appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            />
          </div>
          <div className="col-span-2 flex justify-end space-x-4">
            <button
              type="submit"
              disabled={loading}
              className={`bg-teal-700 text-white px-4 py-2 rounded hover:bg-teal-800 ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {loading ? (isEdit ? 'Updating...' : 'Submitting...') : (isEdit ? 'Update' : 'Submit')}
            </button>
            {!isEdit && (
              <button
                type="button"
                onClick={handleReset}
                disabled={loading}
                className={`bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-700 ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                Reset
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddVehicleCategory;