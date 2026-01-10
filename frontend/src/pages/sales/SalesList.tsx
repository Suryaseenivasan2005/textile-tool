import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, Eye, Printer } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Card } from '../../components/ui/Card';
import { Table } from '../../components/ui/Table';
import { Modal } from '../../components/ui/Modal';
import { SaleDetail } from './SaleDetail';
import { Sale } from '../../types';
import { format } from 'date-fns';
import { apiService } from '../../services/api';

export const SalesList: React.FC = () => {
  const navigate = useNavigate();
  const [sales, setSales] = useState<Sale[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedSale, setSelectedSale] = useState<Sale | null>(null);

  useEffect(() => {
    loadSales();
  }, []);

  const loadSales = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await apiService.getSales({ search: searchTerm || undefined });
      setSales(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load sales');
      console.error('Error loading sales:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      loadSales();
    }, 300);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const filteredSales = sales.filter((sale) =>
    sale.invoice_no.toLowerCase().includes(searchTerm.toLowerCase()) ||
    sale.customer?.name.toLowerCase().includes(searchTerm.toLowerCase())
  );


  const handlePrint = (sale: Sale) => {
    window.print();
    // TODO: Implement actual print/PDF functionality
  };

  const columns = [
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
      key: 'customer' as keyof Sale,
      header: 'Customer',
      render: (sale: Sale) => sale.customer?.name || 'Walk-in Customer',
    },
    {
      key: 'subtotal' as keyof Sale,
      header: 'Subtotal',
      render: (sale: Sale) => `₹${sale.subtotal.toFixed(2)}`,
    },
    {
      key: 'gst_amount' as keyof Sale,
      header: 'GST',
      render: (sale: Sale) => `₹${sale.gst_amount.toFixed(2)}`,
    },
    {
      key: 'total_amount' as keyof Sale,
      header: 'Total',
      render: (sale: Sale) => (
        <span className="font-medium">₹{sale.total_amount.toFixed(2)}</span>
      ),
    },
    {
      key: 'payment_type' as keyof Sale,
      header: 'Payment',
      render: (sale: Sale) => (
        <span className="capitalize">{sale.payment_type}</span>
      ),
    },
    {
      key: 'actions' as keyof Sale,
      header: 'Actions',
      render: (sale: Sale) => (
        <div className="flex items-center gap-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setSelectedSale(sale);
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
              handlePrint(sale);
            }}
            className="text-primary-600 hover:text-primary-700 p-1.5 rounded-lg hover:bg-primary-50 transition-colors"
            title="Print Invoice"
          >
            <Printer className="w-4 h-4" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div>
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Sales & Billing</h1>
          <p className="text-gray-600 mt-2 text-sm font-medium">Create and manage sales invoices</p>
        </div>
        <Button
          variant="primary"
          onClick={() => navigate('/sales/new')}
          className="flex items-center gap-2 w-full sm:w-auto"
        >
          <Plus className="w-4 h-4" />
          New Invoice
        </Button>
      </div>

      <Card>
        <div className="mb-6">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 pointer-events-none" />
            <Input
              type="text"
              placeholder="Search by invoice number or customer..."
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
          <div className="text-center py-12 text-gray-500">Loading sales...</div>
        ) : (
          <Table
            data={filteredSales}
            columns={columns}
            emptyMessage="No sales invoices found. Create your first invoice."
          />
        )}
      </Card>

      <Modal
        isOpen={isDetailModalOpen}
        onClose={() => {
          setIsDetailModalOpen(false);
          setSelectedSale(null);
        }}
        title="Invoice Details"
        size="lg"
      >
        {selectedSale && (
          <SaleDetail
            sale={selectedSale}
            onClose={() => {
              setIsDetailModalOpen(false);
              setSelectedSale(null);
            }}
            onPrint={() => handlePrint(selectedSale)}
          />
        )}
      </Modal>
    </div>
  );
};

