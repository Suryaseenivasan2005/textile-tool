import React, { useState, useEffect } from 'react';
import { Plus, Search, Eye, Download } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Card } from '../../components/ui/Card';
import { Table } from '../../components/ui/Table';
import { Modal } from '../../components/ui/Modal';
import { PaymentForm } from './PaymentForm';
import { LedgerView } from './LedgerView';
import { Payment } from '../../types';
import { format } from 'date-fns';
import { apiService } from '../../services/api';

export const PaymentsList: React.FC = () => {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | 'vendor' | 'customer'>('all');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isLedgerModalOpen, setIsLedgerModalOpen] = useState(false);
  const [selectedEntity, setSelectedEntity] = useState<{ type: 'vendor' | 'customer'; id: string; name: string } | null>(null);

  useEffect(() => {
    loadPayments();
  }, []);

  const loadPayments = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await apiService.getPayments({
        reference_type: typeFilter !== 'all' ? typeFilter : undefined,
      });
      setPayments(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load payments');
      console.error('Error loading payments:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadPayments();
  }, [typeFilter]);

  const filteredPayments = payments.filter((payment) => {
    const matchesSearch = payment.amount.toString().includes(searchTerm);
    const matchesType = typeFilter === 'all' || payment.reference_type === typeFilter;
    return matchesSearch && matchesType;
  });

  const handleAddPayment = async (payment: Omit<Payment, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      await apiService.createPayment(payment);
      setIsAddModalOpen(false);
      loadPayments();
    } catch (err: any) {
      throw new Error(err.message || 'Failed to create payment');
    }
  };

  const handleExport = () => {
    // TODO: Implement Excel export
    alert('Excel export functionality will be implemented');
  };

  const columns = [
    {
      key: 'id' as keyof Payment,
      header: 'Payment ID',
    },
    {
      key: 'reference_type' as keyof Payment,
      header: 'Type',
      render: (payment: Payment) => (
        <span className="capitalize">{payment.reference_type}</span>
      ),
    },
    {
      key: 'reference_id' as keyof Payment,
      header: 'Reference ID',
      render: (payment: Payment) => `#${payment.reference_id}`,
    },
    {
      key: 'amount' as keyof Payment,
      header: 'Amount',
      render: (payment: Payment) => (
        <span className="font-medium">₹{payment.amount.toFixed(2)}</span>
      ),
    },
    {
      key: 'payment_mode' as keyof Payment,
      header: 'Payment Mode',
      render: (payment: Payment) => (
        <span className="capitalize">{payment.payment_mode}</span>
      ),
    },
    {
      key: 'payment_date' as keyof Payment,
      header: 'Date',
      render: (payment: Payment) => format(new Date(payment.payment_date), 'dd MMM yyyy'),
    },
  ];

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Payments & Ledger</h1>
          <p className="text-gray-600 mt-1">Record payments and view ledgers</p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            onClick={handleExport}
            className="flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            Export
          </Button>
          <Button
            variant="primary"
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Record Payment
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <Card>
          <h3 className="text-lg font-semibold mb-4">Vendor Payments</h3>
          <Button
            variant="outline"
            className="w-full mb-2"
            onClick={async () => {
              // TODO: Get actual vendor ID from a selection modal or list
              // For now, using a placeholder - in real app, user would select vendor
              const vendorId = '1'; // This should come from vendor selection
              setSelectedEntity({ type: 'vendor', id: vendorId, name: 'View Vendor Ledger' });
              setIsLedgerModalOpen(true);
            }}
          >
            View Vendor Ledger
          </Button>
          <p className="text-sm text-gray-600">Track all vendor transactions and outstanding amounts</p>
        </Card>

        <Card>
          <h3 className="text-lg font-semibold mb-4">Customer Payments</h3>
          <Button
            variant="outline"
            className="w-full mb-2"
            onClick={async () => {
              // TODO: Get actual customer ID from a selection modal or list
              const customerId = '1'; // This should come from customer selection
              setSelectedEntity({ type: 'customer', id: customerId, name: 'View Customer Ledger' });
              setIsLedgerModalOpen(true);
            }}
          >
            View Customer Ledger
          </Button>
          <p className="text-sm text-gray-600">Track all customer transactions and outstanding amounts</p>
        </Card>
      </div>

      <Card>
        <div className="mb-4 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <Input
              type="text"
              placeholder="Search payments..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Filter by Type</label>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value as 'all' | 'vendor' | 'customer')}
              className="input"
            >
              <option value="all">All Types</option>
              <option value="vendor">Vendor Payments</option>
              <option value="customer">Customer Payments</option>
            </select>
          </div>
        </div>

        {error && (
          <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm font-medium">
            {error}
          </div>
        )}

        {isLoading ? (
          <div className="text-center py-12 text-gray-500">Loading payments...</div>
        ) : (
          <Table
            data={filteredPayments}
            columns={columns}
            emptyMessage="No payments found. Record your first payment."
          />
        )}
      </Card>

      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Record Payment"
        size="md"
      >
        <PaymentForm
          onSubmit={handleAddPayment}
          onCancel={() => setIsAddModalOpen(false)}
        />
      </Modal>

      <Modal
        isOpen={isLedgerModalOpen}
        onClose={() => {
          setIsLedgerModalOpen(false);
          setSelectedEntity(null);
        }}
        title={selectedEntity?.name || 'Ledger'}
        size="xl"
      >
        {selectedEntity && (
          <LedgerView
            type={selectedEntity.type}
            entityId={selectedEntity.id}
            onClose={() => {
              setIsLedgerModalOpen(false);
              setSelectedEntity(null);
            }}
          />
        )}
      </Modal>
    </div>
  );
};

