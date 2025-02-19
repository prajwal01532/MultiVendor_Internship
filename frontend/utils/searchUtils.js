export const filterOrdersByCustomer = (orders, searchTerm) => {
    // Handle null or undefined orders
    if (!orders || !Array.isArray(orders)) {
        console.warn('Invalid orders data provided to filterOrdersByCustomer');
        return [];
    }

    // Handle empty search term
    if (!searchTerm || !searchTerm.trim()) {
        return orders;
    }
    
    // Normalize search term: remove accents, convert to lowercase, and trim
    const searchNormalized = searchTerm.trim()
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '');

    // Split search term into words for more flexible matching
    const searchWords = searchNormalized.split(/\s+/);
    
    return orders.filter(order => {
        try {
            // Handle cases where customer might be null/undefined
            if (!order?.customer) return false;
            
            // Normalize customer name
            const customerNormalized = order.customer
                .toLowerCase()
                .normalize('NFD')
                .replace(/[\u0300-\u036f]/g, '');

            // Check if all search words are found in the customer name
            return searchWords.every(word => 
                // Check for exact match first
                customerNormalized.includes(word) ||
                // Then check for partial matches (minimum 3 characters)
                (word.length >= 3 && 
                 customerNormalized.split(/\s+/).some(namePart => 
                    namePart.startsWith(word) || 
                    namePart.endsWith(word) ||
                    (word.length >= 4 && namePart.includes(word))
                 ))
            );
        } catch (error) {
            console.error('Error filtering order:', order, error);
            return false;
        }
    });
}; 