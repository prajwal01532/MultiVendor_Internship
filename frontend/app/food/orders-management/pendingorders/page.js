"use client"
import React, { useState, useMemo } from 'react'
import { FaSearch, FaFileExport, FaHourglassHalf, FaExclamationCircle } from 'react-icons/fa'
import Image from 'next/image'
import { filterOrdersByCustomer } from '@/utils/searchUtils'

const PendingOrdersPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [orders] = useState(
    Array(23).fill().map((_, i) => ({
      id: `ORD${String(i + 1).padStart(3, '0')}`,
      customer: ['John Doe', 'Jane Smith', 'Mike Johnson', 'Sarah Williams', 'Robert Brown'][i % 5],
      date: new Date(2024, 1, 20 - (i % 10)).toISOString().split('T')[0],
      amount: `₹${(Math.floor(Math.random() * 5000) + 500).toLocaleString()}`,
      status: 'Pending'
    }))
  );

  // Filter orders based on search term
  const filteredOrders = useMemo(() => {
    try {
      return filterOrdersByCustomer(orders, searchTerm);
    } catch (error) {
      console.error('Error filtering orders:', error);
      return [];
    }
  }, [orders, searchTerm]);

  const handleSearch = (e) => {
    setIsSearching(true);
    setSearchTerm(e.target.value);
    // Add a small delay to show loading state
    setTimeout(() => setIsSearching(false), 300);
  };

  // Empty state component
  const EmptyState = ({ isSearching }) => (
    <tr>
      <td colSpan="6" className="px-6 py-8 text-center">
        <div className="flex flex-col items-center justify-center space-y-2">
          <FaExclamationCircle className="text-gray-400 text-3xl mb-2" />
          <p className="text-gray-500 text-lg">
            {searchTerm
              ? `No orders found matching "${searchTerm}"`
              : 'No pending orders available'}
          </p>
        </div>
      </td>
    </tr>
  );

  return (
    <div className="p-2">
      {/* Header with Icon */}
      <div className="flex items-center mb-6">
        <div className="relative w-10 h-10 mr-3 rounded-full">
          <Image
            src="/icons/order.png"
            alt="Pending Orders"
            layout="fill"
            objectFit="contain"
          />
        </div>
        <div className="flex flex-col">
          <h1 className="text-2xl font-bold text-gray-800">Pending Orders</h1>
          <p className="text-sm text-gray-500">View and manage pending orders</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-lg overflow-hidden border">
        {/* Search and Export */}
        <div className="p-4 border-b flex justify-between items-center">
          <div className="relative flex-1 max-w-md">
            <input
              type="text"
              placeholder="Search by customer name..."
              className="pl-10 pr-4 py-2 border rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              value={searchTerm}
              onChange={handleSearch}
            />
            <FaSearch className="absolute left-3 top-3 text-gray-400" />
            {isSearching && (
              <div className="absolute right-3 top-3">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-teal-500"></div>
              </div>
            )}
          </div>
          <button className="flex items-center gap-2 px-4 py-2 text-teal-800 border border-teal-800 rounded-lg hover:bg-teal-50 ml-4">
            <FaFileExport />
            Export
          </button>
        </div>

        {/* Table with Scroll */}
        <div className="max-h-[600px] overflow-y-auto">
          <table className="w-full">
            <thead className="bg-gray-50 sticky top-0 z-10">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredOrders.length > 0 ? (
                filteredOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{order.id}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{order.customer}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{order.date}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{order.amount}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 py-1 text-xs rounded-full bg-yellow-100 text-yellow-800">
                        {order.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <button className="text-blue-600 border p-2 rounded border-blue-600 hover:text-blue-900">
                        <FaHourglassHalf />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <EmptyState isSearching={isSearching} />
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

export default PendingOrdersPage
