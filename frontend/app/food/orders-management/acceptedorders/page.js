"use client"
import React, { useState } from 'react'
import { FaCheckCircle, FaPlay } from 'react-icons/fa'
import OrdersTable from '@/components/OrdersTable'

const AcceptedOrdersPage = () => {
  const [orders] = useState(
    Array(16).fill().map((_, i) => ({
      id: `ORD${String(i + 1).padStart(3, '0')}`,
      customer: ['John Doe', 'Jane Smith', 'Mike Johnson', 'Sarah Williams', 'Robert Brown'][i % 5],
      date: new Date(2024, 1, 20 - (i % 10)).toISOString().split('T')[0],
      amount: `₹${(Math.floor(Math.random() * 5000) + 500).toLocaleString()}`,
      status: 'Accepted'
    }))
  );

  const StartProcessingButton = ({ order }) => (
    <button 
      className="text-green-600 border p-2 rounded border-green-600 hover:bg-green-50"
      onClick={() => console.log('Start processing order:', order.id)}
    >
      <FaPlay />
    </button>
  );

  return (
    <OrdersTable
      title="Accepted Orders"
      description="View and manage accepted orders"
      orders={orders}
      icon="/icons/accepted.png"
      statusIcon={FaCheckCircle}
      showActions={true}
      ActionButton={StartProcessingButton}
    />
  );
};

export default AcceptedOrdersPage;
