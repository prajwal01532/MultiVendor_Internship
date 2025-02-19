"use client"
import React, { useState } from 'react'
import { FaTimesCircle } from 'react-icons/fa'
import OrdersTable from '@/components/OrdersTable'

const CancelledOrdersPage = () => {
  const [orders] = useState(
    Array(12).fill().map((_, i) => ({
      id: `ORD${String(i + 1).padStart(3, '0')}`,
      customer: ['John Doe', 'Jane Smith', 'Mike Johnson', 'Sarah Williams', 'Robert Brown'][i % 5],
      date: new Date(2024, 1, 20 - (i % 10)).toISOString().split('T')[0],
      amount: `₹${(Math.floor(Math.random() * 5000) + 500).toLocaleString()}`,
      status: 'Cancelled'
    }))
  );

  return (
    <OrdersTable
      title="Cancelled Orders"
      description="View and manage cancelled orders"
      orders={orders}
      icon="/icons/cancelled.png"
      statusIcon={FaTimesCircle}
    />
  );
};

export default CancelledOrdersPage;
