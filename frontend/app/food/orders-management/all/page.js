"use client"
import React, { useState } from 'react'
import { FaListAlt } from 'react-icons/fa'
import OrdersTable from '@/components/OrdersTable'

const AllOrdersPage = () => {
  const [orders] = useState(
    Array(25).fill().map((_, i) => ({
      id: `ORD${String(i + 1).padStart(3, '0')}`,
      customer: ['John Doe', 'Jane Smith', 'Mike Johnson', 'Sarah Williams', 'Robert Brown'][i % 5],
      date: new Date(2024, 1, 20 - (i % 10)).toISOString().split('T')[0],
      amount: `₹${(Math.floor(Math.random() * 5000) + 500).toLocaleString()}`,
      status: ['Pending', 'Processing', 'Completed', 'Cancelled', 'On The Way'][i % 5]
    }))
  );

  const getStatusIcon = (status) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return 'text-yellow-500';
      case 'processing':
        return 'text-blue-500 animate-spin';
      case 'completed':
        return 'text-green-500';
      case 'cancelled':
        return 'text-red-500';
      case 'on the way':
        return 'text-indigo-500';
      default:
        return 'text-gray-500';
    }
  };

  const ViewButton = ({ order }) => (
    <button 
      className="text-blue-600 border p-2 rounded border-blue-600 hover:bg-blue-50"
      onClick={() => console.log('View order details:', order.id)}
    >
      <FaListAlt />
    </button>
  );

  return (
    <OrdersTable
      title="All Orders"
      description="View and manage all orders"
      orders={orders}
      icon="/icons/order.png"
      statusIcon={FaListAlt}
      showActions={true}
      ActionButton={ViewButton}
      getStatusColor={getStatusIcon}
    />
  );
};

export default AllOrdersPage;
