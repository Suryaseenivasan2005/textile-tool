import React, { useState, useEffect } from 'react';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Payment, Vendor, Customer } from '../../types';
import { apiService } from '../../services/api';

interface PaymentFormProps {
  payment?: Payment;
  onSubmit: (payment: Payment | Omit<Payment, 'id' | 'created_at' | 'updated_at'>) => void;
  onCancel: () => void;
}

export const PaymentForm: React.FC<PaymentFormProps> = ({ payment, onSubmit, onCancel }) => {
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loadingData, setLoadingData] = useState(true);

  const [formData, setFormData] = useState({
    reference_type: 'vendor' as 'vendor' | 'customer',
    reference_id: '',
    amount: 0,
    payment_mode: 'cash' as 'cash' | 'bank' | 'cheque' | 'online',
    payment_date: new Date().toISOString().split('T')[0],
  });

  useEffect(() => {
    loadFormData();
  }, []);

  const loadFormData = async () => {
    try {
      setLoadingData(true);
      const [vendorsData, customersData] = await Promise.all([
        apiService.getVendors({ status: 'active' }),
        apiService.getCustomers(),
      ]);
      setVendors(vendorsData);
      setCustomers(customersData);

      if (payment) {
        setFormData({
          reference_type: payment.reference_type,
          reference_id: payment.reference_id.toString(),
          amount: payment.amount,
          payment_mode: payment.payment_mode,
          payment_date: payment.payment_date.split('T')[0],
        });
      }
    } catch (error) {
      console.error('Error loading form data:', error);
    } finally {
      setLoadingData(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.reference_id || formData.amount <= 0) {
      alert('Please fill all required fields');
      return;
    }

    const paymentData = {
      reference_type: formData.reference_type,
      reference_id: formData.reference_id,
      amount: formData.amount,
      payment_mode: formData.payment_mode,
      payment_date: formData.payment_date,
    };

    if (payment) {
      onSubmit({ ...paymentData, id: payment.id } as Payment);
    } else {
      onSubmit(paymentData);
    }
  };

  const currentList = formData.reference_type === 'vendor' ? vendors : customers;

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Payment Type *
        </label>
        <select
          value={formData.reference_type}
            onChange={(e) =>
              setFormData({
                ...formData,
                reference_type: e.target.value as 'vendor' | 'customer',
                reference_id: '',
              })
            }
            disabled={loadingData}
          className="input"
          required
        >
          <option value="vendor">Vendor Payment</option>
          <option value="customer">Customer Receipt</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {formData.reference_type === 'vendor' ? 'Vendor' : 'Customer'} *
        </label>
          <select
            value={formData.reference_id}
            onChange={(e) =>
              setFormData({
                ...formData,
                reference_id: e.target.value,
              })
            }
            className="input"
            required
            disabled={loadingData}
          >
            <option value="">Select {formData.reference_type === 'vendor' ? 'Vendor' : 'Customer'}</option>
            {currentList.map((item) => (
              <option key={item.id} value={item.id}>
                {item.name}
              </option>
            ))}
          </select>
      </div>

      <Input
        label="Amount *"
        type="number"
        min="0"
        step="0.01"
        value={formData.amount}
        onChange={(e) => setFormData({ ...formData, amount: parseFloat(e.target.value) || 0 })}
        required
        placeholder="Enter amount"
      />

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Payment Mode *
          </label>
          <select
            value={formData.payment_mode}
            onChange={(e) =>
              setFormData({
                ...formData,
                payment_mode: e.target.value as 'cash' | 'bank' | 'cheque' | 'online',
              })
            }
            className="input"
            required
          >
            <option value="cash">Cash</option>
            <option value="bank">Bank Transfer</option>
            <option value="cheque">Cheque</option>
            <option value="online">Online Payment</option>
          </select>
        </div>

        <Input
          label="Payment Date *"
          type="date"
          value={formData.payment_date}
          onChange={(e) => setFormData({ ...formData, payment_date: e.target.value })}
          required
        />
      </div>

      <div className="flex justify-end gap-3 pt-4">
        <Button type="button" variant="secondary" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" variant="primary">
          {payment ? 'Update' : 'Record'} Payment
        </Button>
      </div>
    </form>
  );
};

