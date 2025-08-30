'use client';

import React, { useState, FormEvent, useEffect } from 'react';
import { adminApi, NewProduct, Category } from '@/lib/adminApi';
import { toast } from 'react-hot-toast';
import { X, Plus, Trash2 } from 'lucide-react';

interface AddProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  onProductAdded: () => void;
}

const initialProductState: Partial<NewProduct> = {
  name: '',
  slug: '',
  brand: '',
  category: '',
  subcategory: '',
  images: [''],
  quantity: 0,
  price: { original: 0, discounted: 0, currency: '₹' },
  description: '',
  shortDescription: '',
  features: [''],
  specifications: { '': '' },
  codAvailable: true,
  returnPolicy: { eligible: true, duration: 15 },
  warranty: '1 Year Warranty',
  tags: [''],
};

const AddProductModal: React.FC<AddProductModalProps> = ({ isOpen, onClose, onProductAdded }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [product, setProduct] = useState<Partial<NewProduct>>(initialProductState);
  const [categories, setCategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);

  useEffect(() => {
    if (isOpen) {
      setProduct(initialProductState);
      fetchCategories();
      fetchBrands();
    }
  }, [isOpen]);

  const fetchCategories = async () => {
    const result = await adminApi.getCategories();
    if (result.success && result.data) {
      setCategories(result.data);
    }
  };

  const fetchBrands = async () => {
    // For now, we'll use a static list of brands. You can make this dynamic later
    setBrands(['Apple', 'Samsung', 'OnePlus', 'Xiaomi', 'Realme', 'Vivo', 'Oppo', 'Nothing', 'Google', 'Sony', 'LG', 'Motorola']);
  };

  const handleCategoryChange = (categoryId: string) => {
    const category = categories.find(c => c._id === categoryId);
    setSelectedCategory(category || null);
    setProduct(p => ({ ...p, category: category?.name || '', subcategory: '' }));
  };

  const handleSubcategoryChange = (subcategory: string) => {
    setProduct(p => ({ ...p, subcategory }));
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;

    if (name.startsWith('price.')) {
      const key = name.split('.')[1] as keyof NewProduct['price'];
      const numericValue = key !== 'currency' ? parseFloat(value) || 0 : value;
      setProduct(p => ({
        ...p,
        price: {
          original: p?.price?.original || 0,
          ...p?.price,
          [key]: numericValue,
        },
      }));
    } else if (name === 'codAvailable') {
      setProduct(p => ({ ...p, codAvailable: checked }));
    } else if (name.startsWith('returnPolicy.')) {
      const key = name.split('.')[1] as keyof NewProduct['returnPolicy'];
      const policyValue = key === 'eligible' ? checked : parseInt(value, 10) || 0;
      setProduct(p => ({
        ...p,
        returnPolicy: {
          eligible: p?.returnPolicy?.eligible || false,
          duration: p?.returnPolicy?.duration || 0,
          ...p?.returnPolicy,
          [key]: policyValue,
        },
      }));
    } else {
      setProduct(p => ({ ...p, [name]: type === 'number' ? parseInt(value, 10) || 0 : value }));
    }

    if (name === 'name') {
      const slug = value.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
      setProduct(p => ({ ...p, slug }));
    }
  };

  const handleDynamicListChange = (listName: 'images' | 'features' | 'tags', index: number, value: string) => {
    const newList = [...(product[listName] || [])];
    newList[index] = value;
    setProduct(p => ({ ...p, [listName]: newList }));
  };

  const addDynamicListItem = (listName: 'images' | 'features' | 'tags') => {
    const newList = [...(product[listName] || []), ''];
    setProduct(p => ({ ...p, [listName]: newList }));
  };

  const removeDynamicListItem = (listName: 'images' | 'features' | 'tags', index: number) => {
    const newList = (product[listName] || []).filter((_, i) => i !== index);
    setProduct(p => ({ ...p, [listName]: newList }));
  };

  const handleSpecificationChange = (index: number, field: 'key' | 'value', value: string) => {
    const specs = Object.entries(product.specifications || {});
    const oldKey = specs[index] ? specs[index][0] : undefined;
    
    let newSpecsObject = { ...product.specifications };

    if (field === 'key') {
        if(oldKey !== undefined) {
            delete newSpecsObject[oldKey];
        }
        newSpecsObject[value] = specs[index] ? specs[index][1] : '';
    } else {
        if(oldKey !== undefined) {
            newSpecsObject[oldKey] = value;
        }
    }
    
    setProduct(p => ({ ...p, specifications: newSpecsObject }));
  };

  const addSpecification = () => {
    setProduct(p => ({ ...p, specifications: { ...p.specifications, [`Attribute ${Object.keys(p.specifications || {}).length + 1}`]: '' } }));
  };

  const removeSpecification = (index: number) => {
    const specs = Object.entries(product.specifications || {});
    specs.splice(index, 1);
    setProduct(p => ({ ...p, specifications: Object.fromEntries(specs) }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const finalProduct: NewProduct = {
      id: `prod_${Date.now()}`,
      name: product.name || '',
      slug: product.slug || '',
      brand: product.brand || '',
      category: product.category || '',
      images: (product.images || []).filter(img => img.trim() !== ''),
      quantity: product.quantity || 0,
      price: { original: product.price?.original || 0, discounted: product.price?.discounted, currency: '₹' },
      description: product.description || '',
      subcategory: product.subcategory || '',
      shortDescription: product.shortDescription || '',
      features: (product.features || []).filter(f => f.trim() !== ''),
      specifications: product.specifications ? Object.fromEntries(Object.entries(product.specifications).filter(([key, value]) => key && value)) : {},
      codAvailable: product.codAvailable || false,
      returnPolicy: product.returnPolicy || { eligible: false, duration: 0 },
      warranty: product.warranty || '',
      tags: (product.tags || []).filter(t => t.trim() !== ''),
    };

    const result = await adminApi.addProduct(finalProduct);
    setIsSubmitting(false);

    if (result.success) {
      toast.success('Product added successfully!');
      onProductAdded();
      onClose();
    } else {
      toast.error(result.message || 'Failed to add product.');
    }
  };

  if (!isOpen) return null;

  const renderDynamicList = (listName: 'images' | 'features' | 'tags', label: string) => (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      {(product[listName] || []).map((item, index) => (
        <div key={index} className="flex items-center gap-2 mb-2">
          <input
            type="text"
            value={item}
            onChange={(e) => handleDynamicListChange(listName, index, e.target.value)}
            className="flex-grow block w-full rounded-md border-gray-300 shadow-sm"
            placeholder={`${label.slice(0, -1)} ${index + 1}`}
          />
          <button type="button" onClick={() => removeDynamicListItem(listName, index)} className="p-2 text-red-600 hover:text-red-800">
            <Trash2 size={18} />
          </button>
        </div>
      ))}
      <button type="button" onClick={() => addDynamicListItem(listName)} className="mt-1 text-sm text-blue-600 hover:text-blue-800 flex items-center gap-1">
        <Plus size={16} /> Add {label.slice(0, -1)}
      </button>
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4">
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-4xl max-h-[95vh]">
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="text-2xl font-bold">Add New Product</h2>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-100">
            <X size={24} />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-6 overflow-y-auto max-h-[calc(95vh-130px)]">
          {/* Basic Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div><label>Name</label><input name="name" onChange={handleInputChange} required className="input" /></div>
            <div><label>Slug</label><input name="slug" value={product.slug} readOnly className="input bg-gray-100" /></div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Brand</label>
              <select 
                name="brand" 
                value={product.brand || ''} 
                onChange={(e) => setProduct(p => ({ ...p, brand: e.target.value }))}
                required 
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              >
                <option value="">Select Brand</option>
                {brands.map(brand => (
                  <option key={brand} value={brand}>{brand}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
              <select 
                value={selectedCategory?._id || ''} 
                onChange={(e) => handleCategoryChange(e.target.value)}
                required 
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              >
                <option value="">Select Category</option>
                {categories.map(category => (
                  <option key={category._id} value={category._id}>{category.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Subcategory</label>
              <select 
                value={product.subcategory || ''} 
                onChange={(e) => handleSubcategoryChange(e.target.value)}
                disabled={!selectedCategory}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 disabled:bg-gray-100"
              >
                <option value="">Select Subcategory</option>
                {selectedCategory?.subcategories.map(subcategory => (
                  <option key={subcategory} value={subcategory}>{subcategory}</option>
                ))}
              </select>
            </div>
            <div><label>Quantity</label><input name="quantity" type="number" onChange={handleInputChange} required className="input" /></div>
          </div>

          {/* Pricing */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t pt-4">
            <div><label>Original Price (₹)</label><input name="price.original" type="number" onChange={handleInputChange} required className="input" /></div>
            <div><label>Discounted Price (₹)</label><input name="price.discounted" type="number" onChange={handleInputChange} className="input" /></div>
          </div>

          {/* Images, Features, Tags */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 border-t pt-4">
            {renderDynamicList('images', 'Image URLs')}
            {renderDynamicList('features', 'Features')}
            {renderDynamicList('tags', 'Tags')}
          </div>

          {/* Specifications */}
          <div className="border-t pt-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Specifications</label>
            {Object.entries(product.specifications || {}).map(([key, value], index) => (
              <div key={index} className="flex items-center gap-2 mb-2">
                <input
                  type="text"
                  value={key}
                  onChange={(e) => handleSpecificationChange(index, 'key', e.target.value)}
                  placeholder="Attribute (e.g., Color)"
                  className="input"
                />
                <input
                  type="text"
                  value={value as string}
                  onChange={(e) => handleSpecificationChange(index, 'value', e.target.value)}
                  placeholder="Value (e.g., Red)"
                  className="input"
                />
                <button type="button" onClick={() => removeSpecification(index)} className="p-2 text-red-600 hover:text-red-800">
                  <Trash2 size={18} />
                </button>
              </div>
            ))}
            <button type="button" onClick={addSpecification} className="mt-1 text-sm text-blue-600 hover:text-blue-800 flex items-center gap-1">
              <Plus size={16} /> Add Specification
            </button>
          </div>

          {/* Descriptions */}
          <div className="space-y-4 border-t pt-4">
            <div><label>Short Description</label><input name="shortDescription" onChange={handleInputChange} className="input" /></div>
            <div><label>Full Description</label><textarea name="description" onChange={handleInputChange} rows={5} className="input"></textarea></div>
          </div>

          {/* Policy & Warranty */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 border-t pt-4">
            <div><label>Warranty</label><input name="warranty" value={product.warranty} onChange={handleInputChange} className="input" /></div>
            <div className="flex items-center gap-4">
              <div className="flex items-center"><input name="codAvailable" type="checkbox" checked={product.codAvailable} onChange={handleInputChange} className="h-4 w-4" /><label className="ml-2">COD Available</label></div>
              <div className="flex items-center"><input name="returnPolicy.eligible" type="checkbox" checked={product.returnPolicy?.eligible} onChange={handleInputChange} className="h-4 w-4" /><label className="ml-2">Return Eligible</label></div>
              <div><label>Duration</label><input name="returnPolicy.duration" type="number" value={product.returnPolicy?.duration} onChange={handleInputChange} className="input w-24" /></div>
            </div>
          </div>

        </form>
        <div className="flex justify-end space-x-3 p-4 bg-gray-50 border-t">
          <button type="button" onClick={onClose} className="btn-secondary">
            Cancel
          </button>
          <button type="submit" onClick={handleSubmit} disabled={isSubmitting} className="btn-primary">
            {isSubmitting ? 'Adding...' : 'Add Product'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddProductModal;
