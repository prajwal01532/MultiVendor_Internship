"use client"
import React, { useState } from 'react'
import { FaSpinner } from 'react-icons/fa'
import OrdersTable from '@/components/OrdersTable'

const ProcessingOrdersPage = () => {
  const [orders] = useState(
    Array(18).fill().map((_, i) => ({
      id: `ORD${String(i + 1).padStart(3, '0')}`,
      customer: ['John Doe', 'Jane Smith', 'Mike Johnson', 'Sarah Williams', 'Robert Brown'][i % 5],
      date: new Date(2024, 1, 20 - (i % 10)).toISOString().split('T')[0],
      amount: `₹${(Math.floor(Math.random() * 5000) + 500).toLocaleString()}`,
      status: 'Processing'
    }))
  );

  return (
    <OrdersTable
      title="Processing Orders"
      description="View and manage orders in processing"
      orders={orders}
      icon="/icons/processing.png"
      statusIcon={FaSpinner}
    />
  );
};

export default ProcessingOrdersPage;
