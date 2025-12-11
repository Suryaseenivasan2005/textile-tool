import React from 'react';
import { Vendor, VendorLedger } from '../../types';
import { Card } from '../../components/ui/Card';
import { Table } from '../../components/ui/Table';
import { format } from 'date-fns';

interface VendorDetailProps {
  vendor: Vendor;
  onClose: () => void;
}

export const VendorDetail: React.FC<VendorDetailProps> = ({ vendor }) => {
  // Mock ledger data - replace with actual API call
  const ledgerEntries: VendorLedger[] = [];

  const ledgerColumns = [
    {
      key: 'transaction_date' as keyof VendorLedger,
      header: 'Date',
      render: (entry: VendorLedger) =>
        format(new Date(entry.transaction_date), 'dd MMM yyyy'),
    },
    {
      key: 'reference_type' as keyof VendorLedger,
      header: 'Type',
    },
    {
      key: 'debit' as keyof VendorLedger,
      header: 'Debit',
      render: (entry: VendorLedger) =>
        entry.debit > 0 ? `₹${entry.debit.toFixed(2)}` : '-',
    },
    {
      key: 'credit' as keyof VendorLedger,
      header: 'Credit',
      render: (entry: VendorLedger) =>
        entry.credit > 0 ? `₹${entry.credit.toFixed(2)}` : '-',
    },
    {
      key: 'balance' as keyof VendorLedger,
      header: 'Balance',
      render: (entry: VendorLedger) => (
        <span className={entry.balance < 0 ? 'text-red-600 font-medium' : 'text-green-600 font-medium'}>
          ₹{Math.abs(entry.balance).toFixed(2)} {entry.balance < 0 ? '(Due)' : ''}
        </span>
      ),
    },
  ];

  const outstandingBalance = ledgerEntries.length > 0
    ? ledgerEntries[ledgerEntries.length - 1].balance
    : 0;

  return (
    <div className="space-y-6">
      <Card title="Vendor Information">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-600">Name</p>
            <p className="font-medium text-gray-900">{vendor.name}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">GST Number</p>
            <p className="font-medium text-gray-900">{vendor.gst_number || '-'}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Phone</p>
            <p className="font-medium text-gray-900">{vendor.phone || '-'}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Status</p>
            <span
              className={`inline-block px-2 py-1 text-xs font-medium rounded-full ${
                vendor.status === 'active'
                  ? 'bg-green-100 text-green-800'
                  : 'bg-gray-100 text-gray-800'
              }`}
            >
              {vendor.status}
            </span>
          </div>
          {vendor.address && (
            <div className="col-span-2">
              <p className="text-sm text-gray-600">Address</p>
              <p className="font-medium text-gray-900">{vendor.address}</p>
            </div>
          )}
        </div>
      </Card>

      <Card
        title="Outstanding Balance"
        actions={
          <span
            className={`text-2xl font-bold ${
              outstandingBalance < 0 ? 'text-red-600' : 'text-green-600'
            }`}
          >
            ₹{Math.abs(outstandingBalance).toFixed(2)}
            {outstandingBalance < 0 && ' (Due)'}
          </span>
        }
      >
        <p className="text-sm text-gray-600">
          {outstandingBalance < 0
            ? 'Amount due from vendor'
            : outstandingBalance > 0
            ? 'Advance paid by vendor'
            : 'No outstanding balance'}
        </p>
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

