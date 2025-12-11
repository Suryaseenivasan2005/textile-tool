import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { PurchaseForm } from './PurchaseForm';
import { Purchase } from '../../types';
import { apiService } from '../../services/api';

export const NewPurchase: React.FC = () => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (purchase: Purchase | Omit<Purchase, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      setIsSubmitting(true);
      await apiService.createPurchase(purchase as Omit<Purchase, 'id' | 'created_at' | 'updated_at'>);
      navigate('/purchases');
    } catch (err: any) {
      setIsSubmitting(false);
      throw new Error(err.message || 'Failed to create purchase');
    }
  };

  const handleCancel = () => {
    navigate('/purchases');
  };

  return (
    <div>
      <div className="mb-6 flex items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">New Purchase Entry</h1>
          <p className="text-gray-600 mt-2 text-sm font-medium">Create a new purchase entry</p>
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
        <PurchaseForm onSubmit={handleSubmit} onCancel={handleCancel} isLoading={isSubmitting} />
      </Card>
    </div>
  );
};

