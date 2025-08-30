
'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { api } from '@/lib/api';
import { toast } from 'react-hot-toast';
import { Package, AlertCircle, RefreshCw, PlusCircle, Edit, Trash2 } from 'lucide-react';
import AddProductModal from '@/components/admin/AddProductModal';
import EditProductModal from '@/components/admin/EditProductModal';
import { adminApi, Product } from '@/lib/adminApi';

const AdminProductsPage = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAddModalOpen, setAddModalOpen] = useState(false);
  const [isEditModalOpen, setEditModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      console.log('🔄 Fetching products from API...');
      const response = await fetch('/api/products');
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      console.log('📦 Admin products API response:', data);
      
      let products: Product[] = [];
      if (data.success && Array.isArray(data.data)) {
        products = data.data;
      } else if (Array.isArray(data)) {
        products = data;
      }
      
      console.log(`✅ Loaded ${products.length} products for admin`);
      setProducts(products);
    } catch (err) {
      setError('Network error occurred');
      console.error('Error fetching products:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const handleEdit = (product: Product) => {
    setSelectedProduct(product);
    setEditModalOpen(true);
  };

  const handleDelete = async (productId: string) => {
    if (!confirm('Are you sure you want to delete this product?')) return;
    
    try {
      const result = await adminApi.deleteProduct(productId);
      if (result.success) {
        toast.success('Product deleted successfully');
        fetchProducts();
      } else {
        throw new Error(result.message || 'Failed to delete product');
      }
    } catch (err) {
      console.error('Error deleting product:', err);
      toast.error('Failed to delete product');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-10 px-4">
        <AlertCircle className="mx-auto h-12 w-12 text-red-400" />
        <h3 className="mt-2 text-lg font-medium text-red-800">Failed to load products</h3>
        <p className="mt-1 text-sm text-red-600">Error: {error}</p>
        <button onClick={fetchProducts} className="btn-secondary mt-6"><RefreshCw className="-ml-1 mr-2 h-5 w-5" />Try Again</button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Product Management</h1>
        <button onClick={() => setAddModalOpen(true)} className="btn-primary"><PlusCircle className="-ml-1 mr-2 h-5 w-5" />Add Product</button>
      </div>

      <AddProductModal isOpen={isAddModalOpen} onClose={() => setAddModalOpen(false)} onProductAdded={fetchProducts} />
      <EditProductModal isOpen={isEditModalOpen} onClose={() => setEditModalOpen(false)} product={selectedProduct} onProductUpdated={fetchProducts} />
      
      {products.length === 0 ? (
        <div className="text-center py-10 bg-white rounded-lg shadow">
          <Package className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-lg font-medium text-gray-900">No products found</h3>
          <p className="mt-1 text-sm text-gray-500">Click 'Add Product' to get started.</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left text-gray-500">
              <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3">Product Name</th>
                  <th scope="col" className="px-6 py-3">Category</th>
                  <th scope="col" className="px-6 py-3">Brand</th>
                  <th scope="col" className="px-6 py-3">Price</th>
                  <th scope="col" className="px-6 py-3">Stock</th>
                  <th scope="col" className="px-6 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.map((product) => (
                  <tr key={product._id} className="bg-white border-b hover:bg-gray-50">
                    <td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap">{product.name}</td>
                    <td className="px-6 py-4">{product.category}</td>
                    <td className="px-6 py-4">{product.brand}</td>
                    <td className="px-6 py-4">₹{product.price.original.toLocaleString('en-IN')}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${product.quantity > 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                        {product.quantity > 0 ? `${product.quantity} in stock` : 'Out of Stock'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right space-x-2">
                      <button onClick={() => handleEdit(product)} className="p-2 text-blue-600 hover:text-blue-800"><Edit size={16} /></button>
                      <button onClick={() => handleDelete(product.id)} className="p-2 text-red-600 hover:text-red-800"><Trash2 size={16} /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminProductsPage;
