"use client"
import React, { useState, useEffect } from 'react';
import { FaCoins, FaPencilAlt, FaTrash } from 'react-icons/fa';
import { PromotionService } from '@/services/promotion.service';
import { toast } from 'react-hot-toast';

const renderIcon = (iconPath, className) => (
  <img 
    src={iconPath} 
    alt="cashback icon" 
    className={`w-7 h-8 ${className}`}
  />
);

const Page = () => {
  const [cashbackStatus, setCashbackStatus] = useState({});
  const [cashbacks, setCashbacks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    customerType: 'all',
    cashbackType: 'percentage',
    amount: 0,
    minimumPurchase: 0,
    maximumDiscount: 0,
    startDate: '',
    endDate: '',
    limitPerUser: 0
  });

  // Fetch cashbacks when component mounts
  useEffect(() => {
    fetchCashbacks();
  }, []);

  const fetchCashbacks = async () => {
    try {
      const response = await PromotionService.listCashbacks();
      setCashbacks(response.data || []);
      // Initialize status states
      const statusObj = {};
      response.data.forEach(cashback => {
        statusObj[cashback._id] = cashback.status;
      });
      setCashbackStatus(statusObj);
    } catch (error) {
      console.error('Error fetching cashbacks:', error);
      toast.error('Failed to fetch cashbacks');
    }
  };

  const handleStatusChange = async (id) => {
    try {
      await PromotionService.updateCashbackStatus(id, !cashbackStatus[id]);
      setCashbackStatus(prev => ({
        ...prev,
        [id]: !prev[id]
      }));
      toast.success('Cashback status updated successfully');
    } catch (error) {
      console.error('Error updating cashback status:', error);
      toast.error('Failed to update cashback status');
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const cashbackData = {
        title: formData.title,
        customerType: formData.customerType,
        cashbackType: formData.cashbackType,
        amount: parseFloat(formData.amount),
        minimumPurchase: parseFloat(formData.minimumPurchase),
        maximumDiscount: parseFloat(formData.maximumDiscount),
        startDate: formData.startDate,
        endDate: formData.endDate,
        limitPerUser: parseInt(formData.limitPerUser)
      };

      await PromotionService.createCashback(cashbackData);
      toast.success('Cashback created successfully');
      // Reset form
      setFormData({
        title: '',
        customerType: 'all',
        cashbackType: 'percentage',
        amount: 0,
        minimumPurchase: 0,
        maximumDiscount: 0,
        startDate: '',
        endDate: '',
        limitPerUser: 0
      });
      // Refresh cashbacks list
      fetchCashbacks();
    } catch (error) {
      console.error('Error creating cashback:', error);
      toast.error(error.message || 'Failed to create cashback');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <h2 className="text-xl font-semibold mb-6 flex items-center">
        {renderIcon("/icons/cashback.png", "mr-3")}
        Add New Cashback
      </h2>
      {/* Cashback Form Section */}
      <div className="bg-white rounded-xl shadow-sm p-6 border">
        <form className="space-y-6" onSubmit={handleSubmit}>
          <div className="grid grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
              <input 
                type="text"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Select Customer</label>
              <select 
                name="customerType"
                value={formData.customerType}
                onChange={handleInputChange}
                className="w-full bg-white px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="all">All Customers</option>
                <option value="new">New Customers</option>
                <option value="premium">Premium Customers</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Cashback Type</label>
              <select 
                name="cashbackType"
                value={formData.cashbackType}
                onChange={handleInputChange}
                className="w-full bg-white px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="percentage">Percentage</option>
                <option value="amount">Fixed Amount</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Cashback Amount (%)</label>
              <input 
                type="number"
                name="amount"
                value={formData.amount}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Minimum Purchase ($)</label>
              <input 
                type="number"
                name="minimumPurchase"
                value={formData.minimumPurchase}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Maximum Discount ($)</label>
              <input 
                type="number"
                name="maximumDiscount"
                value={formData.maximumDiscount}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
              <input 
                type="datetime-local"
                name="startDate"
                value={formData.startDate}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
              <input 
                type="datetime-local"
                name="endDate"
                value={formData.endDate}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Limit for Same User</label>
              <input 
                type="number"
                name="limitPerUser"
                value={formData.limitPerUser}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
          </div>

          <div className="flex justify-end space-x-4">
            <button 
              type="button"
              onClick={() => setFormData({
                title: '',
                customerType: 'all',
                cashbackType: 'percentage',
                amount: 0,
                minimumPurchase: 0,
                maximumDiscount: 0,
                startDate: '',
                endDate: '',
                limitPerUser: 0
              })}
              className="px-6 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
            >
              Reset
            </button>
            <button 
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-teal-800 text-white rounded-lg hover:bg-teal-700 disabled:opacity-50"
            >
              {loading ? 'Submitting...' : 'Submit'}
            </button>
          </div>
        </form>
      </div>

      {/* Cashback List Section */}
      <div className="bg-white rounded-xl shadow-sm p-6 border">
        <h2 className="text-xl font-semibold mb-6">Cashback List</h2>
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Title</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Start Date</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">End Date</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {cashbacks.map((cashback) => (
              <tr key={cashback._id}>
                <td className="px-4 py-3">{cashback.title.en}</td>
                <td className="px-4 py-3">{cashback.cashbackType}</td>
                <td className="px-4 py-3">{cashback.amount}{cashback.cashbackType === 'percentage' ? '%' : ''}</td>
                <td className="px-4 py-3">{new Date(cashback.startDate).toLocaleDateString()}</td>
                <td className="px-4 py-3">{new Date(cashback.endDate).toLocaleDateString()}</td>
                <td className="px-4 py-3">
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input 
                      type="checkbox" 
                      className="sr-only peer" 
                      checked={cashbackStatus[cashback._id]} 
                      onChange={() => handleStatusChange(cashback._id)}
                    />
                    <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </td>
                <td className="px-4 py-3">
                  <div className="flex space-x-2">
                    <button className="p-2 text-blue-600 hover:text-blue-800">
                      <FaPencilAlt />
                    </button>
                    <button 
                      className="p-2 text-red-600 hover:text-red-800"
                      onClick={() => handleDelete(cashback._id)}
                    >
                      <FaTrash />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Page;
