import React, { useState, useEffect } from 'react';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Return, ReturnItem, Product, Sale, Purchase } from '../../types';
import { X, Plus } from 'lucide-react';
import { apiService } from '../../services/api';

interface ReturnFormProps {
  returnItem?: Return;
  onSubmit: (returnItem: Return | Omit<Return, 'id' | 'created_at' | 'updated_at'>) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export const ReturnForm: React.FC<ReturnFormProps> = ({ returnItem, onSubmit, onCancel, isLoading = false }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [sales, setSales] = useState<Sale[]>([]);
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [loadingData, setLoadingData] = useState(true);

  const [formData, setFormData] = useState({
    type: 'sales' as 'sales' | 'purchase',
    reference_invoice_id: '',
    date: new Date().toISOString().split('T')[0],
    items: [] as Omit<ReturnItem, 'return_id'>[],
  });

  const [newItem, setNewItem] = useState({
    product_id: '',
    quantity: 0,
  });

  useEffect(() => {
    loadFormData();
  }, []);

  const loadFormData = async () => {
    try {
      setLoadingData(true);
      const [productsData, salesData, purchasesData] = await Promise.all([
        apiService.getProducts({ status: 'active' }),
        apiService.getSales(),
        apiService.getPurchases(),
      ]);
      setProducts(productsData);
      setSales(salesData);
      setPurchases(purchasesData);

      if (returnItem) {
        setFormData({
          type: returnItem.type,
          reference_invoice_id: returnItem.reference_invoice_id,
          date: returnItem.date.split('T')[0],
          items: returnItem.items || [],
        });
      }
    } catch (error) {
      console.error('Error loading form data:', error);
    } finally {
      setLoadingData(false);
    }
  };

  const totalAmount = formData.items.reduce((sum, item) => {
    const product = products.find((p) => p.id === item.product_id);
    return sum + (item.quantity * (product?.cost_price || 0));
  }, 0);

  const handleAddItem = () => {
    if (newItem.product_id && newItem.quantity > 0) {
      setFormData({
        ...formData,
        items: [...formData.items, {
          product_id: newItem.product_id,
          quantity: newItem.quantity,
        }],
      });
      setNewItem({ product_id: '', quantity: 0 });
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

    if (!formData.reference_invoice_id) {
      alert('Please select a reference invoice');
      return;
    }

    const returnData = {
      type: formData.type,
      reference_invoice_id: formData.reference_invoice_id,
      date: formData.date,
      items: formData.items.map((item) => ({
        product_id: item.product_id,
        quantity: item.quantity,
      })),
    };

    if (returnItem) {
      onSubmit({ ...returnData, id: returnItem.id } as Return);
    } else {
      onSubmit(returnData);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Return Type *
          </label>
          <select
            value={formData.type}
            onChange={(e) =>
              setFormData({
                ...formData,
                type: e.target.value as 'sales' | 'purchase',
                reference_invoice_id: '',
              })
            }
            className="input"
            required
          >
            <option value="sales">Sales Return</option>
            <option value="purchase">Purchase Return</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Reference Invoice *
          </label>
          <select
            value={formData.reference_invoice_id}
            onChange={(e) =>
              setFormData({
                ...formData,
                reference_invoice_id: e.target.value,
              })
            }
            className="input"
            required
            disabled={loadingData}
          >
            <option value="">Select Invoice</option>
            {(formData.type === 'sales' ? sales : purchases).map((invoice) => (
              <option key={invoice.id} value={invoice.id}>
                {invoice.invoice_no}
              </option>
            ))}
          </select>
        </div>
      </div>

      <Input
        label="Return Date *"
        type="date"
        value={formData.date}
        onChange={(e) => setFormData({ ...formData, date: e.target.value })}
        required
      />

      <div className="border-t pt-4">
        <h3 className="text-lg font-medium mb-4">Return Items</h3>

        <div className="grid grid-cols-3 gap-3 mb-4">
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

      <div className="border-t pt-4">
        <div className="flex justify-between text-lg font-bold">
          <span>Total Amount:</span>
          <span>₹{totalAmount.toFixed(2)}</span>
        </div>
        <p className="text-sm text-gray-500 mt-2">
          Stock will be automatically updated after creating this return.
        </p>
      </div>

      <div className="flex justify-end gap-3 pt-4">
        <Button type="button" variant="secondary" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" variant="primary" isLoading={isLoading} disabled={isLoading || loadingData}>
          {returnItem ? 'Update' : 'Create'} Return
        </Button>
      </div>
    </form>
  );
};

