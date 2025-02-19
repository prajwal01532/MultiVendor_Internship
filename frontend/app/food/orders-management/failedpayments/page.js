"use client"
import React, { useState } from 'react'
import { FaExclamationTriangle } from 'react-icons/fa'
import OrdersTable from '@/components/OrdersTable'

const FailedPaymentsPage = () => {
  const [orders] = useState(
    Array(8).fill().map((_, i) => ({
      id: `ORD${String(i + 1).padStart(3, '0')}`,
      customer: ['John Doe', 'Jane Smith', 'Mike Johnson', 'Sarah Williams', 'Robert Brown'][i % 5],
      date: new Date(2024, 1, 20 - (i % 10)).toISOString().split('T')[0],
      amount: `₹${(Math.floor(Math.random() * 5000) + 500).toLocaleString()}`,
      status: 'Payment Failed'
    }))
  );

  const RetryButton = ({ order }) => (
    <button 
      className="text-red-600 border p-2 rounded border-red-600 hover:bg-red-50"
      onClick={() => console.log('Retry payment for order:', order.id)}
    >
      <FaExclamationTriangle />
    </button>
  );

  return (
    <OrdersTable
      title="Failed Payment Orders"
      description="View and manage orders with failed payments"
      orders={orders}
      icon="/icons/failed.png"
      statusIcon={FaExclamationTriangle}
      showActions={true}
      ActionButton={RetryButton}
    />
  );
};

export default FailedPaymentsPage;
