import React, { useState, useEffect } from 'react';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Vendor } from '../../types';

interface VendorFormProps {
  vendor?: Vendor;
  onSubmit: (vendor: Vendor | Omit<Vendor, 'id'>) => void;
  onCancel: () => void;
}

export const VendorForm: React.FC<VendorFormProps> = ({ vendor, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    name: '',
    gst_number: '',
    phone: '',
    address: '',
    status: 'active' as 'active' | 'inactive',
  });

  useEffect(() => {
    if (vendor) {
      setFormData({
        name: vendor.name,
        gst_number: vendor.gst_number || '',
        phone: vendor.phone || '',
        address: vendor.address || '',
        status: vendor.status,
      });
    }
  }, [vendor]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (vendor) {
      onSubmit({ ...formData, id: vendor.id });
    } else {
      onSubmit(formData);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        label="Vendor Name *"
        value={formData.name}
        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
        required
        placeholder="Enter vendor name"
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

      {vendor && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
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

      <div className="flex justify-end gap-3 pt-4">
        <Button type="button" variant="secondary" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" variant="primary">
          {vendor ? 'Update' : 'Add'} Vendor
        </Button>
      </div>
    </form>
  );
};

