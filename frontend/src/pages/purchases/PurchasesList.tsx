import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, Eye, Edit, CheckCircle } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Card } from '../../components/ui/Card';
import { Table } from '../../components/ui/Table';
import { Modal } from '../../components/ui/Modal';
import { PurchaseForm } from './PurchaseForm';
import { PurchaseDetail } from './PurchaseDetail';
import { Purchase } from '../../types';
import { format } from 'date-fns';
import { apiService } from '../../services/api';

export const PurchasesList: React.FC = () => {
  const navigate = useNavigate();
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedPurchase, setSelectedPurchase] = useState<Purchase | null>(null);

  useEffect(() => {
    loadPurchases();
  }, []);

  const loadPurchases = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await apiService.getPurchases({ search: searchTerm || undefined });
      setPurchases(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load purchases');
      console.error('Error loading purchases:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      loadPurchases();
    }, 300);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const filteredPurchases = purchases.filter((purchase) =>
    purchase.invoice_no.toLowerCase().includes(searchTerm.toLowerCase()) ||
    purchase.vendor?.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleEditPurchase = async (purchase: Purchase) => {
    try {
      await apiService.updatePurchase(purchase.id, purchase);
      setIsEditModalOpen(false);
      setSelectedPurchase(null);
      loadPurchases();
    } catch (err: any) {
      throw new Error(err.message || 'Failed to update purchase');
    }
  };

  const handlePaymentStatusChange = async (id: string, status: 'pending' | 'paid' | 'partial') => {
    try {
      await apiService.updatePurchaseStatus(id, status);
      loadPurchases();
    } catch (err: any) {
      console.error('Error updating payment status:', err);
      alert(err.message || 'Failed to update payment status');
    }
  };

  const columns = [
    {
      key: 'invoice_no' as keyof Purchase,
      header: 'Invoice No',
    },
    {
      key: 'invoice_date' as keyof Purchase,
      header: 'Date',
      render: (purchase: Purchase) => format(new Date(purchase.invoice_date), 'dd MMM yyyy'),
    },
    {
      key: 'vendor' as keyof Purchase,
      header: 'Vendor',
      render: (purchase: Purchase) => purchase.vendor?.name || '-',
    },
    {
      key: 'subtotal' as keyof Purchase,
      header: 'Subtotal',
      render: (purchase: Purchase) => `₹${purchase.subtotal.toFixed(2)}`,
    },
    {
      key: 'gst_amount' as keyof Purchase,
      header: 'GST',
      render: (purchase: Purchase) => `₹${purchase.gst_amount.toFixed(2)}`,
    },
    {
      key: 'total_amount' as keyof Purchase,
      header: 'Total',
      render: (purchase: Purchase) => (
        <span className="font-medium">₹{purchase.total_amount.toFixed(2)}</span>
      ),
    },
    {
      key: 'payment_status' as keyof Purchase,
      header: 'Payment Status',
      render: (purchase: Purchase) => (
        <span
          className={`px-2.5 py-1 text-xs font-semibold rounded-full ${
            purchase.payment_status === 'paid'
              ? 'bg-green-100 text-green-700'
              : purchase.payment_status === 'partial'
              ? 'bg-yellow-100 text-yellow-700'
              : 'bg-red-100 text-red-700'
          }`}
        >
          {purchase.payment_status}
        </span>
      ),
    },
    {
      key: 'actions' as keyof Purchase,
      header: 'Actions',
      render: (purchase: Purchase) => (
        <div className="flex items-center gap-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setSelectedPurchase(purchase);
              setIsDetailModalOpen(true);
            }}
            className="text-primary-600 hover:text-primary-700 p-1.5 rounded-lg hover:bg-primary-50 transition-colors"
            title="View Details"
          >
            <Eye className="w-4 h-4" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setSelectedPurchase(purchase);
              setIsEditModalOpen(true);
            }}
            className="text-primary-600 hover:text-primary-700 p-1.5 rounded-lg hover:bg-primary-50 transition-colors"
            title="Edit"
          >
            <Edit className="w-4 h-4" />
          </button>
          {purchase.payment_status !== 'paid' && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                handlePaymentStatusChange(purchase.id as string, 'paid');
              }}
              className="text-green-600 hover:text-green-700 p-1.5 rounded-lg hover:bg-green-50 transition-colors"
              title="Mark as Paid"
            >
              <CheckCircle className="w-4 h-4" />
            </button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div>
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Purchases</h1>
          <p className="text-gray-600 mt-2 text-sm font-medium">Manage your purchase entries</p>
        </div>
        <Button
          variant="primary"
          onClick={() => navigate('/purchases/new')}
          className="flex items-center gap-2 w-full sm:w-auto"
        >
          <Plus className="w-4 h-4" />
          New Purchase
        </Button>
      </div>

      <Card>
        <div className="mb-6">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 pointer-events-none" />
            <Input
              type="text"
              placeholder="Search by invoice number or vendor..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {error && (
          <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm font-medium">
            {error}
          </div>
        )}

        {isLoading ? (
          <div className="text-center py-12 text-gray-500">Loading purchases...</div>
        ) : (
          <Table
            data={filteredPurchases}
            columns={columns}
            emptyMessage="No purchases found. Create your first purchase entry."
          />
        )}
      </Card>

      <Modal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setSelectedPurchase(null);
        }}
        title="Edit Purchase"
        size="xl"
      >
        {selectedPurchase && (
          <PurchaseForm
            purchase={selectedPurchase}
            onSubmit={handleEditPurchase}
            onCancel={() => {
              setIsEditModalOpen(false);
              setSelectedPurchase(null);
            }}
          />
        )}
      </Modal>

      <Modal
        isOpen={isDetailModalOpen}
        onClose={() => {
          setIsDetailModalOpen(false);
          setSelectedPurchase(null);
        }}
        title="Purchase Details"
        size="lg"
      >
        {selectedPurchase && (
          <PurchaseDetail
            purchase={selectedPurchase}
            onClose={() => {
              setIsDetailModalOpen(false);
              setSelectedPurchase(null);
            }}
          />
        )}
      </Modal>
    </div>
  );
};

