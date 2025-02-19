"use client"
import React, { useState, useEffect } from 'react';
import { FaUpload, FaStore, FaMoneyBillWave, FaListUl, FaTags, FaTimes } from 'react-icons/fa';
import { fetchStores, fetchCategories, fetchSubCategories, createProduct, fetchUnits, fetchProductById, updateProduct } from '@/services/groceryProductService';
import Image from 'next/image';
import { toast, Toaster } from 'react-hot-toast';
import { useSearchParams } from 'next/navigation';
import { useRouter } from 'next/navigation';

const renderIcon = (iconPath, className) => (
  <img 
    src={iconPath} 
    alt="item icon" 
    className={`w-7 h-8 ${className}`}
  />
);

const Page = () => {
  const [stores, setStores] = useState([]);
  const [categories, setCategories] = useState([]);
  const [subCategories, setSubCategories] = useState([]);
  const [units, setUnits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [imagePreview1, setImagePreview1] = useState(null);
  const [imagePreview2, setImagePreview2] = useState(null);
  const [submitStatus, setSubmitStatus] = useState({ show: false, message: '', isError: false });
  const searchParams = useSearchParams();
  const editId = searchParams.get('id');
  const [isEditMode, setIsEditMode] = useState(false);
  const router = useRouter();

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    image: null,
    thumbnail: null,
    store: '',
    category: '',
    subCategory: '',
    unit: '',
    nutrition: '',
    allergen: '',
    maxQuantity: '',
    isOrganic: false,
    isHalal: false,
    price: '',
    stock: '',
    discountType: '',
    discountPercent: '',
    attribute: '',
    tags: ''
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [storesData, categoriesData, unitsData] = await Promise.all([
          fetchStores(),
          fetchCategories(),
          fetchUnits()  
        ]);
        
        // Set stores with proper error handling
        if (storesData.success) {
          setStores(storesData.data?.docs || []);
        } else {
          console.error('Failed to fetch stores:', storesData.message);
          setStores([]);
        }

        // Set categories
        if (categoriesData.success) {
          setCategories(categoriesData.data || []);
        } else {
          console.error('Failed to fetch categories:', categoriesData.message);
          setCategories([]);
        }

        // Set units
        setUnits(unitsData || []);

        // If in edit mode, fetch the product data
        if (editId) {
          setIsEditMode(true);
          const productData = await fetchProductById(editId);
          if (productData.success) {
            const product = productData.data;
            
            // Pre-fill the form with existing product data
            setFormData({
              name: product.name?.en || '',
              description: product.description?.en || '',
              store: product.store?._id || '',
              category: product.category?._id || '',
              subCategory: product.subCategory?._id || '',
              unit: product.unit?._id || '',
              nutrition: product.nutritionInfo?.calories || '',
              allergen: product.allergens?.[0] || '',
              maxQuantity: product.maxPurchaseQuantity || '',
              isOrganic: product.isOrganic || false,
              isHalal: product.isHalal || false,
              price: product.price || '',
              stock: product.stock || '',
              discountType: product.discount?.type || '',
              discountPercent: product.discount?.value || '',
              attribute: product.attributes?.[0]?.name || '',
              tags: Array.isArray(product.tags) ? product.tags.join(', ') : ''
            });

            // Set image previews if images exist
            if (product.images?.[0]) {
              setImagePreview1(product.images[0]);
            }
            if (product.thumbnail) {
              setImagePreview2(product.thumbnail);
            }

            // If product has a category, fetch its subcategories
            if (product.category?._id) {
              const subCategoriesData = await fetchSubCategories(product.category._id);
              if (subCategoriesData.success) {
                setSubCategories(subCategoriesData.data.data || []);
              }
            }
          } else {
            toast.error('Failed to fetch product data');
          }
        }
      } catch (err) {
        setError('Failed to fetch data. Please try again.');
        console.error('Error fetching data:', err);
        setStores([]);
        setCategories([]);
        setUnits([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [editId]);

  useEffect(() => {
    const fetchSubCategoriesData = async () => {
      if (formData.category) {
        try {
          console.log('Fetching subcategories for category:', formData.category);
          const subCategoriesData = await fetchSubCategories(formData.category);
          console.log('Fetched subcategories data:', subCategoriesData);
          
          if (subCategoriesData.success) {
            const subCategoriesList = subCategoriesData.data.data || [];
            console.log('Setting subcategories:', subCategoriesList);
            setSubCategories(subCategoriesList);
          } else {
            console.error('Failed to fetch subcategories:', subCategoriesData.message);
            setSubCategories([]);
          }
        } catch (err) {
          console.error('Error fetching subcategories:', err);
          setSubCategories([]);
        }
      } else {
        setSubCategories([]);
      }
    };

    fetchSubCategoriesData();
  }, [formData.category]);

  const handleImage1Change = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Update formData
      setFormData(prev => ({ ...prev, image: file }));
      
      // Create preview URL
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview1(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleImage2Change = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Update formData
      setFormData(prev => ({ ...prev, thumbnail: file }));
      
      // Create preview URL
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview2(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage1 = () => {
    setImagePreview1(null);
    setFormData(prev => ({ ...prev, image: null }));
  };

  const removeImage2 = () => {
    setImagePreview2(null);
    setFormData(prev => ({ ...prev, thumbnail: null }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError(null);

      // Validate required fields
      if (!formData.name || !formData.description || !formData.store || !formData.category) {
        throw new Error('Please fill in all required fields: Name, Description, Store, and Category');
      }

      // Validate images - only require images in create mode
      if (!isEditMode && (!formData.image || !formData.thumbnail)) {
        throw new Error('Please upload both product image and thumbnail');
      }

      // Validate price and stock
      const price = parseFloat(formData.price);
      const stock = parseInt(formData.stock);
      if (isNaN(price) || price < 0) {
        throw new Error('Please enter a valid price (must be a non-negative number)');
      }
      if (isNaN(stock) || stock < 0) {
        throw new Error('Please enter a valid stock quantity (must be a non-negative number)');
      }

      // Validate discount if provided
      if (formData.discountType && !formData.discountPercent) {
        throw new Error('Please enter a discount value');
      }
      if (formData.discountPercent && !formData.discountType) {
        throw new Error('Please select a discount type');
      }
      if (formData.discountPercent) {
        const discountValue = parseFloat(formData.discountPercent);
        if (isNaN(discountValue) || discountValue < 0 || discountValue > 100) {
          throw new Error('Discount value must be between 0 and 100');
        }
      }

      // Validate max quantity if provided
      if (formData.maxQuantity) {
        const maxQty = parseInt(formData.maxQuantity);
        if (isNaN(maxQty) || maxQty <= 0) {
          throw new Error('Maximum purchase quantity must be a positive number');
        }
      }

      let response;
      if (isEditMode) {
        response = await updateProduct(editId, formData);
      } else {
        response = await createProduct(formData);
      }
      
      if (response.success) {
        // Show success toast
        toast.success(isEditMode ? 'Product updated successfully!' : 'Product created successfully!', {
          duration: 3000,
          position: 'top-right'
        });

        if (isEditMode) {
          // In edit mode, redirect to the list page
          router.push('/grocery/productsetup/list');
        } else {
          // In create mode, reset the form
          setFormData({
            name: '',
            description: '',
            image: null,
            thumbnail: null,
            store: '',
            category: '',
            subCategory: '',
            unit: '',
            nutrition: '',
            allergen: '',
            maxQuantity: '',
            isOrganic: false,
            isHalal: false,
            price: '',
            stock: '',
            discountType: '',
            discountPercent: '',
            attribute: '',
            tags: ''
          });
          setImagePreview1(null); 
          setImagePreview2(null);
        }
      } else {
        throw new Error(response.message || `Failed to ${isEditMode ? 'update' : 'add'} product`);
      }
    } catch (err) {
      console.error(`Error ${isEditMode ? 'updating' : 'submitting'} product:`, err);
      // Show error toast
      toast.error(err.message || `Failed to ${isEditMode ? 'update' : 'add'} product. Please try again.`, {
        duration: 3000,
        position: 'top-right'
      });
    } finally {
      setLoading(false);
    } 
  };

  return (
    <div className="p-6 space-y-6">
      <Toaster />
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative" role="alert">
          <span className="block sm:inline">{error}</span>
        </div>
      )}  

      {submitStatus.show && (
        <div className={`${submitStatus.isError ? 'bg-red-50 border-red-200 text-red-700' : 'bg-green-50 border-green-200 text-green-700'} px-4 py-3 rounded relative border`} role="alert">
          <span className="block sm:inline">{submitStatus.message}</span>
        </div>
      )}
      
      {loading ? (
        <div className="flex justify-center items-center h-32">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
        </div>
      ) : (
        <div className="p-6 space-y-6">
          <h2 className="text-xl font-semibold mb-6 flex items-center"> 
            {renderIcon("/icons/items.png", "mr-3")}
            {isEditMode ? 'Edit Product' : 'Add New Item'}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Basic Information */}
            <div className="bg-white rounded-xl shadow-md p-6 border">
              
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Name (Default) <span className="text-red-500">*</span>
                  </label>
                  <input  
                    type="text"
                    required
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Item Image
                  </label>
                  <div className="mt-1 flex justify-center px-6 pt-5 w-36 pb-6 border-2 border-gray-300 border-dashed rounded-lg relative">
                    {imagePreview1 ? (
                      <div className="relative w-full h-full">
                        <img
                          src={imagePreview1} 
                          alt="Preview"
                          className="w-full h-full object-cover rounded-lg"
                        />
                        <button
                          type="button"
                          onClick={removeImage1}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                        >
                          <FaTimes className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-1 text-center">
                        <FaUpload className="mx-auto h-12 w-12 text-gray-400" />
                        <div className="flex text-sm text-gray-600">
                          <label className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500">
                            <span>Upload a file</span>
                            <input
                              type="file"
                              className="sr-only"
                              accept="image/*"
                              onChange={handleImage1Change}
                            />
                          </label>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Short Description (Default) <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    required
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows="3"
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Item Thumbnail
                  </label>
                  <div className="mt-1 flex justify-center w-36 px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-lg relative">
                    {imagePreview2 ? (
                      <div className="relative w-full h-full">
                        <img
                          src={imagePreview2}
                          alt="Preview"
                          className="w-full h-full object-cover rounded-lg"
                        />
                        <button
                          type="button"
                          onClick={removeImage2}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                        >
                          <FaTimes className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-1 text-center">
                        <FaUpload className="mx-auto h-12 w-12 text-gray-400" />
                        <div className="flex text-sm text-gray-600">
                          <label className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500">
                            <span>Upload a file</span>
                            <input
                              type="file"
                              className="sr-only"
                              accept="image/*"
                              onChange={handleImage2Change}
                            />
                          </label>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Store and Category Info */}
            <div className="bg-white rounded-xl shadow-md p-6 border">
              <h2 className="text-lg border-b pb-4 font-semibold mb-4 flex items-center">
                <FaStore className="w-5 h-5 mr-2 text-gray-600" />
                Store and Category Info
              </h2>
              <div className="grid grid-cols-4 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Store <span className="text-red-500">*</span>
                  </label>
                  <select
                    required
                    className="w-full bg-white px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={formData.store}
                    onChange={(e) => setFormData(prev => ({ ...prev, store: e.target.value }))}
                  >
                    <option value="">Select Store</option>
                    {stores.map(store => (
                      <option key={store._id} value={store._id}>{store.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Category <span className="text-red-500">*</span>
                  </label>
                  <select
                    required
                    className="w-full bg-white px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={formData.category}
                    onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                  >
                    <option value="">Select Category</option>
                    {categories.map(category => (
                      <option key={category._id} value={category._id}>{category.name.en}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Sub Category
                  </label>
                  <select
                    className="w-full bg-white px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={formData.subCategory}
                    onChange={(e) => setFormData(prev => ({ ...prev, subCategory: e.target.value }))}
                  >
                    <option value="">Select Sub Category</option>
                    {subCategories.map(subCategory => (
                      <option key={subCategory._id} value={subCategory._id}>{subCategory.name.en}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Unit
                  </label>
                  <select
                    className="w-full bg-white px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={formData.unit}
                    onChange={(e) => setFormData(prev => ({ ...prev, unit: e.target.value }))}
                  >
                    <option value="">Select Unit</option>
                    {units.map(unit => (
                      <option key={unit._id} value={unit._id}>{unit.name.en} ({unit.symbol})</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nutrition
                  </label>
                  <input
                    type="text"
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={formData.nutrition}
                    onChange={(e) => setFormData(prev => ({ ...prev, nutrition: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Allergen Ingredients
                  </label>
                  <input
                    type="text"
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={formData.allergen}
                    onChange={(e) => setFormData(prev => ({ ...prev, allergen: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Maximum Purchase Quantity Limit
                  </label>
                  <input
                    type="number"
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={formData.maxQuantity}
                    onChange={(e) => setFormData(prev => ({ ...prev, maxQuantity: e.target.value }))}
                  />
                </div>
                <div className="flex items-center space-x-6 mt-8">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      className="rounded text-blue-600"
                      checked={formData.isOrganic}
                      onChange={(e) => setFormData(prev => ({ ...prev, isOrganic: e.target.checked }))}
                    />
                    <span className="ml-2 text-sm text-gray-700">Is Organic</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      className="rounded text-blue-600"
                      checked={formData.isHalal}
                      onChange={(e) => setFormData(prev => ({ ...prev, isHalal: e.target.checked }))}
                    />
                    <span className="ml-2 text-sm text-gray-700">Is Halal</span>
                  </label>
                </div>
              </div>
            </div>

            {/* Price Information */}
            <div className="bg-white  rounded-xl shadow-md p-6 border">
              <h2 className="text-lg border-b pb-4 font-semibold mb-4 flex items-center">
                <FaMoneyBillWave className="w-5 h-5 mr-2 text-gray-600" />
                Price Information
              </h2>
              <div className="grid grid-cols-4 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Price <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    required
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={formData.price}
                    onChange={(e) => setFormData(prev => ({ ...prev, price: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Total Stock
                  </label>
                  <input
                    type="number"
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={formData.stock}
                    onChange={(e) => setFormData(prev => ({ ...prev, stock: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Discount Type <span className="text-red-500">*</span>
                  </label>
                  <select
                    required
                    className="w-full bg-white px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={formData.discountType}
                    onChange={(e) => setFormData(prev => ({ ...prev, discountType: e.target.value }))}
                  >
                    <option value="">Select Discount Type</option>
                    <option value="percentage">Percentage</option>
                    <option value="fixed">Fixed Amount</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Discount (%) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    required
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={formData.discountPercent}
                    onChange={(e) => setFormData(prev => ({ ...prev, discountPercent: e.target.value }))}
                  />
                </div>
              </div>
            </div>

            {/* Attribute */}
            <div className="bg-white rounded-xl shadow-md p-6 border">
              <h2 className="text-lg border-b pb-4 font-semibold mb-4 flex items-center">
                <FaListUl className="w-5 h-5 mr-2 text-gray-600" />
                Attribute
              </h2>
              <div>
                <input
                  type="text"
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={formData.attribute}
                  onChange={(e) => setFormData(prev => ({ ...prev, attribute: e.target.value }))}
                  placeholder="Enter attribute"
                />
              </div>
            </div>

            {/* Tags */}
            <div className="bg-white rounded-xl shadow-md p-6 border">
              <h2 className="text-lg border-b pb-4 font-semibold mb-4 flex items-center">
                <FaTags className="w-5 h-5 mr-2 text-gray-600" />
                Tags
              </h2>
              <div>
                <input
                  type="text"
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={formData.tags}
                  onChange={(e) => setFormData(prev => ({ ...prev, tags: e.target.value }))}
                  placeholder="Enter tags"
                />
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex justify-end space-x-4">
              <button
                type="button"
                onClick={() => {
                  if (isEditMode) {
                    // In edit mode, go back to list
                    router.push('/food/productsetup/list');
                  } else {
                    // In create mode, reset form
                    setFormData({
                      name: '',
                      description: '',
                      image: null,
                      thumbnail: null,
                      store: '',
                      category: '',
                      subCategory: '',
                      unit: '',
                      nutrition: '',
                      allergen: '',
                      maxQuantity: '',
                      isOrganic: false,
                      isHalal: false,
                      price: '',
                      stock: '',
                      discountType: '',
                      discountPercent: '',
                      attribute: '',
                      tags: ''
                    });
                    setImagePreview1(null);
                    setImagePreview2(null);
                  }
                }}
                className="px-6 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
                disabled={loading}
              >
                {isEditMode ? 'Cancel' : 'Reset'}
              </button>
              <button
                type="submit"
                className="px-6 py-2 bg-teal-800 text-white rounded-lg hover:bg-teal-700 disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={loading}
              >
                {loading ? 'Saving...' : (isEditMode ? 'Update' : 'Submit')}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default Page;
