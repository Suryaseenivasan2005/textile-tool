import React from 'react';
import { Sale } from '../../types';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Printer } from 'lucide-react';
import { format } from 'date-fns';

interface SaleDetailProps {
  sale: Sale;
  onClose: () => void;
  onPrint: () => void;
}

export const SaleDetail: React.FC<SaleDetailProps> = ({ sale, onPrint }) => {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <Card title="Invoice Information" className="flex-1">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-600">Invoice Number</p>
              <p className="font-medium text-gray-900">{sale.invoice_no}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Invoice Date</p>
              <p className="font-medium text-gray-900">
                {format(new Date(sale.invoice_date), 'dd MMM yyyy')}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Customer</p>
              <p className="font-medium text-gray-900">{sale.customer?.name || 'Walk-in Customer'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Payment Type</p>
              <span className="inline-block px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800 capitalize">
                {sale.payment_type}
              </span>
            </div>
          </div>
        </Card>
        <Button
          variant="primary"
          onClick={onPrint}
          className="flex items-center gap-2 ml-4"
        >
          <Printer className="w-4 h-4" />
          Print Invoice
        </Button>
      </div>

      {sale.items && sale.items.length > 0 && (
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
                {sale.items.map((item, index) => (
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
            <span className="font-medium">₹{sale.subtotal.toFixed(2)}</span>
          </div>
          {sale.discount > 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Discount:</span>
              <span className="font-medium">₹{sale.discount.toFixed(2)}</span>
            </div>
          )}
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">GST (18%):</span>
            <span className="font-medium">₹{sale.gst_amount.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-lg font-bold border-t pt-2">
            <span>Total:</span>
            <span>₹{sale.total_amount.toFixed(2)}</span>
          </div>
        </div>
      </Card>
    </div>
  );
};

