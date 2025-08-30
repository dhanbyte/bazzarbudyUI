'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { adminApi, Category } from '@/lib/adminApi';
import { toast } from 'react-hot-toast';
import { Tag, Plus, ChevronDown, ChevronRight, Loader2 } from 'lucide-react';

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [newCategoryName, setNewCategoryName] = useState('');
  const [isAddingCategory, setIsAddingCategory] = useState(false);

  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());
  const [newSubcategory, setNewSubcategory] = useState<{ categoryId: string; name: string }>({ categoryId: '', name: '' });
  const [addingSubcategoryId, setAddingSubcategoryId] = useState<string | null>(null);

  const fetchCategories = useCallback(async () => {
    setIsLoading(true);
    const result = await adminApi.getCategories();
    if (result.success && result.data) {
      setCategories(result.data);
    } else {
      setError(result.message || 'Failed to load categories.');
      toast.error(result.message || 'Failed to load categories.');
    }
    setIsLoading(false);
  }, []);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCategoryName.trim()) {
      toast.error('Category name cannot be empty.');
      return;
    }
    setIsAddingCategory(true);
    const result = await adminApi.addCategory(newCategoryName.trim());
    if (result.success) {
      toast.success('Category added successfully!');
      setNewCategoryName('');
      fetchCategories(); // Refresh the list
    } else {
      toast.error(result.message || 'Failed to add category.');
    }
    setIsAddingCategory(false);
  };

  const handleAddSubcategory = async (categoryId: string) => {
    if (!newSubcategory.name.trim()) {
      toast.error('Subcategory name cannot be empty.');
      return;
    }
    setAddingSubcategoryId(categoryId);
    const result = await adminApi.addSubcategory(categoryId, newSubcategory.name.trim());
    if (result.success) {
      toast.success('Subcategory added successfully!');
      setNewSubcategory({ categoryId: '', name: '' });
      fetchCategories(); // Refresh the list
    } else {
      toast.error(result.message || 'Failed to add subcategory.');
    }
    setAddingSubcategoryId(null);
  };

  const toggleCategory = (categoryId: string) => {
    setExpandedCategories(prev => {
      const newSet = new Set(prev);
      if (newSet.has(categoryId)) {
        newSet.delete(categoryId);
      } else {
        newSet.add(categoryId);
      }
      return newSet;
    });
  };

  if (isLoading) {
    return <div className="flex justify-center items-center h-64"><Loader2 className="h-8 w-8 animate-spin" /></div>;
  }

  if (error) {
    return <div className="text-red-500 text-center">{error}</div>;
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Manage Categories</h1>

      {/* Add Category Form */}
      <div className="bg-white p-4 rounded-lg shadow-sm">
        <form onSubmit={handleAddCategory} className="flex items-center gap-4">
          <input
            type="text"
            value={newCategoryName}
            onChange={(e) => setNewCategoryName(e.target.value)}
            placeholder="New Category Name"
            className="flex-grow rounded-md border border-gray-300 px-3 py-2 text-sm"
          />
          <button type="submit" disabled={isAddingCategory} className="bg-brand text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-brand/90 disabled:bg-brand/50 flex items-center gap-2">
            {isAddingCategory ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />} Add Category
          </button>
        </form>
      </div>

      {/* Categories List */}
      <div className="bg-white p-4 rounded-lg shadow-sm space-y-2">
        {categories.map(category => (
          <div key={category._id} className="border rounded-md">
            <div className="flex items-center justify-between p-3 cursor-pointer hover:bg-gray-50" onClick={() => toggleCategory(category._id)}>
              <div className="flex items-center gap-2">
                {expandedCategories.has(category._id) ? <ChevronDown className="h-5 w-5" /> : <ChevronRight className="h-5 w-5" />}
                <span className="font-semibold">{category.name}</span>
                <span className="text-xs bg-gray-200 text-gray-700 px-2 py-0.5 rounded-full">{category.subcategories.length} subcategories</span>
              </div>
            </div>
            {expandedCategories.has(category._id) && (
              <div className="p-4 border-t bg-gray-50">
                <ul className="space-y-2 list-disc list-inside pl-2 text-sm">
                  {category.subcategories.length > 0 ? (
                    category.subcategories.map(sub => <li key={sub}>{sub}</li>)
                  ) : (
                    <li className="text-gray-500">No subcategories yet.</li>
                  )}
                </ul>
                {/* Add Subcategory Form */}
                <div className="mt-4 flex items-center gap-2">
                  <input
                    type="text"
                    value={newSubcategory.categoryId === category._id ? newSubcategory.name : ''}
                    onChange={(e) => setNewSubcategory({ categoryId: category._id, name: e.target.value })}
                    placeholder="New Subcategory Name"
                    className="flex-grow rounded-md border border-gray-300 px-3 py-2 text-sm"
                  />
                  <button onClick={() => handleAddSubcategory(category._id)} disabled={addingSubcategoryId === category._id} className="bg-gray-600 text-white px-3 py-1.5 rounded-md text-xs font-medium hover:bg-gray-700 disabled:bg-gray-400 flex items-center gap-1">
                    {addingSubcategoryId === category._id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />} Add
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
