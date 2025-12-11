import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { ProductForm } from './ProductForm';
import { Product } from '../../types';
import { apiService } from '../../services/api';

export const NewProduct: React.FC = () => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (product: Product | Omit<Product, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      setIsSubmitting(true);
      await apiService.createProduct(product as Omit<Product, 'id' | 'created_at' | 'updated_at'>);
      navigate('/products');
    } catch (err: any) {
      setIsSubmitting(false);
      throw new Error(err.message || 'Failed to create product');
    }
  };

  const handleCancel = () => {
    navigate('/products');
  };

  return (
    <div>
      <div className="mb-6 flex items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Add New Product</h1>
          <p className="text-gray-600 mt-2 text-sm font-medium">Create a new product or fabric entry</p>
        </div>
        <Button
          variant="secondary"
          onClick={handleCancel}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </Button>
      </div>

      <Card>
        <ProductForm
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          isLoading={isSubmitting}
        />
      </Card>
    </div>
  );
};

