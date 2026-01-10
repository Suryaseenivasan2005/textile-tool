import React from 'react';
import { Purchase } from '../../types';
import { Card } from '../../components/ui/Card';
import { format } from 'date-fns';

interface PurchaseDetailProps {
  purchase: Purchase;
  onClose: () => void;
}

export const PurchaseDetail: React.FC<PurchaseDetailProps> = ({ purchase }) => {
  return (
    <div className="space-y-6">
      <Card title="Purchase Information">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-600">Invoice Number</p>
            <p className="font-medium text-gray-900">{purchase.invoice_no}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Invoice Date</p>
            <p className="font-medium text-gray-900">
              {format(new Date(purchase.invoice_date), 'dd MMM yyyy')}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Vendor</p>
            <p className="font-medium text-gray-900">{purchase.vendor?.name || '-'}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Payment Status</p>
            <span
              className={`inline-block px-2 py-1 text-xs font-medium rounded-full ${
                purchase.payment_status === 'paid'
                  ? 'bg-green-100 text-green-800'
                  : purchase.payment_status === 'partial'
                  ? 'bg-yellow-100 text-yellow-800'
                  : 'bg-red-100 text-red-800'
              }`}
            >
              {purchase.payment_status}
            </span>
          </div>
        </div>
      </Card>

      {purchase.items && purchase.items.length > 0 && (
        <Card title="Items">
          <div className="overflow-x-auto">
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
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {purchase.items.map((item, index) => (
                  <tr key={index}>
                    <td className="px-4 py-3 text-sm">{item.product?.name || '-'}</td>
                    <td className="px-4 py-3 text-sm">{item.quantity}</td>
                    <td className="px-4 py-3 text-sm">₹{item.rate.toFixed(2)}</td>
                    <td className="px-4 py-3 text-sm font-medium">
                      ₹{(item.quantity * item.rate).toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      <Card title="Summary">
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Subtotal:</span>
            <span className="font-medium">₹{purchase.subtotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">GST (18%):</span>
            <span className="font-medium">₹{purchase.gst_amount.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-lg font-bold border-t pt-2">
            <span>Total:</span>
            <span>₹{purchase.total_amount.toFixed(2)}</span>
          </div>
        </div>
      </Card>
    </div>
  );
};

