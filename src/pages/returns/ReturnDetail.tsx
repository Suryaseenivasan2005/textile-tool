import React from 'react';
import { Return } from '../../types';
import { Card } from '../../components/ui/Card';
import { format } from 'date-fns';

interface ReturnDetailProps {
  returnItem: Return;
  onClose: () => void;
}

export const ReturnDetail: React.FC<ReturnDetailProps> = ({ returnItem }) => {
  return (
    <div className="space-y-6">
      <Card title="Return Information">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-600">Return ID</p>
            <p className="font-medium text-gray-900">#{returnItem.id}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Type</p>
            <span className="inline-block px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800 capitalize">
              {returnItem.type} Return
            </span>
          </div>
          <div>
            <p className="text-sm text-gray-600">Reference Invoice</p>
            <p className="font-medium text-gray-900">#{returnItem.reference_invoice_id}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Date</p>
            <p className="font-medium text-gray-900">
              {format(new Date(returnItem.date), 'dd MMM yyyy')}
            </p>
          </div>
        </div>
      </Card>

      {returnItem.items && returnItem.items.length > 0 && (
        <Card title="Return Items">
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
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {returnItem.items.map((item, index) => (
                  <tr key={index}>
                    <td className="px-4 py-3 text-sm">{item.product?.name || '-'}</td>
                    <td className="px-4 py-3 text-sm">{item.quantity}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      <Card title="Summary">
        <div className="flex justify-between text-lg font-bold">
          <span>Total Amount:</span>
          <span>₹{returnItem.total_amount.toFixed(2)}</span>
        </div>
      </Card>
    </div>
  );
};

