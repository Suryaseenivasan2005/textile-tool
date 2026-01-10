import React, { useState } from 'react';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Inventory } from '../../types';

interface StockAdjustmentFormProps {
  inventory: Inventory;
  onSubmit: (productId: string, quantity: number, type: 'in' | 'out' | 'adjustment', reason?: string) => void;
  onCancel: () => void;
}

export const StockAdjustmentForm: React.FC<StockAdjustmentFormProps> = ({
  inventory,
  onSubmit,
  onCancel,
}) => {
  const [adjustmentType, setAdjustmentType] = useState<'in' | 'out' | 'adjustment'>('adjustment');
  const [quantity, setQuantity] = useState(inventory.quantity_available.toString());
  const [reason, setReason] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const qty = parseFloat(quantity);
    if (qty >= 0) {
      let adjustedQty = qty;
      if (adjustmentType === 'in') {
        adjustedQty = qty; // Quantity to add
      } else if (adjustmentType === 'out') {
        adjustedQty = qty; // Quantity to remove
      }
      // For adjustment type, qty is the new total quantity
      onSubmit(inventory.product_id, adjustedQty, adjustmentType, reason || undefined);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <p className="text-sm text-gray-600 mb-2">Product</p>
        <p className="font-medium text-gray-900">{inventory.product?.name || 'Unknown'}</p>
        <p className="text-sm text-gray-500 mt-1">
          Current Stock: {inventory.quantity_available} {inventory.product?.unit || ''}
        </p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Adjustment Type *
        </label>
        <select
          value={adjustmentType}
          onChange={(e) => {
            setAdjustmentType(e.target.value as 'in' | 'out' | 'adjustment');
            if (e.target.value === 'adjustment') {
              setQuantity(inventory.quantity_available.toString());
            }
          }}
          className="input"
        >
          <option value="in">Stock IN (Add)</option>
          <option value="out">Stock OUT (Remove)</option>
          <option value="adjustment">Manual Adjustment (Set)</option>
        </select>
      </div>

      <Input
        label={adjustmentType === 'adjustment' ? 'New Quantity *' : 'Quantity *'}
        type="number"
        min="0"
        step="0.01"
        value={quantity}
        onChange={(e) => setQuantity(e.target.value)}
        required
        placeholder="Enter quantity"
      />

      {adjustmentType !== 'adjustment' && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
          <p className="text-sm text-blue-800">
            {adjustmentType === 'in' ? (
              <>New stock will be: <strong>{inventory.quantity_available + parseFloat(quantity || '0')} {inventory.product?.unit || ''}</strong></>
            ) : (
              <>New stock will be: <strong>{Math.max(0, inventory.quantity_available - parseFloat(quantity || '0'))} {inventory.product?.unit || ''}</strong></>
            )}
          </p>
        </div>
      )}

      <Input
        label="Reason (Optional)"
        value={reason}
        onChange={(e) => setReason(e.target.value)}
        placeholder="Enter reason for adjustment"
      />

      <div className="flex justify-end gap-3 pt-4">
        <Button type="button" variant="secondary" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" variant="primary">
          Update Stock
        </Button>
      </div>
    </form>
  );
};

