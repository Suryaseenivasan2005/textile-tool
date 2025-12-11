import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, Eye, Filter } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Card } from '../../components/ui/Card';
import { Table } from '../../components/ui/Table';
import { Modal } from '../../components/ui/Modal';
import { ReturnDetail } from './ReturnDetail';
import { Return } from '../../types';
import { format } from 'date-fns';
import { apiService } from '../../services/api';

export const ReturnsList: React.FC = () => {
  const navigate = useNavigate();
  const [returns, setReturns] = useState<Return[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | 'sales' | 'purchase'>('all');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedReturn, setSelectedReturn] = useState<Return | null>(null);

  useEffect(() => {
    loadReturns();
  }, []);

  const loadReturns = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await apiService.getReturns({
        search: searchTerm || undefined,
        type: typeFilter !== 'all' ? typeFilter : undefined,
      });
      setReturns(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load returns');
      console.error('Error loading returns:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      loadReturns();
    }, 300);
    return () => clearTimeout(timer);
  }, [searchTerm, typeFilter]);

  const filteredReturns = returns.filter((returnItem) => {
    const matchesSearch = returnItem.id.toString().includes(searchTerm);
    const matchesType = typeFilter === 'all' || returnItem.type === typeFilter;
    return matchesSearch && matchesType;
  });


  const columns = [
    {
      key: 'id' as keyof Return,
      header: 'Return ID',
    },
    {
      key: 'type' as keyof Return,
      header: 'Type',
      render: (returnItem: Return) => (
        <span className="capitalize">{returnItem.type} Return</span>
      ),
    },
    {
      key: 'reference_invoice_id' as keyof Return,
      header: 'Reference Invoice',
      render: (returnItem: Return) => `#${returnItem.reference_invoice_id}`,
    },
    {
      key: 'date' as keyof Return,
      header: 'Date',
      render: (returnItem: Return) => format(new Date(returnItem.date), 'dd MMM yyyy'),
    },
    {
      key: 'total_amount' as keyof Return,
      header: 'Amount',
      render: (returnItem: Return) => (
        <span className="font-medium">₹{returnItem.total_amount.toFixed(2)}</span>
      ),
    },
    {
      key: 'actions' as keyof Return,
      header: 'Actions',
      render: (returnItem: Return) => (
        <button
          onClick={(e) => {
            e.stopPropagation();
            setSelectedReturn(returnItem);
            setIsDetailModalOpen(true);
          }}
          className="text-primary-600 hover:text-primary-700 p-1.5 rounded-lg hover:bg-primary-50 transition-colors"
          title="View Details"
        >
          <Eye className="w-4 h-4" />
        </button>
      ),
    },
  ];

  return (
    <div>
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Returns Management</h1>
          <p className="text-gray-600 mt-2 text-sm font-medium">Process sales and purchase returns</p>
        </div>
        <Button
          variant="primary"
          onClick={() => navigate('/returns/new')}
          className="flex items-center gap-2 w-full sm:w-auto"
        >
          <Plus className="w-4 h-4" />
          New Return
        </Button>
      </div>

      <Card>
        <div className="mb-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 pointer-events-none" />
            <Input
              type="text"
              placeholder="Search returns..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 pointer-events-none" />
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value as 'all' | 'sales' | 'purchase')}
              className="input pl-10"
            >
              <option value="all">All Types</option>
              <option value="sales">Sales Returns</option>
              <option value="purchase">Purchase Returns</option>
            </select>
          </div>
        </div>

        {error && (
          <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm font-medium">
            {error}
          </div>
        )}

        {isLoading ? (
          <div className="text-center py-12 text-gray-500">Loading returns...</div>
        ) : (
          <Table
            data={filteredReturns}
            columns={columns}
            emptyMessage="No returns found. Create your first return entry."
          />
        )}
      </Card>

      <Modal
        isOpen={isDetailModalOpen}
        onClose={() => {
          setIsDetailModalOpen(false);
          setSelectedReturn(null);
        }}
        title="Return Details"
        size="lg"
      >
        {selectedReturn && (
          <ReturnDetail
            returnItem={selectedReturn}
            onClose={() => {
              setIsDetailModalOpen(false);
              setSelectedReturn(null);
            }}
          />
        )}
      </Modal>
    </div>
  );
};

