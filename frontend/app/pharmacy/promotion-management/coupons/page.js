"use client"
import React, { useState, useEffect } from 'react';
import { FaTicketAlt, FaPencilAlt, FaTrash } from 'react-icons/fa';
import { PromotionService } from '@/services/pharmacyPromotion.service';
import { storeService } from '@/services/pharmacyStore.service';
import { toast } from 'react-hot-toast';

const renderIcon = (iconPath, className) => (
  <img
    src={iconPath}
    alt="coupon icon"
    className={`w-7 h-8 ${className}`}
  />
);

const Page = () => {
  const [couponStatus, setCouponStatus] = useState({});
  const [coupons, setCoupons] = useState([]);
  const [stores, setStores] = useState([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    type: '',
    store: '',
    customerType: 'all',
    code: '',
    limitPerUser: 0,
    startDate: '',
    endDate: '',
    discountType: 'amount',
    discount: 0,
    maxDiscount: 0,
    minPurchase: 0,
    zone: 'all'
  });

  // Fetch coupons and stores on component mount
  useEffect(() => {
    fetchCoupons();
    fetchStores();
  }, []);

  const fetchStores = async () => {
    try {
      const response = await storeService.listStores();
      if (response.success) {
        setStores(response.data.docs || []);
      }
    } catch (error) {
      toast.error('Failed to fetch stores');
      console.error('Error fetching stores:', error);
    }
  };

  const fetchCoupons = async () => {
    try {
      setLoading(true);
      const response = await PromotionService.listCoupons();
      
      if (response.success) {
        const couponList = Array.isArray(response.data) ? response.data : [];
        setCoupons(couponList);
        
        // Initialize status states
        const statusObj = {};
        couponList.forEach(coupon => {
          statusObj[coupon._id] = coupon.status === 'active';
        });
        setCouponStatus(statusObj);
      } else {
        toast.error(response.message || 'Failed to fetch coupons');
        setCoupons([]);
        setCouponStatus({});
      }
    } catch (error) {
      console.error('Error fetching coupons:', error);
      toast.error('Failed to fetch coupons');
      setCoupons([]);
      setCouponStatus({});
    } finally {
      setLoading(false);
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
      // Validate required fields
      const requiredFields = {
        title: 'Title',
        code: 'Code',
        type: 'Coupon Type',
        startDate: 'Start Date',
        endDate: 'End Date',
        discountType: 'Discount Type',
        discount: 'Discount Value',
        limitPerUser: 'Usage Limit Per User',
        zone: 'Zone'
      };

      const missingFields = Object.entries(requiredFields)
        .filter(([key]) => !formData[key])
        .map(([_, label]) => label);

      if (missingFields.length > 0) {
        throw new Error(`Please fill in the following required fields: ${missingFields.join(', ')}`);
      }

      // Validate store for store-type coupons
      if (formData.type === 'store' && !formData.store) {
        throw new Error('Please select a store for store-specific coupon');
      }

      // Validate dates
      const startDate = new Date(formData.startDate);
      const endDate = new Date(formData.endDate);
      const now = new Date();

      if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
        throw new Error('Please enter valid dates');
      }

      // Reset time components to compare just the dates
      startDate.setHours(0, 0, 0, 0);
      const compareDate = new Date(now);
      compareDate.setHours(0, 0, 0, 0);

      if (startDate < compareDate) {
        throw new Error('Start date must be today or a future date');
      }

      if (endDate <= startDate) {
        throw new Error('End date must be after start date');
      }

      // Validate numeric fields
      const numericFields = {
        discount: { min: 0, label: 'Discount' },
        minPurchase: { min: 0, label: 'Minimum Purchase' },
        maxDiscount: { min: 0, label: 'Maximum Discount' },
        limitPerUser: { min: 1, label: 'Usage Limit Per User' }
      };

      Object.entries(numericFields).forEach(([field, { min, label }]) => {
        const value = parseFloat(formData[field]);
        if (isNaN(value) || value < min) {
          throw new Error(`${label} must be ${min === 0 ? 'non-negative' : 'at least ' + min}`);
        }
      });

      // Additional validation for percentage discount
      if (formData.discountType === 'percentage' && parseFloat(formData.discount) > 100) {
        throw new Error('Percentage discount cannot be greater than 100%');
      }

      // Create coupon
      const response = await PromotionService.createCoupon(formData);
      
      if (response.success) {
        toast.success(response.message || 'Coupon created successfully');
        
        // Reset form
        setFormData({
          title: '',
          type: '',
          store: '',
          customerType: 'all',
          code: '',
          limitPerUser: 0,
          startDate: '',
          endDate: '',
          discountType: 'amount',
          discount: 0,
          maxDiscount: 0,
          minPurchase: 0,
          zone: 'all'
        });
        
        // Refresh coupons list
        await fetchCoupons();
      } else {
        // Handle validation errors
        if (response.errors && Array.isArray(response.errors)) {
          const errorMessages = response.errors.map(err => err.msg).join(', ');
          throw new Error(errorMessages || response.message);
        } else {
          throw new Error(response.message || 'Failed to create coupon');
        }
      }
    } catch (error) {
      console.error('Error creating coupon:', error);
      toast.error(error.message || 'Failed to create coupon');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (id, currentStatus) => {
    try {
      setLoading(true);
      const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
      const response = await PromotionService.updateCouponStatus(id, newStatus);
      
      if (response.success) {
        toast.success('Coupon status updated successfully');
        await fetchCoupons(); // Refresh the list
      } else {
        throw new Error(response.message || 'Failed to update coupon status');
      }
    } catch (error) {
      toast.error(error.message || 'Failed to update coupon status');
      console.error('Status update error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this coupon?')) {
      try {
        setLoading(true);
        const response = await PromotionService.deleteCoupon(id);
        
        if (response.success) {
          toast.success('Coupon deleted successfully');
          await fetchCoupons(); // Refresh the list
        } else {
          throw new Error(response.message || 'Failed to delete coupon');
        }
      } catch (error) {
        toast.error(error.message || 'Failed to delete coupon');
        console.error('Delete error:', error);
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div className="p-6 space-y-6">
      <h2 className="text-xl font-semibold mb-6 flex items-center">
        {renderIcon("/icons/coupon.png", "mr-3")}
        Add New Coupon
      </h2>
      {/* Add New Coupon Section */}
      <div className="bg-white rounded-xl shadow-sm p-6 border">
        <form className="space-y-6" onSubmit={handleSubmit}>
          {/* Title - Full Width */}
          <div className="w-full">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Title
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter title"
              required
            />
          </div>

          {/* Other Fields - 4 Columns */}
          <div className="grid grid-cols-4 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Coupon Type
              </label>
              <select 
                name="type"
                value={formData.type}
                onChange={handleInputChange}
                className="w-full bg-white px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="">Select Type</option>
                <option value="general">General</option>
                <option value="first_order">First Order</option>
                <option value="store">Store Specific</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Store
              </label>
              <select
                name="store"
                value={formData.store}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required={formData.type === 'store'}
                disabled={formData.type !== 'store'}
              >
                <option value="">Select Store</option>
                {stores.map((store) => (
                  <option key={store._id} value={store._id}>
                    {store.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Select Customer
              </label>
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
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Code
              </label>
              <input 
                type="text"
                name="code"
                value={formData.code}
                onChange={handleInputChange}
                className="w-full bg-white px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter code"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-4 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Limit For Same User</label>
              <input 
                type="number"
                name="limitPerUser"
                value={formData.limitPerUser}
                onChange={handleInputChange}
                min="1"
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
              <label className="block text-sm font-medium text-gray-700 mb-1">Expiry Date</label>
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
              <label className="block text-sm font-medium text-gray-700 mb-1">Discount Type</label>
              <select 
                name="discountType"
                value={formData.discountType}
                onChange={handleInputChange}
                className="w-full bg-white px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="fixed">Fixed Amount</option>
                <option value="percentage">Percentage</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Discount</label>
              <input 
                type="number"
                name="discount"
                value={formData.discount}
                onChange={handleInputChange}
                min="0"
                step="0.01"
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Max Discount</label>
              <input 
                type="number"
                name="maxDiscount"
                value={formData.maxDiscount}
                onChange={handleInputChange}
                min="0"
                step="0.01"
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Min Purchase</label>
              <input 
                type="number"
                name="minPurchase"
                value={formData.minPurchase}
                onChange={handleInputChange}
                min="0"
                step="0.01"
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
          </div>

          <div className="flex justify-end space-x-4 mt-6">
            <button 
              type="button"
              onClick={() => setFormData({
                title: '',
                type: '',
                store: '',
                customerType: 'all',
                code: '',
                limitPerUser: 0,
                startDate: '',
                endDate: '',
                discountType: 'amount',
                discount: 0,
                maxDiscount: 0,
                minPurchase: 0,
                zone: 'all'
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

      {/* Coupon List Section */}
      <div className="bg-white rounded-xl shadow-sm p-6 border">
        <h2 className="text-xl font-semibold mb-6">Coupon List</h2>
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Title</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Code</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Store</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Discount</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Start Date</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Expiry Date</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {!coupons || coupons.length === 0 ? (
              <tr>
                <td colSpan="9" className="px-4 py-3 text-center text-gray-500">
                  No coupons found
                </td>
              </tr>
            ) : (
              coupons.map((coupon) => (
                <tr key={coupon._id}>
                  <td className="px-4 py-3">{coupon.title}</td>
                  <td className="px-4 py-3">{coupon.code}</td>
                  <td className="px-4 py-3 capitalize">{coupon.type}</td>
                  <td className="px-4 py-3">{coupon.storeDisplay}</td>
                  <td className="px-4 py-3">{coupon.discountDisplay}</td>
                  <td className="px-4 py-3">{coupon.startDate}</td>
                  <td className="px-4 py-3">{coupon.endDate}</td>
                  <td className="px-4 py-3">
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input 
                        type="checkbox" 
                        className="sr-only peer" 
                        checked={coupon.status === 'active'} 
                        onChange={() => handleStatusChange(coupon._id, coupon.status)}
                        disabled={loading}
                      />
                      <div className={`w-11 h-6 bg-gray-200 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all ${coupon.status === 'active' ? 'peer-checked:bg-blue-600' : ''} ${loading ? 'opacity-50' : ''}`}></div>
                    </label>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex space-x-2">
                      <button 
                        className="p-2 text-red-600 hover:text-red-800 disabled:opacity-50"
                        onClick={() => handleDelete(coupon._id)}
                        disabled={loading}
                      >
                        <FaTrash />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Page;
