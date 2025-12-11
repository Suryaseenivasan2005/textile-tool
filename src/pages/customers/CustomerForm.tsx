import React, { useState, useEffect } from 'react';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Customer } from '../../types';

interface CustomerFormProps {
  customer?: Customer;
  onSubmit: (customer: Customer | Omit<Customer, 'id'>) => void;
  onCancel: () => void;
}

export const CustomerForm: React.FC<CustomerFormProps> = ({ customer, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    name: '',
    gst_number: '',
    phone: '',
    address: '',
  });

  useEffect(() => {
    if (customer) {
      setFormData({
        name: customer.name,
        gst_number: customer.gst_number || '',
        phone: customer.phone || '',
        address: customer.address || '',
      });
    }
  }, [customer]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (customer) {
      onSubmit({ ...formData, id: customer.id });
    } else {
      onSubmit(formData);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        label="Customer Name *"
        value={formData.name}
        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
        required
        placeholder="Enter customer name"
      />

      <Input
        label="GST Number"
        value={formData.gst_number}
        onChange={(e) => setFormData({ ...formData, gst_number: e.target.value })}
        placeholder="Enter GST number"
      />

      <Input
        label="Phone"
        type="tel"
        value={formData.phone}
        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
        placeholder="Enter phone number"
      />

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Address
        </label>
        <textarea
          value={formData.address}
          onChange={(e) => setFormData({ ...formData, address: e.target.value })}
          className="input min-h-[80px]"
          placeholder="Enter address"
          rows={3}
        />
      </div>

      <div className="flex justify-end gap-3 pt-4">
        <Button type="button" variant="secondary" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" variant="primary">
          {customer ? 'Update' : 'Add'} Customer
        </Button>
      </div>
    </form>
  );
};

