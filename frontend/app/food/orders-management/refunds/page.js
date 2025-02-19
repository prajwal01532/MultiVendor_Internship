"use client"
import React, { useState, useEffect } from 'react';
import { FaSearch, FaFilter, FaEye, FaCheck, FaTimes } from 'react-icons/fa';
import refundService from '@/services/refundService';
import toast from 'react-hot-toast';
import { format } from 'date-fns';

const RefundsPage = () => {
  const [refunds, setRefunds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedRefund, setSelectedRefund] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  // Fetch refunds
  const fetchRefunds = async () => {
    try {
      setLoading(true);
      const filters = {};
      if (statusFilter !== 'all') {
        filters.status = statusFilter;
      }
      if (searchTerm) {
        filters.search = searchTerm;
      }

      const response = await refundService.getRefunds(currentPage, 10, filters);
      setRefunds(response.data.docs || []);
      setTotalPages(response.data.totalPages || 1);
      setError(null);
    } catch (err) {
      setError(err.message || 'Failed to fetch refunds');
      toast.error('Failed to fetch refunds');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRefunds();
  }, [currentPage, statusFilter, searchTerm]);

  // Handle refund status update
  const handleStatusUpdate = async (id, newStatus) => {
    try {
      setLoading(true);
      await refundService.updateRefundStatus(id, newStatus);
      toast.success(`Refund ${newStatus.toLowerCase()} successfully`);
      fetchRefunds();
    } catch (err) {
      toast.error(err.message || `Failed to ${newStatus.toLowerCase()} refund`);
    } finally {
      setLoading(false);
    }
  };

  // Handle view details
  const handleViewDetails = async (id) => {
    try {
      const response = await refundService.getRefundById(id);
      setSelectedRefund(response.data);
      setShowDetailsModal(true);
    } catch (err) {
      toast.error('Failed to fetch refund details');
    }
  };

  return (
    <div className="p-6">
      {/* Header Section */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Refund Requests</h1>
        
        {/* Search and Filter */}
        <div className="flex gap-4">
          <div className="relative">
            <input
              type="text"
              placeholder="Search refunds..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <FaSearch className="absolute left-3 top-3 text-gray-400" />
          </div>
          <select
            className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-4 p-4 bg-red-100 text-red-700 rounded-lg">
          {error}
        </div>
      )}

      {/* Refunds Table */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Refund ID</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order ID</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Reason</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {loading ? (
              <tr>
                <td colSpan="8" className="text-center py-4">Loading...</td>
              </tr>
            ) : refunds.length === 0 ? (
              <tr>
                <td colSpan="8" className="text-center py-4">No refunds found</td>
              </tr>
            ) : (
              refunds.map((refund) => (
                <tr key={refund._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    #{refund._id.slice(-6).toUpperCase()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-blue-600 hover:text-blue-800">
                    #{refund.order?._id.slice(-6).toUpperCase()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {refund.order?.customer?.name || 'N/A'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    ₹{refund.amount.toFixed(2)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {format(new Date(refund.createdAt), 'MMM dd, yyyy')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {refund.reason}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full
                      ${refund.status === 'approved' ? 'bg-green-100 text-green-800' : 
                        refund.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 
                        'bg-red-100 text-red-800'}`}>
                      {refund.status.charAt(0).toUpperCase() + refund.status.slice(1)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-3">
                      <button
                        onClick={() => handleViewDetails(refund._id)}
                        className="text-blue-600 border border-blue-600 p-2 rounded hover:text-blue-900"
                        title="View Details"
                      >
                        <FaEye />
                      </button>
                      {refund.status === 'pending' && (
                        <>
                          <button
                            onClick={() => handleStatusUpdate(refund._id, 'approved')}
                            className="text-green-600 border border-green-600 p-2 rounded hover:text-green-900"
                            title="Approve"
                          >
                            <FaCheck />
                          </button>
                          <button
                            onClick={() => handleStatusUpdate(refund._id, 'rejected')}
                            className="text-red-600 border border-red-600 p-2 rounded hover:text-red-900"
                            title="Reject"
                          >
                            <FaTimes />
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center mt-6 space-x-2">
          <button
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            disabled={currentPage === 1 || loading}
            className="px-4 py-2 border rounded-md disabled:opacity-50"
          >
            Previous
          </button>
          <span className="px-4 py-2">
            Page {currentPage} of {totalPages}
          </span>
          <button
            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages || loading}
            className="px-4 py-2 border rounded-md disabled:opacity-50"
          >
            Next
          </button>
        </div>
      )}

      {/* Details Modal */}
      {showDetailsModal && selectedRefund && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full">
            <h2 className="text-xl font-bold mb-4">Refund Details</h2>
            <div className="space-y-4">
              <div>
                <h3 className="font-medium">Order Information</h3>
                <p>Order ID: #{selectedRefund.order?._id}</p>
                <p>Customer: {selectedRefund.order?.customer?.name}</p>
                <p>Order Date: {format(new Date(selectedRefund.order?.createdAt), 'MMM dd, yyyy')}</p>
              </div>
              <div>
                <h3 className="font-medium">Refund Information</h3>
                <p>Amount: ₹{selectedRefund.amount.toFixed(2)}</p>
                <p>Status: {selectedRefund.status}</p>
                <p>Reason: {selectedRefund.reason}</p>
                <p>Requested Date: {format(new Date(selectedRefund.createdAt), 'MMM dd, yyyy')}</p>
              </div>
              {selectedRefund.remarks && (
                <div>
                  <h3 className="font-medium">Remarks</h3>
                  <p>{selectedRefund.remarks}</p>
                </div>
              )}
            </div>
            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setShowDetailsModal(false)}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RefundsPage;
