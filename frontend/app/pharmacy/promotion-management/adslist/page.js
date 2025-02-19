"use client"
import React, { useState, useEffect } from 'react';
import { FaPencilAlt, FaTrash } from 'react-icons/fa';
import advertisementService from '@/services/pharmacyAdvertisementService';
import { format } from 'date-fns';
            
const Page = () => {
  const [advertisements, setAdvertisements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Fetch advertisements
  const fetchAdvertisements = async () => {
    try {
      setLoading(true);
      const filters = {};
      if (statusFilter !== 'all') {
        filters.status = statusFilter;
      }
      if (searchTerm) {
        filters.search = searchTerm;
      }

      const response = await advertisementService.getAdvertisements(currentPage, 10, filters);
      setAdvertisements(response.data.docs);
      setTotalPages(response.data.totalPages);
      setError(null);
    } catch (err) {
      setError(err.message || 'Failed to fetch advertisements');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdvertisements();
  }, [currentPage, statusFilter, searchTerm]);

  // Handle status change
  const handleStatusChange = async (id, currentStatus) => {
    try {
      const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
      await advertisementService.updateAdvertisement(id, { status: newStatus });
      fetchAdvertisements();
    } catch (err) {
      setError(err.message || 'Failed to update status');
    }
  };

  // Handle priority change
  const handlePriorityChange = async (id, value) => {
    try {
      await advertisementService.updateAdvertisement(id, { priority: value });
      fetchAdvertisements();
    } catch (err) {
      setError(err.message || 'Failed to update priority');
    }
  };

  // Handle delete
  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this advertisement?')) {
      try {
        await advertisementService.deleteAdvertisement(id);
        fetchAdvertisements();
      } catch (err) {
        setError(err.message || 'Failed to delete advertisement');
      }
    }
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-semibold mb-6">Ads List</h2>
      
      {error && (
        <div className="mb-4 p-4 bg-red-100 text-red-700 rounded-md">
          {error}
        </div>
      )}
      
      <div className="bg-white rounded-xl shadow-sm p-6 border">
        <div className="flex justify-end mb-4">
          <div className="relative">
            <input
              type="text"
              placeholder="Search ads..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-64 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
              <svg
                className="w-5 h-5 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M21 21l-4.35-4.35m1.35-5.65a7 7 0 11-14 0 7 7 0 0114 0z"
                ></path>
              </svg>
            </div>
          </div>
          <select 
            className="ml-4 bg-white px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">All Ads</option>
            <option value="active">Running</option>
            <option value="inactive">Paused</option>
            <option value="approved">Approved</option>
            <option value="expired">Expired</option>
          </select>
        </div>

        <div className="overflow-x-auto">
          {loading ? (
            <div className="text-center py-4">Loading...</div>
          ) : (
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Sl</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ads ID</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ads Title</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Store Info</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ads Type</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Duration</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Priority</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {advertisements.map((ad, index) => (
                  <tr key={ad._id}>
                    <td className="px-4 py-3">{(currentPage - 1) * 10 + index + 1}</td>
                    <td className="px-4 py-3">#{ad._id.slice(-6).toUpperCase()}</td>
                    <td className="px-4 py-3">{ad.title.en}</td>
                    <td className="px-4 py-3">{ad.store?.name || 'N/A'}</td>
                    <td className="px-4 py-3">{ad.type}</td>
                    <td className="px-4 py-3">
                      {format(new Date(ad.startDate), 'MMM dd, yyyy')} - {format(new Date(ad.endDate), 'MMM dd, yyyy')}
                    </td>
                    <td className="px-4 py-3">
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input 
                          type="checkbox" 
                          className="sr-only peer" 
                          checked={ad.status === 'active'} 
                          onChange={() => handleStatusChange(ad._id, ad.status)} 
                        />
                        <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                      </label>
                    </td>
                    <td className="px-4 py-3">
                      <input
                        type="number"
                        min="1"
                        max="10"
                        value={ad.priority}
                        onChange={(e) => handlePriorityChange(ad._id, e.target.value)}
                        className="w-20 px-2 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex space-x-2">
                        <button 
                          className="p-2 border border-blue-600 rounded text-blue-600 hover:text-blue-800"
                          onClick={() => window.location.href = `/food/promotion-management/newad?id=${ad._id}`}
                        >
                          <FaPencilAlt className="w-4 h-4" />
                        </button>
                        <button 
                          className="p-2 border border-red-600 rounded text-red-600 hover:text-red-800"
                          onClick={() => handleDelete(ad._id)}
                        >
                          <FaTrash className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center mt-4 space-x-2">
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="px-4 py-2 border rounded-md disabled:opacity-50"
            >
              Previous
            </button>
            <span className="px-4 py-2">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="px-4 py-2 border rounded-md disabled:opacity-50"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Page;

