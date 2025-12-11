import React, { useState, useEffect } from 'react';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Product } from '../../types';

interface ProductFormProps {
  product?: Product;
  onSubmit: (product: Product | Omit<Product, 'id' | 'created_at' | 'updated_at'>) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export const ProductForm: React.FC<ProductFormProps> = ({ product, onSubmit, onCancel, isLoading = false }) => {
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    color: '',
    design: '',
    unit: 'meter',
    cost_price: 0,
    selling_price: 0,
    status: 'active' as 'active' | 'inactive',
  });

  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name,
        category: product.category || '',
        color: product.color || '',
        design: product.design || '',
        unit: product.unit,
        cost_price: product.cost_price,
        selling_price: product.selling_price,
        status: product.status,
      });
    }
  }, [product]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (product) {
      onSubmit({ ...formData, id: product.id });
    } else {
      onSubmit(formData);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <Input
          label="Product Name *"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          required
          placeholder="Enter product name"
        />

        <Input
          label="Category"
          value={formData.category}
          onChange={(e) => setFormData({ ...formData, category: e.target.value })}
          placeholder="e.g., Cotton, Silk, Polyester"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <Input
          label="Color"
          value={formData.color}
          onChange={(e) => setFormData({ ...formData, color: e.target.value })}
          placeholder="Enter color"
        />

        <Input
          label="Design"
          value={formData.design}
          onChange={(e) => setFormData({ ...formData, design: e.target.value })}
          placeholder="Enter design/pattern"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Unit *
          </label>
          <select
            value={formData.unit}
            onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
            className="input"
            required
          >
            <option value="meter">Meter</option>
            <option value="yard">Yard</option>
            <option value="piece">Piece</option>
            <option value="kg">Kilogram</option>
            <option value="roll">Roll</option>
          </select>
        </div>

        {product && (
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Status
            </label>
            <select
              value={formData.status}
              onChange={(e) =>
                setFormData({ ...formData, status: e.target.value as 'active' | 'inactive' })
              }
              className="input"
            >
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <Input
          label="Cost Price *"
          type="number"
          step="0.01"
          min="0"
          value={formData.cost_price}
          onChange={(e) => setFormData({ ...formData, cost_price: parseFloat(e.target.value) || 0 })}
          required
          placeholder="0.00"
        />

        <Input
          label="Selling Price *"
          type="number"
          step="0.01"
          min="0"
          value={formData.selling_price}
          onChange={(e) => setFormData({ ...formData, selling_price: parseFloat(e.target.value) || 0 })}
          required
          placeholder="0.00"
        />
      </div>

      <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 pt-6 border-t border-gray-200">
        <Button type="button" variant="secondary" onClick={onCancel} className="w-full sm:w-auto">
          Cancel
        </Button>
        <Button type="submit" variant="primary" className="w-full sm:w-auto" isLoading={isLoading}>
          {product ? 'Update' : 'Add'} Product
        </Button>
      </div>
    </form>
  );
};

