import React, { useState, useEffect } from 'react';
import { Plus, Search, Edit, X } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Card } from '../../components/ui/Card';
import { Table } from '../../components/ui/Table';
import { Modal } from '../../components/ui/Modal';
import { CategoryForm } from './CategoryForm';
import { Category } from '../../types';
import { apiService } from '../../services/api';

export const CategoriesList: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await apiService.getCategories({ search: searchTerm || undefined });
      setCategories(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load categories');
      console.error('Error loading categories:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      loadCategories();
    }, 300);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const filteredCategories = categories.filter((category) =>
    category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    category.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddCategory = async (category: Omit<Category, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      await apiService.createCategory(category);
      setIsAddModalOpen(false);
      loadCategories();
    } catch (err: any) {
      throw new Error(err.message || 'Failed to create category');
    }
  };

  const handleEditCategory = async (category: Category) => {
    try {
      await apiService.updateCategory(category.id, category);
      setIsEditModalOpen(false);
      setSelectedCategory(null);
      loadCategories();
    } catch (err: any) {
      throw new Error(err.message || 'Failed to update category');
    }
  };

  const handleDeactivateCategory = async (id: string) => {
    try {
      await apiService.deleteCategory(id);
      loadCategories();
    } catch (err: any) {
      console.error('Error deactivating category:', err);
      alert(err.message || 'Failed to deactivate category');
    }
  };

  const columns = [
    {
      key: 'name' as keyof Category,
      header: 'Category Name',
    },
    {
      key: 'description' as keyof Category,
      header: 'Description',
      render: (category: Category) => category.description || '-',
      className: 'max-w-xs',
    },
    {
      key: 'status' as keyof Category,
      header: 'Status',
      render: (category: Category) => (
        <span
          className={`px-2.5 py-1 text-xs font-semibold rounded-full ${
            category.status === 'active'
              ? 'bg-green-100 text-green-700'
              : 'bg-gray-100 text-gray-600'
          }`}
        >
          {category.status}
        </span>
      ),
    },
    {
      key: 'actions' as keyof Category,
      header: 'Actions',
      render: (category: Category) => (
        <div className="flex items-center gap-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setSelectedCategory(category);
              setIsEditModalOpen(true);
            }}
            className="text-primary-600 hover:text-primary-700 p-1.5 rounded-lg hover:bg-primary-50 transition-colors"
            title="Edit"
          >
            <Edit className="w-4 h-4" />
          </button>
          {category.status === 'active' && (
            <button
            onClick={(e) => {
              e.stopPropagation();
              handleDeactivateCategory(category.id as string);
            }}
              className="text-red-600 hover:text-red-700 p-1.5 rounded-lg hover:bg-red-50 transition-colors"
              title="Deactivate"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div>
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Category Master</h1>
          <p className="text-gray-600 mt-2 text-sm font-medium">Manage product categories</p>
        </div>
        <Button
          variant="primary"
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center gap-2 w-full sm:w-auto"
        >
          <Plus className="w-4 h-4" />
          Add Category
        </Button>
      </div>

      <Card>
        <div className="mb-6">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 pointer-events-none" />
            <Input
              type="text"
              placeholder="Search categories by name or description..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {error && (
          <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm font-medium">
            {error}
          </div>
        )}

        {isLoading ? (
          <div className="text-center py-12 text-gray-500">Loading categories...</div>
        ) : (
          <Table
            data={filteredCategories}
            columns={columns}
            emptyMessage="No categories found. Add your first category to get started."
          />
        )}
      </Card>

      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Add New Category"
        size="md"
      >
        <CategoryForm
          onSubmit={handleAddCategory}
          onCancel={() => setIsAddModalOpen(false)}
        />
      </Modal>

      <Modal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setSelectedCategory(null);
        }}
        title="Edit Category"
        size="md"
      >
        {selectedCategory && (
          <CategoryForm
            category={selectedCategory}
            onSubmit={handleEditCategory}
            onCancel={() => {
              setIsEditModalOpen(false);
              setSelectedCategory(null);
            }}
          />
        )}
      </Modal>
    </div>
  );
};

