"use client"
import React, { useState, useEffect } from 'react';
import { fetchProducts, deleteProduct, updateProduct } from '@/services/groceryProductService';
import Image from 'next/image';
import Link from 'next/link';   
import { FaEdit, FaTrash, FaSearch, FaPlus } from 'react-icons/fa';
import { toast, Toaster } from 'react-hot-toast';
import { useRouter } from 'next/navigation';

const ProductList = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [deleteLoading, setDeleteLoading] = useState(null);
  const [statusLoading, setStatusLoading] = useState(null);
  const router = useRouter();

  useEffect(() => {
    fetchProductList();
  }, []);

  const fetchProductList = async () => {
    try { 
      setLoading(true);
      const response = await fetchProducts();
      if (response.success) {
        setProducts(response.data.docs || []);
        setFilteredProducts(response.data.docs || []);
      } else {
        toast.error('Failed to fetch products');
      }
    } catch (error) {
      console.error('Error fetching products:', error);
      toast.error('Error fetching products');
    } finally { 
      setLoading(false);
    }
  };

  useEffect(() => {
    const lowercaseSearch = searchQuery.toLowerCase();
    const filtered = products.filter(product => 
      product.name?.en?.toLowerCase().includes(lowercaseSearch) ||
      product.description?.en?.toLowerCase().includes(lowercaseSearch)
    );
    setFilteredProducts(filtered);
  }, [searchQuery, products]);  

  const handleDelete = async (productId) => {
    if (!confirm('Are you sure you want to delete this product?')) {
      return;
    } 

    try {
      setDeleteLoading(productId);
      const response = await deleteProduct(productId);
      if (response.success) {
        toast.success('Product deleted successfully');
        // Remove the deleted product from the list
        setProducts(prevProducts => prevProducts.filter(product => product._id !== productId));
      } else {
        toast.error(response.message || 'Failed to delete product');
      }
    } catch (error) {
      console.error('Error deleting product:', error);
      toast.error(error.message || 'Failed to delete product');
    } finally {
      setDeleteLoading(null);
    }
  };

  const handleStatusToggle = async (productId, currentStatus) => {
    try {
      setStatusLoading(productId);
      const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
      
      const response = await updateProduct(productId, {
        status: newStatus
      });

      if (response.success) {
        toast.success(`Product ${newStatus === 'active' ? 'activated' : 'deactivated'} successfully`);
        // Update the product status in the list
        setProducts(prevProducts => 
          prevProducts.map(product => 
            product._id === productId 
              ? { ...product, status: newStatus }
              : product
          )
        );
      } else {
        toast.error(response.message || 'Failed to update product status');
      }
    } catch (error) {
      console.error('Error updating product status:', error);
      toast.error(error.message || 'Failed to update product status');
    } finally {
      setStatusLoading(null);
    }
  };

  return (
    <div className="p-6">
      <Toaster />
      
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800 flex items-center">
          <Image src="/icons/items.png" alt="Products" width={32} height={32} className="mr-2" />
          Products
        </h1>
        <Link 
          href="/grocery/productsetup/addnew"
          className="bg-teal-800 text-white px-4 py-2 rounded-lg hover:bg-teal-700 flex items-center"
        >
          <FaPlus className="mr-2" />
          Add New Product
        </Link>
      </div>

      {/* Search Bar */}
      <div className="bg-white p-4 rounded-lg shadow mb-6">
        <div className="relative">
          <input
            type="text"
            placeholder="Search products..."
            className="w-full pl-10 pr-4 py-2 border rounded-lg"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <FaSearch className="absolute left-3 top-3 text-gray-400" />
        </div>
      </div>

      {/* Products Table */}
      {loading ? (
        <div className="flex justify-center items-center h-32">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Image</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stock</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredProducts.map((product) => (
                <tr key={product._id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="h-12 w-12 relative">
                      <Image
                        src={product.thumbnail || '/placeholder.png'}
                        alt={product.name?.en}
                        layout="fill"
                        objectFit="cover"
                        className="rounded-lg"
                      />
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{product.name?.en}</div>
                    <div className="text-sm text-gray-500">{product.description?.en}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">${product.price}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{product.stock}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button
                      onClick={() => handleStatusToggle(product._id, product.status)}
                      disabled={statusLoading === product._id}
                      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                        ${product.status === 'active' ? 'bg-green-100 text-green-800' : 
                          product.status === 'inactive' ? 'bg-red-100 text-red-800' : 
                          'bg-yellow-100 text-yellow-800'}
                        ${statusLoading === product._id ? 'opacity-50 cursor-wait' : 'cursor-pointer hover:opacity-80'}`}
                    >
                      {statusLoading === product._id ? 'Updating...' : product.status}
                    </button>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button
                          onClick={() => router.push(`/grocery/productsetup/addnew?id=${product._id}`)}
                      className="text-blue-600 hover:text-blue-900 mr-4"
                    >
                      <FaEdit className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => handleDelete(product._id)}
                      disabled={deleteLoading === product._id}
                      className={`text-red-600 hover:text-red-900 
                        ${deleteLoading === product._id ? 'opacity-50 cursor-wait' : ''}`}
                    >
                      {deleteLoading === product._id ? (
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-red-600"></div>
                      ) : (
                        <FaTrash className="w-5 h-5" />
                      )}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default ProductList;
