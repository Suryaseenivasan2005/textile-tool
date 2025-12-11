import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { SaleForm } from './SaleForm';
import { Sale } from '../../types';
import { apiService } from '../../services/api';

export const NewInvoice: React.FC = () => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (sale: Sale | Omit<Sale, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      setIsSubmitting(true);
      await apiService.createSale(sale as Omit<Sale, 'id' | 'created_at' | 'updated_at'>);
      navigate('/sales');
    } catch (err: any) {
      setIsSubmitting(false);
      throw new Error(err.message || 'Failed to create sale');
    }
  };

  const handleCancel = () => {
    navigate('/sales');
  };

  return (
    <div>
      <div className="mb-6 flex items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">New Sales Invoice</h1>
          <p className="text-gray-600 mt-2 text-sm font-medium">Create a new sales invoice</p>
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
        <SaleForm onSubmit={handleSubmit} onCancel={handleCancel} isLoading={isSubmitting} />
      </Card>
    </div>
  );
};

