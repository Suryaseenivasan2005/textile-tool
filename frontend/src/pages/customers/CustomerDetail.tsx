import React from 'react';
import { Customer, CustomerLedger, Sale } from '../../types';
import { Card } from '../../components/ui/Card';
import { Table } from '../../components/ui/Table';
import { format } from 'date-fns';

interface CustomerDetailProps {
  customer: Customer;
  onClose: () => void;
}

export const CustomerDetail: React.FC<CustomerDetailProps> = ({ customer }) => {
  // Mock data - replace with actual API calls
  const ledgerEntries: CustomerLedger[] = [];
  const purchaseHistory: Sale[] = [];

  const ledgerColumns = [
    {
      key: 'transaction_date' as keyof CustomerLedger,
      header: 'Date',
      render: (entry: CustomerLedger) =>
        format(new Date(entry.transaction_date), 'dd MMM yyyy'),
    },
    {
      key: 'reference_type' as keyof CustomerLedger,
      header: 'Type',
    },
    {
      key: 'debit' as keyof CustomerLedger,
      header: 'Debit',
      render: (entry: CustomerLedger) =>
        entry.debit > 0 ? `₹${entry.debit.toFixed(2)}` : '-',
    },
    {
      key: 'credit' as keyof CustomerLedger,
      header: 'Credit',
      render: (entry: CustomerLedger) =>
        entry.credit > 0 ? `₹${entry.credit.toFixed(2)}` : '-',
    },
    {
      key: 'balance' as keyof CustomerLedger,
      header: 'Balance',
      render: (entry: CustomerLedger) => (
        <span className={entry.balance > 0 ? 'text-red-600 font-medium' : 'text-green-600 font-medium'}>
          ₹{Math.abs(entry.balance).toFixed(2)} {entry.balance > 0 ? '(Due)' : ''}
        </span>
      ),
    },
  ];

  const purchaseHistoryColumns = [
    {
      key: 'invoice_no' as keyof Sale,
      header: 'Invoice No',
    },
    {
      key: 'invoice_date' as keyof Sale,
      header: 'Date',
      render: (sale: Sale) => format(new Date(sale.invoice_date), 'dd MMM yyyy'),
    },
    {
      key: 'total_amount' as keyof Sale,
      header: 'Amount',
      render: (sale: Sale) => `₹${sale.total_amount.toFixed(2)}`,
    },
    {
      key: 'payment_type' as keyof Sale,
      header: 'Payment Type',
      render: (sale: Sale) => (
        <span className="capitalize">{sale.payment_type}</span>
      ),
    },
  ];

  const outstandingBalance = ledgerEntries.length > 0
    ? ledgerEntries[ledgerEntries.length - 1].balance
    : 0;

  return (
    <div className="space-y-6">
      <Card title="Customer Information">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-600">Name</p>
            <p className="font-medium text-gray-900">{customer.name}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">GST Number</p>
            <p className="font-medium text-gray-900">{customer.gst_number || '-'}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Phone</p>
            <p className="font-medium text-gray-900">{customer.phone || '-'}</p>
          </div>
          {customer.address && (
            <div className="col-span-2">
              <p className="text-sm text-gray-600">Address</p>
              <p className="font-medium text-gray-900">{customer.address}</p>
            </div>
          )}
        </div>
      </Card>

      <Card
        title="Outstanding Balance"
        actions={
          <span
            className={`text-2xl font-bold ${
              outstandingBalance > 0 ? 'text-red-600' : 'text-green-600'
            }`}
          >
            ₹{Math.abs(outstandingBalance).toFixed(2)}
            {outstandingBalance > 0 && ' (Due)'}
          </span>
        }
      >
        <p className="text-sm text-gray-600">
          {outstandingBalance > 0
            ? 'Amount due from customer'
            : outstandingBalance < 0
            ? 'Advance paid by customer'
            : 'No outstanding balance'}
        </p>
      </Card>

      <Card title="Purchase History">
        <Table
          data={purchaseHistory}
          columns={purchaseHistoryColumns}
          emptyMessage="No purchase history found"
        />
      </Card>

      <Card title="Ledger">
        <Table
          data={ledgerEntries}
          columns={ledgerColumns}
          emptyMessage="No ledger entries found"
        />
      </Card>
    </div>
  );
};

