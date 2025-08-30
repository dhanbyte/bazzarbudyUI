'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { adminApi, Category, Product } from '@/lib/adminApi';
import { toast } from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Loader2, Plus, Tag } from 'lucide-react';

export default function AddProductPage() {
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [isLoadingCategories, setIsLoadingCategories] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [product, setProduct] = useState<Partial<Product>>({
    name: '',
    slug: '',
    brand: '',
    category: '',
    subcategory: '',
    images: [],
    quantity: 0,
    price: { original: 0, discounted: undefined },
    description: '',
    shortDescription: '',
  });

  const fetchCategories = useCallback(async () => {
    setIsLoadingCategories(true);
    const result = await adminApi.getCategories();
    if (result.success && result.data) {
      setCategories(result.data);
    } else {
      toast.error('Failed to load categories.');
    }
    setIsLoadingCategories(false);
  }, []);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;

    if (name === 'name') {
      const slug = value.toLowerCase().replace(/\s+/g, '-').replace(/[^\w\-]+/g, '');
      setProduct(prev => ({ ...prev, name: value, slug }));
    } else if (name.startsWith('price.')) {
      const field = name.split('.')[1];
      setProduct(prev => ({
        ...prev,
        price: {
          original: prev.price?.original ?? 0,
          discounted: prev.price?.discounted,
          [field]: value ? parseFloat(value) : (field === 'discounted' ? undefined : 0),
        },
      }));
    } else if (name === 'images') {
      setProduct(prev => ({ ...prev, images: value.split(',').map(s => s.trim()) }));
    } else if (name === 'quantity') {
        setProduct(prev => ({ ...prev, quantity: value ? parseInt(value, 10) : 0 }));
    } else {
      setProduct(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const categoryId = e.target.value;
    const category = categories.find(c => c._id === categoryId) || null;
    setSelectedCategory(category);
    setProduct(prev => ({ ...prev, category: category?.name || '', subcategory: '' }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const result = await adminApi.addProduct(product);

      if (result.success) {
        toast.success('Product added successfully!');
        router.push('/admin/products');
      } else {
        toast.error(result.message || 'Failed to add product.');
      }
    } catch (error) {
      console.error('Failed to submit product:', error);
      toast.error('An unexpected error occurred.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6 max-w-5xl mx-auto px-2 sm:px-0">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl sm:text-3xl font-bold">Add New Product</h1>
        <div className="flex flex-wrap items-center gap-2 sm:gap-4 w-full sm:w-auto">
          <Link href="/admin/categories" className="bg-gray-200 text-gray-800 px-3 py-1.5 sm:px-4 sm:py-2 rounded-md text-xs sm:text-sm font-medium hover:bg-gray-300 flex items-center gap-1 sm:gap-2 flex-1 sm:flex-initial justify-center">
            <Tag className="h-3 w-3 sm:h-4 sm:w-4" /> Manage Categories
          </Link>
          <Link href="/admin/products" className="bg-white border px-3 py-1.5 sm:px-4 sm:py-2 rounded-md text-xs sm:text-sm font-medium hover:bg-gray-50 flex-1 sm:flex-initial text-center">
            Back to Products
          </Link>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="bg-white p-4 sm:p-6 rounded-lg shadow-sm space-y-4 sm:space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
          <InputField name="name" label="Product Name" value={product.name || ''} onChange={handleInputChange} required />
          <InputField name="slug" label="Slug" value={product.slug || ''} onChange={handleInputChange} required />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
          <InputField name="brand" label="Brand" value={product.brand || ''} onChange={handleInputChange} required />
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
            {isLoadingCategories ? (
              <div className="flex items-center space-x-2 h-10 px-3 border border-gray-300 rounded-md">
                <Loader2 className="h-4 w-4 animate-spin text-gray-400" />
                <span className="text-sm text-gray-500">Loading categories...</span>
              </div>
            ) : (
              <select 
                name="category" 
                value={selectedCategory?._id || ''} 
                onChange={handleCategoryChange} 
                className="w-full rounded-md border-gray-300 py-2 text-sm focus:ring-1 focus:ring-brand" 
                required
              >
                <option value="" disabled>Select a category</option>
                {categories.map(cat => <option key={cat._id} value={cat._id}>{cat.name}</option>)}
              </select>
            )}
          </div>
        </div>

        {selectedCategory && selectedCategory.subcategories.length > 0 && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Subcategory</label>
            <select 
              name="subcategory" 
              value={product.subcategory || ''} 
              onChange={handleInputChange} 
              className="w-full rounded-md border-gray-300 py-2 text-sm focus:ring-1 focus:ring-brand"
            >
              <option value="">Select a subcategory</option>
              {selectedCategory.subcategories.map(sub => <option key={sub} value={sub}>{sub}</option>)}
            </select>
          </div>
        )}

        <div className="space-y-1">
          <label className="block text-sm font-medium text-gray-700">Image URLs</label>
          <textarea 
            name="images" 
            value={product.images?.join('\n') || ''} 
            onChange={(e) => setProduct(prev => ({ ...prev, images: e.target.value.split('\n').map(s => s.trim()).filter(Boolean) }))} 
            className="w-full rounded-md border-gray-300 min-h-[60px] text-sm focus:ring-1 focus:ring-brand" 
            placeholder="Enter one image URL per line"
            required 
          />
          <p className="text-xs text-gray-500">Enter one image URL per line. First image will be used as the main product image.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
          <InputField name="price.original" label="Original Price (₹)" type="number" value={String(product.price?.original || '')} onChange={handleInputChange} required />
          <InputField name="price.discounted" label="Discounted Price (₹)" type="number" value={String(product.price?.discounted || '')} onChange={handleInputChange} />
          <InputField name="quantity" label="Quantity" type="number" value={String(product.quantity || '')} onChange={handleInputChange} required />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
          <textarea 
            name="description" 
            value={product.description || ''} 
            onChange={handleInputChange} 
            className="w-full rounded-md border-gray-300 min-h-[120px] text-sm focus:ring-1 focus:ring-brand" 
            required 
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Short Description</label>
          <textarea 
            name="shortDescription" 
            value={product.shortDescription || ''} 
            onChange={handleInputChange} 
            className="w-full rounded-md border-gray-300 min-h-[60px] text-sm focus:ring-1 focus:ring-brand" 
            placeholder="Brief summary of the product (optional)"
          />
        </div>

        <div className="flex justify-center sm:justify-end pt-4">
          <button 
            type="submit" 
            disabled={isSubmitting} 
            className="w-full sm:w-auto bg-brand text-white px-6 py-2.5 rounded-md font-semibold hover:bg-brand/90 disabled:bg-brand/50 flex items-center justify-center gap-2 text-sm"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" /> 
                <span>Adding Product...</span>
              </>
            ) : (
              <>
                <Plus className="h-4 w-4" /> 
                <span>Add Product</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}

interface InputFieldProps {
  label: string;
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  type?: string;
  required?: boolean;
}

const InputField: React.FC<InputFieldProps> = ({ label, name, value, onChange, type = 'text', required = false }) => (
  <div>
    <label htmlFor={name} className="block text-sm font-medium text-gray-700 mb-1">{label}{required && '*'}</label>
    <input
      type={type}
      id={name}
      name={name}
      value={value}
      onChange={onChange}
      required={required}
      className="w-full rounded-md border-gray-300 shadow-sm focus:border-brand focus:ring focus:ring-brand focus:ring-opacity-50"
      min={type === 'number' ? '0' : undefined}
    />
  </div>
);