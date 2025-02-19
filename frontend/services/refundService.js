import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

const refundService = {
    // Get all refunds with pagination and filters
    getRefunds: async (page = 1, limit = 10, filters = {}) => {
        try {
            // Use the orders endpoint with refund status filter
            const response = await axios.get(`${API_URL}/api/orders`, {
                params: {
                    page,
                    limit,
                    status: 'refund_requested,refund_approved,refund_rejected',
                    ...filters
                },
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`
                }
            });
            return {
                success: true,
                data: {
                    docs: response.data.data.docs.map(order => ({
                        _id: order._id,
                        order: {
                            _id: order._id,
                            customer: {
                                name: order.customer?.name || 'N/A'
                            },
                            createdAt: order.createdAt
                        },
                        amount: order.totalAmount,
                        reason: order.refundReason || 'Not specified',
                        status: order.status.replace('refund_', ''),
                        createdAt: order.updatedAt,
                        remarks: order.refundRemarks
                    })),
                    totalPages: response.data.data.totalPages
                }
            };
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    // Get refund details by order ID
    getRefundById: async (id) => {
        try {
            const response = await axios.get(`${API_URL}/api/orders/${id}`, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`
                }
            });
            
            const order = response.data.data;
            return {
                success: true,
                data: {
                    _id: order._id,
                    order: {
                        _id: order._id,
                        customer: {
                            name: order.customer?.name || 'N/A'
                        },
                        createdAt: order.createdAt,
                        items: order.items,
                        orderNumber: order.orderNumber
                    },
                    amount: order.totalAmount,
                    reason: order.refundReason || 'Not specified',
                    status: order.status.replace('refund_', ''),
                    createdAt: order.updatedAt,
                    remarks: order.refundRemarks
                }
            };
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    // Update refund status
    updateRefundStatus: async (id, status, remarks = '') => {
        try {
            const response = await axios.put(
                `${API_URL}/api/orders/${id}/status`,
                { 
                    status: `refund_${status}`,
                    refundRemarks: remarks 
                },
                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('token')}`
                    }
                }
            );
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    }
};

export default refundService; 