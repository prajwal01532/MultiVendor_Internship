export const getOrderTypeConfig = (type) => {
    const configs = {
        all: {
            title: "All Orders",
            description: "View and manage all orders",
            icon: "/icons/order.png"
        },
        scheduled: {
            title: "Scheduled Orders",
            description: "View and manage scheduled orders",
            icon: "/icons/order.png"
        },
        pending: {
            title: "Pending Orders",
            description: "View and manage pending orders",
            icon: "/icons/pending.png"
        },
        accepted: {
            title: "Accepted Orders",
            description: "View and manage accepted orders",
            icon: "/icons/accepted.png"
        },
        processing: {
            title: "Processing Orders",
            description: "View and manage processing orders",
            icon: "/icons/processing.png"
        },
        completed: {
            title: "Completed Orders",
            description: "View and manage completed orders",
            icon: "/icons/completed.png"
        },
        cancelled: {
            title: "Cancelled Orders",
            description: "View and manage cancelled orders",
            icon: "/icons/cancelled.png"
        },
        ontheway: {
            title: "Orders On The Way",
            description: "View and manage orders that are out for delivery",
            icon: "/icons/delivery.png"
        },
        failedpayments: {
            title: "Failed Payment Orders",
            description: "View and manage orders with failed payments",
            icon: "/icons/failed.png"
        },
        offlinepayments: {
            title: "Offline Payment Orders",
            description: "View and manage orders with offline payments",
            icon: "/icons/offline.png"
        },
        refunds: {
            title: "Refund Orders",
            description: "View and manage refund requests",
            icon: "/icons/refund.png"
        }
    };

    return configs[type] || configs.all;
}; 