"use client"
import React, { useState, useEffect } from 'react';
import { FaCar, FaEdit, FaTrash } from 'react-icons/fa';
import { toast } from 'react-hot-toast';
import { getAllVehicleCategories, deleteVehicleCategory } from '@/app/services/vehicleCategoryService';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

const VehicleCategory = () => {
  const router = useRouter();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await getAllVehicleCategories();
      if (response.success) {
        setCategories(response.data);
      }
    } catch (error) {
      toast.error(error.message || 'Failed to fetch vehicle categories');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (id) => {
    router.push(`/modulesection/addvehiclecategory?id=${id}`);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this category?')) {
      try {
        const response = await deleteVehicleCategory(id);
        if (response.success) {
          toast.success('Vehicle category deleted successfully');
          fetchCategories(); // Refresh the list
        }
      } catch (error) {
        toast.error(error.message || 'Failed to delete vehicle category');
      }
    }
  };

  if (loading) {
    return (
      <div className="p-4 flex justify-center items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-700"></div>
      </div>
    );
  }

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold flex items-center">
          <FaCar className="mr-2" />
          Vehicle Categories
        </h1>
        <Link 
          href="/modulesection/addvehiclecategory"
          className="bg-teal-700 text-white px-4 py-2 rounded hover:bg-teal-800"
        >
          Add New Category
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {categories.map((category) => (
          <div key={category._id} className="border rounded-lg p-4 shadow-sm">
            <div className="flex justify-between items-start mb-2">
              <h2 className="text-xl font-semibold">{category.vehicleType}</h2>
              <div className="flex space-x-2">
                <button
                  onClick={() => handleEdit(category._id)}
                  className="text-blue-600 hover:text-blue-800 p-1"
                >
                  <FaEdit />
                </button>
                <button
                  onClick={() => handleDelete(category._id)}
                  className="text-red-600 hover:text-red-800 p-1"
                >
                  <FaTrash />
                </button>
              </div>
            </div>
            <div className="text-gray-600">
              <p>Extra Charges: ${category.extraCharges}</p>
              <p>Coverage Area: {category.startingCoverage} - {category.maxCoverage} Km</p>
              <p className={`text-sm ${category.isActive ? 'text-green-600' : 'text-red-600'}`}>
                Status: {category.isActive ? 'Active' : 'Inactive'}
              </p>
            </div>
          </div>
        ))}
      </div>

      {categories.length === 0 && (
        <div className="text-center text-gray-500 mt-8">
          No vehicle categories found. Add your first category!
        </div>
      )}
    </div>
  );
};

export default VehicleCategory; 