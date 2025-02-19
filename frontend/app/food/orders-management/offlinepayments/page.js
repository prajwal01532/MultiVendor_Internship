"use client"
import React, { useState } from 'react'
import { FaMoneyBillWave } from 'react-icons/fa'
import OrdersTable from '@/components/OrdersTable'

const OfflinePaymentsPage = () => {
  const [orders] = useState(
    Array(10).fill().map((_, i) => ({
      id: `ORD${String(i + 1).padStart(3, '0')}`,
      customer: ['John Doe', 'Jane Smith', 'Mike Johnson', 'Sarah Williams', 'Robert Brown'][i % 5],
      date: new Date(2024, 1, 20 - (i % 10)).toISOString().split('T')[0],
      amount: `₹${(Math.floor(Math.random() * 5000) + 500).toLocaleString()}`,
      status: 'Offline Payment'
    }))
  );

  const VerifyButton = ({ order }) => (
    <button 
      className="text-green-600 border p-2 rounded border-green-600 hover:bg-green-50"
      onClick={() => console.log('Verify payment for order:', order.id)}
    >
      <FaMoneyBillWave />
    </button>
  );

  return (
    <OrdersTable
      title="Offline Payment Orders"
      description="View and manage orders with offline payments"
      orders={orders}
      icon="/icons/offline.png"
      statusIcon={FaMoneyBillWave}
      showActions={true}
      ActionButton={VerifyButton}
    />
  );
};

export default OfflinePaymentsPage;
