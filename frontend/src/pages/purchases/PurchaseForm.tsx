import React, { useState, useEffect } from 'react';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Purchase, PurchaseItem, Vendor, Product } from '../../types';
import { X, Plus } from 'lucide-react';
import { apiService } from '../../services/api';

interface PurchaseFormProps {
  purchase?: Purchase;
  onSubmit: (purchase: Purchase | Omit<Purchase, 'id' | 'created_at' | 'updated_at'>) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export const PurchaseForm: React.FC<PurchaseFormProps> = ({ purchase, onSubmit, onCancel, isLoading = false }) => {
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loadingData, setLoadingData] = useState(true);

  const [formData, setFormData] = useState({
    vendor_id: '',
    invoice_no: '',
    invoice_date: new Date().toISOString().split('T')[0],
    items: [] as Omit<PurchaseItem, 'purchase_id'>[],
    payment_status: 'pending' as 'pending' | 'paid' | 'partial',
  });

  const [newItem, setNewItem] = useState({
    product_id: '',
    quantity: 0,
    rate: 0,
  });

  useEffect(() => {
    loadFormData();
  }, []);

  const loadFormData = async () => {
    try {
      setLoadingData(true);
      const [vendorsData, productsData] = await Promise.all([
        apiService.getVendors({ status: 'active' }),
        apiService.getProducts({ status: 'active' }),
      ]);
      setVendors(vendorsData);
      setProducts(productsData);

      if (purchase) {
        setFormData({
          vendor_id: purchase.vendor_id.toString(),
          invoice_no: purchase.invoice_no,
          invoice_date: purchase.invoice_date.split('T')[0],
          items: purchase.items || [],
          payment_status: purchase.payment_status,
        });
      }
    } catch (error) {
      console.error('Error loading form data:', error);
    } finally {
      setLoadingData(false);
    }
  };

  useEffect(() => {
    if (purchase) {
      setFormData({
        vendor_id: purchase.vendor_id.toString(),
        invoice_no: purchase.invoice_no,
        invoice_date: purchase.invoice_date.split('T')[0],
        items: purchase.items || [],
        payment_status: purchase.payment_status,
      });
    }
  }, [purchase]);

  const subtotal = formData.items.reduce((sum, item) => sum + item.quantity * item.rate, 0);
  const gstAmount = subtotal * 0.18; // 18% GST
  const totalAmount = subtotal + gstAmount;

  const handleAddItem = () => {
    if (newItem.product_id && newItem.quantity > 0 && newItem.rate > 0) {
      setFormData({
        ...formData,
        items: [...formData.items, {
          product_id: newItem.product_id,
          quantity: newItem.quantity,
          rate: newItem.rate,
        }],
      });
      setNewItem({ product_id: '', quantity: 0, rate: 0 });
    }
  };

  const handleRemoveItem = (index: number) => {
    setFormData({
      ...formData,
      items: formData.items.filter((_, i) => i !== index),
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.items.length === 0) {
      alert('Please add at least one item');
      return;
    }

    const purchaseData = {
      vendor_id: formData.vendor_id,
      invoice_no: formData.invoice_no,
      invoice_date: formData.invoice_date,
      items: formData.items.map((item) => ({
        product_id: item.product_id,
        quantity: item.quantity,
        rate: item.rate,
      })),
      payment_status: formData.payment_status,
    };

    if (purchase) {
      onSubmit({ ...purchaseData, id: purchase.id } as Purchase);
    } else {
      onSubmit(purchaseData);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Vendor *
          </label>
          <select
            value={formData.vendor_id}
            onChange={(e) => setFormData({ ...formData, vendor_id: e.target.value })}
            className="input"
            required
            disabled={loadingData}
          >
            <option value="">Select Vendor</option>
            {vendors.map((vendor) => (
              <option key={vendor.id} value={vendor.id}>
                {vendor.name}
              </option>
            ))}
          </select>
        </div>

        <Input
          label="Invoice Number *"
          value={formData.invoice_no}
          onChange={(e) => setFormData({ ...formData, invoice_no: e.target.value })}
          required
          placeholder="Enter invoice number"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Input
          label="Invoice Date *"
          type="date"
          value={formData.invoice_date}
          onChange={(e) => setFormData({ ...formData, invoice_date: e.target.value })}
          required
        />

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Payment Status
          </label>
          <select
            value={formData.payment_status}
            onChange={(e) =>
              setFormData({
                ...formData,
                payment_status: e.target.value as 'pending' | 'paid' | 'partial',
              })
            }
            className="input"
          >
            <option value="pending">Pending</option>
            <option value="partial">Partial</option>
            <option value="paid">Paid</option>
          </select>
        </div>
      </div>

      <div className="border-t pt-4">
        <h3 className="text-lg font-medium mb-4">Purchase Items</h3>

        <div className="grid grid-cols-4 gap-3 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Product</label>
            <select
              value={newItem.product_id}
              onChange={(e) => setNewItem({ ...newItem, product_id: e.target.value })}
              className="input"
              disabled={loadingData}
            >
              <option value="">Select Product</option>
              {products.map((product) => (
                <option key={product.id} value={product.id}>
                  {product.name}
                </option>
              ))}
            </select>
          </div>
          <Input
            label="Quantity"
            type="number"
            min="0"
            step="0.01"
            value={newItem.quantity}
            onChange={(e) => setNewItem({ ...newItem, quantity: parseFloat(e.target.value) || 0 })}
            placeholder="Qty"
          />
          <Input
            label="Rate"
            type="number"
            min="0"
            step="0.01"
            value={newItem.rate}
            onChange={(e) => setNewItem({ ...newItem, rate: parseFloat(e.target.value) || 0 })}
            placeholder="Rate"
          />
          <div className="flex items-end">
            <Button
              type="button"
              variant="primary"
              onClick={handleAddItem}
              className="w-full flex items-center justify-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Add
            </Button>
          </div>
        </div>

        {formData.items.length > 0 && (
          <div className="border rounded-lg overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Product
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Quantity
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Rate
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Amount
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {formData.items.map((item, index) => {
                  const product = products.find((p) => p.id === item.product_id);
                  return (
                    <tr key={index}>
                      <td className="px-4 py-3 text-sm">{product?.name || '-'}</td>
                      <td className="px-4 py-3 text-sm">{item.quantity}</td>
                      <td className="px-4 py-3 text-sm">₹{item.rate.toFixed(2)}</td>
                      <td className="px-4 py-3 text-sm font-medium">
                        ₹{(item.quantity * item.rate).toFixed(2)}
                      </td>
                      <td className="px-4 py-3 text-sm">
                        <button
                          type="button"
                          onClick={() => handleRemoveItem(index)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="border-t pt-4 space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Subtotal:</span>
          <span className="font-medium">₹{subtotal.toFixed(2)}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">GST (18%):</span>
          <span className="font-medium">₹{gstAmount.toFixed(2)}</span>
        </div>
        <div className="flex justify-between text-lg font-bold border-t pt-2">
          <span>Total:</span>
          <span>₹{totalAmount.toFixed(2)}</span>
        </div>
      </div>

      <div className="flex justify-end gap-3 pt-4">
        <Button type="button" variant="secondary" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" variant="primary" isLoading={isLoading} disabled={isLoading || loadingData}>
          {purchase ? 'Update' : 'Create'} Purchase
        </Button>
      </div>
    </form>
  );
};

