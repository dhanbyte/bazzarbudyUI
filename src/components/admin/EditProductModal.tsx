'use client';

import React, { useState, useEffect, FormEvent } from 'react';
import { adminApi, Product, NewProduct } from '@/lib/adminApi';
import { toast } from 'react-hot-toast';
import { X, Plus, Trash2 } from 'lucide-react';

interface EditProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  onProductUpdated: () => void;
  product: Product | null;
}

const EditProductModal: React.FC<EditProductModalProps> = ({ isOpen, onClose, onProductUpdated, product: initialProduct }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [product, setProduct] = useState<Partial<NewProduct> | null>(null);

  useEffect(() => {
    if (initialProduct) {
      setProduct(initialProduct);
    }
  }, [initialProduct]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;

    setProduct(p => {
      if (!p) return null;

      if (name.startsWith('price.')) {
        const key = name.split('.')[1] as keyof NewProduct['price'];
        const numericValue = key !== 'currency' ? parseFloat(value) || 0 : value;
        const currentPrice = p.price || { original: 0, currency: 'INR' };
        return { ...p, price: { ...currentPrice, [key]: numericValue } };
      } else if (name === 'codAvailable') {
        return { ...p, codAvailable: checked };
      } else if (name.startsWith('returnPolicy.')) {
        const key = name.split('.')[1] as keyof NewProduct['returnPolicy'];
        const policyValue = key === 'eligible' ? checked : parseInt(value, 10) || 0;
        const currentReturnPolicy = p.returnPolicy || { eligible: false, duration: 0 };
        return { ...p, returnPolicy: { ...currentReturnPolicy, [key]: policyValue } };
      } else {
        return { ...p, [name]: type === 'number' ? parseInt(value, 10) || 0 : value };
      }
    });
  };

  const handleDynamicListChange = (listName: 'images' | 'features' | 'tags', index: number, value: string) => {
    setProduct(p => {
      if (!p) return null;
      const newList = [...(p[listName] || [])];
      newList[index] = value;
      return { ...p, [listName]: newList };
    });
  };

  const addDynamicListItem = (listName: 'images' | 'features' | 'tags') => {
    setProduct(p => {
      if (!p) return null;
      const newList = [...(p[listName] || []), ''];
      return { ...p, [listName]: newList };
    });
  };

  const removeDynamicListItem = (listName: 'images' | 'features' | 'tags', index: number) => {
    setProduct(p => {
      if (!p) return null;
      const newList = (p[listName] || []).filter((_, i) => i !== index);
      return { ...p, [listName]: newList };
    });
  };

  const handleSpecificationChange = (index: number, field: 'key' | 'value', value: string) => {
    setProduct(p => {
        if (!p) return null;
        const specs = Object.entries(p.specifications || {});
        const oldKey = specs[index] ? specs[index][0] : undefined;
        let newSpecsObject = { ...p.specifications };

        if (field === 'key') {
            if(oldKey !== undefined) delete newSpecsObject[oldKey];
            newSpecsObject[value] = specs[index] ? specs[index][1] : '';
        } else {
            if(oldKey !== undefined) newSpecsObject[oldKey] = value;
        }
        return { ...p, specifications: newSpecsObject };
    });
  };

  const addSpecification = () => {
    setProduct(p => {
        if (!p) return null;
        return { ...p, specifications: { ...p.specifications, [`Attribute ${Object.keys(p.specifications || {}).length + 1}`]: '' } };
    });
  };

  const removeSpecification = (index: number) => {
    setProduct(p => {
        if (!p) return null;
        const specs = Object.entries(p.specifications || {});
        specs.splice(index, 1);
        return { ...p, specifications: Object.fromEntries(specs) };
    });
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!product || !initialProduct) return;

    setIsSubmitting(true);
    const result = await adminApi.updateProduct(initialProduct.id, product);
    setIsSubmitting(false);

    if (result.success) {
      toast.success('Product updated successfully!');
      onProductUpdated();
      onClose();
    } else {
      toast.error(result.message || 'Failed to update product.');
    }
  };

  if (!isOpen || !product) return null;

  const renderDynamicList = (listName: 'images' | 'features' | 'tags', label: string) => (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      {(product[listName] || []).map((item, index) => (
        <div key={index} className="flex items-center gap-2 mb-2">
          <input type="text" value={item} onChange={(e) => handleDynamicListChange(listName, index, e.target.value)} className="input" placeholder={`${label.slice(0, -1)} ${index + 1}`} />
          <button type="button" onClick={() => removeDynamicListItem(listName, index)} className="p-2 text-red-600"><Trash2 size={18} /></button>
        </div>
      ))}
      <button type="button" onClick={() => addDynamicListItem(listName)} className="mt-1 text-sm text-blue-600 flex items-center gap-1"><Plus size={16} /> Add {label.slice(0, -1)}</button>
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4">
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-4xl max-h-[95vh]">
        <div className="flex justify-between items-center p-4 border-b"><h2 className="text-2xl font-bold">Edit Product</h2><button onClick={onClose} className="p-2 rounded-full hover:bg-gray-100"><X size={24} /></button></div>
        <form onSubmit={handleSubmit} className="p-6 space-y-6 overflow-y-auto max-h-[calc(95vh-130px)]">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div><label>Name</label><input name="name" value={product.name} onChange={handleInputChange} required className="input" /></div>
            <div><label>Slug</label><input name="slug" value={product.slug} readOnly className="input bg-gray-100" /></div>
            <div><label>Brand</label><input name="brand" value={product.brand} onChange={handleInputChange} required className="input" /></div>
            <div><label>Category</label><input name="category" value={product.category} onChange={handleInputChange} required className="input" /></div>
            <div><label>Subcategory</label><input name="subcategory" value={product.subcategory} onChange={handleInputChange} className="input" /></div>
            <div><label>Quantity</label><input name="quantity" type="number" value={product.quantity} onChange={handleInputChange} required className="input" /></div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t pt-4">
            <div><label>Original Price (₹)</label><input name="price.original" type="number" value={product.price?.original} onChange={handleInputChange} required className="input" /></div>
            <div><label>Discounted Price (₹)</label><input name="price.discounted" type="number" value={product.price?.discounted || ''} onChange={handleInputChange} className="input" /></div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 border-t pt-4">
            {renderDynamicList('images', 'Image URLs')}
            {renderDynamicList('features', 'Features')}
            {renderDynamicList('tags', 'Tags')}
          </div>
          <div className="border-t pt-4">
            <label>Specifications</label>
            {Object.entries(product.specifications || {}).map(([key, value], index) => (
              <div key={index} className="flex items-center gap-2 mb-2">
                <input type="text" value={key} onChange={(e) => handleSpecificationChange(index, 'key', e.target.value)} placeholder="Attribute" className="input" />
                <input type="text" value={value} onChange={(e) => handleSpecificationChange(index, 'value', e.target.value)} placeholder="Value" className="input" />
                <button type="button" onClick={() => removeSpecification(index)} className="p-2 text-red-600"><Trash2 size={18} /></button>
              </div>
            ))}
            <button type="button" onClick={addSpecification} className="mt-1 text-sm text-blue-600"><Plus size={16} /> Add Specification</button>
          </div>
          <div className="space-y-4 border-t pt-4">
            <div><label>Short Description</label><input name="shortDescription" value={product.shortDescription} onChange={handleInputChange} className="input" /></div>
            <div><label>Full Description</label><textarea name="description" value={product.description} onChange={handleInputChange} rows={5} className="input"></textarea></div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 border-t pt-4">
            <div><label>Warranty</label><input name="warranty" value={product.warranty} onChange={handleInputChange} className="input" /></div>
            <div className="flex items-center gap-4">
              <div className="flex items-center"><input name="codAvailable" type="checkbox" checked={product.codAvailable} onChange={handleInputChange} /><label className="ml-2">COD Available</label></div>
              <div className="flex items-center"><input name="returnPolicy.eligible" type="checkbox" checked={product.returnPolicy?.eligible} onChange={handleInputChange} /><label className="ml-2">Return Eligible</label></div>
              <div><label>Duration</label><input name="returnPolicy.duration" type="number" value={product.returnPolicy?.duration} onChange={handleInputChange} className="input w-24" /></div>
            </div>
          </div>
        </form>
        <div className="flex justify-end space-x-3 p-4 bg-gray-50 border-t">
          <button type="button" onClick={onClose} className="btn-secondary">Cancel</button>
          <button type="submit" onClick={handleSubmit} disabled={isSubmitting} className="btn-primary">{isSubmitting ? 'Updating...' : 'Update Product'}</button>
        </div>
      </div>
    </div>
  );
};

export default EditProductModal;
