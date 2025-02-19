import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

class PromotionServiceClass {
    // Coupons
    async createCoupon(couponData) {
        try {
            const config = {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            };

            // Transform the data to match backend expectations
            const transformedData = {
                code: couponData.code.toUpperCase(),
                title: couponData.title,
                description: couponData.title, // Using title as description if not provided
                type: couponData.type,
                store: couponData.type === 'store' ? couponData.store : undefined,
                startDate: new Date(couponData.startDate).toISOString(),
                endDate: new Date(couponData.endDate).toISOString(),
                discountType: couponData.discountType === 'amount' ? 'fixed' : 'percentage',
                discountValue: parseFloat(couponData.discount),
                minimumPurchase: parseFloat(couponData.minPurchase) || 0,
                maximumDiscount: parseFloat(couponData.maxDiscount) || undefined,
                usageLimit: {
                    perUser: parseInt(couponData.limitPerUser),
                    total: parseInt(couponData.limitPerUser) * 100 // Set total limit as 100x per user limit
                },
                status: 'active',
                zone: 'all'
            };

            // Remove undefined fields
            Object.keys(transformedData).forEach(key => {
                if (transformedData[key] === undefined) {
                    delete transformedData[key];
                }
            });

            const response = await axios.post(`${API_URL}/api/pharmacypromotions/coupons`, transformedData, config);
            
            if (response.data && response.data.success) {
                return {
                    success: true,
                    data: response.data.data,
                    message: 'Coupon created successfully'
                };
            }
            
            throw new Error(response.data?.message || 'Failed to create coupon');
        } catch (error) {
            console.error('Create coupon error:', error.response?.data || error);
            throw error.response?.data || { 
                success: false,
                message: error.message || 'Failed to create coupon'
            };
        }
    }

    async listCoupons() {
        try {
            const config = {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            };
            
            const response = await axios.get(`${API_URL}/api/pharmacypromotions/coupons`, config);
            
            if (response.data && response.data.success) {
                const coupons = response.data.data?.docs || response.data.data || [];
                return {
                    success: true,
                    data: coupons.map(coupon => ({
                        ...coupon,
                        startDate: new Date(coupon.startDate).toLocaleDateString(),
                        endDate: new Date(coupon.endDate).toLocaleDateString(),
                        discountDisplay: `${coupon.discountValue}${coupon.discountType === 'percentage' ? '%' : ' Rs'}`,
                        storeDisplay: coupon.store?.name || 'All Stores'
                    }))
                };
            }
            
            throw new Error('Failed to fetch coupons');
        } catch (error) {
            console.error('List coupons error:', error);
            return {
                success: false,
                message: error.response?.data?.message || 'Failed to fetch coupons',
                data: []
            };
        }
    }

    async updateCouponStatus(couponId, status) {
        try {
            const config = {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            };
            const response = await axios.patch(`${API_URL}/api/pharmacypromotions/coupons/${couponId}/status`, { status }, config);
            
            if (response.data && response.data.success) {
                return {
                    success: true,
                    message: response.data.message || 'Coupon status updated successfully',
                    data: response.data.data
                };
            }
            
            throw new Error(response.data?.message || 'Failed to update coupon status');
        } catch (error) {
            console.error('Update coupon status error:', error.response?.data || error);
            throw error.response?.data || { 
                success: false,
                message: error.message || 'Failed to update coupon status'
            };
        }
    }

    async deleteCoupon(couponId) {
        try {
            const config = {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            };
            const response = await axios.delete(`${API_URL}/api/pharmacypromotions/coupons/${couponId}`, config);
            
            if (response.data && response.data.success) {
                return {
                    success: true,
                    message: response.data.message || 'Coupon deleted successfully'
                };
            }
            
            throw new Error(response.data?.message || 'Failed to delete coupon');
        } catch (error) {
            console.error('Delete coupon error:', error.response?.data || error);
            throw error.response?.data || { 
                success: false,
                message: error.message || 'Failed to delete coupon'
            };
        }
    }

    // Cashback
    async createCashback(cashbackData) {
        try {
            const config = {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            };
            
            const response = await axios.post(`${API_URL}/api/pharmacy/cashback`, {
                ...cashbackData,
                title: cashbackData.title // Simplified title
            }, config);
            return response.data;
        } catch (error) {
            throw error.response?.data || { message: 'Failed to create cashback' };
        }
    }

    async listCashbacks() {
        try {
            const response = await axios.get(`${API_URL}/api/pharmacy/cashbacks`, {
                withCredentials: true
            });
            return response.data;
        } catch (error) {
            throw error.response?.data || { message: 'Failed to fetch cashbacks' };
        }
    }

    async updateCashbackStatus(cashbackId, status) {
        try {
            const response = await axios.patch(`${API_URL}/api/pharmacy/cashback/${cashbackId}/status`, { status }, {
                withCredentials: true
            });
            return response.data;
        } catch (error) {
            throw error.response?.data || { message: 'Failed to update cashback status' };
        }
    }

    async updateCashback(cashbackId, cashbackData) {
        try {
            const response = await axios.put(`${API_URL}/api/pharmacy/cashback/${cashbackId}`, {
                ...cashbackData,
                title: {
                    en: cashbackData.title,
                    ar: cashbackData.title // You might want to handle Arabic title separately
                }
            }, {
                withCredentials: true
            });
            return response.data;
        } catch (error) {
            throw error.response?.data || { message: 'Failed to update cashback' };
        }
    }

    async validateCoupon(couponData) {
        try {
            const response = await axios.post(`${API_URL}/api/pharmacypromotion/coupons/validate`, couponData, {
                withCredentials: true
            });
            return response.data;
        } catch (error) {
            throw error.response?.data || { message: 'Failed to validate coupon' };
        }
    }
}

export const PromotionService = new PromotionServiceClass(); 