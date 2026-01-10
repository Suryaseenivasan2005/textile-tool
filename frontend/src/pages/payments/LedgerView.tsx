import React from 'react';
import { VendorLedger, CustomerLedger } from '../../types';
import { Card } from '../../components/ui/Card';
import { Table } from '../../components/ui/Table';
import { format } from 'date-fns';

interface LedgerViewProps {
  type: 'vendor' | 'customer';
  entityId: number;
  onClose: () => void;
}

export const LedgerView: React.FC<LedgerViewProps> = ({ type }) => {
  // Mock data - replace with actual API calls
  const vendorLedger: VendorLedger[] = [];
  const customerLedger: CustomerLedger[] = [];

  const ledgerEntries = type === 'vendor' ? vendorLedger : customerLedger;

  const columns = [
    {
      key: 'transaction_date' as keyof (VendorLedger | CustomerLedger),
      header: 'Date',
      render: (entry: VendorLedger | CustomerLedger) =>
        format(new Date(entry.transaction_date), 'dd MMM yyyy'),
    },
    {
      key: 'reference_type' as keyof (VendorLedger | CustomerLedger),
      header: 'Type',
    },
    {
      key: 'debit' as keyof (VendorLedger | CustomerLedger),
      header: 'Debit',
      render: (entry: VendorLedger | CustomerLedger) =>
        entry.debit > 0 ? `₹${entry.debit.toFixed(2)}` : '-',
    },
    {
      key: 'credit' as keyof (VendorLedger | CustomerLedger),
      header: 'Credit',
      render: (entry: VendorLedger | CustomerLedger) =>
        entry.credit > 0 ? `₹${entry.credit.toFixed(2)}` : '-',
    },
    {
      key: 'balance' as keyof (VendorLedger | CustomerLedger),
      header: 'Balance',
      render: (entry: VendorLedger | CustomerLedger) => {
        const isNegative = type === 'vendor' 
          ? entry.balance < 0 
          : entry.balance > 0;
        return (
          <span className={isNegative ? 'text-red-600 font-medium' : 'text-green-600 font-medium'}>
            ₹{Math.abs(entry.balance).toFixed(2)} {isNegative ? '(Due)' : ''}
          </span>
        );
      },
    },
  ];

  const outstandingBalance = ledgerEntries.length > 0
    ? ledgerEntries[ledgerEntries.length - 1].balance
    : 0;

  return (
    <div className="space-y-6">
      <Card
        title="Outstanding Balance"
        actions={
          <span
            className={`text-2xl font-bold ${
              (type === 'vendor' && outstandingBalance < 0) || 
              (type === 'customer' && outstandingBalance > 0)
                ? 'text-red-600'
                : 'text-green-600'
            }`}
          >
            ₹{Math.abs(outstandingBalance).toFixed(2)}
            {((type === 'vendor' && outstandingBalance < 0) || 
              (type === 'customer' && outstandingBalance > 0)) && ' (Due)'}
          </span>
        }
      >
        <p className="text-sm text-gray-600">
          {type === 'vendor'
            ? outstandingBalance < 0
              ? 'Amount due to vendor'
              : outstandingBalance > 0
              ? 'Advance paid to vendor'
              : 'No outstanding balance'
            : outstandingBalance > 0
            ? 'Amount due from customer'
            : outstandingBalance < 0
            ? 'Advance paid by customer'
            : 'No outstanding balance'}
        </p>
      </Card>

      <Card title="Transaction History">
        <Table
          data={ledgerEntries}
          columns={columns}
          emptyMessage="No ledger entries found"
        />
      </Card>
    </div>
  );
};

