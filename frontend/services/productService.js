import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

// Create axios instance with auth header
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Accept': 'application/json'
  }
});

// Add auth token to requests
api.interceptors.request.use(
  (config) => {
    // Only add token in browser environment
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('token');
      if (token) {
        config.headers['x-auth-token'] = token;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export const fetchStores = async () => {
  try {
    const response = await api.get('/foodstores', {
      params: {
        status: 'active',
        sortField: 'name',
        sortOrder: 'asc'
      }
    });
    
    return {
      success: true,
      data: response.data?.data || { docs: [] }
    };
  } catch (error) {
    console.error('Error fetching stores:', error);
    throw {
      success: false,
      message: error.response?.data?.message || 'Failed to fetch stores',
      error
    };
  }
};

export const fetchCategories = async () => {
  try {
    console.log('Making API request to fetch categories...');
    const response = await api.get('/foodproducts/categories');
    console.log('Raw API response:', response);
    
    // Handle paginated response
    const categoriesData = response.data?.data?.docs || [];
    console.log('Processed categories data:', categoriesData);
    
    return {
      success: true,
      data: Array.isArray(categoriesData) ? categoriesData : []
    };
  } catch (error) {
    console.error('Error fetching categories:', error);
    throw {
      success: false,
      message: error.response?.data?.message || 'Failed to fetch categories',
      error
    };
  }
};

export const createCategory = async (categoryData) => {
  try {
    console.log('Creating category with data:', categoryData);
    
    // Create FormData instance
    const formData = new FormData();
    
    // Append name with the correct structure
    formData.append('name[en]', categoryData.name);
    formData.append('priority', categoryData.priority || 1);

    // Append image if it exists
    if (categoryData.image) {
      formData.append('image', categoryData.image);
    }

    // Log FormData entries for debugging
    for (let pair of formData.entries()) {
      console.log('FormData entry:', pair[0], pair[1]);
    }

    // Make the API call
    const response = await api.post('/foodproducts/categories', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
        'Accept': 'application/json'
      }
    });

    console.log('Create category API response:', response);

    if (response.data.success) {
      return {
        success: true,
        data: response.data.data,
        message: response.data.message || 'Category created successfully'
      };
    } else {
      throw new Error(response.data.message || 'Failed to create category');
    }
  } catch (error) {
    console.error('Error creating category:', error);
    
    // Log detailed error information
    if (error.response?.data?.errors) {
      console.error('Validation errors:', error.response.data.errors);
    }
    
    // Throw a more detailed error
    throw {
      success: false,
      message: error.response?.data?.message || error.message || 'Failed to create category',
      error: error.response?.data || error.message,
      status: error.response?.status,
      details: error.response?.data?.errors || []
    };
  }
};

export const fetchSubCategories = async (categoryId = null) => {
  try {
    console.log('Fetching sub-categories for category:', categoryId);
    const url = categoryId 
      ? `/foodproducts/subcategories?category=${categoryId}` 
      : '/foodproducts/subcategories';
    
    const response = await api.get(url);
    console.log('Sub-categories API response:', response.data);

    if (response.data.success) {
      return {
        success: true,
        data: {
          data: response.data.data.docs || []
        }
      };
    } else {
      throw new Error(response.data.message || 'Failed to fetch sub-categories');
    }
  } catch (error) {
    console.error('Error fetching subcategories:', error);
    throw {
      success: false,
      message: error.response?.data?.message || 'Failed to fetch sub-categories',
      error
    };
  }
};

export const createSubCategory = async (subCategoryData) => {
  try {
    console.log('Creating sub-category with data:', subCategoryData);
    
    // Create the request data with proper structure
    const requestData = {
      name: {
        en: subCategoryData.name
      },
      category: subCategoryData.category,
      priority: subCategoryData.priority || 1,
      status: 'active'
    };

    console.log('Sending request data:', requestData);

    const response = await api.post('/foodproducts/subcategories', requestData);

    if (response.data.success) {
      return {
        success: true,
        data: response.data.data
      };
    } else {
      throw new Error(response.data.message || 'Failed to create sub-category');
    }
  } catch (error) {
    console.error('Error creating sub-category:', error);
    throw {
      success: false,
      message: error.response?.data?.message || error.message || 'Failed to create sub-category',
      error
    };
  }
};

export const fetchUnits = async () => {
  try {
    const response = await api.get('/foodproducts/units');
    const units = response.data?.data || [];
    return Array.isArray(units) ? units : [];
  } catch (error) {
    console.error('Error fetching units:', error);
    throw error;
  }
};

export const createProduct = async (productData) => {
  try {
    const formData = new FormData();
    
    // Validate required fields
    if (!productData.name || !productData.description || !productData.store || !productData.category) {
      throw new Error('Missing required fields');
    }

    // Validate files
    if (!productData.image || !productData.thumbnail) {
      throw new Error('Product image and thumbnail are required');
    }

    // Basic product info
    formData.append('name[en]', productData.name);
    formData.append('description[en]', productData.description);
    
    // Store and category
    formData.append('store', productData.store);
    formData.append('category', productData.category);
    
    // Price and stock (with validation)
    const price = parseFloat(productData.price);
    const stock = parseInt(productData.stock);
    if (isNaN(price) || price < 0) throw new Error('Invalid price value');
    if (isNaN(stock) || stock < 0) throw new Error('Invalid stock value');
    formData.append('price', price);
    formData.append('stock', stock);

    // Optional fields
    if (productData.unit) {
      formData.append('unit', productData.unit);
    }
    if (productData.subCategory) {
      formData.append('subCategory', productData.subCategory);
    }

    // Nutrition info
    if (productData.nutrition) {
      const nutritionInfo = {
        calories: parseFloat(productData.nutrition) || 0
      };
      formData.append('nutritionInfo', JSON.stringify(nutritionInfo));
    }

    // Allergens
    if (productData.allergen) {
      formData.append('allergens', JSON.stringify([productData.allergen]));
    }

    // Max purchase quantity
    if (productData.maxQuantity) {
      const maxQty = parseInt(productData.maxQuantity);
      if (!isNaN(maxQty) && maxQty > 0) {
        formData.append('maxPurchaseQuantity', maxQty);
      }
    }

    // Boolean flags
    formData.append('isOrganic', Boolean(productData.isOrganic).toString());
    formData.append('isHalal', Boolean(productData.isHalal).toString());

    // Discount
    if (productData.discountType && productData.discountPercent) {
      const discountValue = parseFloat(productData.discountPercent);
      if (!isNaN(discountValue) && discountValue >= 0) {
        // Ensure discount type matches backend enum values
        const discountType = productData.discountType === 'percent' ? 'percentage' : productData.discountType;
        formData.append('discount[type]', discountType);
        formData.append('discount[value]', discountValue);
      }
    }

    // Attributes
    if (productData.attribute) {
      const attributes = [{
        name: productData.attribute,
        value: productData.attribute
      }];
      formData.append('attributes', JSON.stringify(attributes));
    }

    // Tags
    if (productData.tags) {
      const tags = productData.tags
        .split(',')
        .map(tag => tag.trim())
        .filter(tag => tag.length > 0);
      if (tags.length > 0) {
        formData.append('tags', JSON.stringify(tags));
      }
    }

    // Images
    formData.append('images', productData.image);
    formData.append('thumbnail', productData.thumbnail);

    // Debug log
    console.log('Sending product data:');
    for (let [key, value] of formData.entries()) {
      console.log(`${key}:`, value instanceof File ? value.name : value);
    }

    const response = await api.post('/foodproducts', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });

    if (!response.data) {
      throw new Error('No response data received');
    }

    if (response.data.success) {
      return {
        success: true,
        data: response.data.data,
        message: response.data.message || 'Product created successfully'
      };
    } else {
      throw new Error(response.data.message || 'Failed to create product');
    }
  } catch (error) {
    console.error('Error creating product:', error);
    if (error.response?.data) {
      console.error('Server error details:', error.response.data);
    }
    throw {
      success: false,
      message: error.message || 'Failed to create product',
      error: error.response?.data || error.message
    };
  }
};

export const updateCategory = async (id, categoryData) => {
  try {
    console.log('Updating category with data:', categoryData);
    
    // Create FormData instance
    const formData = new FormData();
    
    // Append name with the correct structure if provided
    if (categoryData.name) {
      formData.append('name[en]', categoryData.name);
    }
    
    // Append other fields if provided
    if (categoryData.priority !== undefined) {
      formData.append('priority', categoryData.priority);
    }
    if (categoryData.status) {
      formData.append('status', categoryData.status);
    }

    // Append image if it exists
    if (categoryData.image) {
      formData.append('image', categoryData.image);
    }

    const response = await api.put(`/foodproducts/categories/${id}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });

    if (response.data.success) {
      return {
        success: true,
        data: response.data.data,
        message: response.data.message || 'Category updated successfully'
      };
    } else {
      throw new Error(response.data.message || 'Failed to update category');
    }
  } catch (error) {
    console.error('Error updating category:', error);
    throw {
      success: false,
      message: error.response?.data?.message || error.message || 'Failed to update category',
      error: error.response?.data || error.message
    };
  }
};

export const deleteCategory = async (id) => {
  try {
    const response = await api.delete(`/foodproducts/categories/${id}`);

    if (response.data.success) {
      return {
        success: true,
        message: response.data.message || 'Category deleted successfully'
      };
    } else {
      throw new Error(response.data.message || 'Failed to delete category');
    }
  } catch (error) {
    console.error('Error deleting category:', error);
    throw {
      success: false,
      message: error.response?.data?.message || error.message || 'Failed to delete category',
      error: error.response?.data || error.message
    };
  }
};

export const updateSubCategory = async (id, subCategoryData) => {
  try {
    console.log('Updating sub-category with data:', subCategoryData);
    
    // Create request data
    const requestData = {};
    
    // Add fields only if they are provided
    if (subCategoryData.name) {
      requestData.name = {
        en: subCategoryData.name
      };
    }
    if (subCategoryData.category) {
      requestData.category = subCategoryData.category;
    }
    if (subCategoryData.priority !== undefined) {
      requestData.priority = subCategoryData.priority;
    }
    if (subCategoryData.status) {
      requestData.status = subCategoryData.status;
    }

    const response = await api.put(`/foodproducts/subcategories/${id}`, requestData, {
      headers: {
        'Content-Type': 'application/json'
      }
    });

    if (response.data.success) {
      return {
        success: true,
        data: response.data.data,
        message: response.data.message || 'Sub-category updated successfully'
      };
    } else {
      throw new Error(response.data.message || 'Failed to update sub-category');
    }
  } catch (error) {
    console.error('Error updating sub-category:', error);
    throw {
      success: false,
      message: error.response?.data?.message || error.message || 'Failed to update sub-category',
      error: error.response?.data || error.message
    };
  }
};

export const deleteSubCategory = async (id) => {
  try {
    const response = await api.delete(`/foodproducts/subcategories/${id}`);

    if (response.data.success) {
      return {
        success: true,
        message: response.data.message || 'Sub-category deleted successfully'
      };
    } else {
      throw new Error(response.data.message || 'Failed to delete sub-category');
    }
  } catch (error) {
    console.error('Error deleting sub-category:', error);
    throw {
      success: false,
      message: error.response?.data?.message || error.message || 'Failed to delete sub-category',
      error: error.response?.data || error.message
    };
  }
};

export const fetchProducts = async (filters = {}) => {
  try {
    const queryParams = new URLSearchParams();
    
    // Add filters to query params
    Object.entries(filters).forEach(([key, value]) => {
      if (value) queryParams.append(key, value);
    });

    const response = await api.get(`/foodproducts?${queryParams.toString()}`);
    
    if (response.data) {
      return {
        success: true,
        data: response.data.data || { docs: [] },
        message: 'Products fetched successfully'
      };
    } else {
      throw new Error('No response data received');
    }
  } catch (error) {
    console.error('Error fetching products:', error);
    throw {
      success: false,
      message: error.response?.data?.message || 'Failed to fetch products',
      error: error.response?.data || error.message
    };
  }
};

export const deleteProduct = async (id) => {
  try {
    const response = await api.delete(`/foodproducts/${id}`);

    if (response.data.success) {
      return {
        success: true,
        message: response.data.message || 'Product deleted successfully'
      };
    } else {
      throw new Error(response.data.message || 'Failed to delete product');
    }
  } catch (error) {
    console.error('Error deleting product:', error);
    throw {
      success: false,
      message: error.response?.data?.message || error.message || 'Failed to delete product',
      error: error.response?.data || error.message
    };
  }
};

export const updateProduct = async (id, productData) => {
  try {
    const formData = new FormData();
    
    // Basic product info
    if (productData.name) {
      formData.append('name[en]', productData.name);
    }
    if (productData.description) {
      formData.append('description[en]', productData.description);
    }
    
    // Store and category
    if (productData.store) formData.append('store', productData.store);
    if (productData.category) formData.append('category', productData.category);
    if (productData.subCategory) formData.append('subCategory', productData.subCategory);
    if (productData.unit) formData.append('unit', productData.unit);
    
    // Price and stock
    if (productData.price !== undefined) formData.append('price', productData.price);
    if (productData.stock !== undefined) formData.append('stock', productData.stock);

    // Nutrition info
    if (productData.nutrition) {
      const nutritionInfo = {
        calories: parseFloat(productData.nutrition) || 0
      };
      formData.append('nutritionInfo', JSON.stringify(nutritionInfo));
    }

    // Allergens
    if (productData.allergen) {
      formData.append('allergens', JSON.stringify([productData.allergen]));
    }

    // Max purchase quantity
    if (productData.maxQuantity) {
      formData.append('maxPurchaseQuantity', productData.maxQuantity);
    }

    // Boolean flags
    if (productData.isOrganic !== undefined) {
      formData.append('isOrganic', productData.isOrganic.toString());
    }
    if (productData.isHalal !== undefined) {
      formData.append('isHalal', productData.isHalal.toString());
    }

    // Discount
    if (productData.discountType && productData.discountPercent) {
      const discountType = productData.discountType === 'percent' ? 'percentage' : productData.discountType;
      formData.append('discount[type]', discountType);
      formData.append('discount[value]', productData.discountPercent);
    }

    // Attributes
    if (productData.attribute) {
      const attributes = [{
        name: productData.attribute,
        value: productData.attribute
      }];
      formData.append('attributes', JSON.stringify(attributes));
    }

    // Tags
    if (productData.tags) {
      const tags = Array.isArray(productData.tags) 
        ? productData.tags 
        : productData.tags.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0);
      if (tags.length > 0) {
        formData.append('tags', JSON.stringify(tags));
      }
    }

    // Images - only append if new files are provided
    if (productData.image) {
      formData.append('images', productData.image);
    }
    if (productData.thumbnail) {
      formData.append('thumbnail', productData.thumbnail);
    }

    // Status
    if (productData.status) {
      formData.append('status', productData.status);
    }

    const response = await api.put(`/foodproducts/${id}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });

    if (response.data.success) {
      return {
        success: true,
        data: response.data.data,
        message: response.data.message || 'Product updated successfully'
      };
    } else {
      throw new Error(response.data.message || 'Failed to update product');
    }
  } catch (error) {
    console.error('Error updating product:', error);
    throw {
      success: false,
      message: error.response?.data?.message || error.message || 'Failed to update product',
      error: error.response?.data || error.message
    };
  }
};

export const fetchProductById = async (id) => {
  try {
    const response = await api.get(`/foodproducts/${id}`);
    
    if (response.data) {
      return {
        success: true,
        data: response.data.data,
        message: 'Product fetched successfully'
      };
    } else {
      throw new Error('No response data received');
    }
  } catch (error) {
    console.error('Error fetching product:', error);
    throw {
      success: false,
      message: error.response?.data?.message || 'Failed to fetch product',
      error: error.response?.data || error.message
    };
  }
}; 